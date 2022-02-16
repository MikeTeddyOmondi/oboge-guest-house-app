const mongoose = require("mongoose");

const BarSaleSchema = new mongoose.Schema(
	{
		invoiceID: {
			type: String,
			required: true,
		},
		customer: {
			type: String,
		},
		drinks: [
			{
				productID: {
					type: mongoose.Schema.Types.ObjectId,
					required: true,
					ref: "Drink",
				},
				qtyBought: {
					type: Number,
					required: true,
				},
				stockValue: {
					type: Number,
					required: true,
				},
			},
		],
		totalStockValue: {
			type: Number,
			required: true,
		},
	},
	{ timestamps: true },
);

// BarSaleSchema.virtual("drink", {
// 	ref: "Drink",
// 	localField: "product",
// 	foreignField: "_id",
// 	justOne: true,
// });

const BarSale = mongoose.model("BarSale", BarSaleSchema);

module.exports = BarSale;
