const NeverBounce = require('neverbounce');
const { emailVerifier } = require('../config/emailVerifier');
const nodemailer = require('nodemailer')
const { google } = require("googleapis");
const OAuth2 = google.auth.OAuth2;
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

// Load User model
const User = require('../models/User');

// Administration | GET
exports.getAdminPanel = (req, res) => {
    res.render('welcome', {
        title: 'Administration',
        layout: './layouts/userLayout'
    })
};

// Admin dashboard | GET
exports.getDashboardPanel = (req, res) => {
    res.render('admin/dashboard', {
        user: req.user,
        title: 'Admin',
        layout: './layouts/adminLayout.ejs'
    })
};

// Users Route | GET
exports.getUsersPanel = (req, res) => {
    User.find({}, (err, users) => {
        users !== 0 ? JSON.stringify(users) : console.log(err)
        res.render('admin/users', {
            users: users,
            user: req.user,
            title: 'Users',
            layout: './layouts/adminLayout.ejs'
        })
    });
};

// Add Users Route | GET
exports.getAddUsersPanel = (req, res) => {
    res.render('admin/addUsers', {
        user: req.user,
        title: 'Add Users',
        layout: './layouts/adminLayout.ejs'
    })
};

// Add Users Route | POST
exports.postAddUsersPanel = async(req, res) => {
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
                    <h5>${CLIENT_URL}/account/activate/${token}</h5>
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
                            from: '"Admin | Oboge Guest House" <noreply.obogeguesthouse@gmail.com>', // sender address,
                            to: email,
                            subject: 'Account Verification | Oboge Guest House',
                            text: `Hi ${name}, ${activation_link}`,
                            html: `<h5>Hi ${name}, ${activation_link}</h5>`
                        }

                        const emailSent = await transporter.sendMail(mailOptions)
                        return emailSent

                    } catch (err) {
                        console.log(`Send Mail Error > ${err}`)
                        res.status(500).render('500', {
                            title: '500 - Internal Server Error',
                            error: err,
                            layout: './layouts/userLayout'
                        })
                    }
                }

                sendMail()
                    .then((emailSent) => {
                        if (!emailSent) {
                            req.flash(
                                'error_msg',
                                `An error occurred while creating ${ newUser.name }'s user account.`
                            )
                        } else {
                            req.flash(
                                'success_msg',
                                `${newUser.name} can now verify their email with the link sent to activate their user account.`
                            )
                            res.redirect('/admin/users/add');
                            console.log(`Verification email has been sent to: ${emailSent}`)
                        }
                    })
                    .catch((error) => {
                        console.log(error)
                        req.flash(
                            'error_msg',
                            `An error occurred while sending mail to ${ newUser.name }.`
                        )
                        res.redirect('/admin/users/add');
                    })
            }
        });
    }
};

// Update Users Route | PUT
exports.putUpdateUsersPanel = async(req, res, next) => {
    req.user = User.findById(req.params.id)
    User.find({}, (err, users) => {
        users !== 0 ? JSON.stringify(users) : console.log(err)
            // Edit user profile
        let user = req.user
        user.name = req.body.name
        user.email = req.body.email
        try {
            updated_user = user.save()
            res.redirect(`/admin/users`)
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
};

// Add Customers | GET
exports.getAddCustomersPanel = (req, res) => {
    res.render('admin/addCustomer', {
        user: req.user,
        title: 'Add Customer',
        layout: './layouts/adminLayout.ejs'
    })
};

// Add Customers | POST
exports.postAddCustomersPanel = (req, res) => {
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
};

// Room Booking | GET
exports.getAddRoomBookingsPanel = (req, res) => {
    res.render('admin/addRoomBookings', {
        user: req.user,
        title: 'Room Bookings',
        layout: './layouts/adminLayout.ejs'
    })
};

// Room Info | GET
exports.getAddRoomInfoPanel = (req, res) => {
    res.render('admin/addRoomInfo', {
        user: req.user,
        title: 'Add Room Info',
        layout: './layouts/adminLayout.ejs'
    })
};