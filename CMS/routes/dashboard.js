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
			dateRangeUsers: res.dateRangeUsers,
			totalUserCount: res.totalUserCount,
			numberOfOrders: res.numberOfOrders,
			totalNumberOfOrders: res.totalNumberOfOrders,
			totalNumberOfBooks: res.totalNumberOfBooks,
			numberOfBooks: res.numberOfBooks
		});
	}
);

// router.post("/", dashboardController.getTotalAccounts)

module.exports = router;
