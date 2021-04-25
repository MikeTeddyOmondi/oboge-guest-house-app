const express = require('express');
const router = express.Router();
const passport = require('passport');
const Feedback = require('../models/Feedback')
const { forwardAuthenticated } = require('../config/auth');
const { upload } = require('../config/screenshotUpload')
const nodemailer = require('nodemailer')
const { google } = require("googleapis");
const OAuth2 = google.auth.OAuth2;
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

// Env | Variables
const clientID = process.env.CLIENT_ID
const clientSecret = process.env.CLIENT_SECRET
const refreshToken = process.env.REFRESH_TOKEN
const redirectURL = "https://developers.google.com/oauthplayground"

// Load User model
const User = require('../models/User');

// Login Page
router.get('/login', forwardAuthenticated, (req, res) => res.render('login', { title: 'Login', layout: './layouts/userLayout' }));

// Login
router.post('/login', (req, res, next) => {
    passport.authenticate('local', {
        successRedirect: '/user-panel',
        failureRedirect: '/users/login',
        failureFlash: true
    })(req, res, next);
});

// Contact Form
router.post('/login/contact', upload.single('screenshot'), async(req, res) => {
    const { username, email, message } = req.body
    const screenshot = req.file

    let errors = [];

    if (!email || !screenshot || !username) {
        errors.push({ msg: 'Please enter all fields...' });
    }

    if (errors.length > 0) {
        res.render('login', {
            errors,
            title: 'Login',
            layout: './layouts/userLayout'
        });
    } else {
        let userFeedback = new Feedback({
            username,
            email,
            message,
            screenshot: screenshot.filename
        })

        try {
            userFeedback = await userFeedback.save()
                .then(() => {
                    req.flash(
                        'success_msg',
                        `Thanks ${username}, your message has been received and it being porcessed...`
                    );
                    res.redirect('/users/login');
                })
        } catch (error) {
            req.flash(
                'error_msg',
                `Sorry an error occurred while processing your message! ${error.message}`
            );
            res.redirect('/users/login');

        }
    }
});

// Logout
router.get('/logout', (req, res) => {
    req.logout()
    req.flash('success_msg', 'You are logged out');
    res.redirect('/users/login');
});

// Forgot Password | GET
router.get('/forgot', (req, res) => {
    res.render('forgot', { title: 'Forgot Password', layout: './layouts/userLayout' })
})

// Forgot Password | POST
router.post('/forgot', (req, res) => {
    const { email } = req.body;

    let errors = [];

    if (!email) {
        errors.push({ msg: 'Please enter an email ID' });
    }

    if (errors.length > 0) {
        res.render('forgot', {
            errors,
            email
        });
    } else {
        User.findOne({ email: email }).then(user => {
            if (!user) {
                //------------ User already exists ------------//
                errors.push({ msg: 'User with Email ID does not exist!' });
                res.render('forgot', {
                    errors,
                    email
                });
            } else {

                const oauth2Client = new OAuth2(
                    clientID, // ClientID
                    clientSecret, // Client Secret
                    redirectURL // Redirect URL
                );

                oauth2Client.setCredentials({
                    refresh_token: refreshToken
                });
                const accessToken = oauth2Client.getAccessToken()

                const token = jwt.sign({ _id: user._id }, process.env.JWT_RESET_KEY, { expiresIn: '30m' });
                const CLIENT_URL = `${req.protocol}://${req.headers.host}`;

                const output = ` <h2> You requested for a password reset. </h2>
                <hr>
                <h2> Please click on below link to reset your user account password </h2>
                <p>${ CLIENT_URL }/users/forgot/ ${ token } </p>
                <hr>
                <p><b> NOTE: </b> The activation link expires in 30 minutes.</p >
                `;

                User.updateOne({ resetLink: token }, (err, success) => {
                    if (err) {
                        errors.push({ msg: 'Error resetting password!' });
                        res.render('forgot', {
                            errors,
                            email
                        });
                    } else {
                        const transporter = nodemailer.createTransport({
                            service: 'gmail',
                            auth: {
                                type: "OAuth2",
                                user: process.env.SENDER_EMAIL,
                                clientId: clientID,
                                clientSecret: clientSecret,
                                refreshToken: refreshToken,
                                accessToken: accessToken
                            },
                        });

                        // send mail with defined transport object
                        const mailOptions = {
                            from: '"Admin | Oboge Guest House" <noreply.obogeguesthouse@gmail.com>', // sender address
                            to: email, // list of receivers
                            subject: "Account Password Reset: ✔", // Subject line
                            html: output, // html body
                        };

                        transporter.sendMail(mailOptions, (error, info) => {
                            if (error) {
                                console.log(error);
                                req.flash(
                                    'error_msg',
                                    'Something went wrong while processing your request. Please try again later.'
                                );
                                res.redirect('/users/forgot');
                            } else {
                                console.log('Mail sent : %s', info.response);
                                req.flash(
                                    'success_msg',
                                    'Password reset link sent to email ID. Please follow the instructions.'
                                );
                                res.redirect('/users/login');
                            }
                        })
                    }
                })

            }
        });
    }
})

// Reset Password Route | GET
router.get('/reset/:id', (req, res) => {
    res.render('reset', { id: req.params.id, title: 'Reset Password', layout: './layouts/userLayout' })
})

// Reset Password Route | POST
router.post('/reset/:id', async(req, res) => {
    var { password, password2 } = req.body;
    const id = req.params.id;
    let errors = [];

    //------------ Checking required fields ------------//
    if (!password || !password2) {
        req.flash(
            'error_msg',
            'Please enter all fields.'
        );
        res.redirect(` / users / reset / $ { id }
                                `);
    }

    //------------ Checking password length ------------//
    else if (password.length < 6) {
        req.flash(
            'error_msg',
            'Password must be at least 6 characters.'
        );
        res.redirect(` / users / reset / $ { id }
                                `);
    }

    //------------ Checking password mismatch ------------//
    else if (password != password2) {
        req.flash(
            'error_msg',
            'Passwords do not match.'
        );
        res.redirect(` / users / reset / $ { id }
                                `);
    } else {
        bcrypt.genSalt(10, (err, salt) => {
            bcrypt.hash(password, salt, (err, hash) => {
                if (err) throw err;
                password = hash;

                User.findByIdAndUpdate({ _id: id }, { password },
                    function(err, result) {
                        if (err) {
                            req.flash(
                                'error_msg',
                                'Error resetting password!'
                            );
                            res.redirect(` / users / reset / $ { id }
                                `);
                        } else {
                            req.flash(
                                'success_msg',
                                'Password reset successfully!'
                            );
                            res.redirect('/users/login');
                        }
                    }
                );

            });
        });
    }
})

// Redirect Link - From Email | GET
router.get('/forgot/:token', (req, res) => {
    const { token } = req.params;

    if (token) {
        jwt.verify(token, process.env.JWT_RESET_KEY, (err, decodedToken) => {
            if (err) {
                req.flash(
                    'error_msg',
                    'Incorrect or expired link! Please try again.'
                );
                res.redirect('/users/login');
            } else {
                const { _id } = decodedToken;
                User.findById(_id, (err, user) => {
                    if (err) {
                        req.flash(
                            'error_msg',
                            'User with email ID does not exist! Please try again.'
                        );
                        res.redirect('/users/login');
                    } else {
                        res.redirect(` / users / reset / $ { _id }
                                `)
                    }
                })
            }
        })
    } else {
        console.log("Password reset error!")
    }
})

module.exports = router;