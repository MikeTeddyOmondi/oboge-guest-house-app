const express = require('express');
const router = express.Router();
const { forwardAuthenticated } = require('../middleware/auth');

// Load User model
const controller = require('../controllers/index.controller');

// Website - Homepage | GET
router
    .route('/')
    .get(controller.getSite);

// Activate Account Handle | GET 
router
    .route('/account/activate/:token')
    .get(controller.activateAccount)

module.exports = router;