const mongoose = require("mongoose");

const BarPurchaseSchema = new mongoose.Schema(
	{
		receiptNumber: {
			type: String,
			required: true,
		},
		product: {
			type: mongoose.Schema.Types.ObjectId,
			required: true,
			ref: "Drink",
		},
		quantity: {
			type: Number,
			required: true,
		},
		stockValue: {
			type: Number,
			required: true,
		},
		supplier: {
			type: String,
			required: true,
		},
	},
	{ timestamps: true },
);

BarPurchaseSchema.virtual("drink", {
	ref: "Drink",
	localField: "product",
	foreignField: "_id",
	justOne: true,
});

const BarPurchase = mongoose.model("BarPurchase", BarPurchaseSchema);

module.exports = BarPurchase;
