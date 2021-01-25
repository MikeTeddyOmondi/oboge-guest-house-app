require('dotenv').config()

if (process.env.NODE_ENV !== 'production') {
    dbPassword = 'mongodb+srv://user_db:user_db123@guest-house-db.uqp8l.gcp.mongodb.net/guest-house-db?retryWrites=true&w=majority'
} else {
    dbPassword = 'mongodb://localhost:27017/admin-db';
}

module.exports = {
    mongoURI: dbPassword
};
