if (process.env.NODE_ENV !== 'production') require('dotenv').config();

const mongoose = require('mongoose');
const Recipe = require('../models/recipe');
const recipes = require('../data/recipes');

const dbUrl = 'mongodb://127.0.0.1/YP';

async function seedRecipes() {
  await mongoose.connect(dbUrl);
  const operations = recipes.map(recipe => ({
    updateOne: {
      filter: { title: recipe.title },
      update: { $set: recipe },
      upsert: true
    }
  }));
  const result = await Recipe.bulkWrite(operations);
  console.log(`Recipes ready: ${recipes.length} (${result.upsertedCount} inserted, ${result.modifiedCount} updated).`);
}

seedRecipes()
  .catch(error => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => mongoose.connection.close());
