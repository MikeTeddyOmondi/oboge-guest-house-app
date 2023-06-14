const bcrypt = require("bcryptjs");
const mongoose = require("mongoose");
const User = require("../models/User");

const DB_REMOTE_URI =
  "mongodb://localhost/guest-house-db?retryWrites=true&w=majority";

// Connection to REMOTE | LOCAL database
const connectDB = (URI) => {
  DB_URI_IN_USE = URI;

  mongoose
    .connect(URI, {
      useNewUrlParser: true,
    })
    .then(() => {
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
      }, 2000);
    });
};

// Ping | Database Connection
connectDB(DB_REMOTE_URI);

User.findOne({ email: "mike_omondi@outlook.com" }).then((user) => {
  if (user) {
    //------------ User's email already exists ------------//
    console.log(
      "The email provided is already registered! Please request you be registered with a new email ID."
    );
    return;
  } else {
    // Save user to the system's database
    const newUser = new User({
      name: "admin",
      email: "mike_omondi@outlook.com",
      password: "password",
      isAdmin: true,
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
            console.log(
              `Welcome ${newUser.name}, you're verified and can now log in...`
            );
            return;
          })
          .catch((err) => {
            console.log(err.message);
            return;
          });
      });
    });
  }
});
