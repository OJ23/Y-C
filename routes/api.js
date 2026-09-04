const express = require('express');
const passport = require('passport');
const catchAsync = require('../utilities/catchasync');
const api = require('../controllers/api');

const router = express.Router();
const requireApiLogin = (req, res, next) => req.isAuthenticated() ? next() : res.status(401).json({ error: 'Authentication required.' });

router.get('/feed', catchAsync(api.feed));
router.get('/profile', requireApiLogin, api.profile);
router.post('/session', passport.authenticate('local'), (req, res) => res.json({ username: req.user.username, role: req.user.role }));
router.delete('/session', requireApiLogin, (req, res, next) => req.logout(error => error ? next(error) : res.status(204).end()));
router.post('/bookmarks/:type/:id', requireApiLogin, catchAsync(api.addBookmark));
router.delete('/bookmarks/:type/:id', requireApiLogin, catchAsync(api.removeBookmark));
router.post('/restaurants', requireApiLogin, catchAsync(api.createRestaurant));

module.exports = router;
