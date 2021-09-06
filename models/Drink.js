const mongoose = require("mongoose");

const DrinkSchema = new mongoose.Schema({
	drinkName: {
		type: String,
		required: true,
	},
	drinkCode: {
		type: String,
		required: true,
		unique: true,
	},
	typeOfDrink: {
		type: { alcoholic, non_alcoholic, water },
		required: true,
	},
	uom: {
		type: { crates, bottles },
		required: true,
	},
	buyingPrice: {
		type: Number,
		required: true,
	},
});

const Drink = mongoose.model("DrinkDetail", DrinkSchema);

module.exports = Drink;
