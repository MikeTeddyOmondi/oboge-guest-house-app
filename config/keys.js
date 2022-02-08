const { MONGO_REMOTE_URI, MONGO_LOCAL_URI } = require("../config/config");
const NODE_ENV = process.env.NODE_ENV;

// Database Connection | REMOTE or LOCAL network
//const URI = `mongodb://${MONGO_ADMIN_USER}:${MONGO_ADMIN_PASSWORD}@${MONGO_IP}:${MONGO_PORT}`;
//const URI = `mongodb://${MONGO_IP}:${MONGO_PORT}/hotel-app-db`;

let DB_URI;

if (NODE_ENV === "development") {
	DB_URI = MONGO_LOCAL_URI;
} else {
	DB_URI = MONGO_LOCAL_URI;
}

module.exports = {
	DB_URI,
};
