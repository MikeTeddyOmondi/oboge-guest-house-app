const express = require("express");
const expressLayouts = require("express-ejs-layouts");
const mongoose = require("mongoose");
const passport = require("passport");
const flash = require("connect-flash");
const session = require("express-session");
const path = require("path");
const favicon = require("serve-favicon");
const cookieParser = require("cookie-parser");
const morgan = require("morgan");

const app = express();

// Env | Config
const { PORT, SESSION_MAX_AGE } = require("./config/config");

// Passport | Config
require("./config/passport")(passport);

// Static Files
app.use(express.static(path.join(__dirname, "assets")));
app.use(favicon(path.join(__dirname, "assets", "favicon.ico")));

// DB | Config
const db_URI = require("./config/keys").mongoURI;

// EJS
app.use(expressLayouts);
app.set("view engine", "ejs");
app.set("view options", { layout: false });

// Cookie Parser
app.use(cookieParser());

// Express body parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// MongoStore | Sessions Store
const MongoDBStore = require("connect-mongodb-session")(session);

// Session Storage
const sessionStore = new MongoDBStore({
	uri: db_URI,
	databaseName: "guest-house-db",
	collection: "sessions",
});

sessionStore.on("error", function(error) {
	// Error catched and thrown to handler
	console.log(`_________________________________________`);
	console.log(`Session error:`);
	console.log(`_________________________________________`);
	console.log(`> ${error.message}`);
});

// Express session
app.use(
	session({
		secret: process.env.SESSION_SECRET,
		saveUninitialized: true,
		resave: false,
		store: sessionStore,
		cookie: {
			name: "cookieStore",
			secure: false,
			httpOnly: true,
			maxAge: parseInt(SESSION_MAX_AGE),
		},
	}),
);

// Passport middleware
app.use(passport.initialize());
app.use(passport.session());

// Connect flash
app.use(flash());

// Global variables
app.use(function(req, res, next) {
	res.locals.success_msg = req.flash("success_msg");
	res.locals.error_msg = req.flash("error_msg");
	res.locals.error = req.flash("error");
	next();
});

// Logs | Routes
app.use(morgan("common"));

// Routes
app.use("/", require("./routes/index.js"));
app.use("/admin", require("./routes/admin-panel.js"));
app.use("/users", require("./routes/users.js"));
app.use("/user-panel", require("./routes/user-panel.js"));

// Server Errors | Page(s) Not Found
app.use(async (req, res, next) => {
	const error = new Error("404 - Not Found");
	error.status = 404;
	next(error);
});

app.use((error, req, res, next) => {
	if (error.status == 404) {
		res.status(404).render("404", {
			title: "404 - Page Not Found",
			layout: "./layouts/userLayout",
		});
	} else if (error.status == 401) {
		res.status(404).render("401", {
			title: "401 - Unauthorized Access",
			layout: "./layouts/userLayout",
		});
	} else if (error.status == 403) {
		res.status(404).render("403", {
			title: "403 - Forbidden",
			layout: "./layouts/userLayout",
		});
	} else {
		res.status(500).render("500", {
			title: "500 - Internal Server Error",
			error: error,
			layout: "./layouts/userLayout",
		});
	}
	next();
});

process.on("unhandledRejection", (error, promise) => {
	console.log(`Unhandled promise rejection: ${promise}`);
	console.log(`Unhandled promise error: ${error.stack || error.message}`);
	// Recommended: send the information to sentry.io
	// or whatever crash reporting service you use
});

process.on("uncaughtException", (error) => {
	console.log(`Uncaught exception occurred: `);
	console.log(`_____________________________ `);
	console.log(`> ${error}`);
	// Recommended: send the information to sentry.io or whatever crash reporting service you use
	process.exit(1); // exit application
});

// Connection to database
const connectWithRetry = () => {
	mongoose
		.connect(db_URI, {
			useNewUrlParser: true,
		})
		.then(() => {
			startServer();
			console.log(`_________________________________________`);
			console.log(`> Database connection initiated...`);
			console.log(`> Database connection successfull!!!`);
			console.log(`_________________________________________`);
		})
		.catch((err) => {
			console.log(`> Error connecting to the database: ${err.message}`);
			setTimeout(connectWithRetry, 5000);
		});
};

// Ping | Database Connection
connectWithRetry();

// Start the server
const startServer = async () => {
	app.listen(PORT, () => {
		console.log(`_________________________________________ `);
		console.log(`> Backend services server initiated...`);
		console.log(`> Backend services served on port: ${PORT}`);
		console.log(`_________________________________________ `);
	});
};
