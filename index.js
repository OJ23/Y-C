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


app.use((req, res, next) => {
  console.log(`📥 Received ${req.method} request to ${req.originalUrl}`);
  next();
});
app.post('*', (req, res, next) => {
  console.log('🔥 Caught POST to:', req.originalUrl);
  next();
});



mongoose.connect('mongodb://127.0.0.1/YP')
    .then(()=> {
      console.log('Connected to the database')  
    })
    .catch(err =>{
      console.log('Error connecting to the database', err.message)
    });

const sessionOptions = {
  secret:'notagoodsecret',
  resave:false, 
  saveUninitialized: false,
  cookie:{
    httpOnly: true,
    expires: Date.now()+ 1000 * 60*60*24*7,
    maxAge: 1000 * 60*60*24*7
  }
}
app.use(session(sessionOptions));
app.set('view engine','ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.urlencoded({extended:true}));
app.use(express.json());
app.use(methodOverride('_method'));
app.engine('ejs', ejsMate);
app.use(express.static(path.join(__dirname, 'public')));
app.use(flash());

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
  next();
});

app.use('/restaurants', restaurantRoutes);
app.use('/restaurants/:id/reviews',reviewRoutes);
app.use('/',userRoutes);





app.get('/', (req, res) => {
    res.render('Home');
});


// app.all('*', (req,res,next)=>{
//   next(new expressError("PAGE NOT FOUND", 404))
// });

app.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    console.error("💥 Multer error:", err);
    req.flash('error', 'File upload failed: ' + err.message);
    // Redirect back or render an error page:
    return res.redirect('back'); 
  }

  // General error handling:
  const statusCode = err.statusCode || 500;
  const message = err.message || "Something went wrong";
  
  console.error("💥 Error:", err);
  res.status(statusCode).render('error', { err });
});

app.listen(3000, () => {
  console.log('Server is running on port 3000');
});