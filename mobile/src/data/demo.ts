import { FeedItem, ProfileSummary } from '../types';
import { imageUrl } from '../config';

export const demoFeed: FeedItem[] = [
  {
    id: 'restaurant-demo-1', type: 'restaurant', title: 'A table worth remembering', subtitle: 'Contemporary Nigerian · Abuja',
    description: 'A warm city restaurant for relaxed dinners, celebrations, and late conversations.',
    imageUrl: imageUrl('/images/discovery-hero.jpg'), recommendationReason: 'Trending near Abuja', rating: 4.7, reviewCount: 128,
    price: '$$', area: '2.4 km away', tags: ['Good for dates', 'Nigerian'], isBookmarked: false
  },
  {
    id: 'dish-demo-1', type: 'dish', title: 'Nigerian Jollof Rice', subtitle: 'Rice dishes',
    description: 'Smoky tomato-pepper rice seasoned with curry, thyme, bay leaf, and rich stock.',
    imageUrl: imageUrl('/images/recipes/web/01-nigerian-jollof-rice.jpg'), recommendationReason: 'Because you enjoy bold flavours',
    rating: 4.8, reviewCount: 94, tags: ['Spicy', 'Local favourite'], isBookmarked: false
  },
  {
    id: 'restaurant-demo-2', type: 'restaurant', title: 'Evening on the terrace', subtitle: 'Casual dining · Wuse',
    description: 'Green surroundings, thoughtful plates, and an easy atmosphere for sharing food.',
    imageUrl: imageUrl('/images/hero-rooftop-terrace.jpg'), recommendationReason: 'Popular for dinner this week', rating: 4.5,
    reviewCount: 63, price: '$$$', area: 'Wuse 2', tags: ['Outdoor', 'Work friendly'], isBookmarked: false
  },
  {
    id: 'dish-demo-2', type: 'dish', title: 'Suya', subtitle: 'Meat and grills',
    description: 'Thin beef skewers generously coated in yaji and grilled over high heat.',
    imageUrl: imageUrl('/images/recipes/web/22-suya.jpg'), recommendationReason: 'A local favourite nearby', rating: 4.9,
    reviewCount: 212, tags: ['Grilled', 'Street food'], isBookmarked: false
  }
];

export const demoProfile: ProfileSummary = {
  displayName: 'Savour explorer', username: 'savour_user', city: 'Abuja, Nigeria',
  bio: 'Finding memorable food, one table at a time.', tasteTags: ['Nigerian', 'Spicy', 'Hidden gems']
};
