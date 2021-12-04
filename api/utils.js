function requireUser(req, res, next) {
    if (!req.user) {
      next({
        name: "MissingUserError",
        message: "You must be logged in to perform this action"
      });
    }
  console.log('req.user in utils', req.user)
    next();
  }
  
  module.exports = {
    requireUser
  }