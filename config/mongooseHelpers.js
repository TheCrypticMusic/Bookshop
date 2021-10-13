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
 * @returns {JSON}
 */
exports.getAllBooks = async () => {
    return await Book.find().lean().exec();
};

/**
 *
 * @param {String} bookId
 * @param {String} skuId
 * @returns {JSON}
 */
exports.getSingleBookBySku = async (bookId, skuId) => {
    try {
        const singleBook = await Book.findOne(
            { _id: bookId },
            { skus: { $elemMatch: { _id: skuId } } }
        )
            .select("title author imagePath _id genre")
            .lean()
            .exec();
        return singleBook;
    } catch (err) {
        return err;
    }
};

/**
 *
 * @param {String} bookId
 * @returns {JSON}
 */
exports.getSingleBook = (bookId) => {
    const book = Book.findOne({ _id: bookId }).lean().exec();
    return book;
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
