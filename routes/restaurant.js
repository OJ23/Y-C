console.log("✅ restaurantRoutes file loaded");



const express = require('express');
const router = express.Router();
const catchAsync = require('../utilities/catchasync');
const {isLoggedIn,validateRestaurant,isAuthor } = require('../middleware');
const restaurant = require('../controllers/restaurants');




// const multer  = require('multer');
// const {storage} = require('../cloudinary/index');
// const upload = multer({storage});
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

const logBeforeMulter = (req, res, next) => {
  console.log('🌟 before multer');
  console.log(req.body);
  console.log(req.files);
  next();
};

router.route('/')
  .get(catchAsync(restaurant.index))
  .post(
  logBeforeMulter,
  upload.array('images',2),
  (req, res, next) => {
  console.log("🌩 multer did not crash silently");
  next();
},
  logAfterMulter, // add this!
);

  // .post(isLoggedIn, validateRestaurant, catchAsync(restaurant.createRestaurant));

  // .post(
  //   isLoggedIn,
  //   upload.single('image'),
  //   catchAsync(async (req, res, next) => {
  //     console.log("🔔 Route hit!");
  //     console.log("BODY:", req.body);
  //     console.log("FILE:", req.file);

  //     const restaurant = new restaurantSchema(req.body.restaurants);
  //     restaurant.author = req.user._id;

  //     if (req.file) {
  //       restaurant.image = {
  //         url: req.file.path,
  //         filename: req.file.filename
  //       };
  //     }

  //     await restaurant.save();
  //     req.flash('success', 'You made a new restaurant!');
  //     res.redirect(`/restaurants/${restaurant._id}`);
  //   })
  // );


router.get('/new', isLoggedIn,restaurant.newForm);

router.route('/:id')
    .get(catchAsync(restaurant.getRestaurant))
    .put(isLoggedIn,validateRestaurant, isAuthor, catchAsync(restaurant.editRestaurant))
    .delete(isAuthor, catchAsync(restaurant.deleteRestaurant))

router.get('/:id/edit', isLoggedIn, isAuthor,catchAsync(restaurant.renderEdit));    


module.exports = router;