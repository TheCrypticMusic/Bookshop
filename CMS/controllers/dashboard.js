const fetch = require("node-fetch");
const cmsHelpers = require("../../config/cmsHelpers");

exports.configDateSettings = (req, res, next) => {
    if (Object.keys(req.query).length === 0) {
        req.query.created = 0;
    }

    const fromDate = cmsHelpers.todaysDateMinusDays(req.query.created);
    const toDate = cmsHelpers.todaysDateMinusDays(0);

    res.fromDate = fromDate;
    res.toDate = toDate;

    next();
};

exports.getOrdersInDateRangeCount = (req, res, next) => {
    console.log("getOrdersInDateRangeCount")
    fetch(`http://localhost:5003/api/orders/?created=true&from=${res.fromDate}&to=${res.toDate}`)
        .then((res) => res.json())
        .then((text) => {
            var numberOfOrders = 0;
            if (text.data === null) {
                numberOfOrders = 0
            } else {
                text.data.orders.map((x) => {
                    numberOfOrders += x.basketIds.length;
                });
            }


            res.numberOfOrders = numberOfOrders;
            next();
        });
};

exports.getTotalOrdersCount = (req, res, next) => {
    console.log("getTotalOrdersCount")
    fetch(`http://localhost:5003/api/orders/`)
        .then((res) => res.json())
        .then((text) => {
            var totalNumberOfOrders = 0;
            text.data.orders.map((x) => {
                totalNumberOfOrders += x.basketIds.length;
            });

            res.totalNumberOfOrders = totalNumberOfOrders;
            next();
        });
};

exports.getUsersInDateRangeCount = (req, res, next) => {
    console.log("getUsersInDateRangeCount")
    fetch(`http://localhost:5003/api/users/?created=true&from=${res.fromDate}&to=${res.toDate}`)
        .then((res) => res.json())
        .then((text) => {
            res.dateRangeUsers = text.data.length;
            next();
        });
};

exports.getTotalUsersCount = (req, res, next) => {
    console.log("getTotalUsersCount")
    fetch("http://localhost:5003/api/users")
        .then((res) => res.json())
        .then((text) => {
            res.totalUserCount = text.data.length;
            next();
        });
};

exports.getTotalNumberOfBooksSoldCount = (req, res, next) => {
    console.log("getTotalNumberOfBooksSoldCount")
    fetch(`http://localhost:5003/api/orders/`)
        .then((res) => res.json())
        .then((text) => {
            var totalNumberOfBooks = 0;
            text.data.orders.map((x, index) => {
                return x.basketIds.map((x) => {
                    totalNumberOfBooks += x.items.length;
                });
            });

            res.totalNumberOfBooks = totalNumberOfBooks;
            next();
        });
};

exports.getBooksInDateRangeCount = (req, res, next) => {
    console.log("getBooksInDateRangeCount")
    fetch(`http://localhost:5003/api/orders/?created=true&from=${res.fromDate}&to=${res.toDate}`)
        .then((res) => res.json())
        .then((text) => {
            var numberOfBooks = 0;
            if (text.data === null) {
                numberOfBooks = 0
            } else {
                text.data.orders.map((x, index) => {
                    return x.basketIds.map((x) => {
                        numberOfBooks += x.items.length;
                    });
                });

            }

            res.numberOfBooks = numberOfBooks;
            next();
        });
};
