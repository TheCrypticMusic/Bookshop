const Book = require("../models/books");
const User = require("../models/user");
const Basket = require("../models/basket");
const Wishlist = require("../models/wishlist");
const Postage = require("../models/postageCosts");
const Order = require("../models/completedOrders");
const mongoose = require("mongoose");
const { exists } = require("../models/user");

// ***** BASKET HELPERS ***** //

exports.createUserBasket = async (userId) => {

	const userBasketExists = await Basket.exists({ "userId": userId });

	if (!userBasketExists) {
		await Basket.create({ userId: userId, items: [] });
		return true;
	}
	return false;
};

exports.deleteUserBasket = async (userId) => {
	const basketDeletedResult = await Basket.deleteOne({ userId: userId }).exec();

	if (basketDeletedResult.deletedCount > 0) {
		return true;
	} else {
		return false;
	}
};

/**
 *
 * @param {String} userId
 * @returns {JSON}
 */
exports.getUserBasket = async (userId) => {
	try {
		const basketExists = await Basket.exists({ userId: userId });

		if (basketExists) {
			const userBasket = await Basket.findOne({ userId: userId }).lean().exec();
			return userBasket;
		} else {
			return false;
		}
	} catch (error) {
		return error
	}
};

/**
 *
 * @param {String} userId
 * @param {Array} basketItemBookSkuIds
 * @returns {Array}
 */
exports.getFilteredBasketWithBookSkuIds = async (userId, basketItemBookSkuIds) => {
	const objectIdBasketItemIds = basketItemBookSkuIds.map((item) => mongoose.Types.ObjectId(item));
	const objectIdUserId = mongoose.Types.ObjectId(userId);

	const userBasket = await Basket.aggregate([
		{
			$match: {
				userId: objectIdUserId,
			},
		},
		{
			$unwind: {
				path: "$items",
			},
		},
		{
			$match: {
				"items.bookSkuId": {
					$in: objectIdBasketItemIds,
				},
			},
		},
		{
			$project: {
				subTotal: 0,
				userId: 0,
				_id: 0,
			},
		},
	]).exec();

	return userBasket;
};

/**
 *
 * @param {String} userId
 * @param {String} bookSkuId
 *
 */
exports.deleteItemFromBasket = async (userId, bookSkuId) => {
	try {
		const deletedBook = await Basket.updateOne({
			userId: userId,
			$pull: { items: { bookSkuId: bookSkuId } },
		}).exec();
		return deletedBook;
	} catch (err) {
		return err;
	}
};

/**
 *
 * @param {String} userId
 * @param {Array} basketItemIds
 * @param {Array} quantity
 */
exports.updateBasketItemQuantity = async (userId, basketItemIds, quantity) => {
	try {
		basketItemIds.map(async (id, index) => {
			await Basket.updateOne(
				{ userId: userId },
				{ $set: { "items.$[elem].quantity": quantity[index] } },
				{ arrayFilters: [{ "elem._id": id }] }
			).exec();
		});
	} catch (err) {
		return err;
	}
};

exports.deleteAllItemsFromBasket = async (userId) => {
	try {
		const deletedItems = await Basket.updateOne({ userId: userId }, { $set: { items: [] } });
		return deletedItems;
	} catch (error) {
		return error;
	}
};

/**
 *
 * @param {String} bookId
 * @param {String} bookSkuId
 */
exports.addBookToBasket = async (userId, bookId, bookSkuId, quantity) => {
	try {
		this.getSingleSkuOfBook(bookId, bookSkuId, ["imagePath", "title", "author"]).then(
			(bookSku) => {
				this._formatBookSkuResultForBasket(bookSku).then(async (formattedResult) => {
					formattedResult["quantity"] = quantity;

					const bookExistsInBasket = await Basket.exists({
						userId: userId,
						"items.bookSkuId": formattedResult.bookSkuId,
					});



					if (bookExistsInBasket) {
						const bookAddedToBasket = await Basket.updateOne(
							{ userId: userId, "items.bookSkuId": bookSkuId },
							{ $inc: { "items.$.quantity": quantity } }
						).exec();

						return bookAddedToBasket;
					} else {
						const bookAddedToBasket = await Basket.updateOne(
							{ userId: userId },
							{ $push: { items: formattedResult } }
						).exec();

						return bookAddedToBasket;
					}
				});
			}
		);
	} catch (err) {
		return err;
	}
};

