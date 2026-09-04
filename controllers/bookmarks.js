const mongoose = require('mongoose');
const Bookmark = require('../models/bookmark');
const Recipe = require('../models/recipe');
const Restaurant = require('../models/restaurant');

const bookmarkTypes = {
  recipe: { model: Recipe, itemModel: 'Recipe', fallback: '/recipes', label: 'dish' },
  restaurant: { model: Restaurant, itemModel: 'Restaurant', fallback: '/restaurants', label: 'restaurant' }
};

module.exports.toggleBookmark = async (req, res) => {
  const type = bookmarkTypes[req.params.type];
  if (!type || !mongoose.isValidObjectId(req.params.id)) {
    req.flash('error', 'That bookmark target is not valid.');
    return res.redirect('/');
  }

  const item = await type.model.exists({ _id: req.params.id });
  if (!item) {
    req.flash('error', `That ${type.label} no longer exists.`);
    return res.redirect(type.fallback);
  }

  const filter = {
    user: req.user._id,
    itemModel: type.itemModel,
    item: req.params.id
  };
  const removed = await Bookmark.findOneAndDelete(filter);
  if (removed) {
    req.flash('success', `${type.label[0].toUpperCase() + type.label.slice(1)} removed from bookmarks.`);
  } else {
    await Bookmark.create(filter);
    req.flash('success', `${type.label[0].toUpperCase() + type.label.slice(1)} bookmarked.`);
  }

  const requestedReturn = String(req.body.returnTo || '');
  const returnTo = requestedReturn.startsWith('/') && !requestedReturn.startsWith('//')
    ? requestedReturn
    : type.fallback;
  res.redirect(returnTo);
};
