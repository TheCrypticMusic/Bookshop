const express = require("express");
const Book = require("../models/books");
const csrf = require("csurf");
const e = require("connect-flash");
const User = require("../models/user");

const Basket = require("../models/basket")

const router = express.Router();

// const csrfProtection = csrf();

function isAuthenticated(req, res, next) {
	if (req.isAuthenticated()) {
		next();
	} else {
		res.redirect("/login");
	}
}

// router.use(csrfProtection);

router.use((req, res, next) => {
	res.locals.isAuthenticated = req.isAuthenticated();
	if (req.isAuthenticated()) res.locals.user = req.user.username;
	res.locals.session = req.session
	next();
});

router.get("/", (req, res, next) => {
	console.log("Is User Authenticated?", req.isAuthenticated());
	Book.find((err, docs) => {
		if (!err) {
			res.render("index", { title: "Bookstore", books: docs });
		} else {
			console.log("Error retrieving books:", +err);
		}
	}).lean();
});

router.get("/register", (req, res, next) => {
	res.render("register")
	// { csrfToken: req.csrfToken() };

});

router.get("/login", (req, res, next) => {
	res.render("login"
		// { csrfToken: req.csrfToken() });
	)
});

router.get("/logout", (req, res, next) => {
	req.session.destroy();
	res.redirect("/");
});

router.get("/basket", isAuthenticated, async (req, res, next) => {
	const userId = req.session.passport.user

	if (userId) {
		await Basket.findOne({ userId }, (err, userBasket) => {
			if (!err) {

				if (userBasket) {
					const basketItems = userBasket.items
					const subTotal = userBasket.subTotal
					return res.render("basket", { basketItems: basketItems, subTotal: subTotal })
				} else {
					return res.render("basket", { basketItems: 0})
				}
			}
		}).lean()
	}
});

router.get("/add-to-basket/:id", (req, res, next) => {

	return res.render("index",
		// { csrfToken: req.csrfToken()})
	)
})


router.get("/remove-from-basket/:id", (req, res, next) => {

	return res.render("/basket",
		// { csrfToken: req.csrfToken()})
	)
})



router.get("/account", isAuthenticated, (req, res, next) => {
	User.findById(req.user.id, (err, result) => {
		if (err) {
			return err;
		} else {
			return res.render("account", { user: result });
		}
	}).lean();
});

router.get("/amendments/email", isAuthenticated, (req, res, next) => {
	return res.render("email", { csrfToken: req.csrfToken() });
});

router.get("/amendments/password", isAuthenticated, (req, res, next) => {
	return res.render("password", { csrfToken: req.csrfToken() });
});

router.get("/amendments/username", isAuthenticated, (req, res, next) => {
	return res.render("username", { csrfToken: req.csrfToken() });
});

module.exports = router;
