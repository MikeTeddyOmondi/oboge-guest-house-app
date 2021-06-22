const passport = require('passport');
const Feedback = require('../models/Feedback')
const nodemailer = require('nodemailer')
const { google } = require("googleapis");
const OAuth2 = google.auth.OAuth2;
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

// Env | Variables
const {
    JWT_RESET_KEY,
    SENDER_EMAIL,
    CLIENT_ID,
    CLIENT_SECRET,
    REFRESH_TOKEN,
    REDIRECT_URL
} = require('../config/config')

// Load User model
const User = require('../models/User');

// Login Page | GET
exports.getLogin = (req, res) => {
    res.render('login', {
        title: 'Login',
        layout: './layouts/userLayout'
    })
}

// Login page | POST
exports.postLogin = (req, res, next) => {
    passport.authenticate('local', {
        successRedirect: '/user-panel',
        failureRedirect: '/users/login',
        failureFlash: true
    })(req, res, next);
};

// User Feeback Contact Form | POST
exports.postLoginContact = async(req, res) => {
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
                        `Thanks ${username}. Your message has been received and it being processed...`
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
};

// Logout | GET
exports.getLogout = (req, res) => {
    req.logout()
    req.flash('success_msg', 'You are logged out');
    res.redirect('/users/login');
};

// Forgot Password | GET
exports.getForgot = (req, res) => {
    res.render('forgot', { title: 'Forgot Password', layout: './layouts/userLayout' })
}

// Forgot Password | POST
exports.postForgot = async(req, res) => {
    const { email } = req.body;

    let errors = [];

    if (!email) {
        errors.push({ msg: 'Please enter an email ID' });
    }

    if (errors.length > 0) {
        res.render('forgot', {
            errors,
            email,
            title: 'Forgot Password',
            layout: './layouts/userLayout'
        });
    } else {
        User.findOne({ email: email }).then(user => {
            if (!user) {
                //------------ User already exists ------------//
                errors.push({ msg: 'User with that email ID does not exist!' });
                res.render('forgot', {
                    errors,
                    email,
                    title: 'Forgot Password',
                    layout: './layouts/userLayout'
                });
            } else {
                // Sign the token 
                const token = jwt.sign({ _id: user._id }, JWT_RESET_KEY, { expiresIn: '30m' });
                const CLIENT_URL = `${ req.protocol }://${req.headers.host}`;

                User.updateOne({ resetLink: token }, (err, success) => {
                    if (err) {
                        errors.push({ msg: 'An error occurred while updating reset link for the user!' });
                        res.render('forgot', {
                            errors,
                            email,
                            title: 'Forgot Password',
                            layout: './layouts/userLayout'
                        });
                    } else {
                        // Send email password reset link to user's inbox  
                        async function sendMail() {
                            try {
                                const oauth2Client = new OAuth2(
                                    CLIENT_ID, // ClientID
                                    CLIENT_SECRET, // Client Secret
                                    REDIRECT_URL // Redirect URL
                                );

                                oauth2Client.setCredentials({
                                    refresh_token: REFRESH_TOKEN
                                })

                                const senderMail = SENDER_EMAIL
                                const accessToken = await oauth2Client.getAccessToken()

                                const transporter = nodemailer.createTransport({
                                    service: 'gmail',
                                    auth: {
                                        type: 'OAuth2',
                                        user: senderMail,
                                        clientId: CLIENT_ID,
                                        clientSecret: CLIENT_SECRET,
                                        refreshToken: REFRESH_TOKEN,
                                        accessToken: accessToken
                                    }
                                })

                                const email_body = ` 
                                    <h5> You requested for a password reset. </h5>
                                    <h5> If this is not your action, please contact the administrator. </h5>
                                    <hr>
                                    <h5> Please click on below link to reset your user account password </h5>
                                    <p>${CLIENT_URL}/users/forgot/${token}</p>
                                    <hr>
                                    <p><b> NOTE: </b> The activation link expires in 30 minutes.</p >
                                `;

                                // send mail with defined transport object
                                const mailOptions = {
                                    from: '"Admin | Oboge Guest House" <noreply.obogeguesthouse@gmail.com>', // sender address
                                    to: email, // list of receivers
                                    subject: "Account Password Reset: ✔", // Subject line
                                    text: `Hi, ${email_body}`,
                                    html: `<h5>Hi, ${email_body}</h5>`, // html body
                                };

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
                                        `An error occurred while resetting password for this ${email}.`
                                    )
                                } else {
                                    req.flash(
                                        'success_msg',
                                        `Password reset link has been sent to the email. Please follow the instructions to recover your password.`
                                    )
                                    res.redirect('/users/login');
                                    console.log(`Password reset email has been sent to: ${email}`)
                                }
                            })
                            .catch((error) => {
                                console.log(error)
                                req.flash(
                                    'error_msg',
                                    `Something went wrong while processing your request. Please try again later.`
                                )
                                res.redirect('/users/forgot');
                            })
                    }
                })

            }
        });
    }
}

// Reset Password Route | GET [ /reset/:id ]
exports.getResetId = (req, res) => {
    res.render('reset', { id: req.params.id, title: 'Reset Password', layout: './layouts/userLayout' })
}

// Reset Password Route | POST  [ /reset/:id ]
exports.postResetId = async(req, res) => {
    var { password, password2 } = req.body;
    const id = req.params.id;
    let errors = [];

    //------------ Checking required fields ------------//
    if (!password || !password2) {
        req.flash(
            'error_msg',
            'Please enter all fields.'
        );
        res.redirect(`/users/reset/${ id }`);
    }

    //------------ Checking password length ------------//
    else if (password.length < 6) {
        req.flash(
            'error_msg',
            'Password must be at least 6 characters.'
        );
        res.redirect(`/users/reset/${ id }`);
    }

    //------------ Checking password mismatch ------------//
    else if (password != password2) {
        req.flash(
            'error_msg',
            'Passwords do not match.'
        );
        res.redirect(`/users/reset/${ id }`);
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
                            res.redirect(`/users/reset/${ id }`);
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
}

// Redirect Link - From Email | GET [ /forgot/:token ]
exports.getForgotToken = (req, res) => {
    const { token } = req.params;

    if (token) {
        jwt.verify(token, JWT_RESET_KEY, (err, decodedToken) => {
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
                        res.redirect(`/users/reset/${_id}`)
                    }
                })
            }
        })
    } else {
        console.log("Password reset error!")
    }
}