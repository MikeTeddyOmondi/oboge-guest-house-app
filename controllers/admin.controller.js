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

// Administration | GET
exports.getAdminPanel = (req, res) => {
	res.render("welcome", {
		title: "Administration",
		layout: "./layouts/userLayout",
	});
};

// Admin dashboard | GET
exports.getDashboardPanel = (req, res) => {
	res.render("admin/dashboard", {
		user: req.user,
		title: "Admin",
		layout: "./layouts/adminLayout.ejs",
	});
};

// Users Route | GET
exports.getUsersPanel = (req, res) => {
	User.find({}, (err, users) => {
		users !== 0 ? JSON.stringify(users) : console.log(err);
		res.render("admin/users", {
			users: users,
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

// Add Customers | GET
exports.getAddCustomersPanel = (req, res) => {
	res.render("admin/addCustomer", {
		user: req.user,
		title: "Add Customer",
		layout: "./layouts/adminLayout.ejs",
	});
};

// Add Customers | POST
exports.postAddCustomersPanel = (req, res) => {
	const { firstname, lastname, id_number, phone_number, email } = req.body;
	console.log({
		firstname,
		lastname,
		id_number,
		phone_number,
		email,
	});

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
				res.render("admin/addCustomer", {
					firstname,
					lastname,
					id_number,
					phone_number,
					email,
					user: req.user,
					title: "Add Customer",
					layout: "./layouts/adminLayout",
				});
			}
		});
	}
};

// Room Booking | GET
exports.getAddRoomBookingsPanel = (req, res) => {
	res.render("admin/addRoomBookings", {
		user: req.user,
		title: "Room Bookings",
		layout: "./layouts/adminLayout.ejs",
	});
};

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
