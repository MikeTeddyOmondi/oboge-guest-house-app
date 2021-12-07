const mongoose = require("mongoose");

const BookingSchema = new mongoose.Schema(
	{
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
		roomBooked: {
			type: mongoose.Schema.Types.ObjectId,
			required: true,
			ref: "Room",
		},
		checkInDate: {
			type: Date,
			required: true,
		},
		checkOutDate: {
			type: Date,
			required: true,
		},
		vat: {
			type: Number,
			required: true,
		},
		subTotalCost: {
			type: Number,
			required: true,
		},
		totalCost: {
			type: Number,
			required: true,
		},
	},
	{ timestamps: true },
);

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
