const NeverBounce = require("neverbounce");
const { emailVerifier } = require("../services/emailVerifier");
const nodemailer = require("nodemailer");
const { google } = require("googleapis");
const OAuth2 = google.auth.OAuth2;
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

// Load User model
const User = require("../models/User");
const Customer = require("../models/Customer");
const Room = require("../models/Room");
const Drink = require("../models/Drink");
const Booking = require("../models/Booking");

// Import Booking Service
const {
	saveCustomer,
	fetchBookings,
	searchCustomer,
	findCustomer,
	findRoom,
	saveBooking,
	checkRoomAvailability,
	updateRoomStatus,
} = require("../services/booking.service");

// Import Bar Service
const {
	fetchAllDrinks,
	searchDrink,
	saveBarPurchase,
	fetchBarPurchases,
} = require("../services/bar.service");

// Administration | GET
exports.getAdminPanel = (req, res) => {
	res.render("welcome", {
		title: "Administration",
		layout: "./layouts/userLayout",
	});
};

// ________________________________________________
// DASHBOARD | INFORMATION
// ________________________________________________

// Admin dashboard | GET
exports.getDashboardPanel = (req, res) => {
	res.render("admin/dashboard", {
		user: req.user,
		title: "Dashboard",
		layout: "./layouts/adminLayout.ejs",
	});
};

// ________________________________________________
// USERS INFORMATION
// ________________________________________________

// Users Route | GET
exports.getUsersPanel = (req, res) => {
	User.find({}, (err, users) => {
		users !== 0 ? JSON.stringify(users) : console.log(err);
		res.render("admin/users", {
			users,
			user: req.user,
			title: "Users",
			layout: "./layouts/adminLayout.ejs",
		});
	});
};

// Add Users Route | GET
exports.getAddUsersPanel = (req, res) => {
	res.render("admin/addUsers", {
		user: req.user,
		title: "Add Users",
		layout: "./layouts/adminLayout.ejs",
	});
};

// Add Users Route | POST
exports.postAddUsersPanel = async (req, res) => {
	const { name, email, password, confirm_password, role } = req.body;

	let errors = [];
	let isAdmin;

	if (!name || !email || !password || !confirm_password || !role) {
		errors.push({ msg: "Please enter all fields" });
	}

	if (password != confirm_password) {
		errors.push({ msg: "Passwords do not match" });
	}

	if (password.length < 6) {
		errors.push({ msg: "Password must be at least 6 characters" });
	}

	if (errors.length > 0) {
		res.render("admin/addUsers", {
			errors,
			name,
			email,
			password,
			confirm_password,
			role,
			user: req.user,
			title: "Add Users",
			layout: "./layouts/adminLayout",
		});
	} else {
		// Check if the user's email exists in the database
		User.findOne({ email: email }).then((user) => {
			if (user) {
				errors.push({ msg: "Email already exists" });
				res.render("admin/addUsers", {
					errors,
					name,
					email,
					password,
					confirm_password,
					role,
					user: req.user,
					title: "Add Users",
					layout: "./layouts/adminLayout",
				});
			} else {
				try {
					emailVerifier.verify(email, async (err, data) => {
						if (err)
							throw `An error occurred while validating your email: ${err.message}`;
						else if (data.smtpCheck === "false") {
							errors.push({ msg: "Please enter a valid email ..." });
							res.render("admin/addUsers", {
								errors,
								name,
								email,
								password,
								confirm_password,
								role,
								user: req.user,
								title: "Add Users",
								layout: "./layouts/adminLayout",
							});
							return res;
						}
					});
				} catch (err) {
					console.log(err.message);
				}

				if (role == "admin") {
					isAdmin = true;
				} else {
					isAdmin = false;
				}

				const newUser = new User({
					name,
					email,
					password,
					isAdmin,
				});

				const oAuth2Client = new OAuth2(
					process.env.CLIENT_ID, // ClientID
					process.env.CLIENT_SECRET, // Client Secret
					"https://developers.google.com/oauthplayground", // Redirect URL
				);

				oAuth2Client.setCredentials({
					refresh_token: process.env.REFRESH_TOKEN,
				});

				const token = jwt.sign(
					{ name, email, password, isAdmin },
					process.env.JWT_ACTIVATION_KEY,
					{ expiresIn: "30m" },
				);
				const CLIENT_URL = `${req.protocol}://${req.headers.host}`;

				const activation_link = `
                    <h5>Please click on below link to activate your account</h5>
                    <h5>${CLIENT_URL}/account/activate/${token}</h5>
                    <h5><b>NOTE: </b> The above account activation link expires in 30 minutes.</h5>
                    `;

				// Send email verification link to user's inbox
				async function sendMail() {
					try {
						const senderMail = process.env.SENDER_EMAIL;
						const accessToken = await oAuth2Client.getAccessToken();

						const transporter = nodemailer.createTransport({
							service: "gmail",
							auth: {
								type: "OAuth2",
								user: senderMail,
								clientId: process.env.CLIENT_ID,
								clientSecret: process.env.CLIENT_SECRET,
								refreshToken: process.env.REFRESH_TOKEN,
								accessToken: accessToken,
							},
						});

						const mailOptions = {
							from: '"Admin | Oboge Guest House" <noreply.obogeguesthouse@gmail.com>', // sender address,
							to: email,
							subject: "Account Verification | Oboge Guest House",
							text: `Hi ${name}, ${activation_link}`,
							html: `<h5>Hi ${name}, ${activation_link}</h5>`,
						};

						const emailSent = await transporter.sendMail(mailOptions);
						return emailSent;
					} catch (err) {
						console.log(`Send Mail Error > ${err}`);
						res.status(500).render("500", {
							title: "500 - Internal Server Error",
							error: err,
							layout: "./layouts/userLayout",
						});
					}
				}

				sendMail()
					.then((emailSent) => {
						if (!emailSent) {
							req.flash(
								"error_msg",
								`An error occurred while creating ${newUser.name}'s user account.`,
							);
						} else {
							req.flash(
								"success_msg",
								`${newUser.name} can now verify their email with the link sent to activate their user account.`,
							);
							res.redirect("/admin/users/add");
							console.log(`Verification email has been sent to: ${email}`);
						}
					})
					.catch((error) => {
						console.log(error);
						req.flash(
							"error_msg",
							`An error occurred while sending mail to ${newUser.name}.`,
						);
						res.redirect("/admin/users/add");
					});
			}
		});
	}
};

