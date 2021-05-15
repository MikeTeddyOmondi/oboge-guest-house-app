const express = require('express');
const router = express.Router();
const NeverBounce = require('neverbounce');
const { emailVerifier } = require('../config/emailVerifier');
const { ensureAuthenticated, forwardAuthenticated } = require('../config/auth');
const nodemailer = require('nodemailer')
const { google } = require("googleapis");
const OAuth2 = google.auth.OAuth2;
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

// Load User model
const User = require('../models/User');

// Website - Homepage | GET
router.get('/', forwardAuthenticated, (req, res) => res.render('site', { title: 'Welcome', layout: './layouts/siteLayout' }));

// Administration | GET
router.get('/admin', forwardAuthenticated, (req, res) => res.render('welcome', { title: 'Administration', layout: './layouts/userLayout' }));

// Admin dashboard | GET
router.get('/dashboard', ensureAuthenticated, (req, res) => {
    res.render('admin/dashboard', {
        user: req.user,
        title: 'Admin',
        layout: './layouts/adminLayout.ejs'
    })
});

// Users Route | GET
router.get('/users', ensureAuthenticated, (req, res) => {
    User.find({}, (err, users) => {
        users !== 0 ? JSON.stringify(users) : console.log(err)
        res.render('admin/users', {
            users: users,
            user: req.user,
            title: 'Users',
            layout: './layouts/adminLayout.ejs'
        })
    });
});

// Add Users Route | GET
router.get('/users/add', ensureAuthenticated, (req, res) => {
    res.render('admin/addUsers', {
        user: req.user,
        title: 'Add Users',
        layout: './layouts/adminLayout.ejs'
    })
});

// Add Users Route | POST
router.post('/users/add', ensureAuthenticated, (req, res) => {
    const {
        name,
        email,
        password,
        confirm_password,
        role
    } = req.body;

    let errors = [];
    let isAdmin;

    if (!name || !email || !password || !confirm_password || !role) {
        errors.push({ msg: 'Please enter all fields' });
    }

    if (password != confirm_password) {
        errors.push({ msg: 'Passwords do not match' });
    }

    if (password.length < 6) {
        errors.push({ msg: 'Password must be at least 6 characters' });
    }

    if (errors.length > 0) {
        res.render('admin/addUsers', {
            errors,
            name,
            email,
            password,
            confirm_password,
            role,
            user: req.user,
            title: 'Add Users',
            layout: './layouts/adminLayout'
        })
    } else {
        // Check if the user's email exists in the database
        User.findOne({ email: email }).then(user => {
            if (user) {
                errors.push({ msg: 'Email already exists' });
                res.render('admin/addUsers', {
                    errors,
                    name,
                    email,
                    password,
                    confirm_password,
                    role,
                    user: req.user,
                    title: 'Add Users',
                    layout: './layouts/adminLayout'
                });
            } else {
                try {
                    emailVerifier.verify(email, async(err, data) => {
                        if (err) throw `An error occurred while validating your email: ${err.message}`
                        else if (data.smtpCheck === 'false') {
                            errors.push({ msg: 'Please enter a valid email ...' });
                            res.render('admin/addUsers', {
                                errors,
                                name,
                                email,
                                password,
                                confirm_password,
                                role,
                                user: req.user,
                                title: 'Add Users',
                                layout: './layouts/adminLayout'
                            });
                            return res
                        }
                    });
                } catch (err) {
                    console.log(err.message)
                }

                if (role == 'admin') {
                    isAdmin = true
                } else {
                    isAdmin = false
                }

                const newUser = new User({
                    name,
                    email,
                    password,
                    isAdmin
                });

                const oAuth2Client = new OAuth2(
                    process.env.CLIENT_ID, // ClientID
                    process.env.CLIENT_SECRET, // Client Secret
                    "https://developers.google.com/oauthplayground" // Redirect URL
                )

                oAuth2Client.setCredentials({
                    refresh_token: process.env.REFRESH_TOKEN
                })

                const token = jwt.sign({ name, email, password, isAdmin }, process.env.JWT_ACTIVATION_KEY, { expiresIn: '30m' });
                const CLIENT_URL = `${req.protocol}://${req.headers.host}`;

                const activation_link = `
                    <h5>Please click on below link to activate your account</h5>
                    <h5>${CLIENT_URL}/activate/${token}</h5>
                    <h5><b>NOTE: </b> The above account activation link expires in 30 minutes.</h5>
                    `

                // Send email verification link to user's inbox  
                async function sendMail() {
                    try {
                        const senderMail = process.env.SENDER_EMAIL
                        const accessToken = await oAuth2Client.getAccessToken()

                        const transporter = nodemailer.createTransport({
                            service: 'gmail',
                            auth: {
                                type: 'OAuth2',
                                user: senderMail,
                                clientId: process.env.CLIENT_ID,
                                clientSecret: process.env.CLIENT_SECRET,
                                refreshToken: process.env.REFRESH_TOKEN,
                                accessToken: accessToken
                            }
                        })

                        const mailOptions = {
                            from: senderMail,
                            to: email,
                            subject: 'Account Verification | Oboge Guest House',
                            text: `Hi ${name}, ${activation_link}`,
                            html: `<h5>Hi ${name}, ${activation_link}</h5>`
                        }

                        const emailSent = await transporter.sendMail(mailOptions)
                        return emailSent

                    } catch (err) {
                        console.log(err.message)
                    }
                }

                sendMail()
                    .then((emailSent) => {
                        if (!emailSent) {
                            throw err
                        }
                        req.flash(
                            'success_msg',
                            `${newUser.name} can now verify their email with the link sent to activate their user account.`
                        )
                        res.redirect('/users/add');
                        console.log(`Verification email has been sent to: ${emailSent.envelope.to}`)
                    })
                    .catch((error) => {
                        console.log(error.message)
                        req.flash(
                            'error_msg',
                            `An error occurred while creating ${newUser.name}'s user account.`
                        )
                        res.redirect('/users/add');
                    })
            }
        });
    }
});

