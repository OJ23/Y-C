const mongoose = require('mongoose');
const Restaurant = require('../models/restaurant');
const venues = require('./abuja_venues.json');

const dbUrl = process.env.DB_URL || 'mongodb://127.0.0.1/YP';

const clean = value => (value || '').trim();
const readable = value => clean(value).replaceAll('_', ' ');

const locationFor = venue => {
  const parts = [clean(venue.address), clean(venue.district)]
    .filter(Boolean)
    .filter((part, index, values) => values.indexOf(part) === index);

  if (!parts.some(part => /abuja|fct/i.test(part))) parts.push('Abuja, FCT');
  return parts.join(', ');
};

const descriptionFor = venue => {
  const category = readable(venue.category) || 'venue';
  const venueType = readable(venue.venue_type) || category;
  const cuisine = readable(venue.cuisine);
  const district = clean(venue.district) || 'Abuja';
  const stars = Number(venue.stars);

  if (category === 'hotel') {
    const starText = stars ? `${stars}-star ` : '';
    return `${venue.name} is a ${starText}${venueType} in ${district}. Explore this Abuja venue and keep it in your personal city guide.`;
  }

  const foodText = cuisine ? ` known for ${cuisine}` : '';
  const hoursText = clean(venue.opening_hours) ? ` Listed opening hours: ${venue.opening_hours}.` : '';
  return `${venue.name} is an Abuja ${venueType}${foodText}, located in ${district}.${hoursText}`;
};

const toRestaurant = venue => ({
  title: clean(venue.name),
  description: descriptionFor(venue),
  location: locationFor(venue),
  category: clean(venue.category),
  venueType: readable(venue.venue_type),
  cuisine: readable(venue.cuisine),
  phone: clean(venue.phone),
  website: clean(venue.website),
  openingHours: clean(venue.opening_hours),
  hotelStars: Number(venue.stars) || undefined,
  geometry: {
    type: 'Point',
    coordinates: [Number(venue.longitude), Number(venue.latitude)]
  },
  images: [],
  source: {
    provider: 'OpenStreetMap',
    url: clean(venue.osm_url),
    notabilityScore: Number(venue.notability_score) || undefined
  }
});

const seedDB = async () => {
  await mongoose.connect(dbUrl);
  console.log('Connected to the database');

  const restaurants = venues.map(toRestaurant);
  await Restaurant.deleteMany({});
  const inserted = await Restaurant.insertMany(restaurants);

  const counts = inserted.reduce((result, restaurant) => {
    result[restaurant.category] = (result[restaurant.category] || 0) + 1;
    return result;
  }, {});

  console.log(`Seeded ${inserted.length} Abuja venues`, counts);
};

seedDB()
  .catch(error => {
    console.error('Seeding failed:', error);
    process.exitCode = 1;
  })
  .finally(() => mongoose.connection.close());
