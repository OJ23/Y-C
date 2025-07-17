const restaurant = require('../models/restaurant');
const restaurantSchema = require('../models/restaurant');
const {cloudinary} = require('../cloudinary/index');
const maptilerClient = require("../mapTiler/index");


module.exports.index = async(req, res) =>{
    const restaurants = await restaurantSchema.find({});
    res.render('restaurants/index', {restaurants});
}

module.exports.newForm = async(req,res)=>{
  console.log(req.flash)
    res.render('restaurants/new');
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
      res.render('restaurants/edit', {restaurants});
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