// Activate Account Handle | GET 
router.get('/activate/:token', (req, res) => {
    const token = req.params.token;
    let errors = [];
    if (token) {
        jwt.verify(token, process.env.JWT_ACTIVATION_KEY, (err, decodedToken) => {
            if (err) {
                req.flash(
                    'error_msg',
                    'The link is incorrect or has already expired! Please request the administrator to register you once again.'
                );
                res.redirect('/users/login');
            } else {
                const { name, email, password, isAdmin } = decodedToken;
                User.findOne({ email: email }).then(user => {
                    if (user) {
                        //------------ User's email already exists ------------//
                        req.flash(
                            'error_msg',
                            'The email provided is already registered! Please request you be registered with a new email ID.'
                        );
                        res.redirect('/users/login');
                    } else {
                        // Save user to the system's database
                        const newUser = new User({
                            name,
                            email,
                            password,
                            isAdmin,
                            isVerified: true
                        });

                        //Hashing the password
                        bcrypt.genSalt(10, (err, salt) => {
                            bcrypt.hash(newUser.password, salt, (err, hash) => {
                                if (err) throw err;
                                newUser.password = hash;
                                newUser
                                    .save()
                                    .then(user => {
                                        req.flash(
                                            'success_msg',
                                            `Welcome ${newUser.name}, you're verified and can now log in...`
                                        );
                                        res.redirect('/users/login');
                                    })
                                    .catch((err) => {
                                        console.log(err.message)
                                        req.flash(
                                            'error_msg',
                                            `An error occurred while verifying ${newUser.name}'s user account.`
                                        )
                                    });
                            });
                        });
                    }
                });
            }

        })
    } else {
        res.status(404)
        console.log("User account activation and verification error!")
    }
})

// Update Users Route | PUT
router.put('/users/:id', ensureAuthenticated, async(req, res, next) => {
    req.user = User.findById(req.params.id)
    User.find({}, (err, users) => {
        users !== 0 ? JSON.stringify(users) : console.log(err)
            // Edit user profile
        let user = req.user
        user.name = req.body.name
        user.email = req.body.email
        try {
            updated_user = user.save()
            res.redirect(`/users`)
        } catch (err) {
            console.log(err)
            res.render(`/users`, {
                //user: user,
                user: req.user,
                users: users,
                title: 'Users',
                layout: './layouts/adminLayout'
            })
        }
    })
})

// Add Customers | GET
router.get('/customers', ensureAuthenticated, (req, res) => {
    res.render('admin/addCustomer', {
        user: req.user,
        title: 'Add Customer',
        layout: './layouts/adminLayout.ejs'
    })
});

// Add Customers | POST
router.post('/customers', ensureAuthenticated, (req, res) => {
    const { firstname, lastname, id_number, phone_number, email } = req.body
    console.log(firstname, lastname, id_number, phone_number, email)

    let errors = [];

    if (!firstname || !lastname || !id_number || !phone_number || !email) {
        errors.push({ msg: 'Please enter all fields' });
    }

    if (firstname.length || lastname < 3) {
        errors.push({ msg: 'Names must be at least 3 characters long' });
    }

    if (errors.length > 0) {
        res.render('admin/addCustomer', {
            errors,
            firstname,
            lastname,
            id_number,
            phone_number,
            email,
            user: req.user,
            title: 'Add Customer',
            layout: './layouts/adminLayout'
        })
    } else {
        res.render('admin/addCustomer', {
            user: req.user,
            title: 'Add Customer',
            layout: './layouts/adminLayout.ejs'
        })
    }
});

// Room Booking | GET
router.get('/room-bookings', ensureAuthenticated, (req, res) =>
    res.render('admin/addRoomBookings', {
        user: req.user,
        title: 'Room Bookings',
        layout: './layouts/adminLayout.ejs'
    })
);

// Room Info | GET
router.get('/room-info', ensureAuthenticated, (req, res) =>
    res.render('admin/addRoomInfo', {
        user: req.user,
        title: 'Add Room Info',
        layout: './layouts/adminLayout.ejs'
    })
);

module.exports = router;