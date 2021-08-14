const User = require('../models/user');
const bcrypt = require('bcrypt');
const passport = require('passport');
const localStrategy = require('passport-local').Strategy;

module.exports = function () {
  passport.use(new localStrategy(function (username, password, done) {
    User.findOne({ username: username }, function (err, user) {
      if (err) return done(err);
      if (!user) return done(null, false, { message: 'Incorrect Username' });

      bcrypt.compare(password, user.password, function (err, res) {
        if (err) return done(err);
        if (res === false) {
          return done(null, false, { message: 'Incorrect password' });
        }
        return done(null, user)
      })
    })
  }))
}