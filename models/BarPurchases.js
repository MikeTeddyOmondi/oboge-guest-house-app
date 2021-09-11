const mongoose = require("mongoose");

const BarPurchaseSchema = new mongoose.Schema(
	{
		receiptNumber: {
			type: String,
			required: true,
		},
		drinks: [
			{
				drinkID: {
					type: mongoose.Schema.Types.ObjectId,
					required: true,
					ref: "Drink",
				},
				quantityPurchased: {
					type: Number,
					required: true,
				},
			},
		],
		stockValue: {
			type: Number,
			required: true,
		},
	},
	{ timestamps: true },
);

BarPurchaseSchema.virtual("specific-drink", {
	ref: "Drink",
	localField: "drink",
	foreignField: "drinkCode",
	justOne: true,
});

const BarPurchase = mongoose.model("BarPurchase", BarPurchaseSchema);

module.exports = BarPurchase;
