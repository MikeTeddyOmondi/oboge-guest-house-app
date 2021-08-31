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
				console.log("> [Booking Service] error - ", err.message);
				return err;
			});
		return newCustomer._id;
	},
	searchCustomer: async (customerID) => {
		// Searching for customer given the ID number
		let customer;

		await Customer.findOne({ id_number: String(customerID) })
			.then((customerFound) => {
				console.log(`> CustomerFound: ${customerFound._id}`);
				customer = customerFound;
			})
			.catch((err) => {
				console.log(`> [Booking Service] error - ${err}`);
				return err;
			});
		return customer;
	},
	findCustomer: async (objectID) => {
		// Searching for customer given the unique Object ID
		let customer;

		await Customer.findOne({ _id: objectID })
			.then((customerFound) => {
				console.log(`> Customer Found: ${customerFound._id}`);
				customer = customerFound;
			})
			.catch((err) => {
				console.log(`> [Booking Service] error - ${err.message}`);
				return err;
			});

		return customer;
	},
	findRoom: async (roomNumber) => {
		// Logic here
		let roomFound;

		await Room.findOne({ roomNumber })
			.then((room) => {
				console.log(`> Room Found: ${room._id}`);
				roomFound = room;
			})
			.catch((err) => {
				console.log(`> [Booking Service] error - ${err.message}`);
				return err;
			});

		return roomFound;
	},
	saveBooking: async (booking) => {
		// Booking Service Logic
		const {
			customerId,
			numberAdults,
			numberKids,
			roomRate,
			roomID,
			check_in_date,
			check_out_date,
		} = booking;

		// Total number of occupants
		const numberOccupants = parseInt(numberAdults) + parseInt(numberKids);

		// Initialized Variables
		const vatPercentage = 16 / 100;
		const subTotal = numberOccupants * parseInt(roomRate);
		const VAT = vatPercentage * subTotal;
		const total = subTotal + VAT;

		let newBooking = new Booking({
			customer: customerId,
			numberAdults,
			numberKids,
			roomsBooked: roomID,
			checkInDate: check_in_date,
			checkOutDate: check_out_date,
			vat: VAT,
			subTotalCost: subTotal,
			totalCost: total,
		});

		newBooking
			.save()
			.then(() => {
				console.log("Saved a new booking!");
			})
			.catch((err) => {
				console.log("> [Booking Service] error - ", err.message);
				return err;
			});
		return newBooking;
	},
};
