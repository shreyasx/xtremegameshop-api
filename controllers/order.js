const Order = require("../models/order");

exports.saveOrder = (req, res, next) => {
	const { products, price, addresses, payment } = req.body;
	const order = new Order();
	order.products = products;
	order.payment = payment;
	order.user = req.profile._id;
	order.price = price;
	order.addresses = addresses;
	order.save().then(() => {
		console.log("order saved in db");
		res.json("ok");
	});
};

exports.getOrders = (req, res) => {
	Order.find({ user: req.profile._id }, (er, orders) => {
		const resp = orders.map(order => {
			const { _id, price, products } = order;
			return { _id, price, products };
		});
		res.json(resp);
	});
};
