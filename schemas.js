const baseJoi = require('joi');
const sanitizeHTML = require('sanitize-html');
const { restaurantTags, mealTags } = require('./data/restaurantTags');

const extension = (joi) =>({
    type: 'string',
    base:joi.string(),
    messages: {
      'string.escapeHTML': '{{#label}} must not include HTML!'
    },
    rules:{
      escapeHTML: {
        validate(value,helpers){
          const clean = sanitizeHTML(value,{
            allowedTags:[],
            allowedAttributes:{}
          });
          if(clean !== value) return helpers.error('string.escapeHTML',{value})
          return clean;
        }
      }
    }
})


const joi = baseJoi.extend(extension)

module.exports.restaurantsValid = joi.object({
    restaurants: joi.object({
      title:joi.string().required().escapeHTML(),
      description: joi.string().required().escapeHTML(),
      rating: joi.number().required().min(0),
      location: joi.string().required().escapeHTML(),
      tags: joi.array().items(joi.string().valid(...restaurantTags)).single().default([]),
      mealTags: joi.array().items(joi.string().valid(...mealTags)).single().default([]),
      // image: joi.string().required(),
      price: joi.number().required().min(0)
    }).required(),
    markVisited: joi.boolean().truthy('on').falsy('').default(false),
    deleteImages: joi.array().items(joi.string().escapeHTML())
});
module.exports.reviewsValid = joi.object({
    review: joi.object({
      rating: joi.number().required(),
      body: joi.string().required().escapeHTML(),
    }).required()
})
