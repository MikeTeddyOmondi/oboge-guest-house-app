require('dotenv').config()

if (process.env.NODE_ENV !== 'production') {
    dbPassword = process.env.MONGODB_URI
} else {
    dbPassword = 'mongodb://localhost:27017/hotel-app-db';
}

module.exports = {
    mongoURI: dbPassword
};
