const Product = require("../models/product");
const Category = require("../models/category");

exports.getCategories = async (req, res) => {
	const categories = await Category.find({});
	const resp = categories.map(category => {
		const { _id, name } = category;
		return { _id, name };
	});
	res.json(resp);
};

exports.getProducts = async (req, res) => {
	const { category } = req.query;
	const response = await Product.find({ category });
	const resp = response.map(product => {
		const { name, price, _id, description, stock } = product;
		return { name, price, _id, description, stock };
	});
	res.json(resp);
};
