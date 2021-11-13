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

exports.addressExists = async (req, res, next) => {

	const userId = req.params.userid
	mongooseHelpers.getUserAddress(userId).then((result) => {
		if (req.method === "POST") {
			if (result["address"] !== undefined && result["shippingAddress"] !== undefined) {
				this.sendStatus(409, "error", null, "Cannot create anymore addresses for this user", req, res)
			}
		}
		next()
	})

}


exports.bookExists = (req, res, next) => {
	

	
	if (req.body.bookId === undefined) {

		res.bookid = req.params.bookid
	} else {
		res.bookid = req.body.bookId
	}

	mongooseHelpers.getSingleBook(res.bookid).then((book) => {
		if (book === null) {
			this.sendStatus(404, "error", null, "Incorrect book id provided", req, res)
		}
		else {
			next()
		}
	})
};

exports.skuExists = (req, res, next) => {
	const bookSkuId = req.method === "POST" ? req.body.bookSkuId : req.params.bookSkuId
	const bookId = req.method === "POST" ? req.body.bookId : req.params.bookId



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

/**
 * 
 * @param {Array} query 
 * @returns 
 */
exports.createCamelCaseDatabaseEnquiry = (query) => {

	const camelCaseWord = []

	for (const index in query) {

		const newWord = query[index].replace(/\-[a-z]/g, (word) => {

			return word.toUpperCase()
		})


		camelCaseWord.push(newWord.split("-").join(""))
	}

	return camelCaseWord

}


/**
 * 
 * @param {Array} fieldsRequired 
 * @returns 
 */
exports.validQueryChecker = (fieldsRequired) => {
	return (req, res, next) => {

		const queryFields = Object.keys(req.query)
		const numberOfQueryPresent = queryFields.length
		const numberOfRequiredFieldsPresent = fieldsRequired.length

		const checker = (arr1, arr2) => arr2.every(elem => arr1.includes(elem))

		if (numberOfRequiredFieldsPresent != numberOfQueryPresent) {
			this.sendStatus(400, "error", null, `Invalid number of query fields sent. Expected amount: ${numberOfRequiredFieldsPresent}`, req, res)
		} else if (!(checker(fieldsRequired, queryFields))) {
			this.sendStatus(400, "error", null, `Invalid query fields sent. Expected fields: ${fieldsRequired} Data sent: ${queryFields}`, req, res)
		} else {
			next()
		}
	}
}

exports.userExists = (req, res, next) => {

	const userId = req.params.userid

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


exports.filterBuilderForFind = (subDocumentName, filterAction) => {
	return (req, res, next) => {
		res.filter = {}
		if (subDocumentName !== undefined) {

			const filterBuliderObject = {}
			Object.keys(req.query).map(keyNames => {
				if (req.query[keyNames] === "true") {
					const newField = subDocumentName + "." + keyNames

					delete req.query[keyNames]

					filterBuliderObject[newField] = req.query

					if (keyNames === "created") {
						const data = this.filterQueryDate(req.query, filterBuliderObject)
						res.filter = data

					}
				}
			})
		} else {
			Object.keys(req.query).map(keyNames => {
				if (req.query[keyNames] === "true") {
					const newField = keyNames
					delete req.query[keyNames]
					const data = this.filterQueryDate(req.query, { [newField]: req.query })
					res.filter = data
				}
			})
		}
		next()
	}
}


exports.filterQueryDate = (reqQuery, obj) => {


	const filterTerm = Object.keys(obj)[0]
	for (const key in reqQuery) {
		if (key === "from") {
			obj[filterTerm]["$gte"] = new Date(reqQuery[key]).setHours(0, 0, 0, 0)
			delete obj[filterTerm][key]
		} else {
			obj[filterTerm]["$lte"] = new Date(reqQuery[key]).setHours(23, 59, 59)
			delete obj[filterTerm][key]
		}
	}


	return obj

}