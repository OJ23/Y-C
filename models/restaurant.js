const { types, required } = require('joi');
const mongoose = require('mongoose');
const  Schema = mongoose.Schema;
const Review = require('./review');
const { coordinates } = require('@maptiler/client');
const { restaurantTags, mealTags } = require('../data/restaurantTags');



const imageSchema = new Schema({
    url: String,
    filename: String
});
imageSchema.virtual('thumbnail').get(function(){
    return this.url.replace('/upload','/upload/w_200');
});

const restaurantSchema = new Schema({
    title : String,
    description : String,
    rating : Number,
    location : String,
    category: String,
    venueType: String,
    cuisine: String,
    tags: [{ type: String, enum: restaurantTags }],
    mealTags: [{ type: String, enum: mealTags }],
    phone: String,
    website: String,
    openingHours: String,
    hotelStars: Number,
    source: {
        provider: String,
        url: String,
        notabilityScore: Number
    },
    images : [imageSchema],
    price : Number,
    geometry: {
        type:{
            type: String,
            enum: ['Point'],
            required: true
        },
        coordinates:{
            type: [Number],
            required: true
        }
    },
    author:{
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    reviews: [
        {
            type: Schema.Types.ObjectId,
            ref: 'Review'
            
        }
    ]
});

restaurantSchema.index({ geometry: '2dsphere' });

// const restaurantSchema = new Schema({
//     title: { type: String, required: true },
//     description: { type: String },
//     rating: { type: Number, min: 0, max: 5 },
//     location: { type: String, required: true },
//     image: { type: String,},
//     price: { type: Number, min: 0 }
// });
restaurantSchema.post('findOneAndDelete', async(doc)=>{
    if (doc) {
        await Review.deleteMany({
            _id:{$in:doc.reviews}
        })
    }
})
module.exports = mongoose.model('Restaurant', restaurantSchema);
