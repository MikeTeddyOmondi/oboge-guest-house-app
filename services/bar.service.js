// Models
const Drink = require("../models/Drink");
const BarPurchase = require("../models/BarPurchases");

// Booking Logic | Customer
module.exports = {
	saveDrink: async (drink) => {
		// Logic here
		const { drinkName, drinkCode, typeOfDrink, uom, buyingPrice, image } =
			drink;

		let newDrink = new Drink({
			drinkName,
			drinkCode,
			typeOfDrink,
			uom,
			buyingPrice,
			image,
		});

		await newDrink
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
		let drink = {};

		await Drink.findOne({ drinkCode: String(drinkCode) })
			.then((drinkFound) => {
				if (drinkFound) {
					console.log(`> Drink Found: ${drinkFound._id}`)
					return (drink = drinkFound);
				} 
				return drink = {};
				
			})
			.catch((err) => {
				console.log(
					`> [Bar Service] An error occurred while searching for that drink (${drinkCode}) - ${err}`,
				);
				return err;
			});
		return drink;
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
	fetchAllDrinks: async () => {
		// Logic here
		let allDrinks;

		await Drink.find({})
			.then((drinks) => {
				//allDrinkCodes = drinks.map(({ drinkCode }) => drinkCode);
				allDrinks = drinks;
			})
			.catch((err) => {
				console.log(
					`> [Bar Service] An error occurred while fetching data - ${err.message}`,
				);
				return err;
			});

		return allDrinks;
	},
	saveBarPurchase: async (barPurchase) => {
		// Bar purchase Service Logic
		const { receiptNumber, product, quantity, stockValue, supplier } =
			barPurchase;

		let newBarPurchase = new BarPurchase({
			receiptNumber,
			product,
			quantity,
			stockValue,
			supplier,
		});

		newBarPurchase
			.save()
			.then(() => {
				console.log("> Saved a new bar purchase!");
			})
			.catch((err) => {
				console.log(
					`> [Bar Service] An error occurred while saving the bar purchase (${barPurchase}) - ${err.message}`,
				);
				return;
			});
		return newBarPurchase;
	},
	fetchBarPurchases: async () => {
		// Logic here
		let allPurchases;

		await BarPurchase.find({})
			.populate("product")
			.then((purchasesMade) => {
				// console.log(purchasesMade);
				allPurchases = purchasesMade;
			})
			.catch((err) => {
				console.log(
					`> [Bar Service] An error occurred while fetching data - ${err.message}`,
				);
				allPurchases = {};
				return err;
			});

		return allPurchases;
	},
	updateStockQuantity: async (drink, quantity) => {
		await Drink.updateOne(
			{ _id: drink._id },
			{
				$set: {
					inStock: true,
					stockQty: parseInt(drink.stockQty) + parseInt(quantity),
				},
			},
		)
			.then(() => {
				console.log(
					`> [Bar Service] Updated drink ${drink.drinkCode} stock data successfully`,
				);
			})
			.catch((err) => {
				console.log(
					`> [Bar Service] An error occurred while updating drink data - ${err.message}`,
				);
				return err;
			});
	},
};
