// Models
const Drink = require("../models/Drink");
const BarPurchase = require("../models/BarPurchases");

// Booking Logic | Customer
module.exports = {
	saveDrink: async (drink) => {
		// Logic here
		const { drinkName, drinkCode, typeOfDrink, uom, buyingPrice } = drink;

		let newDrink = new Drink({
			drinkName,
			drinkCode,
			typeOfDrink,
			uom,
			buyingPrice,
		});

		newDrink
			.save()
			.then(() => {
				console.log("> Saved a new drink!");
			})
			.catch((err) => {
				console.log(
					"> [Bar Service] An error occurred while saving the drink information - ",
					err.message,
				);
				return err;
			});
		return newDrink;
	},
	searchDrink: async (drinkCode) => {
		// Searching for drink given the unique drink code
		let drink;

		await Customer.findOne({ drinkCode: String(drinkCode) })
			.then((drinkFound) => {
				console.log(`> CustomerFound: ${customerFound._id}`);
				customer = customerFound;
			})
			.catch((err) => {
				console.log(
					`> [Bar Service] An error occurred while searching for that drink - ${err}`,
				);
				return err;
			});
		return customer;
	},
	findDrink: async (objectID) => {
		// 		// Searching for drink given the unique Object ID
		let customer;

		await Drink.findOne({ _id: objectID })
			.then((drinkFound) => {
				console.log(`> Drink found: ${drinkFound._id}`);
				drink = drinkFound;
			})
			.catch((err) => {
				console.log(
					`> [Bar Service] An error occurred while finding the single drink - ${err.message}`,
				);
				return err;
			});

		return customer;
	},
	fetchAllDrinkCodes: async () => {
		// Logic here
		let allDrinkCodes = [];

		await Drink.find({})
			.then((drinks) => {
				allDrinkCodes = drinks.map(({ drinkCode }) => drinkCode);
				console.log("codes", allDrinkCodes);
			})
			.catch((err) => {
				console.log(
					`> [Bar Service] An error occurred while fetching data - ${err.message}`,
				);
				return err;
			});

		return allDrinkCodes;
	},
	// findRoom: async (roomNumber) => {
	// 	// Logic here
	// 	let roomFound;

	// 	await Room.findOne({ roomNumber })
	// 		.then((room) => {
	// 			console.log(`> Room Found: ${room._id}`);
	// 			roomFound = room;
	// 		})
	// 		.catch((err) => {
	// 			console.log(`> [Booking Service] error - ${err.message}`);
	// 			return err;
	// 		});

	// 	return roomFound;
	// },
	saveBarPurchase: async (barPurchase) => {
		// Bar purchase Service Logic
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

		let newBarPurchase = new BarPurchase({
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

		newBarPurchase
			.save()
			.then(() => {
				console.log("> Saved a new bar purchase!");
			})
			.catch((err) => {
				console.log(
					"> [Bar Service] An error occurred while saving the bar purchase - ",
					err.message,
				);
				return err;
			});
		return newBarPurchase;
	},
};
