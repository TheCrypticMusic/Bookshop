const express = require("express");
const router = express.Router();

router.use((req, res, next) => {
	console.log(res);
});

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

exports.sendStatus = (statusCode, successOrError, data, message, path, res) => {
	return res.status(statusCode).json({
		status: successOrError,
		code: statusCode,
		message: message,
		data: data,
		path: path,
	});
};

exports.filterBuilder = (filter) => {
	return Object.keys(filter);
};

