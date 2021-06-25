// Load process.env
require('dotenv').config()

// Load env configuration
module.exports = {
    MONGO_IP: process.env.MONGO_IP || "mongo",
    MONGO_PORT: process.env.MONGO_PORT || 27017,
    MONGO_ADMIN_USER: process.env.MONGO_ADMIN_USER,
    MONGO_ADMIN_PASSWORD: process.env.MONGO_ADMIN_PASSWORD,
    MONGO_USER: process.env.MONGO_USER,
    MONGO_PASSWORD: process.env.MONGO_PASSWORD,
    SESSION_SECRET: process.env.SESSION_SECRET,
    NODE_ENV: process.env.NODE_ENV,
    MONGODB_URI: process.env.MONGODB_URI,
    PORT: process.env.PORT || 8080,
    SESSION_MAX_AGE: process.env.SESSION_MAX_AGE,
    CLIENT_ID: process.env.CLIENT_ID,
    CLIENT_SECRET: process.env.CLIENT_SECRET,
    REFRESH_TOKEN: process.env.REFRESH_TOKEN,
    REDIRECT_URL: "https://developers.google.com/oauthplayground",
    JWT_RESET_KEY: process.env.JWT_RESET_KEY,
    JWT_ACTIVATION_KEY: process.env.JWT_ACTIVATION_KEY,
    SENDER_EMAIL: process.env.SENDER_EMAIL,
};