exports.getAllItemsInUserBasket = async (userId) => {
	const itemsInUserBasket = await Basket.findOne({ userId: userId }, "items");
	return itemsInUserBasket;
};

exports.getBasketItem = async (userId, bookSkuId) => {
	const singleItemInBasket = await Basket.findOne(
		{ userId: userId },
		{ items: { $elemMatch: { bookSkuId: bookSkuId } } }
	)
		.lean()
		.exec();
	return singleItemInBasket;
};

exports.updateBasketItem = async (userId, bookSkuId, updateData) => {
	const updatedItem = await Basket.updateOne(
		{ userId: userId, "items.bookSkuId": bookSkuId },
		{ $set: updateData }
	);

	return updatedItem;
};

// ***** BOOK HELPERS ***** //

/**
 *
 * @param {JSON} filter To retrive all books leave empty parameter empty,
 * however, if you want to return a filtered response
 * then pass the required filtering in an JSON object
 *
 * E.g find all books that are from a particular genre:
 * {genre: "Sci-Fi"}
 *
 * E.g find all books that are hardback AND Fiction:
 * {author: "Agatha Christie", genre: "Fiction"}
 *
 * @returns {JSON}
 */
exports.getBooks = async (filter = {}) => {
	return await Book.find(filter).lean().exec();
};

/**
 *
 * @param {String} bookId
 * @param {String} skuId
 * @param {Array} selectFilter
 * @returns {JSON}
 */
exports.getSingleSkuOfBook = async (bookId, skuId, selectFilter) => {
	try {
		const singleSku = await Book.findOne(
			{ _id: bookId },
			{ skus: { $elemMatch: { _id: skuId } } }
		)
			.select(selectFilter)
			.lean()
			.exec();
		return singleSku;
	} catch (err) {
		return err;
	}
};

exports.getAllSkusOfBook = async (bookId, selectFilter) => {
	try {
		const allSkus = await Book.findOne({ _id: bookId }, "skus");
		return allSkus;
	} catch (error) {
		return error;
	}
};

/**
 *
 * @param {String} bookId
 * @returns {JSON}
 */
exports.getSingleBook = async (bookId) => {

	return await Book.findOne({ _id: bookId }).lean().exec();
};

/**
 *
 * @param {String} genreRequired
 * @returns {JSON}
 */
exports.getBookGenre = (genreRequired) => {
	const booksOfGenre = Book.find(
		{
			genre: {
				$regex: new RegExp("^" + genreRequired),
				$options: "i",
			},
		},
		{ skus: { $elemMatch: { type: "Paperback" } } }
	)
		.select("title imagePath author genre")
		.lean()
		.exec();
	return booksOfGenre;
};

/**
 * Update book details - this can be used to update the following fields
 *
 * field: imagePath
 *
 * field: title
 *
 * field: author
 *
 * field: genre
 * @param {string} userId
 */
exports.updateBookDetails = async (bookId, updateData) => {
	const updatedBookResult = await Book.updateOne({ _id: bookId }, updateData).exec();
	return updatedBookResult;
};

exports.deleteAllSkusFromBook = async (bookId) => {
	const deletedBookSkus = await Book.updateOne(
		{
			_id: bookId,
		},
		{ $set: { skus: [] } }
	).exec();
	return deletedBookSkus;
};

exports.deleteBookSku = async (bookId, skuId) => {
	const deletedBookSku = await Book.updateOne(
		{
			_id: bookId,
		},
		{
			$pull: { skus: { _id: skuId } },
		}
	).exec();
	return deletedBookSku;
};

