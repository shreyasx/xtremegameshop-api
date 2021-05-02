const express = require("express");
const router = express.Router();

const { getUserById } = require("../controllers/user");
const { isSignedIn, isAuthenticated, isAdmin } = require("../controllers/auth");
const { saveOrder, getOrders } = require("../controllers/order");

router.param("userId", getUserById);
router.post("/newOrder/:userId", isSignedIn, isAuthenticated, saveOrder);
router.get("/getOrders/:userId", isSignedIn, isAuthenticated, getOrders);

module.exports = router;
