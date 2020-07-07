require('dotenv').config()

if (process.env.NODE_ENV !== 'production') {
    dbPassword = 'mongodb://localhost:27017/admin-db';
} else {
    dbPassword = 'mongodb+srv://' + DB_USER + ':' + DB_PASSWORD + '@guest-house-db.uqp8l.gcp.mongodb.net/' + CLUSTER_NAME + '?retryWrites=true&w=majority'
}

//dbPassword = 'mongodb://localhost:27017/admin-db';
//dbPassword = 'mongodb+srv://YOUR_USERNAME_HERE:'+ encodeURIComponent('YOUR_PASSWORD_HERE') + '@CLUSTER_NAME_HERE.mongodb.net/test?retryWrites=true';
//dbPassword = 'mongodb+srv://DB_USER:DB_PASSWORD@guest-house-db.uqp8l.gcp.mongodb.net/CLUSTER_NAME?retryWrites=true&w=majority

module.exports = {
    mongoURI: dbPassword
};