exports.createSkuForBook = async (bookId, sku, category, stockLevel, price, type) => {
	const numberOfBooks = await Book.countDocuments({ _id: bookId });
	const numberOfTypes = await Book.countDocuments({
		_id: bookId,
		"skus.type": type,
	});

	if (numberOfBooks > 0 && numberOfTypes == 0) {
		const createdSku = await Book.updateOne(
			{ _id: bookId },
			{
				$addToSet: {
					skus: {
						sku: sku,
						category: category,
						quantity: stockLevel,
						price: price,
						type: type,
					},
				},
			}
		).exec();
		return createdSku;
	} else {
		return false;
	}
};

exports.updateSkuForBook = async (bookId, skuId, updateDocument) => {
	const skuUpdate = await Book.updateOne(
		{ _id: bookId, "skus._id": skuId },
		{ $set: updateDocument }
	).exec();
	return skuUpdate;
};

exports.createBook = async (imagePath, title, author, genre) => {
	const numberOfBooks = await Book.countDocuments({
		title: title,
		author: author,
	});

	if (numberOfBooks > 0) {
		return false;
	} else {
		const createdBook = await Book.create({
			title: title,
			imagePath: imagePath,
			author: author,
			genre: genre,
			skus: [],
		});
		return createdBook;
	}
};

exports.deleteBook = async (bookId) => {
	const deletedBookResult = await Book.deleteOne({ _id: bookId }).exec();

	return deletedBookResult;
};

// ***** WISHLIST HELPERS ***** //

exports.createWishlist = async (userId) => {
	const userWishlistExists = await Wishlist.exists({ userId: userId });

	if (!userWishlistExists) {
		const userWishlist = await Wishlist.create({ userId: userId });
		return true;
	}
	return false;
};

/**
 *
 * @param {String} userId
 * @returns {JSON}
 */
exports.getUserWishlist = async (userId) => {
	const userWishListExists = await Wishlist.findOne({ userId: userId })
		.select("wishlist")
		.lean()
		.exec();

	if (userWishListExists) {
		const wishlistBookIds = userWishListExists.wishlist.map((x) => x.bookId);
		const books = this.getBooks({ _id: wishlistBookIds });
		return books;
	} else {
		return false;
	}
};

exports.getSingleItemInWishlist = async (userId, bookId) => {
	const singleItem = await Wishlist.findOne(
		{ userId: userId },
		{
			wishlist: {
				$elemMatch: { bookId: bookId },
			},
		}
	);
	if (singleItem.wishlist.length === 0) {
		return false;
	}
	return singleItem;
};
exports.deleteWishlistItems = async (userId) => {
	const deletedItems = await Wishlist.updateOne({ userId: userId }, { $set: { wishlist: [] } });
	return deletedItems;
};

/**
 *
 * @param {String} userId
 * @param {String} bookId
 *
 */
exports.addBookToWishlist = async (userId, bookId) => {
	try {
		this.getSingleItemInWishlist(userId, bookId).then(async (result) => {
			if (!result) {
				const addedBook = await Wishlist.updateOne(
					{ userId: userId },
					{ $addToSet: { wishlist: { bookId: bookId } } }
				).exec();
				return addedBook;
			}
		});
		return false;

	} catch (err) {
		return err;
	}
};

exports.deleteSingleItemFromWishlist = async (userId, bookId) => {
	try {
		const deletedItem = await Wishlist.updateOne(
			{ userId: userId },
			{ $pull: { wishlist: { bookId: bookId } } }
		).exec();
		return deletedItem;
	} catch (error) {
		return error;
	}
};

// ***** USER HELPERS ***** //

exports.createUser = async (username, email, password, roleTitle, writeAccess, readAccess) => {
	try {
		new User({
			username: username,
			email: email,
			password: password,
			role: {
				title: roleTitle,
				writeAccess: writeAccess,
				readAccess: readAccess,
			}
		}).save((error, data) => {
			if (error) {
				return error;
			}
			return data;
		});
	} catch (error) {
		return error;
	}
};


