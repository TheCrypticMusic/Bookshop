const express = require("express");
const router = express.Router();
const mongooseHelpers = require("../config/mongooseHelpers");
const APIHelpers = require("../config/APIHelpers");

const userBasketExists = (req, res, next) => {
	const userId = req.params.userid;

	mongooseHelpers.getUserBasket(userId).then((result) => {
		if (result === null) {
			APIHelpers.sendStatus(404, "error", null, "Basket not found", req.originalUrl, res);
		} else {
			next();
		}
	});
};

const completedOrderExists = (req, res, next) => {
	const userId = req.params.userid;
	const basketId = req.params.basketid;

	mongooseHelpers.getSingleOrder(userId, basketId).then((singleOrder) => {
		if (!singleOrder) {
			APIHelpers.sendStatus(404, "error", null, "No order found", req.originalUrl, res);
		} else {
			next();
		}
	});
};

const userOrderDocumentExists = async (req, res, next) => {
	const userId = req.params.userid;

	await mongooseHelpers.getUserOrders(userId).then((result) => {
		if (!result) {
			APIHelpers.sendStatus(
				404,
				"error",
				null,
				"No order document found",
				req.originalUrl,
				res
			);
		} else {
			next();
		}
	});
};

// get all orders that have been processed on the website
router.get("/", (req, res) => {
	mongooseHelpers.getAllOrders().then((orders) => {
		if (orders.length > 0) {
			APIHelpers.sendStatus(
				200,
				"success",
				{ orders: orders },
				"All orders found",
				req.originalUrl,
				res
			);
		} else {
			APIHelpers.sendStatus(404, "error", null, "No orders found", req.originalUrl, res);
		}
	});
});

// get a specfic user and their associated completed orders
router.get("/:userid", userOrderDocumentExists, (req, res) => {
	const userId = req.params.userid;

	mongooseHelpers.getUserOrders(userId).then((userOrders) => {
		APIHelpers.sendStatus(
			200,
			"success",
			{ user_orders: userOrders },
			"User orders found",
			req.originalUrl,
			res
		);
	});
});

// creates a new order document for the database
router.post("/:userid", (req, res) => {
	const userId = req.params.userid;

	mongooseHelpers.createNewOrderDocumentForUser(userId).then((documentCreated) => {
		if (documentCreated) {
			APIHelpers.sendStatus(
				201,
				"success",
				null,
				"User order document sucessfully created",
				req.originalUrl,
				res
			);
		} else {
			APIHelpers.sendStatus(
				404,
				"error",
				null,
				"Document already exists",
				req.originalUrl,
				res
			);
		}
	});
});

// delete order document
router.delete("/:userid", userOrderDocumentExists, (req, res) => {
	const userId = req.params.userid;

	mongooseHelpers.deleteOrderDocument(userId).then((result) => {
		if (result.deletedCount > 0) {
			APIHelpers.sendStatus(
				200,
				"success",
				null,
				"Order document deleted",
				req.originalUrl,
				res
			);
		}
	});
});

// create a new order
router.post("/:userid/baskets", userOrderDocumentExists, userBasketExists, (req, res) => {
	const userId = req.params.userid;

	mongooseHelpers.createUserOrder(userId).then((result) => {
		if (!result) {
			APIHelpers.sendStatus(
				201,
				"success",
				result,
				"New order created",
				req.originalUrl,
				res
			);
		} else {
			APIHelpers.sendStatus(
				404,
				"error",
				null,
				"Basket found but zero items in basket",
				req.originalUrl,
				res
			);
		}
	});
});

// delete all orders
router.delete("/:userid/baskets", userOrderDocumentExists, (req, res) => {
	const userId = req.params.userid;

	mongooseHelpers.deleteAllOrders(userId).then((result) => {
		if (result.nModified > 0) {
			APIHelpers.sendStatus(200, "success", null, "Orders deleted", req.originalUrl, res);
		} else {
			APIHelpers.sendStatus(404, "success", null, "No orders found", req.originalUrl, res);
		}
	});
});

// get a single completed order for a user

router.get("/:userid/baskets/:basketid", userOrderDocumentExists, (req, res) => {
	const userId = req.params.userid;
	const basketId = req.params.basketid;

	mongooseHelpers.getSingleOrder(userId, basketId).then((singleOrder) => {
		APIHelpers.sendStatus(200, "success", singleOrder, "Order found", req.originalUrl, res);
	});
});

// update existing subTotal within a completed order
// Fields that can be updated:
// subTotal
router.put(
	"/:userid/baskets/:basketid",
	userOrderDocumentExists,
	completedOrderExists,
	(req, res) => {
		const userId = req.params.userid;
		const basketId = req.params.basketid;
		const updateData = req.body;

		mongooseHelpers.updateSingleOrderSubtotal(userId, basketId, updateData).then((result) => {
			if (result.nModified > 0) {
				APIHelpers.sendStatus(
					200,
					"success",
					null,
					"Completed order subtotal updated",
					req.originalUrl,
					res
				);
			} else {
				APIHelpers.sendStatus(
					422,
					"success",
					null,
					"Completed order found but not updated due to same data being present",
					req.originalUrl,
					res
				);
			}
		});
	}
);

router.delete(
	"/:userid/baskets/:basketid",
	userOrderDocumentExists,
	completedOrderExists,
	(req, res) => {
		const userId = req.params.userid;
		const basketId = req.params.basketid;

		mongooseHelpers.deleteSingleOrder(userId, basketId).then((result) => {
			APIHelpers.sendStatus(
				200,
				"success",
				null,
				"Completed order deleted",
				req.originalUrl,
				res
			);
		});
	}
);


// Update a single order item details
router.put(
	"/:userid/baskets/:basketid/items/:itemid",
	userOrderDocumentExists,
	completedOrderExists,
	(req, res) => {
		const userId = req.params.userid;
		const basketId = req.params.basketid;
		const itemId = req.params.itemid;
		const updateBody = req.body;

		mongooseHelpers
			.updateSingleOrderItemDetails(userId, basketId, itemId, updateBody)
			.then((result) => {
				APIHelpers.sendStatus(201, "success", result, "Item updated", req.originalUrl, res);
			});
	}
);

module.exports = router;
