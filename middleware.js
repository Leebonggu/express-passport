module.exports = function(req, res, next) {
  res.locals.loginUser = req.user || null;
  next();
};