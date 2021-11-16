
const fetch = require("node-fetch");
const cmsHelpers = require("../../config/cmsHelpers");

exports.configDateSettings = (req, res, next) => {
	res.dates = {};
	if (Object.keys(req.query).length === 0) {
		req.query.created = 0;
	}

	const fromDate = cmsHelpers.todaysDateMinusDays(req.query.created);
	const toDate = cmsHelpers.todaysDateMinusDays(0);

	res.fromDate = fromDate;
	res.toDate = toDate;
	next();
};


/**
 * 
 * @param {array} data 
 */
const getTotalInDateRange = (data, dataName, filter) => {

	if (data === null) {
		return 0;
	}
	const dates = []
	data[dataName].map(x => {
		if (filter === "books") {
			return x.basketIds.map(x => {
				dates.push(x.items.length)
			})
		} else {
			dates.push(x.basketIds.length)
		}
	})

	const dateRangeMapSum = dates.reduce((x, y) => x + y)
	return dateRangeMapSum
}

/**
 * 
 * @param {Array} data 
 * @param {String} dataName 
 * @param {String} filter 
 * @param {String} yearOrMonth 
 * @returns {JSON}
 */
const getBreakdownWithDateRange = (data, yearOrMonth = "year", graphName) => {
	const breakDownData = {};
	if (data === null) {
		return 0;
	}
	if (graphName !== "books") {
		data.map((x) => {
			const date = createUTCDate(x, yearOrMonth)
			if (date in breakDownData) {
				x: breakDownData[date] += 1;
			} else {
				x: breakDownData[date] = 1;
			}
		})
	} else {
		data.map((x) => {
			return x.basketIds.map((x) => {
				const date = createUTCDate(x.created, yearOrMonth)
				if (date in breakDownData) {
					breakDownData[date] += x.items.length
				} else {
					breakDownData[date] = x.items.length
				}
			})
		})
	}
	return breakDownData
}

const getBreakdownWithDateRangeForBooks = (data, yearOrMonth = "year") => {

}

/**
 * 
 * @param {JSON} data 
 * @returns Array
 */
const formatDataForChart = (data) => {
	const dataArr = []
	const dataSize = Object.keys(data).length
	for (let index = 0; index < dataSize; index++) {
		dataArr.push({
			x: new Date(Object.keys(data)[index]),
			y: Object.values(data)[index],
		});
	}
	return dataArr
}

const createUTCDate = (date, monthOrYear) => {

	const dateBuilder = new Date(date)

	const day = monthOrYear === "month" ? dateBuilder.getUTCDate() : 0

	const month = dateBuilder.getUTCMonth()
	const year = dateBuilder.getUTCFullYear()
	const formattedDate = day === 0 ? new Date(year, month) : new Date(year, month, day)

	return formattedDate

}

const getDatesInDateRange = (data, dataName, routeToDate) => {
	const dates = [];

	if (data === null) {
		return 0
	}

	data[dataName].map(x => {
		if (routeToDate !== false) {
			return x[routeToDate].map(x => {
				dates.push(x.created)
			})
		} else {
			dates.push(x.created)
		}
	})

	return dates
}

exports.getOrdersInDateRangeCount = (req, res, next) => {
	fetch(`http://localhost:5003/api/orders/?created=true&from=${res.fromDate}&to=${res.toDate}`)
		.then((res) => res.json())
		.then((text) => {

			const total = getTotalInDateRange(text.data, "orders")
			const dates = getDatesInDateRange(text.data, "orders", "basketIds")


			res.dates["orders"] = dates;
			res.numberOfOrders = total;
			next();
		});
};

exports.getTotalOrdersCount = (req, res, next) => {
	fetch(`http://localhost:5003/api/orders/`)
		.then((res) => res.json())
		.then((text) => {

			const totalNumberOfOrders = getTotalInDateRange(text.data, "orders")

			res.totalNumberOfOrders = totalNumberOfOrders;
			next();
		});
};

exports.getUsersInDateRangeCount = (req, res, next) => {
	fetch(`http://localhost:5003/api/users/?created=true&from=${res.fromDate}&to=${res.toDate}`)
		.then((res) => res.json())
		.then((
			text) => {

			const userDates = getDatesInDateRange(text.data, "users", false)

			res.dateRangeUsers = text.data.users.length;
			res.dates["users"] = userDates
			next();

		});
};

exports.getTotalUsersCount = (req, res, next) => {
	fetch("http://localhost:5003/api/users")
		.then((res) => res.json())
		.then((text) => {
			res.totalUserCount = text.data.users.length;
			next();
		});
};

exports.getTotalNumberOfBooksSoldCount = (req, res, next) => {
	fetch(`http://localhost:5003/api/orders/`)
		.then((res) => res.json())
		.then((text) => {

			const totalNumberOfBooks = getTotalInDateRange(text.data, "orders", "books")
			res.totalNumberOfBooks = totalNumberOfBooks;
			next();
		});
};


exports.getBooksInDateRangeCount = (req, res, next) => {
	fetch(`http://localhost:5003/api/orders/?created=true&from=${res.fromDate}&to=${res.toDate}`)
		.then((res) => res.json())
		.then((text) => {

			const numberOfBooksInDateRange = getTotalInDateRange(text.data, "orders", "books")

			res.numberOfBooks = numberOfBooksInDateRange;

			res.bookData = text.data

			next();
		});
};

exports.orderChartSetup = (req, res, next) => {

	if (req.query.created === "365") {

		const yearlyOrderDataObj = getBreakdownWithDateRange(res.dates["orders"], "year")
		const yearlyOrderDataArr = formatDataForChart(yearlyOrderDataObj)

		res.dates["orders"] = yearlyOrderDataArr;
	} else {
		const monthOrderDataObj = getBreakdownWithDateRange(res.dates["orders"], "month")
		const monthlyOrderDataArr = formatDataForChart(monthOrderDataObj)

		res.dates["orders"] = monthlyOrderDataArr;
	}

	next();
};

exports.bookChartSetup = (req, res, next) => {

	if (res.bookData.orders === null) {
		return 0
	}


	if (req.query.created === "365") {

		const yearlyBookDataObj = getBreakdownWithDateRange(res.bookData.orders, "year", "books")
		const yearlyBookDataArr = formatDataForChart(yearlyBookDataObj)
		res.dates["books"] = yearlyBookDataArr
	} else {

		const monthlyDataObj = getBreakdownWithDateRange(res.bookData.orders, "month", "books")
		const monthlyDataArr = formatDataForChart(monthlyDataObj)
		res.dates["books"] = monthlyDataArr
	}
	next()
};

exports.accountChartSetup = (req, res, next) => {

	if (req.query.created === "365") {
		const yearlyAccountDataObj = getBreakdownWithDateRange(res.dates["users"], "year")
		const yearlyAccountDataArr = formatDataForChart(yearlyAccountDataObj)

		res.dates["users"] = yearlyAccountDataArr;

	} else {

		const monthlyAccountDataObj = getBreakdownWithDateRange(res.dates["users"], "month")
		const monthlyAccountDataArr = formatDataForChart(monthlyAccountDataObj)

		res.dates["users"] = monthlyAccountDataArr;

	}
	next()
}


