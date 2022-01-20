const mongoose = require("mongoose");

const DrinkSchema = new mongoose.Schema(
	{
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
			type: String,
			required: true,
		},
		uom: {
			type: String,
			required: true,
		},
		buyingPrice: {
			type: Number,
			required: true,
		},
		stockQty: {
			type: Number,
			default: 0,
		},
		inStock: {
			type: Boolean,
			default: false,
		},
		image: {
			type: String,
			default: "drink_image.jpg",
		},
	},
	{ timestamps: true },
);

const Drink = mongoose.model("Drink", DrinkSchema);

module.exports = Drink;
