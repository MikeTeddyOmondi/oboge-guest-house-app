const express = require('express');
const router = express.Router();
const { ensureAuthenticated } = require('../config/auth');

// User Panel | Dashboard Page
router.get('/', ensureAuthenticated, (req, res) => res.render('panel/panel', {
    user: req.user,
    title: 'User Panel',
    layout: './layouts/panelLayout'
}));

// User Panel - GET | Bookings Page
router.get('/bookings', ensureAuthenticated, (req, res) => {
    res.render('panel/bookings', {
        user: req.user,
        title: 'Bookings',
        layout: './layouts/panelLayout'
    })
});

// User Panel - POST | Bookings Page
router.post('/bookings', ensureAuthenticated, (req, res) => {
    const {
        firstname,
        lastname,
        idNumber,
        phoneNumber,
        email_ID,
        numberAdults,
        numberKids,
        room_type_select,
        room_number_select,
        check_out_date
    } = req.body
    console.log(
        firstname,
        lastname,
        idNumber,
        phoneNumber,
        email_ID,
        numberAdults,
        numberKids,
        room_type_select,
        room_number_select,
        check_out_date
    );
    res.render('panel/bookings', {
        user: req.user,
        title: 'Bookings',
        layout: './layoutspanelLayout'
    })
});

// User Panel | Bar Page
router.get('/bar', ensureAuthenticated, (req, res) => res.render('panel/bar', {
    user: req.user,
    title: 'Bar',
    layout: './laouts/panelLayout'
}));

// User Panel | Restaurant Page
router.get('/restaurant', ensureAuthenticated, (req, res) => res.render('panel/restaurant', {
    user: req.user,
    title: 'Restaurant',
    layout: './layouts/pnelLayout'
}));

// User Panel | Facility Page
router.get('/facilities', ensureAuthenticated, (req, res) => res.render('panel/facilities', {
    user: req.user,
    title: 'Facilities',
    layout: './layouts/pnelLayout'
}));

// Logout
router.get('/logout', (req, res) => {
    req.logout();
    req.flash('success_msg', 'You are logged out');
    res.redirect('/users/login');
});

module.exports = router;