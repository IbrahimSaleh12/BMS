const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const session = require('express-session');
const flash = require('connect-flash');
const passport = require('passport');
const User = require('./models/user');
const ejs = require('ejs');
const ejsMate = require('ejs-mate');
const methodOverride = require('method-override');
const ExpressError = require('./utils/ExpressError');
const path = require('path');
const auth = require('./config/auth');
const users = require('./routes/users');
const posts = require('./routes/posts');

const app = express();

mongoose.connect('mongodb://localhost:27017/bms',
  { useNewUrlParser: true, useUnifiedTopology: true }, async (err) => {
    if (err) {
      console.log('Error');
    } else {
      console.log('Connected to MongoDB!');
    }
  })


const sessionConfig = {
  // store,
  // name: 'session',
  secret: "verygoodsecret",
  resave: false,
  saveUninitialized: true
  // cookie: {
  //   httpOnly: true,
  //   // secure: true,
  //   expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
  //   maxAge: 1000 * 60 * 60 * 24 * 7
  // }
}
app.use(session(sessionConfig));
app.use(flash());
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));
app.use(passport.initialize());
app.use(passport.session());

app.engine('ejs', ejsMate);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));


passport.serializeUser(function (user, done) {
  done(null, user.id);
})

passport.deserializeUser(async function (id, done) {
  User.findById(id, function (err, user) {
    done(err, user)
  });
});

//create a local strategy - check if username and password are correct
auth();

app.use((req, res, next) => {
  res.locals.currentUser = req.user;
  next();
})

app.use((req, res, next) => {
  res.locals.success = req.flash('success');
  res.locals.error = req.flash('error');
  next();
})


//routes
//must be removed from here later
app.get('/', async (req, res) => {
  res.redirect('/posts');
})


app.use('/', users);
app.use('/posts', posts);


app.all('*', (req, res, next) => {
  next(new ExpressError('Page not Found', 404));
})


app.use((err, req, res, next) => {
  const { statusCode = 500 } = err;
  if (!err.message) err.message = 'Something went wrong';
  res.status(statusCode).render('error', { err });
})





app.listen(3000, () => {
  console.log('Server running on port 3000');
})