// Update Users Route | GET
exports.getUpdateUsersPanel = async (req, res) => {
	const { id } = req.params;
	await User.findById(id, (err, userFound) => {
		if (!err) {
			res.render("admin/editUserProfile", {
				userFound: userFound,
				user: req.user,
				title: "Edit Users",
				layout: "./layouts/adminLayout",
			});
		}
	});
};

// Update Users Route | PUT
exports.putUpdateUsersPanel = async (eq, res) => {};

// Delete Users Route | DELETE
exports.deleteUsersPanel = async (req, res) => {
	const { id } = req.params;

	await User.findByIdAndDelete(id)
		.then(() => {
			req.flash("success_msg", `The user was deleted successfully...`);
			res.redirect("/admin/users");
		})
		.catch((err) => {
			console.log(err);
			req.flash("error_msg", `An error occurred while deleting this user...`);
			res.redirect("/admin/users");
		});
};

// ________________________________________________
// CUSTOMERS INFORMATION
// ________________________________________________

// Add Customers List View | GET
exports.getCustomersListPanel = (req, res) => {
	Customer.find({}, (err, customers) => {
		customers !== 0 ? JSON.stringify(customers) : console.log(err);
		res.render("admin/customers", {
			customers,
			user: req.user,
			title: "Add Customer",
			layout: "./layouts/adminLayout.ejs",
		});
	});
};

// Add Customers Form View | GET
exports.getAddCustomersFormPanel = (req, res) => {
	res.render("admin/addCustomer", {
		user: req.user,
		title: "Add Customer",
		layout: "./layouts/adminLayout.ejs",
	});
};

