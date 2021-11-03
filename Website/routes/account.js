const express = require("express");
const router = express.Router();
const authController = require("../controllers/account/auth");
const expressHelpers = require("../../config/expressHelpers");
const userController = require("../controllers/account/user");

router.get("/", expressHelpers.isAuthenticated, userController.getUserDetails, (req, res, next) => {
	return res.render("account", {
		layout: "account-layout",
		user: res.user,
	});
});

router.get("/login", (req, res, next) => {
	return res.render("login");
});

router.post("/login", authController.login);

router.get("/register", (req, res, next) => {
	return res.render("register");
});

router.post(
	"/register",
	authController.validateEmail,
	authController.validateUsername,
	authController.validateNewPasswords,
	userController.registerUser, (req, res, next) => {
		return res.redirect("/account/login")
	}
)

router.get("/logout", (req, res, next) => {
	req.session.destroy();
	res.redirect("/");
});

router.get(
	"/user-wishlist",
	expressHelpers.isAuthenticated,
	userController.getUserWishlist,
	(req, res, next) => {
		return res.render("user-wishlist", {
			layout: "account-layout",
			wishlist: res.wishlist,
		});
	}
);

router.get(
	"/address",
	expressHelpers.isAuthenticated,
	userController.getUserDetails,
	(req, res, next) => {
		return res.render("address", {
			layout: "account-layout",
			user: res.user.address,
		});
	}
);

router.get(
	"/order-history",
	expressHelpers.isAuthenticated,
	userController.getUserOrders,
	(req, res, next) => {
		return res.render("order-history", {
			layout: "account-layout",
			orders: res.orders,
		});
	}
);

router.get("/update/email", userController.getUserDetails, (req, res, next) => {
	return res.render("update/email", {
		layout: "account-layout",
		email: res.user.email,
	});
});

router.put(
	"/update/email",
	authController.validateEmail,
	userController.updateEmail)

router.get("/update/password", expressHelpers.isAuthenticated, (req, res, next) => {
	return res.render("update/password", {
		layout: "account-layout",
	});
});

router.put(
	"/update/password",
	expressHelpers.isAuthenticated,
	authController.validateOldPassword,
	authController.validateNewPasswords,
	userController.updatePassword,
);


// TODO: Update username GET and PUT

router.get("/update/username", expressHelpers.isAuthenticated, userController.getUserDetails, (req, res, next) => {

	return res.render("update/username", { layout: "account-layout", username: res.user.username })
})

module.exports = router;

router.put("/update/username", expressHelpers.isAuthenticated, authController.validateUsername, userController.updateUsername)

router.get("/update/address-details", expressHelpers.isAuthenticated, (req, res, next) => {
	return res.render("update/address-details", { layout: "account-layout" })
})

router.put("/update/address-details", expressHelpers.isAuthenticated, userController.updateAddress)