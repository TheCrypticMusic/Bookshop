const express = require("express");
const router = express.Router();
const dashboardController = require("../controllers/dashboard");

router.get(
	"/",
	dashboardController.configDateSettings,
	dashboardController.getUsersInDateRangeCount,
	dashboardController.getTotalUsersCount,
	dashboardController.getOrdersInDateRangeCount,
	dashboardController.getTotalOrdersCount,
	dashboardController.getTotalNumberOfBooksSoldCount,
	dashboardController.getBooksInDateRangeCount,

	(req, res, next) => {
		return res.render("dashboard", {
			title: "Dashboard",
			dateRangeUsers: res.dateRangeUsers,
			totalUserCount: res.totalUserCount,
			dateRangeOrders: res.numberOfOrders,
			totalNumberOfOrders: res.totalNumberOfOrders,
			totalNumberOfBooks: res.totalNumberOfBooks,
			dateRangeBooks: res.numberOfBooks,
			active: {	}
		});
	}
);
router.get(
	"/snapshots",
	dashboardController.configDateSettings,
	dashboardController.getUsersInDateRangeCount,
	dashboardController.getOrdersInDateRangeCount,
	dashboardController.getBooksInDateRangeCount,

	(req, res, next) => {
		return res.send({
			dateRangeUsers: res.dateRangeUsers,
			dateRangeOrders: res.numberOfOrders,
			dateRangeBooks: res.numberOfBooks,
		});
	}
);

router.get(
	"/breakdown/orders",
	dashboardController.configDateSettings,
	dashboardController.getOrdersInDateRangeCount,
	dashboardController.orderChartSetup,
	(req, res, next) => {
		return res.send({
			data: res.dates,
		});
	}
);

router.get(
	"/breakdown/books",
	dashboardController.configDateSettings,
	dashboardController.getBooksInDateRangeCount,
	dashboardController.bookChartSetup,
	(req, res, next) => {
		return res.send({
			data: res.dates,
		});
	}
);

router.get(
	"/breakdown/accounts",
	dashboardController.configDateSettings,
	dashboardController.getUsersInDateRangeCount,
	dashboardController.accountChartSetup,
	(req, res, next) => {
		return res.send({
			data: res.dates,
		});
	}
);


module.exports = router;