const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

// Load User model
const User = require("../models/User");

// Env | Variables
const { JWT_ACTIVATION_KEY } = require("../config/config");

exports.getSite = (req, res) => {
	res.render("site", {
		title: "Welcome",
		layout: "./layouts/siteLayout",
	});
};

exports.activateAccount = (req, res) => {
	const token = req.params.token;
	let errors = [];
	if (token) {
		jwt.verify(token, JWT_ACTIVATION_KEY, (err, decodedToken) => {
			if (err) {
				req.flash(
					"error_msg",
					"The link is incorrect or has already expired! Please request the administrator to register you once again.",
				);
				res.redirect("/users/login");
			} else {
				const { name, email, password, isAdmin } = decodedToken;
				User.findOne({ email: email }).then((user) => {
					if (user) {
						//------------ User's email already exists ------------//
						req.flash(
							"error_msg",
							"The email provided is already registered! Please request you be registered with a new email ID.",
						);
						res.redirect("/users/login");
					} else {
						// Save user to the system's database
						const newUser = new User({
							name,
							email,
							password,
							isAdmin,
							isVerified: true,
						});

						//Hashing the password
						bcrypt.genSalt(10, (err, salt) => {
							bcrypt.hash(newUser.password, salt, (err, hash) => {
								if (err) throw err;
								newUser.password = hash;
								newUser
									.save()
									.then(() => {
										req.flash(
											"success_msg",
											`Welcome ${newUser.name}, you're verified and can now log in...`,
										);
										res.redirect("/users/login");
									})
									.catch((err) => {
										console.log(err.message);
										req.flash(
											"error_msg",
											`An error occurred while verifying ${newUser.name}'s user account.`,
										);
									});
							});
						});
					}
				});
			}
		});
	} else {
		res.status(404);
		console.log("User account activation and verification error!");
	}
};