exports.getAllUsers = async (filter) => {

	try {

		const allUsers = await User.find(filter).lean().exec()

		return allUsers
	} catch (error) {
		return error
	}
}


/**
 *
 * @param {String} userId
 * @returns {JSON}
 */
exports.getUser = async (userId) => {

	try {
		const userExists = await User.exists({ _id: userId });
		if (userExists) {
			const foundUser = await User.findById({ _id: userId }).lean().exec();
			return foundUser;
		} else {
			return false;
		}
	} catch (err) {

		return err;
	}
};

exports.getNumberOfUsers = async () => {

	try {

		const userCount = await User.countDocuments()
		return userCount

	} catch (error) {
		return err
	}
}

exports.getUsersCreatedToday = async () => {

	try {

		const todayCount = await User.countDocuments({ "createdAt": { $gte: this._getDate() } })

		return todayCount

	} catch (error) {

		return error

	}

}

exports.getUserRoleTitle = async (userId) => {
	try {

		const user = await User.findOne({ _id: userId }).select("role")

		return user.role.title
	} catch (error) {
		return error
	}
}

exports.getUserAddress = async (userId, selectFilter) => {
	try {

		const userAddress = await User.findOne({ _id: userId }).select(selectFilter)
		return userAddress
	} catch (error) {
		return error
	}
}

exports.updateUser = async (userId, updateData) => {
	try {
		const updatedUserResult = await User.updateOne({ _id: userId }, updateData).exec();
		return updatedUserResult;
	} catch (error) {
		return error;
	}
};

exports.createAddressForUser = async (userId, updateData) => {
	try {

		const updateAddressResult = await User.updateOne({ _id: userId }, { $set: updateData }).exec()
		return updateAddressResult

	} catch (error) {
		return error
	}
}

// ***** ORDER HELPERS ***** //

/**
 *
 * @returns {JSON}
 */
exports.getAllOrders = async (filter) => {
	try {

		const allOrders = await Order.find(filter).lean().exec();
		return allOrders;
	} catch (error) {
		return error;
	}
};


exports.getAllOrdersInDateRange = async (to, from) => {
	try {

		const orders = await Order.aggregate([
			{
				'$project': {
					'basketIds': {
						'$filter': {
							'input': '$basketIds',
							'as': 'index',
							'cond': {
								'$and': [
									{
										'$gte': [
											'$$index.created', new Date(new Date(from).setHours(0, 0, 0, 0))
										]
									}, {
										'$lte': [
											'$$index.created', new Date(new Date(to).setHours(23, 59, 59))
										]
									}
								]
							}
						}
					}
				}
			}, {
				'$match': {
					'basketIds': {
						'$ne': []
					}
				}
			}
		]).exec()

		return orders
	} catch (error) {
		return error
	}
}

/**
 *
 * @param {String} userId
 * @returns {JSON}
 */
exports.getUserOrders = async (userId) => {
	try {

		const completedOrders = await Order.findOne({ userId: userId }).lean().exec();
		return completedOrders;
	} catch (err) {
		return err;
	}
};

exports.deleteAllOrders = async (userId) => {
	try {
		const deletedOrders = await Order.updateOne({ userId: userId }, { basketIds: [] }).exec();
		return deletedOrders;
	} catch (error) {
		return error;
	}
};

exports.deleteSingleOrder = async (userId, basketId) => {
	try {
		const deletedOrder = await Order.updateOne(
			{ userId: userId },
			{ $pull: { basketIds: { _id: basketId } } }
		);
		return deletedOrder;
	} catch (error) {
		return error;
	}
};

exports.deleteOrderDocument = async (userId) => {
	try {
		const deletedOrderDocument = await Order.deleteOne({
			userId: userId,
		}).exec();

		return deletedOrderDocument;
	} catch (error) {
		return error;
	}
};

