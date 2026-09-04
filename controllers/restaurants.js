const restaurant = require('../models/restaurant');
const restaurantSchema = require('../models/restaurant');
const {cloudinary} = require('../cloudinary/index');
const maptilerClient = require("../mapTiler/index");
const { restaurantTags, mealTags } = require('../data/restaurantTags');
const Visit = require('../models/visit');

const RESTAURANTS_PER_PAGE = 18;

const escapeRegex = value => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const createSearchFilter = query => {
    if (!query) return {};
    const escapedQuery = escapeRegex(query);
    return {
      $or: [
        { title: { $regex: escapedQuery, $options: 'i' } },
        { description: { $regex: escapedQuery, $options: 'i' } },
        { location: { $regex: escapedQuery, $options: 'i' } },
        { cuisine: { $regex: escapedQuery, $options: 'i' } },
        { tags: { $regex: escapedQuery, $options: 'i' } },
        { mealTags: { $regex: escapedQuery, $options: 'i' } }
      ]
    };
};

module.exports.index = async(req, res) =>{
    const query = String(req.query.q || '').trim().slice(0, 100);
    const requestedPage = Math.max(1, Number.parseInt(req.query.page, 10) || 1);
    if (['saved', 'visited'].includes(req.query.view) && !req.user) {
      req.session.returnTo = req.originalUrl;
      req.flash('error', 'Log in to see your personal places.');
      return res.redirect('/login');
    }
    const view = req.user && ['saved', 'visited'].includes(req.query.view) ? req.query.view : 'all';
    let personalRestaurantIds = null;
    if (view === 'saved') {
      personalRestaurantIds = res.locals.savedRestaurants.map(item => item._id);
    } else if (view === 'visited') {
      const visits = await Visit.find({ user: req.user._id }).select('restaurant');
      personalRestaurantIds = visits.map(visit => visit.restaurant);
    }
    const searchFilter = createSearchFilter(query);
    const filter = personalRestaurantIds
      ? (query ? { $and: [searchFilter, { _id: { $in: personalRestaurantIds } }] } : { _id: { $in: personalRestaurantIds } })
      : searchFilter;
    const totalRestaurants = await restaurantSchema.countDocuments(filter);
    const totalPages = Math.max(1, Math.ceil(totalRestaurants / RESTAURANTS_PER_PAGE));
    const currentPage = Math.min(requestedPage, totalPages);
    const restaurants = await restaurantSchema.find(filter)
      .sort({ title: 1 })
      .skip((currentPage - 1) * RESTAURANTS_PER_PAGE)
      .limit(RESTAURANTS_PER_PAGE);
    res.render('restaurants/index', {
      restaurants,
      query,
      totalRestaurants,
      currentPage,
      totalPages,
      view,
      pageTitle: query ? `Results for ${query}` : view === 'visited' ? 'Your visited places' : view === 'saved' ? 'Your saved places' : 'Discover restaurants'
    });
}

module.exports.suggestions = async(req, res) => {
    const query = String(req.query.q || '').trim().slice(0, 100);
    if (query.length < 2) return res.json([]);

    const restaurants = await restaurantSchema.find(createSearchFilter(query))
      .select('title location cuisine')
      .sort({ title: 1 })
      .limit(8)
      .lean();

    res.json(restaurants.map(item => ({
      value: item.title,
      label: item.title,
      detail: item.location || item.cuisine || 'Restaurant'
    })));
}

module.exports.newForm = async(req,res)=>{
    res.render('restaurants/new', { restaurantTags, mealTags });
}

module.exports.createRestaurant = async(req,res,next)=>{
      const geoData = await maptilerClient.geocoding.forward(req.body.restaurants.location, { limit: 1});
      const features = geoData.features;
      console.log(geoData.features[0].geometry.coordinates, "✅ Coordinates found");
      const restaurant = new restaurantSchema(req.body.restaurants);
      restaurant.geometry = geoData.features[0].geometry;
      restaurant.images = req.files.map(f =>({url: f.path, filename: f.filename}));
      restaurant.author = req.user._id;
      console.log(restaurant.author);
      await restaurant.save();
      if (req.body.markVisited) {
        await Visit.findOneAndUpdate(
          { user: req.user._id, restaurant: restaurant._id },
          { $setOnInsert: { user: req.user._id, restaurant: restaurant._id } },
          { upsert: true }
        );
      }
      console.log(restaurant)
      req.flash('success','you made a new farm');
      res.redirect(`/restaurants/${restaurant._id}`);

}

module.exports.getRestaurant = async(req,res)=>{
      const {id} = req.params;
      const restaurants = await restaurantSchema.findById(id).populate({path:'reviews', populate:{path:'author'}}).populate('author');
      if(!restaurants){
        req.flash('error','cannot find that restaurant');
        return res.redirect('/restaurants');
      }
      res.render('restaurants/show', {restaurants});
}

module.exports.renderEdit = async(req,res)=>{
      const {id} = req.params;
      const restaurants = await restaurantSchema.findById(id);
      if(!restaurants){
        req.flash('error','cannot find that restaurant');
        return res.redirect('/restaurants');
      }
      res.render('restaurants/edit', {restaurants, restaurantTags, mealTags});
}

module.exports.editRestaurant = async(req,res)=>{
      const {id} = req.params;
      const geoData = await maptilerClient.geocoding.forward(req.body.restaurants.location, { limit: 1 });

      const restaurant  = await restaurantSchema.findByIdAndUpdate(id, {...req.body.restaurants}, {runValidators:true, new:true});
      restaurant.geometry = geoData.features[0].geometry;

      const imgs = req.files.map(f =>({url: f.path, filename: f.filename}));
      restaurant.images.push(...imgs);
      await restaurant.save();
      if(req.body.deleteImages){
            for(let filename of req.body.deleteImages){
                  await cloudinary.uploader.destroy(filename);
            }
            await restaurant.updateOne({$pull:{images: {filename:{$in:req.body.deleteImages}}}});
            console.log(restaurant);
      }
      req.flash('success','you made a new farm');
      res.redirect(`/restaurants/${restaurant._id}`);
}

module.exports.deleteRestaurant = async(req,res)=>{
      const {id} = req.params;
      await restaurantSchema.findByIdAndDelete(id);
      req.flash('error','you deleted a farm');
      res.redirect('/restaurants');
}
