// Import model
const Customer = require("../models/Customer");

// Import Booking Config
const {
	saveCustomer,
	searchCustomer,
	findRoom,
	saveBooking,
} = require("../config/booking.config");

// User Panel | Dashboard Page
exports.getUserPanel = (req, res) => {
	res.render("panel/panel", {
		user: req.user,
		title: "User Panel",
		layout: "./layouts/panelLayout",
	});
};

// User Panel - GET | Bookings Page
exports.getBoookingPanel = (req, res) => {
	res.render("panel/bookings", {
		user: req.user,
		title: "Bookings",
		layout: "./layouts/panelLayout",
	});
};

// User Panel - POST | Bookings Page
exports.postBookingPanel = (req, res) => {};

// User Panel - GET | Search Customer by ID Number | Bookings Page
exports.getNewCustomerPanel = (req, res) => {
	res.render("panel/bookingsNewCustomer", {
		user: req.user,
		title: "New Customer - Bookings Page",
		layout: "./layouts/panelLayout",
	});
};

// User Panel - POST | Search Customer by ID Number | Bookings Page
exports.postNewCustomerPanel = async (req, res) => {
	// Initialize customerID, errors
	let customerID;
	let errors = [];

	// Body | Request
	const { firstname, lastname, id_number, phone_number, email } = req.body;

	if (!firstname || !lastname || !id_number || !phone_number) {
		errors.push({ msg: "Please enter all fields" });
	}

	if (errors.length > 0) {
		res.render("panel/bookingsNewCustomer", {
			errors,
			firstname,
			lastname,
			id_number,
			phone_number,
			email,
			user: req.user,
			title: "New Customer - Bookings Page",
			layout: "./layouts/panelLayout",
		});
	} else {
		// Check if the customer exists in the database
		Customer.findOne({ id_number: id_number }).then((customer) => {
			if (customer) {
				errors.push({
					msg: `That customer already exists!`,
				});
				res.render("panel/bookingsNewCustomer", {
					errors,
					firstname,
					lastname,
					id_number,
					phone_number,
					email,
					user: req.user,
					title: "New Customer - Bookings Page",
					layout: "./layouts/panelLayout",
				});
			} else {
				// Create a customer details | Object
				let customerDetails = {
					firstname,
					lastname,
					id_number,
					phone_number,
					email,
				};
				// Save the customer details
				saveCustomer(customerDetails)
					.then((id) => {
						console.log(`[NEW] CustomerID: ${id}`);
						customerID = id;
						req.session.customerID = customerID;
					})
					.catch((err) => {
						console.log("> [Controller] error - " + err.message);
						errors.push({
							msg: `An error occurred while saving customer details!`,
						});
						res.render("panel/bookingsNewCustomer", {
							errors,
							firstname,
							lastname,
							id_number,
							phone_number,
							email,
							user: req.user,
							title: "New Customer - Bookings Page",
							layout: "./layouts/panelLayout",
						});
					});

				console.log(req.session.customerID);
				res.redirect("/user-panel/bookings/booking-details");

				// res.render("panel/bookingsDetails", {
				// 	customerID,
				// 	user: req.user,
				// 	title: "Bookings Details",
				// 	layout: "./layouts/panelLayout",
				// });
			}
		});
	}
};

// User Panel - GET | Search Customer by ID Number | Bookings Page
exports.getSearchCustomerPanel = (req, res) => {
	res.render("panel/bookingsSearchCustomer", {
		user: req.user,
		title: "Search Customer - Bookings Page",
		layout: "./layouts/panelLayout",
	});
};

// User Panel - POST | Search Customer by ID Number | Bookings Page
exports.postSearchCustomerPanel = async (req, res) => {
	// Initialize customerID
	let customerID;

	// Body | Request
	const { id_number } = req.body;

	// Search customer with the id
	await searchCustomer(id_number)
		.then((foundID) => {
			console.log(`Customer Details: ${foundID}`);
			customerID = foundID;
			req.session.customerID = customerID;
		})
		.catch((err) => {
			console.log(`> [Controller] error - ${err.message}`);
		});

	res.redirect("/user-panel/bookings/booking-details");

	// res.render("panel/bookingsDetails", {
	// 	customerID,
	// 	user: req.user,
	// 	title: "Bookings Details",
	// 	layout: "./layouts/panelLayout",
	// });
};

// User Panel - GET | Bookings Details Page
exports.getBookingsDetailsPanel = (req, res) => {
	let customerID = req.session.customerID;
	res.render("panel/bookingsDetails", {
		customerID,
		user: req.user,
		title: "Bookings Details",
		layout: "./layouts/panelLayout",
	});
};

// User Panel - POST | Bookings Details Page
exports.postBookingsDetailsPanel = async (req, res) => {
	// Body of Request
	const {
		customerId,
		numberAdults,
		numberKids,
		roomType,
		roomNumber,
		check_in_date,
		check_out_date,
	} = req.body;

	// // Create a room details | Object
	// let roomDetails = {
	// 	roomType,
	// 	roomCapacity: parseInt(numberAdults) + parseInt(numberKids),
	// 	roomNumber,
	// };

	// findRoom(roomDetails)
	// 	.then((roomIDFound) => {
	// 		console.log(`> RoomIDFound: ${roomIDFound}`);
	// 	})
	// 	.catch((err) => {
	// 		console.log("> [Controller] error - " + err.message);
	// 	});

	// let bookingDetails = {
	// 	customerID,
	// 	numberAdults,
	// 	numberKids,
	// 	roomID,
	// 	check_in_date,
	// 	check_out_date,
	// };

	res.render("panel/bookingsInvoice", {
		user: req.user,
		customerDetails,
		roomDetails,
		bookingDetails,
		title: "Hotel Booking Invoice | Receipt",
		layout: "./layouts/panelLayout",
	});
};

// User Panel - POST | Bar Page
exports.getBarPanel = (req, res) => {
	res.render("panel/bar", {
		user: req.user,
		title: "Bar",
		layout: "./layouts/panelLayout",
	});
};

// User Panel | Restaurant Page
exports.getRestaurantPanel = (req, res) => {
	res.render("panel/restaurant", {
		user: req.user,
		title: "Restaurant",
		layout: "./layouts/panelLayout",
	});
};

// User Panel | Facility Page
exports.getFacilitiesPanel = (req, res) => {
	res.render("panel/facilities", {
		user: req.user,
		title: "Facilities",
		layout: "./layouts/panelLayout",
	});
};

// Logout | User Panel
exports.logout = (req, res) => {
	req.logout();
	req.flash("success_msg", "You are logged out");
	res.redirect("/users/login");
};
