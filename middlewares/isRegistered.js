module.exports = (req, res, next) => {
  if (req.user.role === 0 || req.user.role === 1 || req.user.role === 3) {
    return res.send('You are not allowed!');
  };

  next();
};