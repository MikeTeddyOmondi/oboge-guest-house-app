const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema(
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

const User = mongoose.model("User", UserSchema);

module.exports = User;
