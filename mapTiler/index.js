const maptilerClient = require('@maptiler/client');

maptilerClient.config.apiKey =  process.env.MAPTILER_API_KEY

module.exports = maptilerClient;