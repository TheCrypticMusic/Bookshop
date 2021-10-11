const Book = require("../models/books");
const User = require("../models/user");
const Basket = require("../models/basket");
const Wishlist = require("../models/wishlist");
const Postage = require("../models/postageCosts");
const Order = require("../models/completedOrders");
const mongoose = require("mongoose");

const bcrypt = require("bcryptjs");

/**
 *
 * @param {String} userId
 * @returns JSON
 */
exports.getUserBasket = async (userId) => {
    return await Basket.findOne({ userId: userId }).lean().exec();
};

/**
 *
 * @returns JSON
 */
exports.getAllBooks = async () => {
    return await Book.find().lean().exec();
};

/**
 *
 * @param {String} bookId
 * @param {String} skuId
 * @returns JSON
 */
exports.getSingleBookBySku = (bookId, skuId) => {
    const book = Book.findOne(
        { _id: bookId },
        { skus: { $elemMatch: { _id: skuId } } }
    )
        .select("title author imagePath _id genre")
        .lean()
        .exec();
    return book;
};

/**
 *
 * @param {String} bookId
 * @returns JSON
 */
exports.getSingleBook = (bookId) => {
    const book = Book.findOne({ _id: bookId }).lean().exec();
    return book;
};

/**
 *
 * @param {String} userId
 * @returns JSON
 */
exports.getUserWishlist = async (userId) => {
    const userWishlist = await Wishlist.findOne({ userId: userId })
        .select("wishlist")
        .lean()
        .exec();

    const wishlistBookIds = userWishlist.wishlist.map((x) => x.bookId);

    const bookInfo = await Book.find({ _id: { $in: wishlistBookIds } })
        .lean()
        .exec();

    return bookInfo;
};

/**
 *
 * @param {String} userId
 * @returns JSON
 */
exports.getOrders = async (userId) => {
    try {
        const completedOrders = await Order.findOne({ userId: userId })
            .lean()
            .exec();
        // console.log(completedOrders)
        return completedOrders;
    } catch (err) {
        console.log(err);
        return err;
    }
};

/**
 *
 * @param {String} userId
 * @returns JSON
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
 * @returns JSON
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
 * @returns JSON
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
 * @param {String} bookSkuId
 *
 */
exports.deleteBookFromBasket = async (userId, bookSkuId) => {
    try {
        return await Basket.updateOne({
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
 */
exports.updateBasketSubtotal = async (userId) => {
    try {
        await Basket.findOne({ userId })
            .exec()
            .then((result) => {
                result.updateSubTotalPrice();
            });
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
exports.updateBasketItemQuantityAndTotal = async (
    userId,
    basketItemIds,
    quantity
) => {
    try {
        await basketItemIds.map(async (id, index) => {
            Basket.updateOne(
                { userId: userId },
                { $set: { "items.$[elem].quantity": quantity[index] } },
                { arrayFilters: [{ "elem._id": id }] }
            )
                .exec()
                .then(async () => {
                    const userBasket = await Basket.findOne({ userId: userId }).exec();

                    userBasket.items.map((x) => {
                        x.total = x.price * x.quantity;
                    });

                    await userBasket.save().then((result) => {
                        userBasket.updateSubTotalPrice();
                        return result;
                    });
                });
        });
    } catch (err) {
        console.log(err);
        return err;
    }
};

/**
 *
 * @param {String} userId
 * @param {String} newUsername
 * @returns Boolean
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
 * @returns Boolean
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
 * @returns Boolean
 */
exports.updatePassword = async (
    userId,
    oldPassword,
    newPassword,
    newPasswordConfirm
) => {
    if (newPassword != newPasswordConfirm) {
        return false;
    }
    return true;

    // const userInDatabase = await User.findOne({userId: userId}).exec()
};

/**
 *
 * @param {String} userId
 * @param {Array} basketItemBookSkuIds
 * @returns Array
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
