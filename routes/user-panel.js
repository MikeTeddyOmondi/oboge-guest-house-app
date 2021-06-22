const express = require('express');
const router = express.Router();
const { ensureAuthenticated } = require('../middleware/auth');

// Controllers | User Panel
const panelController = require('../controllers/user_panel.controller')

// User Panel | Dashboard Page
router
    .route('/')
    .get(ensureAuthenticated, panelController.getUserPanel);

// User Panel - GET | Bookings Page
router
    .route('/bookings')
    .get(ensureAuthenticated, panelController.getBoookingPanel);

// User Panel - POST | Bookings Page
router
    .route('/bookings')
    .post(ensureAuthenticated, panelController.postBookingPanel);

// User Panel | Bar Page
router
    .route('/bar')
    .get(ensureAuthenticated, panelController.getBarPanel);

// User Panel | Restaurant Page
router
    .route('/restaurant')
    .get(ensureAuthenticated, panelController.getRestaurantPanel);

// User Panel | Facility Page
router
    .route('/facilities')
    .get(ensureAuthenticated, panelController.getFacilitiesPanel);

// Logout
router
    .route('/logout')
    .get(panelController.logout);

module.exports = router;