const express = require("express");
const router = express.Router();
const mongooseHelpers = require("../config/mongooseHelpers")



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
	const bookId = req.method !== "" ? req.body.bookId : req.params.bookId

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
	const bookSkuId = req.method !== "" ? req.body.bookSkuId : req.params.bookSkuId
	const bookId = req.method !== "" ? req.body.bookId : req.params.bookId


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