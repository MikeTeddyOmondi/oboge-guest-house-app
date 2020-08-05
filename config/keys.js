require('dotenv').config()

if (process.env.NODE_ENV !== 'production') {
    dbPassword = 'mongodb+srv://user_db:user_db123@guest-house-db.uqp8l.gcp.mongodb.net/guest-house-db?retryWrites=true&w=majority'
} else {
    dbPassword = 'mongodb://localhost:27017/admin-db';}

//dbPassword = 'mongodb://localhost:27017/admin-db';
//dbPassword = 'mongodb+srv://YOUR_USERNAME_HERE:'+ encodeURIComponent('YOUR_PASSWORD_HERE') + '@CLUSTER_NAME_HERE.mongodb.net/test?retryWrites=true';

module.exports = {
    mongoURI: dbPassword
};
