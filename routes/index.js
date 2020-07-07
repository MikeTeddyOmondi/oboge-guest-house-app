const express = require('express');
const router = express.Router();
const { ensureAuthenticated, forwardAuthenticated } = require('../config/auth');

// Welcome Page
router.get('/', forwardAuthenticated, (req, res) => res.render('welcome'));

// Dashboard
//router.get('/dashboard', ensureAuthenticated, (req, res) =>
//  res.render('dashboard', {
//    user: req.user
//  })
//);

// Admin dashboard
router.get('/dashboard', ensureAuthenticated, (req, res) =>
  res.render('admin/dashboard', {
    user: req.user,
    title: 'Admin'
  })
);

// Users
router.get('/users', ensureAuthenticated, (req, res) =>
  res.render('admin/users', {
    user: req.user,
    title: 'Users'
  })
);

module.exports = router;
