module.exports = (req, res, next) => {
  if (req.user.role === 0 || req.user.role === 1 || req.user.role === 2) {
    return res.json('You are not allowed!');
  };

  next();
};