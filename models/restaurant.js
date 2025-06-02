const { types } = require('joi');
const mongoose = require('mongoose');
const  Schema = mongoose.Schema;
const Review = require('./review');

const restaurantSchema = new Schema({
    title : String,
    description : String,
    rating : Number,
    location : String,
    image : String,
    price : Number,
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
})

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