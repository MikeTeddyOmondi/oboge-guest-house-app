const express = require("express");
const router = express.Router();
const {
	ensureAuthenticated,
	forwardAuthenticated,
} = require("../middleware/auth");

// Image Uploader Service
const { upload } = require("../services/drinkImageUpload");

// Controller | Admin Panel
const adminController = require("../controllers/admin.controller");

// Administration | GET
router.route("/").get(forwardAuthenticated, adminController.getAdminPanel);

// Admin dashboard | GET
router
	.route("/dashboard")
	.get(ensureAuthenticated, adminController.getDashboardPanel);

// Users Route | GET
router.route("/users").get(ensureAuthenticated, adminController.getUsersPanel);

// Add Users Route | GET
// Add Users Route | POST
router
	.route("/users/add")
	.get(ensureAuthenticated, adminController.getAddUsersPanel)
	.post(ensureAuthenticated, adminController.postAddUsersPanel);

// Update Users Route | GET
// Update Users Route | PUT
router
	.route("/users/edit/:id")
	.get(ensureAuthenticated, adminController.getUpdateUsersPanel)
	.put(ensureAuthenticated, adminController.putUpdateUsersPanel);

// Delete User Route | GET
// Delete User Route | DELETE
router
	.route("/users/delete/:id")
	.get(ensureAuthenticated, adminController.deleteUsersPanel);

// Add Customers List view| GET
// Add Customers List View| POST
router
	.route("/customers")
	.get(ensureAuthenticated, adminController.getCustomersListPanel);

// Add Customers Form view| GET
// Add Customers Form View| POST
router
	.route("/customers/add")
	.get(ensureAuthenticated, adminController.getAddCustomersFormPanel)
	.post(ensureAuthenticated, adminController.postAddCustomersFormPanel);

// Room Booking | GET
router
	.route("/bookings")
	.get(ensureAuthenticated, adminController.getAddBookingsPanel);

// Room Booking | Search Customer by ID Number | GET
router
	.route("/bookings/search-customer")
	.get(ensureAuthenticated, adminController.getSearchCustomerPanel)
	.post(ensureAuthenticated, adminController.postSearchCustomerPanel);

// Admin Panel - GET & POST | Room Booking Details | Bookings Page
router
	.route("/bookings/booking-details")
	.get(ensureAuthenticated, adminController.getBookingsDetailsPanel)
	.post(ensureAuthenticated, adminController.postBookingsDetailsPanel);

// Admin Panel - GET | Bookings Invoice Page
router
	.route("/bookings/invoice")
	.get(ensureAuthenticated, adminController.getBookingInvoice);

// Room Info | GET
// Room Info | POST
router
	.route("/add-room-info")
	.get(ensureAuthenticated, adminController.getAddRoomInfoPanel)
	.post(ensureAuthenticated, adminController.postAddRoomInfoPanel);

// Add Bar Drink | Menu Updates | GET
// Add Bar Drink | Menu Updates | POST
router
	.route("/add-bar-drink")
	.get(ensureAuthenticated, adminController.getAddBarDrinkPanel)
	.post(
		ensureAuthenticated,
		upload.single("image"),
		adminController.postAddBarDrinkPanel,
	);

// Bar Purchases | GET
router
	.route("/bar-purchases")
	.get(ensureAuthenticated, adminController.getBarPurchasesPanel);

// Bar Purchases - Form | GET
// Bar Purchases - Form | POST
router
	.route("/bar-purchases/add")
	.get(ensureAuthenticated, adminController.getBarPurchasesFormPanel)
	.post(ensureAuthenticated, adminController.postBarPurchasesFormPanel);

module.exports = router;
