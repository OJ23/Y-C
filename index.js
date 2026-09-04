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
const MongoStore = require('connect-mongo').default;
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const pinoHttp = require('pino-http');
const flash = require('connect-flash');

const joi = require('joi');
const restaurantRoutes = require('./routes/restaurant.js');
const reviewRoutes = require('./routes/reviews.js')
const userRoutes  = require('./routes/user.js');
const bookmarkRoutes = require('./routes/bookmarks.js');
const visitRoutes = require('./routes/visits.js');
const apiRoutes = require('./routes/api.js');
const apiV1Routes = require('./routes/apiV1.js');

const passport = require('passport');
const localStrategy = require('passport-local');
const User = require('./models/user.js');
const multer = require('multer');
const mongoSanitize = require('express-mongo-sanitize');
const helmet = require('helmet');
const Restaurant = require('./models/restaurant.js');
const Recipe = require('./models/recipe.js');
const Bookmark = require('./models/bookmark.js');
const Visit = require('./models/visit.js');


// app.use((req, res, next) => {
//   console.log(`📥 Received ${req.method} request to ${req.originalUrl}`);
//   next();
// });
// app.post('*', (req, res, next) => {
//   console.log('🔥 Caught POST to:', req.originalUrl);
//   next();
// });

const localDbUrl = 'mongodb://127.0.0.1/YP';
const configuredDbUrl = process.env.MONGO_URI || process.env.DB_URL;
// Legacy DB_URL values often point at production Atlas. Development stays local
// unless MONGO_URI is explicitly supplied.
const dbUrl = process.env.NODE_ENV !== 'production' && !process.env.MONGO_URI
  ? localDbUrl
  : configuredDbUrl || localDbUrl;
if (process.env.NODE_ENV === 'production' && (!process.env.SESSION_SECRET || !process.env.JWT_ACCESS_SECRET || !process.env.JWT_REFRESH_SECRET)) {
  throw new Error('SESSION_SECRET, JWT_ACCESS_SECRET, and JWT_REFRESH_SECRET are required in production.');
}
const databaseReady = process.env.NODE_ENV === 'test'
  ? Promise.resolve(null)
  : mongoose.connect(dbUrl).catch(async error => {
      const mayUseLocalFallback = process.env.NODE_ENV !== 'production' && dbUrl !== localDbUrl;
      if (!mayUseLocalFallback) throw error;
      console.warn(`Configured MongoDB is unavailable (${error.code || error.message}). Falling back to ${localDbUrl} for development.`);
      return mongoose.connect(localDbUrl);
    });

