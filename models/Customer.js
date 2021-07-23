const mongoose = require("mongoose");

const CustomerSchema = new mongoose.Schema({
	firstname: {
		type: String,
		required: true,
	},
	lastname: {
		type: String,
		required: true,
	},
	id_number: {
		type: String,
		required: true,
		unique: true,
	},
	email: {
		type: String,
		default: "",
	},
	phone_number: {
		type: Number,
		required: true,
	},
	createdDate: {
		type: Date,
		default: Date.now,
	},
	updatedDate: {
		type: Date,
		defualt: "",
	},
});

const Customer = mongoose.model("Customer", CustomerSchema);

module.exports = Customer;
