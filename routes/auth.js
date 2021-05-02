var express = require("express");
var router = express.Router();

const { check } = require("express-validator");
const {
	signout,
	signup,
	signin,
	facebook,
	google,
	forgotPassword,
	confirmPasswordReset,
} = require("../controllers/auth");

const { updateUser } = require("../controllers/user");

router.param("token", confirmPasswordReset);

router.post(
	"/signup",
	[
		check("name", "Name should be atleast 3 char long").isLength({ min: 3 }),
		check("email", "Email is required").isEmail(),
		check("password", "Password should be atleast 5 char long").isLength({
			min: 5,
		}),
	],
	signup
);

router.post("/signup/facebook", facebook);
router.post("/signup/google", google);

router.post(
	"/signin",
	[
		check("email", "Email is required").isEmail(),
		check("password", "Password field is required").isLength({ min: 1 }),
	],
	signin
);

router.get("/signout", signout);
router.post("/sendResetPasswordLink", forgotPassword);
router.post("/forgot/:token", updateUser);

module.exports = router;
