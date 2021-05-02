const mongoose = require("mongoose");
const { ObjectId } = mongoose.Schema;

const PaymentSchema = new mongoose.Schema({
	user: {
		type: ObjectId,
		ref: "User",
		required: true,
	},
	options: { type: Object, required: true },
	charge: { type: Object, required: true },
});

const Payment = mongoose.model("Payment", PaymentSchema);

module.exports = Payment;
