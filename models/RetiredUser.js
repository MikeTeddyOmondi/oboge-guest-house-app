const mongoose = require("mongoose");

const RetiredUserSchema = new mongoose.Schema(
	{
		name: {
			type: String,
			required: true,
		},
		email: {
			type: String,
			required: true,
		},
		password: {
			type: String,
			required: true,
		},
		isAdmin: {
			type: Boolean,
			default: false,
		},
		isVerified: {
			type: Boolean,
			default: false,
		},
		resetLink: {
			type: String,
			default: "",
		},
	},
	{ timestamps: true },
);

const RetiredUser = mongoose.model("RetiredUser", RetiredUserSchema);

module.exports = RetiredUser;