// Add Customers Form View | POST
exports.postAddCustomersFormPanel = (req, res) => {
	const { firstname, lastname, id_number, phone_number, email } = req.body;

	let errors = [];

	if (!firstname || !lastname || !id_number || !phone_number || !email) {
		errors.push({ msg: "Please enter all fields" });
	}

	if (firstname.length < 3) {
		errors.push({ msg: "Firstname must be at least 3 characters long!" });
	}
	if (lastname.length < 3) {
		errors.push({ msg: "Lastname must be at least 3 characters long!" });
	}

	if (errors.length > 0) {
		res.render("admin/addCustomer", {
			errors,
			firstname,
			lastname,
			id_number,
			phone_number,
			email,
			user: req.user,
			title: "Add Customer",
			layout: "./layouts/adminLayout",
		});
	} else {
		// Check if the customer's ID exists in the database
		Customer.findOne({ id_number: id_number }).then((idNumber) => {
			if (idNumber) {
				errors.push({
					msg: `A customer with that ID Number already exists!`,
				});
				res.render("admin/addCustomer", {
					errors,
					firstname,
					lastname,
					id_number,
					phone_number,
					email,
					user: req.user,
					title: "Add Customer",
					layout: "./layouts/adminLayout",
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
						req.flash("success_msg", `Saved a customer successfully: ${id}`);
						res.redirect("/admin/add-customers");
					})
					.catch((err) => {
						console.log(`> [Controller] error - ${err.message}`);
						errors.push({
							msg: `An error occurred while saving customer details!`,
						});
						res.render("admin/addCustomer", {
							errors,
							firstname,
							lastname,
							id_number,
							phone_number,
							email,
							user: req.user,
							title: "Add Customer",
							layout: "./layouts/adminLayout",
						});
					});
			}
		});
	}
};

// ________________________________________________
// ADD ROOM BOOKINGS | ACCOMODATIONS | INFORMATION
// ________________________________________________

// Room Booking List View | GET
exports.getAddBookingsPanel = (req, res) => {
	// Fetching All Bookings Made
	fetchBookings()
		.then((bookings) => {
			// console.log(bookings);
			// render the page
			res.render("admin/addBookings", {
				bookings,
				user: req.user,
				title: "Room Bookings | Accomodation",
				layout: "./layouts/adminLayout.ejs",
			});
		})
		.catch((err) => {
			// render the page
			res.render("admin/addBookings", {
				user: req.user,
				title: "Room Bookings | Accomodation",
				layout: "./layouts/adminLayout.ejs",
			});
		});
};

// Room Booking List View | Search Customer by ID Number | GET
exports.getSearchCustomerPanel = (req, res) => {
	res.render("admin/addBookingsSearch", {
		user: req.user,
		title: "Room Bookings | Accomodation",
		layout: "./layouts/adminLayout.ejs",
	});
};

// Room Booking List View | Search Customer by ID Number | POST
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
			return res.redirect("/admin/bookings/search-customer");
		});

	res.redirect("/admin/bookings/booking-details");
};

// Admin Panel - GET | Bookings Details Page
exports.getBookingsDetailsPanel = (req, res) => {
	let customerID = req.session.customerID;
	res.render("admin/addBookingsDetails", {
		customerID,
		user: req.user,
		title: "Room Bookings | Accomodation",
		layout: "./layouts/adminLayout",
	});
};

// Admin Panel - POST | Bookings Details Page
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
			// Check Room Availability

			console.log(`> Room Details: ${roomFound}`);
			roomDetails = roomFound;
		});

	const { roomRate, _id } = roomDetails;
	const roomID = _id;

	// Check room if its available
	let availability = await checkRoomAvailability(roomNumber);
	console.log("> Is room booked? ", availability);

	// Booking Logic
	let numberOccupants = parseInt(numberAdults) + parseInt(numberKids);

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

	if (availability == true) {
		errors.push({ msg: "Room is not available. Try another room!" });
	}

	if (errors.length > 0) {
		return res.render("admin/addBookingsDetails", {
			errors,
			customerID: req.session.customerID,
			numberAdults,
			numberKids,
			roomType,
			roomNumber,
			check_in_date,
			check_out_date,
			user: req.user,
			title: "Room Bookings | Accomodation",
			layout: "./layouts/adminLayout",
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

	// Update room status to >>> isBooked: true
	let result = await updateRoomStatus(roomNumber, true);

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

			// Redirect to Customer Invoice
			res.redirect("/admin/bookings/invoice");
		})
		.catch((err) => {
			console.log(`> [Controller] error: ${err}`);
		});
};

