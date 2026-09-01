// require('dotenv').config();
// // console.log('Full ENV:', process.env); // Add this

// console.log('CLOUD NAME:', process.env.CLOUDINARY_CLOUD_NAME);

// require('dotenv').config();


if(process.env.NODE_ENV !== "production"){
  require('dotenv').config()
}

// console.log('ENV:', process.env.CLOUDINARY_CLOUD_NAME, process.env.CLOUDINARY_KEY, process.env.CLOUDINARY_SECRET);


const express  = require('express');
const app = express();
const path = require('path');
const mongoose = require('mongoose');
const methodOverride = require('method-override');
const ejsMate = require('ejs-mate');
const session = require('express-session');
const flash = require('connect-flash');

const joi = require('joi');
const restaurantRoutes = require('./routes/restaurant.js');
const reviewRoutes = require('./routes/reviews.js')
const userRoutes  = require('./routes/user.js');

const passport = require('passport');
const localStrategy = require('passport-local');
const User = require('./models/user.js');
const multer = require('multer');
const mongoSanitize = require('express-mongo-sanitize');
const helmet = require('helmet');
const Restaurant = require('./models/restaurant.js');


// app.use((req, res, next) => {
//   console.log(`📥 Received ${req.method} request to ${req.originalUrl}`);
//   next();
// });
// app.post('*', (req, res, next) => {
//   console.log('🔥 Caught POST to:', req.originalUrl);
//   next();
// });

// const dbUrl = process.env.DB_URL
mongoose.connect('mongodb://127.0.0.1/YP')
    .then(()=> {
      console.log('Connected to the database')  
    })
    .catch(err =>{
      console.log('Error connecting to the database', err.message)
    });

const sessionOptions = {
  name: 'blah',
  secret:'notagoodsecret',
  resave:false, 
  saveUninitialized: false,
  cookie:{
    httpOnly: true,
    // secure:true, // this is so noone can gain access if it isnt https
    expires: Date.now()+ 1000 * 60*60*24*7,
    maxAge: 1000 * 60*60*24*7
  }
}

const scriptSrcUrls = [
    "https://stackpath.bootstrapcdn.com/",
    // "https://api.tiles.mapbox.com/",
    // "https://api.mapbox.com/",
    "https://kit.fontawesome.com/",
    "https://cdnjs.cloudflare.com/",
    "https://cdn.jsdelivr.net",
    "https://cdn.maptiler.com/",
];
const styleSrcUrls = [
    "https://kit-free.fontawesome.com/",
    "https://stackpath.bootstrapcdn.com/",
    // "https://api.mapbox.com/",
    // "https://api.tiles.mapbox.com/",
    "https://fonts.googleapis.com/",
    "https://use.fontawesome.com/",
    "https://cdn.jsdelivr.net",
    "https://cdn.maptiler.com/",
];
const connectSrcUrls = [
    // "https://api.mapbox.com/",
    // "https://a.tiles.mapbox.com/",
    // "https://b.tiles.mapbox.com/",
    // "https://events.mapbox.com/",
    "https://api.maptiler.com/",
    "https://*.maptiler.com/",
    "https://*.tiles.maptiler.com/",
    "https://cdn.jsdelivr.net/",
];
const fontSrcUrls = [
  "https://cdn.maptiler.com/",
  "https://fonts.gstatic.com/",
  "https://fonts.openmaptiles.org/"
];

app.use(session(sessionOptions));
app.set('view engine','ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.urlencoded({extended:true}));
app.use(express.json());
app.use(express.static('public')); // In your main app file
app.use(methodOverride('_method'));
app.engine('ejs', ejsMate);
app.use(express.static(path.join(__dirname, 'public')));
app.use(flash());
app.use(mongoSanitize());

app.use(
  helmet.contentSecurityPolicy({
    directives:{
      defaultSrc:["'self'"],
      connectSrc:["'self'", ...connectSrcUrls],
      scriptSrc:["'unsafe-inline'","'self'", ...scriptSrcUrls],
      styleSrc:["'self'","'unsafe-inline'", ...styleSrcUrls],
      workerSrc:["'self'","blob:"],
      objectSrc:[],
      imgSrc: [
              "'self'",
              "blob:",
              "data:",
              "https://res.cloudinary.com/dzdt4kihv/",//should match your cloudinary acct

                "https://api.maptiler.com/",
                "https://*.maptiler.com/",
              ],
      fontSrc:["'self'",...fontSrcUrls],
    }
  })
);

app.use(passport.initialize());
app.use(passport.session());

passport.use(new localStrategy(User.authenticate()))
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req, res, next) => {
  res.locals.message = req.flash('success');
  res.locals.error = req.flash('error');
  res.locals.signal = req.flash('signal'); // optional, if you're using this elsewhere
  res.locals.currentUser = req.user;
  res.locals.currentPath = req.path;
  next();
});

app.use('/restaurants', restaurantRoutes);
app.use('/restaurants/:id/reviews',reviewRoutes);
app.use('/',userRoutes);





app.get('/', async (req, res, next) => {
  try {
    const recentRestaurants = await Restaurant.find({}).sort({ _id: -1 }).limit(3);
    res.render('home', { recentRestaurants, pageTitle: 'Discover restaurants worth remembering' });
  } catch (error) {
    next(error);
  }
});


// app.all('*', (req,res,next)=>{
//   next(new expressError("PAGE NOT FOUND", 404))
// });

app.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    console.error("💥 Multer error:", err);
    req.flash('error', 'File upload failed: ' + err.message);
    // Redirect back or render an error page:
    return res.send('multer error default page'); 
  }

  // General error handling:
  const statusCode = err.statusCode || 500;
  const message = err.message || "Something went wrong";
  
  console.error("💥 Error:", err);
  res.status(statusCode).render('error', { err });
});

const port = process.env.PORT || 5173;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
