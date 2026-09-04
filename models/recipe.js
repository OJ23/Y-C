const mongoose = require('mongoose');

const recipeSchema = new mongoose.Schema({
  title: { type: String, required: true, unique: true, trim: true },
  category: { type: String, required: true, trim: true },
  group: { type: String, enum: ['Swallow', 'Assorted', 'Fried', 'Drinks', 'Coffee', 'Cocktails'], default: 'Assorted' },
  image: { type: String, required: true },
  summary: { type: String, required: true },
  ingredients: [{ type: String, required: true }],
  process: { type: String, required: true },
  keywords: { type: String, default: '' }
}, { timestamps: true });

recipeSchema.index({ title: 'text', category: 'text', summary: 'text', ingredients: 'text', process: 'text', keywords: 'text' });

module.exports = mongoose.model('Recipe', recipeSchema);
