// Lib imports
const { DateTime } = require("luxon");

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
				console.log("> Saved a new customer!");
			})
			.catch((err) => {
				console.log("> [Booking Service] error - ", err.message);
				return err;
			});
		return newCustomer._id;
	},
	fetchAllCustomers: async () => {
		// Logic here
		let customers;

		await Customer.find({})
			.then((allCustomers) => {
				// All Customers
				customers = allCustomers;
			})
			.catch((err) => {
				console.log(
					`> [Booking Service] An error occurred while fetching data - ${err.message}`,
				);
				return err;
			});

		return customers;
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

		// Calculate the number of days to stay in the room
		const days = DateTime.fromISO(check_out_date)
			.diff(DateTime.fromISO(check_in_date), "days")
			.toObject().days;

		// console.log(`Accomodation Duration = ${days} days`);

		// Initialized Variables
		const vatPercentage = 16 / 100;
		const subTotal = numberOccupants * parseInt(roomRate) * days;
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
	fetchBookings: async () => {
		// Logic here
		let allBookings;

		await Booking.find({})
			.populate("customer")
			.populate("roomBooked")
			.then((bookingsMade) => {
				// console.log(`Bookings made: ${bookingsMade}`);
				allBookings = bookingsMade;
			})
			.catch((err) => {
				console.log(
					`> [Booking Service] An error occurred while fetching data - ${err.message}`,
				);
				allBookings = {};
				return err;
			});

		return allBookings;
	},
	updateRoomStatus: async (roomNumber, boolean) => {
		if (boolean == true) {
			await Room.findOneAndUpdate(
				{ roomNumber },
				{ isBooked: true },
				(err, doc, res) => {
					if (err) return console.log(err.message);
					console.log({ doc });
				},
			).clone();
		} else if (boolean == false) {
			await Room.findOneAndUpdate(
				{ roomNumber },
				{ isBooked: false },
				(err, doc, res) => {
					if (err) return console.log(err.message);
					console.log({ doc });
				},
			).clone();
		} else {
			return console.log(
				"> [Service error} No args provided: (roomNumber, boolean)",
			);
		}

		return;
	},
	checkRoomAvailability: async (roomNumber) => {
		let availability;

		await Room.findOne({ roomNumber })
			.then((room) => {
				let roomFound = room;

				if (roomFound.isBooked == true) {
					console.log(`> Room is not available!`);
					return (availability = true);
				}
				console.log(`> Room is available...`);
				return (availability = false);
			})
			.catch((err) => {
				console.log(
					`> [Booking Service] error while checking availability - ${err.message}`,
				);
				return err;
			});

		return availability;
	},
};
