const express = require('express');
const router = express.Router();
const passport = require('passport');
const catchAsync = require('../utilities/catchasync');
const { storeReturnTo } = require('../middleware');
const user = require ('../controllers/users');

router.route('/register')
    .get(user.getRegister )
    .post(catchAsync(user.createUser));

router.route('/login')
    .get(user.getLogin)
    .post(storeReturnTo,passport.authenticate('local',{failureFlash:true,failureRedirect: '/login'}),user.userLogin);

router.get('/logout', user.userLogout); 
module.exports = router;