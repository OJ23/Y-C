const joi = require('joi')
module.exports.restaurantsValid = joi.object({
    restaurants: joi.object({
      title:joi.string().required(),
      description: joi.string().required(),
      rating: joi.number().required().min(0),
      location: joi.string().required(),
      image: joi.string().required(),
      price: joi.number().required().min(0)

    }).required()
});
module.exports.reviewsValid = joi.object({
    review: joi.object({
      rating: joi.number().required(),
      body: joi.string().required()
    }).required()
})