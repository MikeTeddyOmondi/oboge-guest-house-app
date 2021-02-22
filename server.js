const express = require('express');
const expressLayouts = require('express-ejs-layouts');
const mongoose = require('mongoose');
const passport = require('passport');
const flash = require('connect-flash');
const session = require('express-session');
const path = require('path');
const cookieParser = require('cookie-parser');

const app = express();

// Passport Config
require('./config/passport')(passport);

// DB Config
const db = require('./config/keys').mongoURI;

// Connect to MongoDB
mongoose
    .connect(
        process.env.MONGODB_URI || db,
        { useNewUrlParser: true, useUnifiedTopology: true }
    )
    .then(() => console.log('> Database connection initiated ...'))
    .catch(err => console.log(err));

// EJS
app.use(expressLayouts);
app.set('view engine', 'ejs');
app.set('view options', { layout: false });
//app.set("layout", path.join(__dirname, "/layouts"));

//static files
app.use(express.static(path.join(__dirname, 'assets')))

// Cookie Parser
app.use(cookieParser())

// Express body parser
app.use(express.urlencoded({ extended: true }));

// Express session
app.use(
    session({
        secret: process.env.SESSION_SECRET,
        saveUninitialized: true,
        resave: false,
        cookie: {
            httpOnly: true,
            maxAge: parseInt(process.env.SESSION_MAX_AGE)
        }
    })
);

// Passport middleware
app.use(passport.initialize());
app.use(passport.session());

// Connect flash
app.use(flash());

// Global variables
app.use(function (req, res, next) {
    res.locals.success_msg = req.flash('success_msg');
    res.locals.error_msg = req.flash('error_msg');
    res.locals.error = req.flash('error');
    next();
});

// Routes
app.use('/', require('./routes/index.js'));
app.use('/users', require('./routes/users.js'));
app.use('/user-panel', require('./routes/user-panel.js'));

// Server Errors | Page(s) Not Found
app.use((req, res, next) => {
    res.status(404).render('404', { title: '404 - Page Not Found', layout: './layouts/siteLayout' })
})

const PORT = process.env.PORT || 8080;

app.listen(PORT, console.log(`> Application server initiated on port: ${PORT}`));