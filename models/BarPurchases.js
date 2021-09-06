const mongoose = require("mongoose");

const BarPurchaseSchema = new mongoose.Schema({
	drink: {
		type: mongoose.Schema.Types.ObjectId,
		required: true,
		ref: "DrinkDetail",
	},
	quantityPurchased: {
		type: number,
		required: true,
	},
	uom: {
		type: [crates, bottles],
		required: true,
	},
	buyingPrice: {
		type: Number,
		required: true,
	},
});

BarPurchaseSchema.virtual("specific-drink", {
	ref: "Drink",
	localField: "drink",
	foreignField: "drinkCode",
	justOne: true,
});

const BarPurchase = mongoose.model("BarPurchase", BarPurchaseSchema);

module.exports = BarPurchase;
