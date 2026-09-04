const mongoose = require('mongoose');
const Restaurant = require('../models/restaurant');
const Visit = require('../models/visit');

module.exports.toggleVisit = async (req, res) => {
  const { id } = req.params;
  if (!mongoose.isValidObjectId(id) || !(await Restaurant.exists({ _id: id }))) {
    if (req.accepts(['html', 'json']) === 'json') {
      return res.status(404).json({ error: 'That place no longer exists.' });
    }
    req.flash('error', 'That place no longer exists.');
    return res.redirect('/restaurants');
  }

  const filter = { user: req.user._id, restaurant: id };
  const removed = await Visit.findOneAndDelete(filter);
  const visited = !removed;
  if (visited) await Visit.create(filter);

  if (req.accepts(['html', 'json']) === 'json') {
    return res.json({ visited });
  }

  req.flash('success', visited ? 'Place added to your visits.' : 'Place removed from your visits.');
  const requestedReturn = String(req.body.returnTo || '');
  const returnTo = requestedReturn.startsWith('/') && !requestedReturn.startsWith('//')
    ? requestedReturn
    : `/restaurants/${id}`;
  res.redirect(returnTo);
};
