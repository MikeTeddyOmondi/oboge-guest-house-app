const mongoose = require("mongoose");

const BookingSchema = new mongoose.Schema({
	customer: {
		type: mongoose.Schema.Types.ObjectId,
		required: true,
		ref: "Customer",
	},
	numberAdults: {
		type: Number,
		required: true,
	},
	numberKids: {
		type: Number,
		required: true,
	},
	roomsBooked: [
		{
			type: mongoose.Schema.Types.ObjectId,
			required: true,
			ref: "Room",
		},
	],
	checkInDate: {
		type: Date,
		required: true,
	},
	checkOutDate: {
		type: Date,
		required: true,
	},
	totalCost: {
		type: Number,
		required: true,
	},
	createdDate: {
		type: Date,
		default: Date.now,
	},
	updatedDate: {
		type: Date,
		default: "",
	},
});

BookingSchema.virtual("occupant", {
	ref: "Customer",
	localField: "customer",
	foreignField: "_id",
	justOne: true,
});

BookingSchema.virtual("rooms-booked", {
	ref: "Room",
	localField: "roomsBooked",
	foreignField: "_id",
	justOne: true,
});

const Booking = mongoose.model("Booking", BookingSchema);

module.exports = Booking;
