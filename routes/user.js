const express = require("express");
const router = express.Router();

const {
	getUserById,
	getUser,
	updateUser,
	userPurchaseList,
	deleteUser,
	verify,
	confirmationPost,
	getStatus,
	saveOrder,
} = require("../controllers/user");
const { isSignedIn, isAuthenticated, isAdmin } = require("../controllers/auth");

router.param("userId", getUserById);
router.get("/user/:userId", isSignedIn, isAuthenticated, getUser);
router.put("/user/:userId", isSignedIn, isAuthenticated, updateUser);
router.get(
	"/order/user/:userId",
	isSignedIn,
	isAuthenticated,
	userPurchaseList
);
router.get("/delete/:userId", isSignedIn, isAuthenticated, deleteUser);
router.get("/verify/:userId", isSignedIn, isAuthenticated, verify);
router.post("/verify-email", confirmationPost);
router.post("/update/:userId", isSignedIn, isAuthenticated, updateUser);
router.get("/getStatus/:userId", isSignedIn, isAuthenticated, getStatus);

module.exports = router;
