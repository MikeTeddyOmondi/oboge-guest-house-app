const {
    MONGO_IP,
    MONGO_PORT,
    MONGODB_URI
} = require("../config/config")

// Database Connection | Remote network
//const URI = `mongodb://${MONGO_ADMIN_USER}:${MONGO_ADMIN_PASSWORD}@${MONGO_IP}:${MONGO_PORT}`;
const URI = `mongodb://${MONGO_IP}:${MONGO_PORT}/hotel-app-db`;

module.exports = {
    'mongoURI': MONGODB_URI
};