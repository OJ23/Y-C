const mongoose = require('mongoose');

const visitSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  restaurant: { type: mongoose.Schema.Types.ObjectId, ref: 'Restaurant', required: true }
}, { timestamps: true });

visitSchema.index({ user: 1, restaurant: 1 }, { unique: true });

module.exports = mongoose.model('Visit', visitSchema);
