const Book = require("../models/books");
const User = require("../models/user");
const Basket = require("../models/basket");
const Wishlist = require("../models/wishlist");
const Postage = require("../models/postageCosts");
const Order = require("../models/completedOrders");
const mongoose = require("mongoose");


/**
 *
 * @param {String} userId
 * @returns {JSON}
 */
exports.getUserBasket = async (userId) => {

    return await Basket.findOne({ userId: userId }).lean().exec();

};

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
            { skus: { $elemMatch: { _id: skuId } } },
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
        const allSkus = await Book.findOne(
            { _id: bookId },
            "skus"
        )
        return allSkus
    } catch (error) {
        return error
    }

}

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

        const bookInfo = await Book.find({ _id: { $in: wishlistBookIds } })
            .lean()
            .exec();
        return bookInfo;
    } else {
        return {}
    }

};

/**
 *
 * @param {String} userId
 * @returns {JSON}
 */
exports.getUserOrders = async (userId) => {

    try {
        const completedOrders = await Order.findOne({ userId: userId })
            .lean()
            .exec();
        return completedOrders;
    } catch (err) {
        console.log(err);
        return err;
    }

};

/**
 *
 * @param {String} userId
 * @returns {JSON}
 */
exports.getUser = async (userId) => {

    try {
        return await User.findById({ _id: userId }).lean().exec();
    } catch (err) {
        console.log(err);
        return err;
    }

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
 *
 * @returns {JSON}
 */
exports.getPostagePrices = () => {

    const postagePrices = Postage.findOne()
        .lean()
        .map((x) => x.postageTypes);
    return postagePrices;

};

/**
 *
 * @param {String} userId
 * @param {Array} basketItemBookSkuIds
 * @returns {Array}
 */
exports.getFilteredBasketWithBookSkuIds = async (
    userId,
    basketItemBookSkuIds
) => {

    const objectIdBasketItemIds = basketItemBookSkuIds.map((item) =>
        mongoose.Types.ObjectId(item)
    );
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
exports.deleteBookFromBasket = async (userId, bookSkuId) => {

    try {
        await Basket.updateOne({
            userId: userId,
            $pull: { items: { _id: bookSkuId } },
        }).exec();
    } catch (err) {
        console.log(err);
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
        console.log(err);
        return err;
    }

};

/**
 * 
 * @param {String} userId 
 * @param {String} bookId 
 * 
 */
exports.updateWishListWithBook = async (userId, bookId) => {

    try {
        const bookExistsInWishlist = await Wishlist.exists({ userId: userId, "wishlist.bookId": bookId })
        if (bookExistsInWishlist) {
            await Wishlist.updateOne({ userId: userId }, { $pull: { "wishlist": { bookId: bookId } } })
        } else {
            const updateData = {
                wishlist: {
                    bookId: bookId
                }
            }
            await Wishlist.updateOne(
                { userId: userId },
                { $addToSet: updateData },
                { upsert: true }
            ).exec();
        }
    } catch (err) {
        console.log(err)
        return err
    }

}

/**
 *
 * @param {String} userId
 * @param {String} bookSkuId
 * @param {String} bookImage
 * @param {String} bookType
 * @param {String} bookTitle
 * @param {String} bookAuthor
 * @param {Number} quantity
 * @param {Number} price
 *
 */
exports.updateBasketWithBook = async (
    userId,
    bookSkuId,
    bookImage,
    bookType,
    bookTitle,
    bookAuthor,
    quantity,
    price
) => {

    try {
        const bookExistsInBasket = await Basket.exists({
            userId: userId,
            "items.bookSkuId": bookSkuId,
        });
        if (bookExistsInBasket) {
            await Basket.updateOne(
                { userId: userId, "items.bookSkuId": bookSkuId },
                { $inc: { "items.$.quantity": quantity } }
            ).exec();
        } else {
            const updateData = {
                items: {
                    bookSkuId: bookSkuId,
                    bookImage: bookImage,
                    bookType: bookType,
                    bookTitle: bookTitle,
                    bookAuthor: bookAuthor,
                    quantity: quantity,
                    price: price,
                    total: quantity * price,
                },
            };
            await Basket.updateOne(
                { userId: userId },
                { $addToSet: updateData },
                { upsert: true }
            ).exec();
        }
    } catch (err) {
        return err;
    }

};

/**
 *
 * @param {String} userId
 * @param {String} newUsername
 * @returns {Boolean}
 */
exports.updateUsername = async (userId, newUsername) => {

    const userInDatabase = await User.findOne({ username: newUsername }).exec();
    if (!userInDatabase) {
        await User.findOne({ _id: userId })
            .exec()
            .then((result) => {
                result.username = newUsername;
                result.save();
            });
        return true;
    }
    return false;

};

/**
 *
 * @param {String} userId
 * @param {String} newEmail
 * @returns {Boolean}
 */
exports.updateEmail = async (userId, newEmail, password) => {

    const userInDatabase = await User.findOne({ email: newEmail }).exec();
    if (!userInDatabase) {
        await User.findOne({ _id: userId })
            .exec()
            .then(async (result) => {
                await result.comparePassword(password, (err, isMatch) => {
                    if (err) {
                        return err;
                    }
                    result.email = newEmail;
                    result.save();
                    return isMatch;
                });
            });
        return true;
    }
    return false;

};

/**
 *
 * @param {String} userId
 * @param {String} oldPassword
 * @param {String} newPassword
 * @param {String} newPasswordConfirm
 * @returns {Boolean}
 */
exports.updatePassword = async (userId, newPassword, newPasswordConfirm) => {

    if (newPassword != newPasswordConfirm) {
        return false;
    }
    //  using mongoose.pre hook here to hash the password when I edit the password field and I call save
    await User.findOne({ _id: userId })
        .exec()
        .then(async (userInDatabase) => {
            userInDatabase.password = newPassword;
            userInDatabase.save();
        });
    return true;

};


exports.createUserBasket = async (userId) => {

    const userHasBasket = await Basket.findOne({ userId: userId }).exec()
    if (userHasBasket) {
        return true
    } else {
        await Basket.create({ userId: userId, items: [] })
        return false
    }

}

exports.deleteUserBasket = async (userId) => {

    const basketDeletedResult = await Basket.deleteOne({ userId: userId }).exec()
    if (basketDeletedResult.deletedCount > 0) {
        return true
    } else {
        return false
    }

}

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

    const updatedBookResult = await Book.updateOne({ "_id": bookId }, updateData).exec()
    return updatedBookResult

}

exports.deleteAllSkusFromBook = async (bookId) => {

    const deletedBookSkus = await Book.updateOne({
        "_id": bookId
    }, { $set: { "skus": [] } }).exec()
    return deletedBookSkus

}

exports.deleteBookSku = async (bookId, skuId) => {

    const deletedBookSku = await Book.updateOne({
        "_id": bookId
    }, {
        $pull: { "skus": { _id: skuId } },
    }).exec();
    return deletedBookSku

}

exports.createSkuForBook = async (bookId, category, stockLevel, price, type) => {

    const numberOfBooks = await Book.countDocuments({ "_id": bookId })
    const numberOfTypes = await Book.countDocuments({ "_id": bookId, "skus.type": type })

    if (numberOfBooks > 0 && numberOfTypes == 0) {
        const createdSku = await Book.updateOne({ "_id": bookId }, { $addToSet: { "skus": { category: category, quantity: stockLevel, price: price, type: type } } }).exec()
        return createdSku
    } else {
        return false
    }

}

exports.updateSkuForBook = async (bookId, skuId, updateDocument) => {

    const skuUpdate = await Book.updateOne({ "_id": bookId, "skus._id": skuId }, { $set: updateDocument }).exec()
    return skuUpdate

}


exports.createBook = async (imagePath, title, author, genre) => {

    const numberOfBooks = await Book.countDocuments({ title: title, author: author })

    if (numberOfBooks > 0) {
        return false
    } else {
        const createdBook = await Book.create({ title: title, imagePath: imagePath, author: author, genre: genre, skus: [] })
        return createdBook
    }

}

exports.deleteBook = async (bookId) => {

    const deletedBookResult = await Book.deleteOne({ "_id": bookId }).exec()

    return deletedBookResult

}


exports.getPostageTypes = async () => {

    try {
        const postages = await Postage.find().lean().exec()
        return postages
    } catch (error) {
        return error
    }

}

exports.createPostageType = async (postageName, price) => {

    try {
        const postageCount = await Postage.countDocuments({ "postageTypes.postageName": postageName })

        if (postageCount > 0) {
            return false
        } else {
            const newPostage = await Postage.updateOne({ $addToSet: { "postageTypes": { "postageName": postageName, "postageCost": price } } })
            return newPostage
        }
    } catch (error) {
        return error
    }

}

exports.updatePostageType = async (postageTypeId, updateData) => {

    try {
        const updatedPostage = await Postage.updateOne({ "postageTypes._id": postageTypeId }, { $set: updateData }).exec()
        return updatedPostage

    } catch (error) {
        return error
    }

}

exports.deletePostageType = async (postageTypeId) => {

    try {

        const deletedPostage = await Postage.updateOne({}, { $pull: { "postageTypes": { "_id": postageTypeId } }}).exec()
        console.log(deletedPostage)
        return deletedPostage

    } catch (error) {
        return error
    }
}


