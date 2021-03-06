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
// Add Users Route | POST
router
    .route('/users/add')
    .get(ensureAuthenticated, adminController.getAddUsersPanel)
    .post(ensureAuthenticated, adminController.postAddUsersPanel);

// Update Users Route | GET
// Update Users Route | PUT
router
    .route('/users/edit/:id')
    .get(ensureAuthenticated, adminController.getUpdateUsersPanel)
    .put(ensureAuthenticated, adminController.putUpdateUsersPanel)

// Delete User Route | GET
// Delete User Route | DELETE
router
    .route('/users/delete/:id')
    .get(ensureAuthenticated, adminController.deleteUsersPanel)

// Add Customers | GET
// Add Customers | POST
router
    .route('/add-customers')
    .get(ensureAuthenticated, adminController.getAddCustomersPanel)
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