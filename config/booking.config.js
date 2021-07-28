// Models
const Customer = require("../models/Customer");
const Room = require("../models/Room");
const Booking = require("../models/Booking");

// Booking Logic | Customer
module.exports = {
	saveCustomer: async (customer) => {
		// Logic here
		const { firstname, lastname, email, id_number, phone_number } = customer;

		let newCustomer = new Customer({
			firstname,
			lastname,
			email,
			id_number,
			phone_number,
		});

		newCustomer
			.save()
			.then(() => {
				console.log("Saved a new customer!");
			})
			.catch((err) => {
				console.log("> [Config] error - ", err.message);
			});
		return newCustomer._id;
	},
	searchCustomer: async (customerID) => {
		// Logic here
		let id;

		await Customer.findOne({ id_number: String(customerID) })
			.then((customerFound) => {
				id = customerFound._id;
			})
			.catch((err) => {
				console.log(`> [Config] error - ${err}`);
			});
		return id;
	},
	findRoom: async (room) => {
		// Logic here
		let roomIDFound;
		await Room.findOne({ roomNumber: room.roomNumber }, function (err, docs) {
			if (err) {
				console.log(err);
			} else {
				console.log("RoomFound: ", docs._id);
			}
			roomIDFound = docs._id;
		});
		return roomIDFound;
	},
	saveBooking: async (booking) => {
		// Logic here
	},
};
