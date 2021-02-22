const express = require('express');
const router = express.Router();
const { emailVerifier } = require('../config/emailVerifier');
const { ensureAuthenticated, forwardAuthenticated } = require('../config/auth');
const nodemailer = require('nodemailer')
const { google } = require("googleapis");
const OAuth2 = google.auth.OAuth2;
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
// Load User model
const User = require('../models/User');

// Website - Homepage
router.get('/', forwardAuthenticated, (req, res) => res.render('site', { title: 'Welcome', layout: './layouts/siteLayout' }));

// Administration
router.get('/admin', forwardAuthenticated, (req, res) => res.render('welcome', { title: 'Administration', layout: './layouts/adminLayout' }));

// Admin dashboard
router.get('/dashboard', ensureAuthenticated, (req, res) => {
  res.render('admin/dashboard', {
    user: req.user,
    title: 'Admin',
    layout: './layouts/adminLayout.ejs'
  })
});

// Users Route - GET
router.get('/users', ensureAuthenticated, (req, res) => {
    User.find({}, (err , users) => {
        users !== 0 ? JSON.stringify(users) : console.log(err)
        res.render('admin/users', {
          users: users,
          user: req.user,
          title: 'Users',
          layout: './layouts/adminLayout.ejs'
        })
    });
  }
);

// Users Route - POST
router.post('/users', ensureAuthenticated, (req, res) => {
  User.find({}, (err , users) => {
    users !== 0 ? JSON.stringify(users) : console.log(err)
    const { name, email, password, confirm_password } = req.body;
    let errors = [];

    if (!name || !email || !password || !confirm_password) {
    errors.push({ msg: 'Please enter all fields' });
    }

    if (password != confirm_password) {
    errors.push({ msg: 'Passwords do not match' });
    }

    if (password.length < 6) {
    errors.push({ msg: 'Password must be at least 6 characters' });
    }

    if ( errors.length > 0 ) {
      res.render('admin/users', {
        errors,
        name,
        email,
        password,
        confirm_password,
        user: req.user,
        users: users,
        title: 'Users',
        layout: './layouts/adminLayout'
      }) 
    } else { 
      // Check if the user's email exists in the database
      User.findOne({ email: email }).then(user => {
        if (user) {
          errors.push({ msg: 'Email already exists' });
          res.render('admin/users', {
            errors,
            name,
            email,
            password,
            confirm_password,
            user: req.user,
            users: users,
            title: 'Users',
            layout: './layouts/adminLayout'
          });
        } else { 
          // Email Verification through API call
          emailVerifier.verify(email, (err, data) => {
            if (data.smtpCheck !== 'true') {
              errors.push({ msg: 'Please enter a valid email ...' });
              res.statusCode().render('admin/users', {
                errors,
                name,
                email,
                password,
                confirm_password,
                user: req.user,
                users: users,
                title: 'Users',
                layout: './layouts/adminLayout'
              });
              console.log(data);
              console.log(`An error occurred while validating your email: ${err}`);
            }
          });

          const newUser = new User({
            name,
            email,
            password
          });

          const oAuth2Client = new OAuth2(
            process.env.CLIENT_ID, // ClientID
            process.env.CLIENT_SECRET, // Client Secret
            "https://developers.google.com/oauthplayground" // Redirect URL
          )
          oAuth2Client.setCredentials({
            refresh_token: process.env.REFRESH_TOKEN
          })

          const token = jwt.sign({ name, email, password }, process.env.JWT_ACTIVATION_KEY, { expiresIn: '30m' });
          const CLIENT_URL = 'http://' + req.headers.host;

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
                subject: 'Account Verification | Oboge Guest House - Web Application',
                text: `Hi ${name}, ${activation_link}`,
                html: `<h5>Hi ${name}, ${activation_link}</h5>`  
              }

              const emailSent = await transporter.sendMail(mailOptions)
              return emailSent

            } catch (err) {
              console.log(err)
            }
          }

          sendMail()
            .then((emailSent) => {
              req.flash(
                'success_msg',
                `${newUser.name} can now verify their email with the link sent to activate their user account.`
              )
              res.redirect('/users');
              console.log(`${emailSent.response}`)
              console.log('Verification email has been sent to', emailSent.envelope.to)
            })
            .catch((error) => console.log(error.message))
        }
      });
    }
  });
});

//------------ Activate Account Handle ------------//
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
          }
          else {
              const { name, email, password } = decodedToken;
              User.findOne({ email: email }).then(user => {
                  if (user) {
                      //------------ User's email already exists ------------//
                      req.flash(
                          'error_msg',
                          'The email provided is already registered! Please request you be registered with a new email ID.'
                      );
                      res.redirect('/users/login');
                  } else
                  {
                    // Save user to the system's database
                      const newUser = new User({
                          name,
                          email,
                          password
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
                            .catch(err => console.log(err));
                        });
                      });
                  }
              });
          }

      })
  }
  else {
    res.status(404)
    console.log("User account activation and verification error!")
  }
})

// Users Route - PUT
router.put('/users/:id', ensureAuthenticated, async (req, res, next) => {
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

// Customers
router.get('/customers', ensureAuthenticated, (req, res) =>
  res.render('admin/customers', {
    user: req.user,
    title: 'Customers',
    layout: './layouts/adminLayout.ejs'
  })
);

// Room Booking
router.get('/room_bookings', ensureAuthenticated, (req, res) =>
  res.render('admin/room_bookings', {
    user: req.user,
    title: 'Room Bookings',
    layout: './layouts/adminLayout.ejs'
  })
);

// Room Info
router.get('/room_info', ensureAuthenticated, (req, res) =>
  res.render('admin/room_info', {
    user: req.user,
    title: 'Room Info',
    layout: './layouts/adminLayout.ejs'
  })
);

module.exports = router;
