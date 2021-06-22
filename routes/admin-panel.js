const express = require('express');
const router = express.Router();
const { ensureAuthenticated, forwardAuthenticated } = require('../middleware/auth');

// Controller | Admin Panel 
const adminController = require('../controllers/admin.controller')

// Administration | GET
router
    .route('/')
    .get(forwardAuthenticated, adminController.getAdminPanel);

// Admin dashboard | GET
router
    .route('/dashboard')
    .get(ensureAuthenticated, adminController.getDashboardPanel);

// Users Route | GET
router
    .route('/users')
    .get(ensureAuthenticated, adminController.getUsersPanel);

// Add Users Route | GET
router
    .route('/users/add')
    .get(ensureAuthenticated, adminController.getAddUsersPanel);

// Add Users Route | POST
router
    .route('/users/add')
    .post(ensureAuthenticated, adminController.postAddUsersPanel);

// Update Users Route | PUT
router
    .route('/users/:id')
    .put(ensureAuthenticated, adminController.putUpdateUsersPanel)

// Add Customers | GET
router
    .route('/add-customers')
    .get(ensureAuthenticated, adminController.getAddCustomersPanel);

// Add Customers | POST
router
    .route('/add-customers')
    .post(ensureAuthenticated, adminController.postAddCustomersPanel);

// Room Booking | GET
router
    .route('/add-room-booking')
    .get(ensureAuthenticated, adminController.getAddRoomBookingsPanel);

// Room Info | GET
router
    .route('/add-room-info')
    .get(ensureAuthenticated, adminController.getAddRoomInfoPanel);

module.exports = router;