const sessionOptions = {
  name: 'savour.sid',
  secret: process.env.SESSION_SECRET || 'development-session-secret-change-me',
  ...(process.env.NODE_ENV === 'test' ? {} : {
    store: MongoStore.create({
      clientPromise: databaseReady.then(connection => connection.connection.getClient()),
      collectionName: 'sessions'
    })
  }),
  resave:false, 
  saveUninitialized: false,
  cookie:{
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
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

if (process.env.NODE_ENV === 'production') app.set('trust proxy', 1);
if (process.env.NODE_ENV === 'production') {
  app.use(pinoHttp({
    genReqId: req => req.get('x-request-id') || require('crypto').randomUUID(),
    redact: ['req.headers.authorization', 'req.headers.cookie', 'req.body.password', 'req.body.refreshToken', 'res.headers.set-cookie']
  }));
} else {
  app.use((req, res, next) => {
    const startedAt = process.hrtime.bigint();
    req.id = req.get('x-request-id') || require('crypto').randomUUID();
    req.log = {
      error(context, message) {
        const detail = context?.err?.message || context?.code || '';
        console.error(`[${req.id}] ${message}${detail ? ` — ${detail}` : ''}`);
      }
    };
    res.on('finish', () => {
      const durationMs = Number(process.hrtime.bigint() - startedAt) / 1e6;
      console.log(`${req.method} ${req.originalUrl} ${res.statusCode} ${durationMs.toFixed(0)}ms`);
    });
    next();
  });
}
app.use(compression());
app.use(session(sessionOptions));
app.set('view engine','ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));
app.use(express.json({ limit: '1mb' }));
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

app.use(async (req, res, next) => {
  try {
    res.locals.message = req.flash('success');
    res.locals.error = req.flash('error');
    res.locals.signal = req.flash('signal');
    res.locals.currentUser = req.user;
    res.locals.currentPath = req.path;
    res.locals.currentUrl = req.originalUrl;
    res.locals.savedRecipeIds = new Set();
    res.locals.savedRestaurantIds = new Set();
    res.locals.savedRecipes = [];
    res.locals.savedRestaurants = [];
    res.locals.visitedRestaurantIds = new Set();

    if (req.user) {
      const [bookmarks, visits] = await Promise.all([
        Bookmark.find({ user: req.user._id }).sort({ createdAt: -1 }).populate('item'),
        Visit.find({ user: req.user._id }).select('restaurant')
      ]);
      bookmarks.filter(bookmark => bookmark.item).forEach(bookmark => {
        const id = String(bookmark.item._id);
        if (bookmark.itemModel === 'Recipe') {
          res.locals.savedRecipeIds.add(id);
          res.locals.savedRecipes.push(bookmark.item);
        } else if (bookmark.itemModel === 'Restaurant') {
          res.locals.savedRestaurantIds.add(id);
          res.locals.savedRestaurants.push(bookmark.item);
        }
      });
      visits.forEach(visit => res.locals.visitedRestaurantIds.add(String(visit.restaurant)));
    }
    next();
  } catch (error) {
    next(error);
  }
});

app.use('/restaurants', restaurantRoutes);
app.use('/restaurants/:id/reviews',reviewRoutes);
app.use('/',userRoutes);
app.use('/bookmarks', bookmarkRoutes);
app.use('/visits', visitRoutes);
app.use('/api', apiRoutes);
app.use('/api/v1', rateLimit({ windowMs: 60 * 1000, limit: 120, standardHeaders: 'draft-8', legacyHeaders: false }), apiV1Routes);





app.get('/', async (req, res, next) => {
  try {
    const recentRestaurants = await Restaurant.find({}).sort({ _id: -1 }).limit(3);
    const requestedSavedTab = ['moments', 'dishes', 'places'].includes(req.query.tab) ? req.query.tab : null;
    res.render('home', { recentRestaurants, requestedSavedTab, pageTitle: req.user ? 'Your Savour bookmarks' : 'Discover restaurants worth remembering' });
  } catch (error) {
    next(error);
  }
});

const escapeRegex = value => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const recipeGroups = ['Swallow', 'Assorted', 'Fried', 'Drinks', 'Coffee', 'Cocktails'];
const createRecipeFilter = query => {
  if (!query) return {};
  const regex = new RegExp(escapeRegex(query), 'i');
  return { $or: [
    { title: regex },
    { category: regex },
    { group: regex },
    { summary: regex },
    { ingredients: regex },
    { keywords: regex }
  ] };
};

app.get('/recipes/suggestions', async (req, res, next) => {
  try {
    const query = String(req.query.q || '').trim().slice(0, 100);
    if (query.length < 2) return res.json([]);
    const recipes = await Recipe.find(createRecipeFilter(query))
      .select('title category group')
      .sort({ title: 1 })
      .limit(8)
      .lean();
    res.json(recipes.map(recipe => ({
      value: recipe.title,
      label: recipe.title,
      detail: recipe.category || recipe.group || 'Recipe'
    })));
  } catch (error) {
    next(error);
  }
});

app.get('/recipes/group/:groupSlug', async (req, res, next) => {
  try {
    const recipeGroup = recipeGroups.find(group => group.toLowerCase() === req.params.groupSlug.toLowerCase());
    if (!recipeGroup) {
      const err = new Error('Recipe classification not found.');
      err.statusCode = 404;
      throw err;
    }

    const recipeQuery = String(req.query.q || '').trim().slice(0, 100);
    const searchFilter = createRecipeFilter(recipeQuery);
    const filter = recipeQuery ? { $and: [{ group: recipeGroup }, searchFilter] } : { group: recipeGroup };
    const recipes = await Recipe.find(filter).sort({ title: 1 });
    res.render('recipes/group', {
      recipes,
      recipeGroup,
      recipeQuery,
      pageTitle: `${recipeGroup} recipes`
    });
  } catch (error) {
    next(error);
  }
});

app.get('/recipes', async (req, res, next) => {
  try {
    const recipeQuery = String(req.query.q || '').trim().slice(0, 100);
    const recipeFilter = createRecipeFilter(recipeQuery);
    const recipes = await Recipe.find(recipeFilter).sort({ group: 1, title: 1 });
    const totalRecipes = recipes.length;
    const recipeCategoryCounts = Object.fromEntries(recipeGroups.map(group => [
      group,
      recipes.filter(recipe => recipe.group === group).length
    ]));
    res.render('recipes/index', {
      recipes,
      recipeQuery,
      totalRecipes,
      recipeCategoryCounts,
      pageTitle: 'Nigerian Recipe Finder'
    });
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

  if (req.originalUrl.startsWith('/api/')) {
    const statusCode = err.statusCode || 500;
    const message = statusCode === 500 && process.env.NODE_ENV === 'production' ? 'Something went wrong.' : (err.message || 'Something went wrong.');
    req.log?.error({ err, code: err.code }, message);
    return res.status(statusCode).json({ data: null, error: { code: err.code || 'INTERNAL_ERROR', message }, meta: { requestId: req.id } });
  }

  // General error handling:
  const statusCode = err.statusCode || 500;
  const message = err.message || "Something went wrong";
  
  console.error("💥 Error:", err);
  res.status(statusCode).render('error', { err });
});

const port = process.env.PORT || 5173;
if (require.main === module) {
  databaseReady
    .then(() => app.listen(port, () => console.log(`Connected to MongoDB; server is running on port ${port}`)))
    .catch(error => {
      console.error(`Database startup failed: ${error.code || error.message}`);
      process.exitCode = 1;
    });
}

module.exports = app;
