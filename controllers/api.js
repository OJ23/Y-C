const mongoose = require('mongoose');
const maptilerClient = require('../mapTiler');
const Bookmark = require('../models/bookmark');
const Recipe = require('../models/recipe');
const Restaurant = require('../models/restaurant');
const Visit = require('../models/visit');
const sanitizeHtml = require('sanitize-html');

const PAGE_SIZE = 8;
const escapeRegex = value => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const encodeCursor = offset => Buffer.from(JSON.stringify({ offset }), 'utf8').toString('base64url');
const decodeCursor = cursor => {
  if (!cursor) return 0;
  try {
    const value = JSON.parse(Buffer.from(cursor, 'base64url').toString('utf8'));
    return Number.isSafeInteger(value.offset) && value.offset >= 0 ? value.offset : 0;
  } catch { return 0; }
};

const restaurantItem = (restaurant, savedIds, reason) => ({
  id: String(restaurant._id), type: 'restaurant', title: restaurant.title,
  subtitle: [restaurant.cuisine, restaurant.location].filter(Boolean).join(' · ') || 'Restaurant',
  description: restaurant.description || 'A place worth discovering.',
  imageUrl: restaurant.images?.[0]?.url || '/images/discovery-hero.jpg',
  recommendationReason: reason || 'Recommended near Abuja', rating: restaurant.rating || undefined,
  reviewCount: restaurant.reviews?.length || undefined, price: restaurant.price ? '$'.repeat(Math.min(4, restaurant.price)) : undefined,
  area: restaurant.location || undefined, tags: [...(restaurant.tags || []), ...(restaurant.mealTags || [])].slice(0, 3),
  isBookmarked: savedIds.has(String(restaurant._id))
});

const recipeItem = (recipe, savedIds, reason) => ({
  id: String(recipe._id), type: 'dish', title: recipe.title, subtitle: recipe.category || recipe.group || 'Dish',
  description: recipe.summary, imageUrl: `/images/recipes/web/${recipe.image}`,
  recommendationReason: reason || 'A Nigerian favourite to try', tags: [recipe.group, recipe.category].filter(Boolean).slice(0, 3),
  isBookmarked: savedIds.has(String(recipe._id))
});

module.exports.feed = async (req, res) => {
  const offset = decodeCursor(String(req.query.cursor || ''));
  const type = String(req.query.type || 'for-you');
  const query = String(req.query.q || '').trim().slice(0, 100);
  const regex = query ? new RegExp(escapeRegex(query), 'i') : null;
  const restaurantFilter = regex ? { $or: [{ title: regex }, { description: regex }, { location: regex }, { cuisine: regex }, { tags: regex }, { mealTags: regex }] } : {};
  const recipeFilter = regex ? { $or: [{ title: regex }, { category: regex }, { group: regex }, { summary: regex }, { keywords: regex }] } : {};
  const wantsRestaurants = !['dish', 'moment'].includes(type);
  const wantsDishes = !['restaurant', 'moment', 'nearby', 'open'].includes(type);
  const [restaurants, recipes] = await Promise.all([
    wantsRestaurants ? Restaurant.find(restaurantFilter).sort({ _id: -1 }).limit(80).lean() : [],
    wantsDishes ? Recipe.find(recipeFilter).sort({ _id: -1 }).limit(80).lean() : []
  ]);
  const reason = type === 'trending' ? 'Trending with Savour diners' : type === 'nearby' ? 'Near your selected area' : type === 'budget' ? 'Good value for your next outing' : undefined;
  const mixed = [];
  const length = Math.max(restaurants.length, recipes.length);
  for (let index = 0; index < length; index += 1) {
    if (restaurants[index]) mixed.push(restaurantItem(restaurants[index], res.locals.savedRestaurantIds, reason));
    if (recipes[index]) mixed.push(recipeItem(recipes[index], res.locals.savedRecipeIds, reason));
  }
  const items = mixed.slice(offset, offset + PAGE_SIZE);
  const nextOffset = offset + items.length;
  res.json({ items, nextCursor: nextOffset < mixed.length ? encodeCursor(nextOffset) : null });
};

module.exports.profile = (req, res) => res.json({
  displayName: req.user.username, username: req.user.username, city: 'Abuja, Nigeria',
  bio: 'Finding memorable food, one table at a time.', tasteTags: []
});

const bookmarkModels = {
  dish: { model: Recipe, itemModel: 'Recipe' },
  restaurant: { model: Restaurant, itemModel: 'Restaurant' }
};

module.exports.addBookmark = async (req, res) => {
  const target = bookmarkModels[req.params.type];
  if (!target || !mongoose.isValidObjectId(req.params.id) || !(await target.model.exists({ _id: req.params.id }))) return res.status(404).json({ error: 'Item not found.' });
  await Bookmark.findOneAndUpdate(
    { user: req.user._id, itemModel: target.itemModel, item: req.params.id },
    { $setOnInsert: { user: req.user._id, itemModel: target.itemModel, item: req.params.id } },
    { upsert: true }
  );
  res.status(201).json({ bookmarked: true });
};

module.exports.removeBookmark = async (req, res) => {
  const target = bookmarkModels[req.params.type];
  if (!target || !mongoose.isValidObjectId(req.params.id)) return res.status(404).json({ error: 'Item not found.' });
  await Bookmark.findOneAndDelete({ user: req.user._id, itemModel: target.itemModel, item: req.params.id });
  res.json({ bookmarked: false });
};

module.exports.createRestaurant = async (req, res) => {
  const name = String(req.body.name || '').trim().slice(0, 120);
  const address = String(req.body.address || '').trim().slice(0, 240);
  const cuisine = String(req.body.cuisine || '').trim().slice(0, 80);
  const description = sanitizeHtml(String(req.body.description || ''), { allowedTags: [], allowedAttributes: {} }).trim().slice(0, 1500);
  if (!name || !address || !cuisine) return res.status(400).json({ error: 'Name, address, and cuisine are required.' });
  const similar = await Restaurant.findOne({ title: new RegExp(`^${escapeRegex(name)}$`, 'i'), location: new RegExp(escapeRegex(address), 'i') });
  if (similar) return res.status(409).json({ error: 'A similar restaurant already exists.', restaurantId: similar._id });
  const geoData = await maptilerClient.geocoding.forward(address, { limit: 1 });
  if (!geoData.features?.[0]) return res.status(422).json({ error: 'That address could not be located.' });
  const restaurant = await Restaurant.create({ title: name, location: address, cuisine, description: description || `${cuisine} restaurant in ${address}.`, rating: 0, price: 2, geometry: geoData.features[0].geometry, author: req.user._id });
  if (req.body.visited) await Visit.create({ user: req.user._id, restaurant: restaurant._id });
  res.status(201).json({ id: restaurant._id, status: 'published' });
};
