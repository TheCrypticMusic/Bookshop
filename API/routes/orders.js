const express = require("express");
const router = express.Router();
const mongooseHelpers = require("../../config/mongooseHelpers");
const apiHelpers = require("../../config/apiHelpers");




// get all orders that have been processed on the website
router.get("/", (req, res) => {
	mongooseHelpers.getAllOrders().then((orders) => {
		if (orders.length > 0) {
			apiHelpers.sendStatus(
				200,
				"success",
				{ orders: orders },
				"All orders found",
				req,
				res
			);
		} else {
			apiHelpers.sendStatus(404, "error", null, "No orders found", req, res);
		}
	});
});

// get a specfic user and their associated completed orders
router.get("/:userid", apiHelpers.userOrderDocumentExists, (req, res) => {
	const userId = req.params.userid;

	mongooseHelpers.getUserOrders(userId).then((userOrders) => {
		apiHelpers.sendStatus(
			200,
			"success",
			{ user_orders: userOrders },
			"User orders found",
			req,
			res
		);
	});
});

// creates a new order document for the database
router.post("/:userid", (req, res) => {
	const userId = req.params.userid;

	mongooseHelpers.createNewOrderDocumentForUser(userId).then((documentCreated) => {
		if (documentCreated) {
			apiHelpers.sendStatus(
				201,
				"success",
				null,
				"User order document sucessfully created",
				req,
				res
			);
		} else {
			apiHelpers.sendStatus(
				404,
				"error",
				null,
				"Document already exists",
				req,
				res
			);
		}
	});
});

// delete order document
router.delete("/:userid", apiHelpers.userOrderDocumentExists, (req, res) => {
	const userId = req.params.userid;

	mongooseHelpers.deleteOrderDocument(userId).then((result) => {
		if (result.deletedCount > 0) {
			apiHelpers.sendStatus(
				200,
				"success",
				null,
				"Order document deleted",
				req,
				res
			);
		}
	});
});

// create a new order
router.post("/:userid/baskets", apiHelpers.userOrderDocumentExists, apiHelpers.basketExists, (req, res) => {
	const userId = req.params.userid;

	mongooseHelpers.createUserOrder(userId).then((result) => {
		if (!result) {
			apiHelpers.sendStatus(
				201,
				"success",
				result,
				"New order created",
				req,
				res
			);
		} else {
			apiHelpers.sendStatus(
				404,
				"error",
				null,
				"Basket found but zero items in basket",
				req,
				res
			);
		}
	});
});

// delete all orders
router.delete("/:userid/baskets", apiHelpers.userOrderDocumentExists, (req, res) => {
	const userId = req.params.userid;

	mongooseHelpers.deleteAllOrders(userId).then((result) => {
		if (result.nModified > 0) {
			apiHelpers.sendStatus(200, "success", null, "Orders deleted", req, res);
		} else {
			apiHelpers.sendStatus(404, "success", null, "No orders found", req, res);
		}
	});
});

// get a single completed order for a user

router.get("/:userid/baskets/:basketid", apiHelpers.userOrderDocumentExists, (req, res) => {
	const userId = req.params.userid;
	const basketId = req.params.basketid;

	mongooseHelpers.getSingleOrder(userId, basketId).then((singleOrder) => {
		apiHelpers.sendStatus(200, "success", singleOrder, "Order found", req, res);
	});
});

// update existing subTotal within a completed order
// Fields that can be updated:
// subTotal
router.put(
	"/:userid/baskets/:basketid",
	apiHelpers.userOrderDocumentExists,
	apiHelpers.completedOrderExists,
	(req, res) => {
		const userId = req.params.userid;
		const basketId = req.params.basketid;
		const updateData = req.body;

		mongooseHelpers.updateSingleOrderSubtotal(userId, basketId, updateData).then((result) => {
			if (result.nModified > 0) {
				apiHelpers.sendStatus(
					200,
					"success",
					null,
					"Completed order subtotal updated",
					req,
					res
				);
			} else {
				apiHelpers.sendStatus(
					422,
					"success",
					null,
					"Completed order found but not updated due to same data being present",
					req,
					res
				);
			}
		});
	}
);

router.delete(
	"/:userid/baskets/:basketid",
	apiHelpers.userOrderDocumentExists,
	apiHelpers.completedOrderExists,
	(req, res) => {
		const userId = req.params.userid;
		const basketId = req.params.basketid;

		mongooseHelpers.deleteSingleOrder(userId, basketId).then((result) => {
			apiHelpers.sendStatus(
				200,
				"success",
				null,
				"Completed order deleted",
				req,
				res
			);
		});
	}
);


// Update a single order item details
router.put(
	"/:userid/baskets/:basketid/items/:itemid",
	apiHelpers.userOrderDocumentExists,
	apiHelpers.completedOrderExists,
	(req, res) => {
		const userId = req.params.userid;
		const basketId = req.params.basketid;
		const itemId = req.params.itemid;
		const updateBody = req.body;

		mongooseHelpers
			.updateSingleOrderItemDetails(userId, basketId, itemId, updateBody)
			.then((result) => {
				apiHelpers.sendStatus(201, "success", result, "Item updated", req, res);
			});
	}
);

module.exports = router;
