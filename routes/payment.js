const express = require("express");
const router = express.Router();
const stripe = require("stripe")(
	"sk_test_51IBXOSJZ5SfvqGzXBGfUKdVLckmTs6fiRob6N640tZROlXx9FJ8bgNYQjLXTtDTjmiQHB2UPhJoT84q7NZfqZsES00pE60groz"
);
const uuid = require("uuid/v4");
const Payment = require("../models/payments");
const Product = require("../models/product");

router.post("/checkout", async (req, res) => {
	let error;
	let status;
	try {
		const { product, idList, token } = req.body;
		const customer = await stripe.customers.create({
			email: token.email,
			source: token.id,
		});

		idList.map(_id => {
			Product.findOne({ _id }, (er, prod) => {
				prod.sold++;
				prod.stock--;
				prod.save();
			});
		});

		const idempotencyKey = uuid();
		const stripeOptions = {
			amount: product.price * 100,
			currency: "inr",
			customer: customer.id,
			receipt_email: token.email,
			description: `Purchased products`,
			shipping: {
				name: token.card.name,
				address: {
					line1: token.card.address_line1,
					line2: token.card.address_line2,
					city: token.card.address_city,
					country: token.card.address_country,
					postal_code: token.card.address_zip,
				},
			},
		};
		const charge = await stripe.charges.create(stripeOptions, {
			idempotencyKey,
		});
		status = "success";
		const payment = new Payment();
		payment.user = product.user;
		payment.options = stripeOptions;
		payment.charge = charge;
		payment.save((er, result) => {
			if (er) return res.json({ error, status });
			res.json({ error, status, payment: result._id });
		});
	} catch (err) {
		console.error("Error making payment: ", err);
		status = "failure";
		res.json({ error, status });
	}
});

module.exports = router;