// This is used to create a record in the database of all the orders that the user has completed
// This is not used to create a new order
// Please use createNewOrder instead
exports.createNewOrderDocumentForUser = async (userId) => {
	try {
		const userInDatabaseCount = await Order.countDocuments({ userId: userId });

		if (userInDatabaseCount > 0) {
			return false;
		} else {
			const newOrderDocument = await Order.create({
				userId: userId,
				basketIds: [],
			});
			return newOrderDocument;
		}
	} catch (error) {
		return error;
	}
};

exports.createUserOrder = async (userId) => {
	try {
		const userBasket = await Basket.findOne({ userId: userId }).lean().exec();
		if (userBasket.items.length == 0) {
			return false;
		}

		await Order.updateOne({ userId: userId }, { $push: { basketIds: userBasket } }).then(() => {
			this.deleteUserBasket(userId).then((successfullyDeleted) => {
				if (successfullyDeleted) {
					return successfullyDeleted;
				}
			});
		});
	} catch (error) {
		return error;
	}
};

exports.getSingleOrder = async (userId, basketId) => {
	try {
		const singleOrderExists = await Order.exists({
			userId: userId,
			basketIds: { $elemMatch: { _id: basketId } },
		});

		if (!singleOrderExists) {
			return false;
		}

		const singleOrder = await Order.findOne(
			{ userId: userId },
			{
				basketIds: { $elemMatch: { _id: basketId } },
			}
		)
			.lean()
			.exec();
		return singleOrder;
	} catch (error) {
		return error;
	}
};

exports.updateSingleOrderSubtotal = async (userId, basketId, updateData) => {
	try {
		const convertedUpdateData = this._updateZeroDepthSubdocumentBuilder(
			"basketIds",
			updateData
		);

		const updatedOrder = await Order.updateOne(
			{ userId: userId, "basketIds._id": basketId },
			convertedUpdateData
		).exec();
		return updatedOrder;
	} catch (error) {
		return error;
	}
};

/**
 *
 * @param {String} userId
 * @param {JSON} updateData
 * @returns
 */
exports.updateSingleOrderItemDetails = async (userId, basketId, itemId, updateData) => {
	try {
		const compiledUpdate = this._updateSubdocumentWithDepthBuilder(
			"basketIds.items",
			[basketId, itemId],
			updateData
		);

		const updatedOrderItem = await Order.updateOne(
			{
				userId: userId,
			},
			{
				$set: compiledUpdate[0],
			},
			{
				arrayFilters: compiledUpdate[1],
			}
		).exec();

		return updatedOrderItem;
	} catch (error) {
		return error;
	}
};

// ***** POSTAGE HELPERS ***** //

/**
 *
 * @returns {JSON}
 */
exports.getPostagePrices = () => {
	const postagePrices = Postage.findOne()
		.lean()
		.map((x) => x.postageTypes);
	return postagePrices;
};

exports.getPostageTypes = async () => {
	try {
		const postages = await Postage.find().lean().exec();
		return postages;
	} catch (error) {
		return error;
	}
};

exports.createPostageType = async (postageName, price) => {
	try {
		const postageCount = await Postage.countDocuments({
			"postageTypes.postageName": postageName,
		});

		if (postageCount > 0) {
			return false;
		} else {
			const newPostage = await Postage.updateOne({
				$addToSet: {
					postageTypes: { postageName: postageName, postageCost: price },
				},
			});
			return newPostage;
		}
	} catch (error) {
		return error;
	}
};

exports.getSinglePostageType = async (postageTypeId) => {
	try {
		const postageTypeExists = await Postage.exists({ "postageTypes._id": postageTypeId });

		if (!postageTypeExists) {
			return false;
		}

		const postageType = await Postage.findOne(
			{},
			{ postageTypes: { $elemMatch: { _id: postageTypeId } } }
		)
			.lean()
			.exec();
		return postageType;
	} catch (error) {
		return error;
	}
};

exports.updatePostageType = async (postageTypeId, updateData) => {
	try {
		const updatedPostage = await Postage.updateOne(
			{ "postageTypes._id": postageTypeId },
			{ $set: updateData }
		).exec();
		return updatedPostage;
	} catch (error) {
		return error;
	}
};