// Admin Panel - GET | Bookings Invoice Page
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
	res.render("admin/bookingsInvoice", {
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
		title: "Room Bookings | Accomodation | Invoice",
		layout: "./layouts/adminLayout",
	});
};

// ______________________________________
// ADD ROOM INFORMATION
// ______________________________________

// Room Info | GET
exports.getAddRoomInfoPanel = (req, res) => {
	res.render("admin/addRoomInfo", {
		user: req.user,
		title: "Add Room Info",
		layout: "./layouts/adminLayout.ejs",
	});
};

// Room Info | POST
exports.postAddRoomInfoPanel = (req, res) => {
	const { roomType, roomCapacity, roomNumber, roomRate, booked } = req.body;

	let errors = [];
	let isBooked;

	if (!roomType || !roomCapacity || !roomNumber || !roomRate || !booked) {
		errors.push({ msg: "Please enter all fields" });
	}

	if (errors.length > 0) {
		res.render("admin/addRoomInfo", {
			errors,
			roomType,
			roomCapacity,
			roomNumber,
			roomRate,
			booked,
			user: req.user,
			title: "Add Room Info",
			layout: "./layouts/adminLayout",
		});
	} else {
		// Check if the room exists in the database
		Room.findOne({ roomNumber: roomNumber }).then((roomNumber) => {
			if (roomNumber) {
				errors.push({
					msg: `A room with that number already exists!`,
				});
				res.render("admin/addRoomInfo", {
					errors,
					roomType,
					roomCapacity,
					roomNumber: req.body.roomNumber,
					roomRate,
					booked,
					user: req.user,
					title: "Add Room Info",
					layout: "./layouts/adminLayout",
				});
			} else {
				// Initialize room booking to false
				if (booked == "false") {
					isBooked = false;
				} else {
					isBooked = true;
				}

				const newRoom = new Room({
					roomType: roomType,
					roomCapacity: roomCapacity,
					roomNumber: req.body.roomNumber,
					roomRate: roomRate,
					isBooked: isBooked,
				});

				newRoom
					.save()
					.then(() => {
						req.flash(
							"success_msg",
							`Room information was saved successfully!`,
						);
						res.redirect("/admin/add-room-info");
					})
					.catch((err) => {
						req.flash(
							"error_msg",
							`An error occurred while saving the room...`,
						);
						res.redirect("/admin/add-room-info");
					});
			}
		});
	}
};

// ______________________________________
// ADD BAR DRINKS INFORMATION
// ______________________________________

// Add Bar Drink | Menu Updates | GET
exports.getAddBarDrinkPanel = (req, res) => {
	res.render("admin/addBarDrink", {
		user: req.user,
		title: "Add Bar Drink | Menu",
		layout: "./layouts/adminLayout.ejs",
	});
};

// Add Bar Drink | Menu Updates | POST
exports.postAddBarDrinkPanel = (req, res) => {
	const { drinkName, drinkCode, typeOfDrink, uom, buyingPrice } = req.body;
	const image = req.file;

	//console.log(req.body);

	let errors = [];

	if (
		!drinkName ||
		!drinkCode ||
		!typeOfDrink ||
		!uom ||
		!buyingPrice ||
		!image
	) {
		errors.push({ msg: "Please enter all fields" });
	}

	if (errors.length > 0) {
		res.render("admin/addBarDrink", {
			errors,
			drinkName,
			drinkCode,
			typeOfDrink,
			uom,
			buyingPrice,
			image,
			user: req.user,
			title: "Add Bar Drink | Menu",
			layout: "./layouts/adminLayout.ejs",
		});
	} else {
		// Check if the drink code exists in the database
		Drink.findOne({ drinkCode: drinkCode }).then((drinkCode) => {
			if (drinkCode) {
				errors.push({
					msg: `That drink code already exists!`,
				});
				res.render("admin/addBarDrink", {
					errors,
					drinkName,
					drinkCode,
					typeOfDrink,
					uom,
					buyingPrice,
					image,
					user: req.user,
					title: "Add Bar Drink | Menu",
					layout: "./layouts/adminLayout.ejs",
				});
			} else {
				const newDrink = new Drink({
					drinkName,
					drinkCode: req.body.drinkCode,
					typeOfDrink,
					uom,
					buyingPrice,
					image: image.filename,
				});

				newDrink
					.save()
					.then(() => {
						req.flash("success_msg", `Drink information saved successfully!`);
						res.redirect("/admin/add-bar-drink");
					})
					.catch((err) => {
						req.flash(
							"error_msg",
							`An error occurred while saving the drink information...`,
						);
						res.redirect("/admin/add-bar-drink");
					});
			}
		});
	}
};

