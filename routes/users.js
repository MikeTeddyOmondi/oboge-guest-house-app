const express = require('express');
const router = express.Router();
const passport = require('passport');
const { forwardAuthenticated } = require('../config/auth');
const util = require("util");
const multer = require("multer");
const GridFsStorage = require("multer-gridfs-storage");

// Login Page
router.get('/login', forwardAuthenticated, (req, res) => res.render('login', { title: 'Login', layout: './layouts/adminLayout' }));

// Login
router.post('/login', (req, res, next) => {
  passport.authenticate('local', {
    successRedirect: '/user-panel',
    failureRedirect: '/users/login',
    failureFlash: true
  })(req, res, next);
});

// Contact Form
router.post('/login/contact', (req, res, next) => {
  const {
    username,
    email,
    message,
    screenshot
  } = req.body

  console.log(
    username,
    email,
    message,
    screenshot
  );
  res.redirect('/users/login')
});

// Logout
router.get('/logout', (req, res) => {
  req.logout()
  req.flash('success_msg', 'You are logged out');
  res.redirect('/users/login');
});

module.exports = router;
