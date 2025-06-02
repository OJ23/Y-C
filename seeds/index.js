const mongoose = require('mongoose');
const restaurantSchema = require('../models/restaurant');
const cities = require('./cities');
const {places, descriptors} = require('./seedhelpers');

mongoose.connect('mongodb://127.0.0.1/YP')
    .then(()=> {
      console.log('Connected to the database')
    })
    .catch(err =>{
      console.log('Error connecting to the database')
    });


const seedDB = async () => {
    await restaurantSchema.deleteMany({});
    for(let i= 0; i<11; i++){
        const random10 = Math.floor(Math.random()*cities.length);
        const spot = new restaurantSchema({
            title: `${descriptors[random10]} ${places[random10]}`,
            description:"Lorem ipsum dolor sit, amet consectetur adipisicing elit. Itaque fugit vitae, minus eaque ipsa dicta a esse alias! Impedit suscipit, repudiandae veritatis quidem debitis beatae laudantium reiciendis. Voluptate, odio sapiente!",
            author: '681c9dea9fdfdfcdb4779242',
            location: `${cities[random10].city}, ${cities[random10].state}`,
            rating: Math.floor(Math.random()*5),
            price: Math.floor(Math.random()*100),
            image: `https://picsum.photos/400?random=${Math.random()}`    
        })
    await spot.save();
    }}
seedDB().then(() => {
    mongoose.connection.close();
})