const User = require("../models/user");
const crypto = require("crypto");
const nodemailer = require("nodemailer");
const Token = require("../models/Token");
const Order = require("../models/order");
const Cart = require("../models/cart");

exports.getStatus = (req, res) => {
	User.findOne({ _id: req.profile._id }, (er, user) => {
		if (er || !user) {
			console.log("aaaaaaaahhhhh");
			return;
		}
		if (!user.encry_password) return res.json("linked");
		res.json("not linked");
	});
};

exports.confirmationPost = (req, res, next) => {
	const { token } = req.body;
	Token.findOne({ token }, function (err, token) {
		if (!token) return res.json({ error: "Invalid token" });
		if (token.createdAt + 1800000 < Date.now())
			return res.json({ error: "Token expired" });

		User.findOne({ _id: token.userId }, function (e, user) {
			if (!user) return res.json({ error: "Invalid token" });
			if (user.verified)
				return res.json({
					error: "This user has already been verified.",
				});

			// Verify and save the user
			user.verified = true;
			console.log(`${user.name} - Verified.`);
			user.save(function (er) {
				if (er) return res.json({ error: err.message });
				res.json(true);
			});
		});
	});
};

const createToken = userID => {
	const tokenS = new Token({
		userId: userID,
		token: crypto.randomBytes(16).toString("hex"),
	});
	tokenS.save((err, response) => {
		if (err) {
			console.log("unable to save token in db.");
			return;
		}
	});
	return tokenS.token;
};

const transporter = nodemailer.createTransport({
	service: "gmail",
	auth: {
		user: process.env.NODEMAILER_EMAIL,
		pass: process.env.NODEMAILER_PASS,
	},
});

const sendMail = (user, res) => {
	var mailOptions = {
		from: process.env.NODEMAILER_EMAIL,
		to: user.email,
		subject: "Account Verification Token",
		text:
			`Hey ${user.name},\n\n` +
			"I'm Shreyas, the owner of Extreme Gaming Store. If you didn't " +
			"create an account on my website, please ignore this mail.\n" +
			"However, if you did, you can verify your account by clicking the link: \n" +
			process.env.CLIENT +
			"verify/" +
			createToken(user._id) +
			"\nYou can reply to this mail for any queries." +
			"\n\nRegards\nShreyas Jamkhandi",
	};
	transporter.sendMail(mailOptions, function (err, msg) {
		if (err) {
			console.log("send mail error -", err.message);
			res.json({ error: "Couldn't send mail to your address." });
		} else {
			console.log(
				`sent account verification email to ${user.email} sucessfully.`
			);
			res.json("Sent mail");
		}
	});
};

exports.verify = (req, res) => {
	User.findOne({ _id: req.profile._id }, (er, user) => {
		sendMail(user, res);
	});
};

exports.deleteUser = (req, res) => {
	User.deleteOne({ _id: req.profile._id })
		.then(r => {
			Cart.deleteOne({ user: req.profile._id }).then(re =>
				res.json("Account deleted successfully!")
			);
		})
		.catch(console.log);
};

exports.getUserById = (req, res, next, id) => {
	User.findById(id).exec((err, user) => {
		if (err || !user) {
			return res.status(400).json({
				error: "No user was found in DB",
			});
		}
		req.profile = user;
		next();
	});
};

exports.getUser = (req, res) => {
	req.profile.salt = undefined;
	req.profile.encry_password = undefined;
	return res.json(req.profile.verified);
};

exports.updateUser = (req, res) => {
	const { pass1, pass2 } = req.body;
	var password;
	if (pass1 === pass2) password = pass1;
	else return res.json({ error: "Passwords must be the same." });
	if (password.length < 5)
		return res.json({ error: "Password must be 5 or more characters." });
	User.findOne({ _id: req.profile._id }, (err, user) => {
		if (err || !user) {
			return res.status(400).json({
				error: "YOU are not AUTHORISED to update this infornmation",
			});
		}
		if (user.authenticate(password))
			return res.status(401).json({
				error: "New password must be different from your existing password.",
			});
		user.password = password;
		user
			.save()
			.then(resp => {
				const { token } = req.params;
				Token.deleteOne({ token }).then(re => {
					console.log(`Password updated and deleted token for ${user.email}`);
					res.json("doneee");
				});
			})
			.catch(e =>
				res.status(400).json({ error: "Couldn't update your password." })
			);
		req.profile = null;
	});
};

exports.userPurchaseList = (req, res) => {
	Order.find({ user: req.profile._id })
		.populate("user", "_id name")
		.exec((err, order) => {
			if (err) {
				return res.status(400).json({
					error: "NO Order in this account",
				});
			}
			return res.json(order);
		});
};
