const express = require("express");
const router = express.Router();
const mongooseHelpers = require("../config/mongooseHelpers")
const authControler = require("../controllers/auth")


exports.createTitleCaseQuery = (query) => {
	for (const value in query) {
		if (typeof query[value] === "string" && /[-]/.test(query[value])) {
			query[value] = query[value]
				.split(/[ -]+/)
				.map((x) => {
					return x[0].toUpperCase() + x.slice(1);
				})
				.join("-");
		} else {
			query[value] = query[value]
				.split(" ")
				.map((x) => {
					return x[0].toUpperCase() + x.slice(1);
				})
				.join(" ");
		}
	}
	return query;
};

exports.sendStatus = (statusCode, successOrError, data, message, req, res) => {

	res.status(statusCode).json({
		status: successOrError,
		code: statusCode,
		message: message,
		data: data,
		path: req.originalUrl
	})
}

exports.filterBuilder = (filter) => {
	return Object.keys(filter);
};


exports.basketExists = (req, res, next) => {
	const userId = req.params.userid;

	console.log(userId)
	mongooseHelpers.getUserBasket(userId).then((userBasket) => {
		if (!(userBasket)) {
			this.sendStatus(404, "error", null, "No basket found", req, res);
		} else {
			next();
		}
	});
};

exports.completedOrderExists = (req, res, next) => {
	const userId = req.params.userid;
	const basketId = req.params.basketid;

	mongooseHelpers.getSingleOrder(userId, basketId).then((singleOrder) => {
		if (!singleOrder) {
			this.sendStatus(404, "error", null, "No order found", req, res);
		} else {
			next();
		}
	});
};


exports.userOrderDocumentExists = async (req, res, next) => {
	const userId = req.params.userid;
	mongooseHelpers.getUserOrders(userId).then((result) => {
		if (!result) {
			this.sendStatus(
				404,
				"error",
				null,
				"No order document found",
				req,
				res
			);
		} else {
			next();
		}
	});
};

exports.bookExists = (req, res, next) => {
	const bookId = req.method !== "POST" ? req.body.bookId : req.params.bookId

	mongooseHelpers.getSingleBook(bookId).then((book) => {
		if (book === null) {
			this.sendStatus(404, "error", null, "Incorrect book id provided", req, res)
		}
		else {
			next()
		}
	})
};

exports.skuExists = (req, res, next) => {
	const bookSkuId = req.method !== "POST" ? req.body.bookSkuId : req.params.bookSkuId
	const bookId = req.method !== "POST" ? req.body.bookId : req.params.bookId


	mongooseHelpers.getSingleSkuOfBook(bookId, bookSkuId).then((sku) => {
		if (!(sku.hasOwnProperty("skus"))) {
			this.sendStatus(404, "error", null, "Incorrect book sku id provided", req, res)
		} else {
			next()
		}
	})
}

exports.basketItemExists = (req, res, next) => {
	const userId = req.method !== "POST" ? req.params.userid : req.body.userid
	const itemId = req.method !== "POST" ? req.params.itemid : req.body.itemid

	mongooseHelpers.getBasketItem(userId, itemId).then((result) => {

		if (!(result.hasOwnProperty("items"))) {
			this.sendStatus(404, "error", null, "Basket item not found", req, res)
		} else {
			req.result = result
			next()
		}
	})
}

exports.postageTypeExists = (req, res, next) => {

	const postageTypeId = req.method !== "POST" ? req.params.postagetypeid : req.body.postagetypeid

	mongooseHelpers.getSinglePostageType(postageTypeId).then((result) => {
		if (!(result)) {
			this.sendStatus(404, "error", null, "Postage type not found", req, res)
		} else {
			req.result = result
			next()
		}
	})
}

exports.wishlistExists = (req, res, next) => {

	const userId = req.method !== "" ? req.params.userid : req.body.userid

	mongooseHelpers.getUserWishlist(userId).then((result) => {

		if (!(result)) {
			this.sendStatus(404, "error", null, "No wishlist found", req, res)
		} else {
			req.result = result
			next()
		}
	})
}

exports.userExists = (req, res, next) => {

	const userId = req.method !== "POST" ? req.params.userid : req.body.userid

	mongooseHelpers.getUser(userId).then((result) => {
		if (!(result)) {
			this.sendStatus(404, "error", null, "No user found", req, res)
			return
		}
		req.result = result
		next()
	})
}

exports.vaildateRegisterData = (req, res, next) => {

	const { username, email, password } = req.body

	console.log("Username:", username, "Email:", email, "Password:", password)

	mongooseHelpers._vaildateEmail(email).then((emailExists) => {
		if (emailExists) {
			return this.sendStatus(409, "error", null, "Email already exists", req, res)
		}
		mongooseHelpers._vaildateUsername(username).then((userUsernameExists) => {
			if (userUsernameExists) {
				return this.sendStatus(409, "error", null, "Username already exists", req, res)
			}
			next()
		})

	})


}	
