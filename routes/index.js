const express = require('express');
const router = express.Router();
const { ensureAuthenticated, forwardAuthenticated } = require('../config/auth');

// Website - Homepage
router.get('/', forwardAuthenticated, (req, res) => res.render('site', { title: 'Welcome', layout: './layouts/siteLayout' }));

// Administration
router.get('/admin', forwardAuthenticated, (req, res) => res.render('welcome', { title: 'Administration', layout: './layouts/adminLayout' }));

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
    title: 'Admin',
    layout: './layouts/adminLayout.ejs'
  })
);

// Users
router.get('/users', ensureAuthenticated, (req, res) =>
  res.render('admin/users', {
    user: req.user,
    title: 'Users',
    layout: './layouts/adminLayout.ejs'
  })
);

// Customers
router.get('/customers', ensureAuthenticated, (req, res) =>
  res.render('admin/customers', {
    user: req.user,
    title: 'Customers',
    layout: './layouts/adminLayout.ejs'
  })
);

// Room Booking
router.get('/room_bookings', ensureAuthenticated, (req, res) =>
  res.render('admin/room_bookings', {
    user: req.user,
    title: 'Room Bookings',
    layout: './layouts/adminLayout.ejs'
  })
);

// Room Info
router.get('/room_info', ensureAuthenticated, (req, res) =>
  res.render('admin/room_info', {
    user: req.user,
    title: 'Room Info',
    layout: './layouts/adminLayout.ejs'
  })
);

module.exports = router;