// ______________________________________
// ADD BAR PURCHASES INFORMATION
// ______________________________________

// Bar purchases | GET
exports.getBarPurchasesPanel = (req, res) => {
	// Fetching All Bar Purchases
	fetchBarPurchases()
		.then((purchases) => {
			// render the page
			res.render("admin/barPurchases", {
				purchases,
				user: req.user,
				title: "Bar Purchases",
				layout: "./layouts/adminLayout.ejs",
			});
		})
		.catch((err) => {
			// render the page
			res.render("admin/barPurchases", {
				user: req.user,
				title: "Bar Purchases",
				layout: "./layouts/adminLayout.ejs",
			});
		});
};

// Bar purchases - Add Bar Purchases Form | GET
exports.getBarPurchasesFormPanel = (req, res) => {
	// Initialize drink codes to display
	let drinkCodes = {};

	// fetch all drink codes from database
	fetchAllDrinks()
		.then((allDrinks) => {
			//console.log(allDrinks);

			drinkCodes = allDrinks.map(({ drinkCode }) => drinkCode);

			// render the page
			res.render("admin/barPurchasesForm", {
				drinkCodes,
				user: req.user,
				title: "Bar Purchases - Add List",
				layout: "./layouts/adminLayout.ejs",
			});
		})
		.catch((err) => {
			console.log(`> An error occurred while fetching data: ${err.message}`);
		});
};

// Bar purchases - Add Bar Purchases Form | POST
exports.postBarPurchasesFormPanel = (req, res) => {
	const { receiptNumber, product, quantity, supplier } = req.body;

	console.log({ receiptNumber, product, quantity, supplier });

	let errors = [];
	let drinks = {};
	let drinkCodes = {};
	let buyingPrice = 0;

	// fetch all drink codes from database
	fetchAllDrinks()
		.then((allDrinks) => {
			drinks = allDrinks;
			drinkCodes = allDrinks.map(({ drinkCode }) => drinkCode);

			// Bar Purchases Logic
			if (!receiptNumber || !product || !quantity || !supplier) {
				errors.push({ msg: "Please enter all fields" });
			}

			if (errors.length > 0) {
				res.render("admin/barPurchasesForm", {
					errors,
					quantity,
					availability,
					drinkCodes,
					user: req.user,
					title: "Bar Purchases | Add List",
					layout: "./layouts/adminLayout.ejs",
				});
			} else {
				// Get the buying price after specific product search
				searchDrink(product)
					.then((drinkFound) => {
						// Get the buying price of the product
						buyingPrice = drinkFound.buyingPrice;

						// Calculate Stock value
						let stockValue = buyingPrice * Number(quantity);

						const newPurchase = {
							receiptNumber,
							product: drinkFound._id,
							quantity,
							stockValue,
							supplier,
						};

						// Save Bar Purchase
						saveBarPurchase(newPurchase)
							.then((purchaseMade) => {
								console.log(
									`> [Controller Logs] New Bar Purchase: ${purchaseMade}`,
								);
								req.flash(
									"success_msg",
									`Saved the new bar stock purchase successfully!...`,
								);
								return res.redirect("/admin/bar-purchases/add");
							})
							.catch((err) => {
								console.log(
									`> [Controller Error] An error occurred while saving the data: ${err.message}`,
								);
								req.flash(
									"error_msg",
									`An error occurred while saving the data!`,
								);
								return res.redirect("/admin/bar-purchases/add");
							});
					})
					.catch((err) => {
						console.log(
							`> [Controller Error] Product with that code was not found!!!...`,
						);

						req.flash(
							"error_msg",
							`Product with this code ${product} was not found!`,
						);
						return res.redirect("/admin/bar-purchases/add");
					});
			}
		})
		.catch((err) => {
			console.log(
				`> [Controller Error] An error occurred while fetching data: ${err.message}`,
			);
			req.flash("error_msg", `An error occurred while fetching data!`);
			return res.redirect("/admin/bar-purchases/add");
		});
};
