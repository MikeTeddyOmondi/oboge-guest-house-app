const { MONGO_REMOTE_URI, MONGO_LOCAL_URI } = require("../config/config");

// Database Connection | REMOTE or LOCAL network
//const URI = `mongodb://${MONGO_ADMIN_USER}:${MONGO_ADMIN_PASSWORD}@${MONGO_IP}:${MONGO_PORT}`;
//const URI = `mongodb://${MONGO_IP}:${MONGO_PORT}/hotel-app-db`;

module.exports = {
	MONGO_REMOTE_URI,
	MONGO_LOCAL_URI,
};
