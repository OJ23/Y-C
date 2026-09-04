const express = require('express');
const router = express.Router();
const catchAsync = require('../utilities/catchasync');
const { isLoggedIn } = require('../middleware');
const visits = require('../controllers/visits');

router.post('/restaurant/:id', isLoggedIn, catchAsync(visits.toggleVisit));

module.exports = router;
