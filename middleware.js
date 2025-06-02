
const expressError = require('../campgrounds/utilities/espresserror');
const {restaurantsValid} = require('../campgrounds/schemas');
const {reviewsValid} = require('../campgrounds/schemas');
const reviewSchema = require('./models/review.js');
const restaurantSchema = require('../campgrounds/models/restaurant.js');




const isLoggedIn = (req,res,next)=>{

console.log('2')
    console.log('isLoggedIn check:', req.isAuthenticated());
    if (!req.isAuthenticated()) {
      console.log(req.originalUrl)
      req.session.returnTo = req.originalUrl; 
      req.flash('error', 'you must be signed in')
      return res.redirect('/login');
    }
    next();
  };

const storeReturnTo = (req, res, next) => {
    if (req.session.returnTo) {
        res.locals.returnTo = req.session.returnTo;
    }
    next();
}

const validateRestaurant = (req,res,next) =>{
  console.log('3')
    const {error} = restaurantsValid.validate(req.body);
    if(error){
      console.log("💬 req.body:", req.body);
      const msg = error.details.map(el =>el.message).join(',')
      throw new expressError(msg, 400)
    }else{
      next()
    }
  }
const isAuthor = async(req,res,next) =>{
    const {id} = req.params;
    const restaurant = await restaurantSchema.findById(id)
      if(!restaurant.author.equals(req.user._id)){
        req.flash('error','you do not have such permission');
        return res.redirect(`/restaurants/${id}`);
      }
      next();
}

const isReviewAuthor = async(req,res,next) =>{
    const {id,reviewId} = req.params;
    const review = await reviewSchema.findById(reviewId);
      if(!review.author.equals(req.user._id)){
        req.flash('error','you do not have such permission');
        return res.redirect(`/restaurants/${id}`);
      }
      next();
}
const validateReview = (req,res,next)=>{
    const {error} = reviewsValid.validate(req.body)
    if(error){
      const msg = error.details.map(el =>el.message).join(',')
      console.log(req.body)
      throw new expressError(msg, 400)
    }else{
      next()
    }
}

    

  module.exports = {isLoggedIn, storeReturnTo, validateRestaurant, isAuthor, validateReview, isReviewAuthor};