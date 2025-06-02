const restaurantSchema = require('../models/restaurant');


module.exports.index = async(req, res) =>{
    const restaurants = await restaurantSchema.find({});
    res.render('restaurants/index', {restaurants});
}

module.exports.newForm = async(req,res)=>{
  console.log(req.flash)
    res.render('restaurants/new');
}

module.exports.createRestaurant = async(req,res,next)=>{
        const restaurant = new restaurantSchema(req.body.restaurants);
        restaurant.author = req.user._id;
        console.log(restaurant.author);
        console.log('📁 req.file:', req.file);
        console.log('📦 req.body:', req.body);


            if (req.file) {
            // req.file.path contains the Cloudinary URL
            restaurant.image = req.file.path; 
            }
        await restaurant.save();
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
      const rests  = await restaurantSchema.findByIdAndUpdate(id, {...req.body.restaurants}, {runValidators:true, new:true});
      req.flash('success','you made a new farm')
      res.redirect(`/restaurants/${rests._id}`);
}

module.exports.deleteRestaurant = async(req,res)=>{
      const {id} = req.params;
      await restaurantSchema.findByIdAndDelete(id);
      req.flash('error','you deleted a farm');
      res.redirect('/restaurants');
}