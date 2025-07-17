

const express = require('express');
const router = express.Router();
const catchAsync = require('../utilities/catchasync');
const {isLoggedIn,validateRestaurant,isAuthor } = require('../middleware');
const restaurant = require('../controllers/restaurants');


const multer = require('multer');
// const upload = multer({ dest: 'uploads/' }); // Use local folder temporarily
const { storage } = require('../cloudinary/index'); // your cloudinary multer storage config
const upload = multer({ storage });

const logAfterMulter = (req, res, next) => {
  console.log('🌟 after multer');
  console.log('📁 file:', req.files);
  console.log('🧾 body:', req.body);
  next();
};

// const logBeforeMulter = (req, res, next) => {
//   console.log('🌟 before multer');
//   console.log(req.body);
//   console.log(req.files);
//   next();
// };

router.route('/')
  .get(catchAsync(restaurant.index))
  .post(isLoggedIn,upload.array('images',2), validateRestaurant,catchAsync(restaurant.createRestaurant));

//   .post(
//   logBeforeMulter,
//   upload.array('images',2),
//   (req, res, next) => {
//   console.log("🌩 multer did not crash silently");
//   next();
// },
//   logAfterMulter, // add this!
// );


router.get('/new', isLoggedIn,restaurant.newForm);

router.route('/:id')
    .get(catchAsync(restaurant.getRestaurant))
    .put(isLoggedIn,upload.array('images',2), isAuthor,validateRestaurant,catchAsync(restaurant.editRestaurant))
    .delete(isLoggedIn,isAuthor, catchAsync(restaurant.deleteRestaurant))

router.get('/:id/edit', isLoggedIn, isAuthor,catchAsync(restaurant.renderEdit));    


module.exports = router;