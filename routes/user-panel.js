const express = require("express");
const router = express.Router();
const { ensureAuthenticated } = require("../middleware/auth");

// Controllers | User Panel
const panelController = require("../controllers/user_panel.controller");

// User Panel | Dashboard Page
router.route("/").get(ensureAuthenticated, panelController.getUserPanel);

// User Panel - GET & POST| Bookings Page
router
	.route("/bookings")
	.get(ensureAuthenticated, panelController.getBoookingPanel)
	.post(ensureAuthenticated, panelController.postBookingPanel);

// User Panel - GET & POST | Bookings Details | Bookings Page
router
	.route("/bookings/booking-details")
	.get(ensureAuthenticated, panelController.getBookingsDetailsPanel)
	.post(ensureAuthenticated, panelController.postBookingsDetailsPanel);

// User Panel - GET & POST | New Customer | Bookings Page
router
	.route("/bookings/new-customer")
	.get(ensureAuthenticated, panelController.getNewCustomerPanel)
	.post(ensureAuthenticated, panelController.postNewCustomerPanel);

// User Panel - GET & POST | Search Customer by ID Number | Bookings Page
router
	.route("/bookings/search-customer")
	.get(ensureAuthenticated, panelController.getSearchCustomerPanel)
	.post(ensureAuthenticated, panelController.postSearchCustomerPanel);

// 	User Panel - GET | Bookings Invoice Page
router
	.route("/bookings/invoice")
	.get(ensureAuthenticated, panelController.getBookingInvoice);

// User Panel | Bar Page
router.route("/bar").get(ensureAuthenticated, panelController.getBarPanel);

// User Panel | Restaurant Page
router
	.route("/restaurant")
	.get(ensureAuthenticated, panelController.getRestaurantPanel);

// User Panel | Facility Page
router
	.route("/facilities")
	.get(ensureAuthenticated, panelController.getFacilitiesPanel);

// Logout
router.route("/logout").get(panelController.logout);

module.exports = router;
