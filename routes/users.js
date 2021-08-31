const express = require('express');
const router = express.Router();
const { upload } = require('../services/screenshotUpload')

// Controller
const userController = require("../controllers/user.controller.js")

// Login Page
router
    .route('/login')
    .get(userController.getLogin)
    .post(userController.postLogin)

// Contact Form
router
    .route('/login/contact')
    .post(upload.single('screenshot'), userController.postLoginContact)

// Logout
router
    .route('/logout')
    .get(userController.getLogout)

// Forgot Password 
router
    .route('/forgot')
    .get(userController.getForgot)
    .post(userController.postForgot)

// Reset Password Route
router
    .route('/reset/:id')
    .get(userController.getResetId)
    .post(userController.postResetId)

// Redirect Link - From Email 
router
    .route('/forgot/:token')
    .get(userController.getForgotToken)

module.exports = router;