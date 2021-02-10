const express = require('express');
const router = express.Router();
const passport = require('passport');
const { ensureAuthenticated, forwardAuthenticated } = require('../config/auth');

// User Panel | Dashboard Page
router.get('/', ensureAuthenticated, (req, res) => res.render('panel/panel', { title: 'User Panel', layout: './layouts/panelLayout' }));

// Logout
router.get('/logout', (req, res) => {
  req.logout();
  req.flash('success_msg', 'You are logged out');
  res.redirect('/users/login');
});

module.exports = router;