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

// Add Customers | GET
// Add Customers | POST
router
	.route("/add-customers")
	.get(ensureAuthenticated, adminController.getAddCustomersPanel)
	.post(ensureAuthenticated, adminController.postAddCustomersPanel);

// Room Booking | GET
router
	.route("/add-room-booking")
	.get(ensureAuthenticated, adminController.getAddRoomBookingsPanel);

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
