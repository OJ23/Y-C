const crypto = require('crypto');
const mongoose = require('mongoose');
const Bookmark = require('../models/bookmark');
const Recipe = require('../models/recipe');
const Restaurant = require('../models/restaurant');

const cursorSecret = () => process.env.JWT_ACCESS_SECRET || 'development-access-secret-change-me';
const sign = body => crypto.createHmac('sha256', cursorSecret()).update(body).digest('base64url');
const encodeCursor = offset => { const body = Buffer.from(JSON.stringify({ offset })).toString('base64url'); return `${body}.${sign(body)}`; };
const decodeCursor = value => {
  if (!value) return 0;
  const [body, signature] = String(value).split('.');
  if (!body || !signature || signature.length !== sign(body).length || !crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(sign(body)))) return null;
  try { const { offset } = JSON.parse(Buffer.from(body, 'base64url')); return Number.isSafeInteger(offset) && offset >= 0 ? offset : null; } catch { return null; }
};
const escapeRegex = value => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const envelope = (res, data, meta = {}) => res.json({ data, error: null, meta });

exports.feed = async (req, res) => {
  const hasLat = req.query.lat !== undefined; const hasLng = req.query.lng !== undefined;
  const lat = Number(req.query.lat); const lng = Number(req.query.lng);
  if (hasLat !== hasLng || (hasLat && (!Number.isFinite(lat) || !Number.isFinite(lng) || lat < -90 || lat > 90 || lng < -180 || lng > 180))) {
    return res.status(422).json({ data: null, error: { code: 'VALIDATION_ERROR', message: 'Latitude and longitude must be supplied together and be valid coordinates.', fields: { location: 'Use latitude -90 to 90 and longitude -180 to 180.' } }, meta: {} });
  }
  const offset = decodeCursor(req.query.cursor);
  if (offset === null) return res.status(400).json({ data: null, error: { code: 'INVALID_CURSOR', message: 'The feed cursor is invalid.' }, meta: {} });
  const limit = Math.min(30, Math.max(1, Number(req.query.limit) || 20));
  const filter = String(req.query.filter || 'for-you');
  const query = String(req.query.q || '').trim().slice(0, 100);
  const regex = query ? new RegExp(escapeRegex(query), 'i') : null;
  const restaurantQuery = regex ? { $or: [{ title: regex }, { description: regex }, { location: regex }, { cuisine: regex }, { tags: regex }] } : {};
  const recipeQuery = regex ? { $or: [{ title: regex }, { category: regex }, { group: regex }, { summary: regex }] } : {};
  const [restaurants, recipes, bookmarks] = await Promise.all([
    filter !== 'dish' && filter !== 'moment' ? Restaurant.find(restaurantQuery).sort({ _id: -1 }).limit(100).lean() : [],
    filter !== 'restaurant' && filter !== 'moment' ? Recipe.find(recipeQuery).sort({ _id: -1 }).limit(100).lean() : [],
    req.user ? Bookmark.find({ user: req.user._id }).select('item itemModel').lean() : []
  ]);
  const saved = new Set(bookmarks.map(item => `${item.itemModel}:${item.item}`));
  const mixed = [];
  for (let index = 0; index < Math.max(restaurants.length, recipes.length); index += 1) {
    const place = restaurants[index]; const dish = recipes[index];
    if (place) mixed.push({ id: String(place._id), type: 'restaurant', title: place.title, subtitle: [place.cuisine, place.location].filter(Boolean).join(' · ') || 'Restaurant', description: place.description || 'A place worth discovering.', imageUrl: place.images?.[0]?.url || '/images/discovery-hero.jpg', recommendationReason: filter === 'nearby' ? 'Near your selected area' : 'Recommended for you', rating: place.rating || undefined, reviewCount: place.reviews?.length || undefined, price: place.price ? '$'.repeat(Math.min(4, place.price)) : undefined, area: place.location, tags: [...(place.tags || []), ...(place.mealTags || [])].slice(0, 3), isBookmarked: saved.has(`Restaurant:${place._id}`) });
    if (dish) mixed.push({ id: String(dish._id), type: 'dish', title: dish.title, subtitle: dish.category || dish.group || 'Dish', description: dish.summary, imageUrl: `/images/recipes/web/${dish.image}`, recommendationReason: 'A Nigerian favourite to try', tags: [dish.group, dish.category].filter(Boolean), isBookmarked: saved.has(`Recipe:${dish._id}`) });
  }
  const items = mixed.slice(offset, offset + limit); const nextOffset = offset + items.length;
  return envelope(res, { items, nextCursor: nextOffset < mixed.length ? encodeCursor(nextOffset) : null }, { feedSessionId: req.get('x-feed-session-id') || crypto.randomUUID() });
};

const targets = { restaurant: { model: Restaurant, itemModel: 'Restaurant' }, dish: { model: Recipe, itemModel: 'Recipe' } };
exports.listBookmarks = async (req, res) => {
  const target = targets[req.query.type] || targets.restaurant;
  const bookmarks = await Bookmark.find({ user: req.user._id, itemModel: target.itemModel }).sort({ createdAt: -1 }).limit(Math.min(30, Number(req.query.limit) || 20)).populate('item').lean();
  return envelope(res, { items: bookmarks.filter(x => x.item).map(x => ({ id: x.item._id, type: req.query.type || 'restaurant' })), nextCursor: null });
};
exports.addBookmark = async (req, res) => {
  const { entityType, entityId } = req.body; const target = targets[entityType];
  if (!target || !mongoose.isValidObjectId(entityId) || !(await target.model.exists({ _id: entityId }))) return res.status(404).json({ data: null, error: { code: 'NOT_FOUND', message: 'Item not found.' }, meta: {} });
  await Bookmark.findOneAndUpdate({ user: req.user._id, itemModel: target.itemModel, item: entityId }, { $setOnInsert: { user: req.user._id, itemModel: target.itemModel, item: entityId } }, { upsert: true });
  return res.status(201).json({ data: { bookmarked: true }, error: null, meta: {} });
};
exports.removeBookmark = async (req, res) => {
  const target = targets[req.params.type]; if (!target) return res.status(404).json({ data: null, error: { code: 'NOT_FOUND', message: 'Item not found.' }, meta: {} });
  await Bookmark.deleteOne({ user: req.user._id, itemModel: target.itemModel, item: req.params.entityId });
  return envelope(res, { bookmarked: false });
};
