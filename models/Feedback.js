const mongoose = require("mongoose");

const FeedbackSchema = new mongoose.Schema({
	username: {
		type: String,
		required: true,
	},
	email: {
		type: String,
		required: true,
	},
	message: {
		type: String,
		required: true,
	},
	screenshot: {
		type: String,
		default: "screenshot.jpg",
	},
	createdDate: {
		type: Date,
		default: Date.now,
	},
});

const Feedback = mongoose.model("Feedback", FeedbackSchema);

module.exports = Feedback;
