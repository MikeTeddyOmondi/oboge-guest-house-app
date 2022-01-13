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

// EJS
app.use(expressLayouts);
app.set("view engine", "ejs");
app.set("view options", { layout: false });

// Cookie Parser
app.use(cookieParser());

// Express body parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Logs | Routes
process.env.NODE_ENV === "production" ? app.use(morgan("common")) : app.use(morgan("dev")); 

// DB | Configs
const DB_REMOTE_URI = require("./config/keys").MONGO_REMOTE_URI;

// MongoStore | Sessions Store
const MongoDBStore = require("connect-mongodb-session")(session);

// Session Storage
let sessionOptions = {};

sessionOptions = {
	uri: DB_REMOTE_URI,
	databaseName: "guest-house-db",
	collection: "sessions",
};

const sessionStore = new MongoDBStore(sessionOptions);

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

// Check for errors before making a session
sessionStore.on("error", function (error) {
	// Error catched and thrown to handler
	console.log(`_________________________________________`);
	console.log(`Sessions error:`);
	console.log(`_________________________________________`);
	console.log(`> Unable to initiate sessions from database:`);
	console.log(`> ${error.message}`);
	console.log(`_________________________________________`);
});

// Global variables
app.use(function (req, res, next) {
	res.locals.success_msg = req.flash("success_msg");
	res.locals.error_msg = req.flash("error_msg");
	res.locals.error = req.flash("error");
	next();
});

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

// Connection to REMOTE | LOCAL database
const connectDB = (URI) => {
	DB_URI_IN_USE = URI;
	// console.log({ DB_URI_IN_USE });

	mongoose
		.connect(URI, {
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
			console.log(`_________________________________________`);
			console.log(`Database connection error:`);
			console.log(`_________________________________________`);
			console.log(`> Error connecting to the remote database: ${err.message}`);
			console.log(`> Trying connection to the remote database once again...`);
			setTimeout(() => {
				connectDB(DB_REMOTE_URI);
			}, 3000);
		});
};

// Ping | Database Connection
connectDB(DB_REMOTE_URI);

// Start the server
const startServer = async () => {
	app.listen(PORT, () => {
		console.log(`_________________________________________ `);
		console.log(`> Backend services server initiated...`);
		console.log(`> Backend services served on port: ${PORT}`);
		console.log(`_________________________________________ `);
	});
};

process.on("unhandledRejection", (error, promise) => {
	console.log(`Unhandled promise rejection: ${promise}`);
	console.log(`Unhandled promise error: ${error.stack || error.message}`);
	// Recommended: send the information to sentry.io
	// or whatever crash reporting service
});

process.on("uncaughtException", (error) => {
	console.log(`Uncaught exception occurred: `);
	console.log(`_____________________________ `);
	console.log(`> Node thread process exiting...`);
	console.log(`> ${error.message}`);
	// Recommended: send the information to sentry.io or whatever crash reporting service 
	process.exit(1); // exit application
});
