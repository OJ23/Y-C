
const reviewSchema = require('../models/review')
const restaurantSchema = require('../models/restaurant');

module.exports.createReview = async(req,res)=>{
    const restaurant = await restaurantSchema.findById(req.params.id);
    console.log(req.body)
    const review = new reviewSchema(req.body.review)
    console.log(req.body);
    restaurant.reviews.push(review);
    review.author = req.user._id;
    await review.save();
    await restaurant.save();
    req.flash('success','you made a new review')
    res.redirect(`/restaurants/${restaurant._id}`);
}

module.exports.destroyReview = async(req,res)=>{
    const {id, reviewId} = req.params;
    const restaurant = await restaurantSchema.findByIdAndUpdate(id, {pull:{reviews:reviewId}});
    await reviewSchema.findByIdAndDelete(reviewId);
    req.flash('danger','you deleted a farm')
    res.redirect(`/restaurants/${restaurant._id}`);
  }