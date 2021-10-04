// Import model
const Customer = require("../models/Customer");

// Import Booking Service
const {
	saveCustomer,
	searchCustomer, // search by customer's ID number
	findCustomer, // search by customer's unique Object ID
	findRoom,
	saveBooking,
} = require("../services/booking.service");

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
						res.redirect("/user-panel/bookings/booking-details");
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
		.then((customerFound) => {
			console.log(`> Customer Details: ${customerFound._id}`);
			customerID = customerFound._id;
			req.session.customerID = customerID;
		})
		.catch((err) => {
			console.log(`> [Controller] error - ${err.message}`);
			req.flash(
				"error_msg",
				`There is no customer with this ID number: ${id_number}...`,
			);
			return res.redirect("/user-panel/bookings/search-customer");
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
	// Body | Request
	const {
		customerId,
		numberAdults,
		numberKids,
		roomType,
		roomNumber,
		check_in_date,
		check_out_date,
	} = req.body;

	let errors = [];

	// Initialize booking, customer & room details
	let bookingDetails;
	let customerDetails;
	let roomDetails;

	// Find customer with the customerId
	await findCustomer(customerId)
		.then((customerFound) => {
			console.log(`> Customer Details: ${customerFound}`);
			customerDetails = customerFound;
		})
		.catch((err) => {
			console.log(`[Controller] error: ${err}`);
		});

	// Find room given the room number
	await findRoom(roomNumber)
		.catch((err) => {
			console.log(`> [Controller] error: ${err}`);
		})
		.then((roomFound) => {
			console.log(`> Room Details: ${roomFound}`);
			roomDetails = roomFound;
		});

	const { roomRate, _id } = roomDetails;
	const roomID = _id;

	// Booking Logic
	let numberOccupants = parseInt(numberAdults) + parseInt(numberKids);
	let VAT = 0.16;

	if (
		!numberAdults ||
		!numberKids ||
		!roomType ||
		!roomNumber ||
		!check_in_date ||
		!check_out_date
	) {
		errors.push({ msg: "Please enter all fields" });
	}

	if (numberOccupants > roomDetails.roomCapacity) {
		errors.push({ msg: "Room capacity of the chosen room has been exceeded!" });
	}

	if (errors.length > 0) {
		res.render("panel/bookingsDetails", {
			errors,
			customerID: req.session.customerID,
			numberAdults,
			numberKids,
			roomType,
			roomNumber,
			check_in_date,
			check_out_date,
			user: req.user,
			title: "Bookings Details",
			layout: "./layouts/panelLayout",
		});
	}
	bookingDetails = {
		customerId,
		numberAdults,
		numberKids,
		roomID,
		roomType,
		roomNumber,
		roomRate,
		check_in_date,
		check_out_date,
	};

	// Save booking
	await saveBooking(bookingDetails)
		.then((invoiceInfo) => {
			console.log(`> [NEW] Booking Info: ${invoiceInfo}`);

			// Load invoice information into the session | request object
			req.session.bookingID = invoiceInfo._id;
			req.session.firstname = customerDetails.firstname;
			req.session.lastname = customerDetails.lastname;
			req.session.phoneNumber = customerDetails.phone_number;
			req.session.email = customerDetails.email;
			req.session.roomType = bookingDetails.roomType;
			req.session.roomRate = bookingDetails.roomRate;
			req.session.numberOccupants = numberOccupants;
			req.session.check_in_date = invoiceInfo.checkInDate;
			req.session.check_out_date = invoiceInfo.checkOutDate;
			req.session.subTotal = invoiceInfo.subTotalCost;
			req.session.VAT = invoiceInfo.vat;
			req.session.totalCost = invoiceInfo.totalCost;

			res.redirect("/user-panel/bookings/invoice");
		})
		.catch((err) => {
			console.log(`> [Controller] error: ${err}`);
		});

	// res.render("panel/bookingsInvoice", {
	// 	customerDetails,
	// 	roomDetails,
	// 	bookingDetails,
	// 	user: req.user,
	// 	title: "Hotel Booking Invoice | Receipt",
	// 	layout: "./layouts/panelLayout",
	// });
};

// User Panel - GET | Bookings Invoice Page
exports.getBookingInvoice = (req, res) => {
	const {
		bookingID,
		firstname,
		lastname,
		phoneNumber,
		email,
		roomType,
		roomRate,
		numberOccupants,
		check_in_date,
		check_out_date,
		subTotal,
		VAT,
		totalCost,
	} = req.session;
	res.render("panel/bookingsInvoice", {
		bookingID,
		firstname,
		lastname,
		phoneNumber,
		email,
		roomType,
		roomRate,
		numberOccupants,
		check_in_date,
		check_out_date,
		subTotal,
		VAT,
		totalCost,
		user: req.user,
		title: "Bookings | Invoice",
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
