const express = require('express');
const passport = require('passport');
const bcrypt = require('bcrypt');
const User = require('../models/user');
const router = express.Router();
const isLoggedIn = require('../middlewares')

// //must be removed to a middleware file later
// const isLoggedIn = function (req, res, next) {
//   if (req.isAuthenticated()) return next();
//   res.redirect('/login')
// }


router.get('/register', async (req, res) => {
  if (res.locals.currentUser) {
    return res.redirect('/posts')
  }
  res.render('users/register');
})
router.post('/register', async (req, res, next) => {
  if (res.locals.currentUser) {
    return res.redirect('/posts');
  }
  const { username, email, password } = req.body.user;
  const hashedPassword = await bcrypt.hash(password, 10);
  const user = new User({ username, email, password: hashedPassword });
  await user.save();
  req.login(user, function (err) {
    if (err) return next(err);
    return res.redirect('/posts');
  })
})


router.get('/login', async (req, res) => {
  if (res.locals.currentUser) {
    return res.redirect('/posts')
  }
  res.render('users/login');
})

router.post('/login', passport.authenticate('local', { successRedirect: '/posts', failureRedirect: '/login' }), (req, res) => {
  if (res.locals.currentUser) {
    return res.redirect('/posts');
  }
});


router.get('/logout', (req, res) => {
  req.logout();
  res.redirect('/posts');
})

//this route is just for testing purposes
//must be remoed later
// router.get('/secret', isLoggedIn, (req, res) => {
//   res.send('Secret');
// }) 

module.exports = router;