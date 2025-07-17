const baseJoi = require('joi');
const sanitizeHTML = require('sanitize-html');

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
      // image: joi.string().required(),
      price: joi.number().required().min(0)
    }).required(),
    deleteImages: joi.array()
});
module.exports.reviewsValid = joi.object({
    review: joi.object({
      rating: joi.number().required(),
      body: joi.string().required().escapeHTML(),
    }).required()
})