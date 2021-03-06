const isLoggedIn = function (req, res, next) {
  if (req.isAuthenticated()) return next();
  req.session.returnTo = req.originalUrl;
  res.redirect('/login');
}

module.exports = isLoggedIn;