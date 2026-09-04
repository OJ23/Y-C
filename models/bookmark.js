const mongoose = require('mongoose');

const bookmarkSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  itemModel: { type: String, enum: ['Recipe', 'Restaurant'], required: true },
  item: { type: mongoose.Schema.Types.ObjectId, refPath: 'itemModel', required: true }
}, { timestamps: true });

bookmarkSchema.index({ user: 1, itemModel: 1, item: 1 }, { unique: true });

module.exports = mongoose.model('Bookmark', bookmarkSchema);
