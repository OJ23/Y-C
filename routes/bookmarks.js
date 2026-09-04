const express = require('express');
const catchAsync = require('../utilities/catchasync');
const { isLoggedIn } = require('../middleware');
const bookmarks = require('../controllers/bookmarks');

const router = express.Router();

router.post('/:type/:id', isLoggedIn, catchAsync(bookmarks.toggleBookmark));

module.exports = router;
