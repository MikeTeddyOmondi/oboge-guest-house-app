const express = require('express');
const expressLayouts = require('express-ejs-layouts');
const mongoose = require('mongoose');
const passport = require('passport');
const flash = require('connect-flash');
const session = require('express-session');
const path = require('path');
const favicon = require('serve-favicon')
const cookieParser = require('cookie-parser');
const morgan = require('morgan')

const app = express();

// Passport Config
require('./config/passport')(passport);

//static files
app.use(express.static(path.join(__dirname, 'assets')))
app.use(favicon(path.join(__dirname, 'assets', 'favicon.ico')))

// DB Config
const db = require('./config/keys').mongoURI;

// Connection to database
mongoose
    .connect(
        db, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            useFindAndModify: false,
            useCreateIndex: true
        }
    )
    .then(() => console.log('> Database connection initiated ...'))
    .catch((err) => console.log(err.message));

// EJS
app.use(expressLayouts);
app.set('view engine', 'ejs');
app.set('view options', { layout: false });
//app.set("layout", path.join(__dirname, "/layouts"));

// Cookie Parser
app.use(cookieParser())

// Express body parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// MongoStore | Sessions Store
const MongoDBStore = require('connect-mongodb-session')(session)

// Session Storage
const sessionStore = new MongoDBStore({
    uri: db,
    collection: 'sessions'
})

// Express session
app.use(
    session({
        secret: process.env.SESSION_SECRET,
        saveUninitialized: true,
        resave: false,
        store: sessionStore,
        cookie: {
            httpOnly: true,
            maxAge: parseInt(process.env.SESSION_MAX_AGE)
        }
    }));

// Passport middleware
app.use(passport.initialize());
app.use(passport.session());

// Connect flash
app.use(flash());

// Global variables
app.use(function(req, res, next) {
    res.locals.success_msg = req.flash('success_msg');
    res.locals.error_msg = req.flash('error_msg');
    res.locals.error = req.flash('error');
    next();
});

// Logs | Routes
app.use(morgan('dev'))

// Routes
app.use('/', require('./routes/index.js'));
app.use('/users', require('./routes/users.js'));
app.use('/user-panel', require('./routes/user-panel.js'));

// Server Errors | Page(s) Not Found
app.use(async(req, res, next) => {
    const error = new Error('404 - Not Found')
    error.status = 404
    next(error)
})

app.use((error, req, res, next) => {
    if (error.status == 404) {
        res.status(404).render('404', { title: '404 - Page Not Found', layout: './layouts/userLayout' })
    } else if (error.status == 401) {
        res.status(404).render('401', { title: '401 - Unauthorized Access', layout: './layouts/userLayout' })
    } else if (error.status == 403) {
        res.status(404).render('403', { title: '403 - Forbidden', layout: './layouts/userLayout' })
    } else {
        res.status(404).render('500', { title: '500 - Internal Server Error', error: error, layout: './layouts/userLayout' })
    }
    next()
})

const PORT = process.env.PORT || 8080;

app.listen(PORT, console.log(`> Application server initiated on port: ${PORT}`));