exports.deletePostageType = async (postageTypeId) => {
	try {
		const deletedPostage = await Postage.updateOne(
			{},
			{ $pull: { postageTypes: { _id: postageTypeId } } }
		).exec();
		return deletedPostage;
	} catch (error) {
		return error;
	}
};

/**
 * This will build a valid update for subdocuments that have a depth of zero
 *
 *
 * @param {String} subdocumentName
 * @param {String} updateFields
 *
 * @returns JSON
 */
exports._updateZeroDepthSubdocumentBuilder = (subdocumentName, updateFields) => {
	const changeFieldsName = Object.keys(updateFields).map((fieldName) => {
		const newField = subdocumentName + ".$." + fieldName;
		return { [newField]: updateFields[fieldName] };
	});
	const newUpdate = changeFieldsName.reduce((a, b) => Object.assign({}, a, b));

	return newUpdate;
};

/**
 *  Create an update that works with subdocuments that have a depth of more than 1
 *  The order that you provide the arrayFilter matters! It must be in the same order as
 *  the nesting
 *  basketIds._id > items._id
 *
 * @param {String} subdocumentPath
 * @param {Array} arrayFilters
 * @param {JSON} updateFields
 *
 * @returns Array
 */
exports._updateSubdocumentWithDepthBuilder = (subdocumentPath, arrayFilters, updateFields) => {
	if (subdocumentPath.split(".").length < 2) {
		throw "subdocument path can't be less than 2 nested.\nUse updateZeroDepthSubdocumentBuilder instead";
	}

	const arrayReferences = subdocumentPath.split(".");

	const pathBuilder = arrayReferences.map((pathName) => {
		const newPath = pathName + ".$[" + pathName.slice(0, 2) + "].";
		return newPath;
	});

	const compileNewUpdate = Object.keys(updateFields).map((x, index) => {
		const newUpdateFields = pathBuilder.join("") + x;
		return { [newUpdateFields]: updateFields[x] };
	});
	const newSetUpdate = compileNewUpdate.reduce((a, b) => Object.assign({}, a, b));

	const newArrayFilter = arrayFilters.map((id, index) => {
		const keyBuilder = `${arrayReferences[index].slice(0, 2)}._id`;
		return { [keyBuilder]: id };
	});
	return [newSetUpdate, newArrayFilter];
};

exports._formatBookSkuResultForBasket = async (bookResult) => {
	const { imagePath, title, author } = bookResult;
	const skuDetails = bookResult.skus[0];

	const { _id, price, type } = skuDetails;

	const combinedResult = await {
		bookImage: imagePath,
		bookSkuId: _id,
		bookType: type,
		bookTitle: title,
		bookAuthor: author,
		price: price,
	};

	return combinedResult;
};

exports._vaildateEmail = async (email) => {
	const userEmailExists = await User.exists({ email: email });
	return userEmailExists;
};

exports._vaildateUsername = async (username) => {
	const userUsernameExists = await User.exists({ username: username });
	console.log("Username already exists?", userUsernameExists);
	return userUsernameExists;
};

exports._validateUserBasket = async (userId) => {
	const userBasketExists = await Basket.exists({ userId: userId });
	console.log("User has basket?", userBasketExists);
	return userBasket;
};

exports._validatePassword = async (userId, password) => {
	try {
		const user = await User.findOne({ _id: userId }).exec();
		if (user) {
			const passwordResult = user.comparePassword(password, (err, isMatch) => {
				console.log("Password's Match?", isMatch)
				if (err) {
					return err;
				}
				return isMatch;
			});

			return passwordResult;
		}

	} catch (error) {
		console.log("ERROR:", error)
		return error
	}

};


exports._getDate = () => {

	const today = new Date()

	const todayYear = today.getFullYear()
	const todayMonth = today.getMonth() + 1
	const todayDay = today.getDate() < 10 ? "0" + today.getDate() : today.getDate()


	const filterDate = `${todayYear}-${todayMonth}-${todayDay}`
	return filterDate
}


