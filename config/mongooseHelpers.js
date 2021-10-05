const Book = require("../models/books");
const User = require("../models/user");
const Basket = require("../models/basket");
const Wishlist = require("../models/wishlist");
const Postage = require("../models/postageCosts");
const Order = require("../models/completedOrders");

exports.getUserBasket = (userId) => {
    const userBasket = Basket.findOne({ userId: userId }, (err, result) => {
        if (err) {
            return err;
        }
        return result;
    });
    return userBasket.lean();
};

exports.getAllBooks = () => {
    const allBooks = Book.find((err, result) => {
        if (err) {
            console.log("Error retrieving books:" + err);
            return err;
        }
        return result;
    });
    return allBooks.lean();
};

exports.getSingleBookBySku = (bookId, skuId) => {
    const book = Book.findOne({_id: bookId}, {"skus": {"$elemMatch": {"_id": skuId}}}).select("title author imagePath _id").lean().exec()
    return book

}

exports.getUserWishlist = async (userId) => {
    const userWishlist = await Wishlist.findOne({userId: userId}).select("wishlist").lean().exec()
    
    const wishlistBookIds = userWishlist.wishlist.map(x => x.bookId)
    
    const bookInfo = await Book.find({_id: {"$in": wishlistBookIds}}).lean().exec()

    return bookInfo


}

exports.getOrders = (userId) => {
    const completedOrders = Order.findOne(
        { userId: userId },
        (err, userOrders) => {
            if (err) {
                console.log("Error getting orders:", err);
                return err;
            }
            return userOrders;
        }
    );
    return completedOrders.lean();
};

exports.getUser = (userId) => {
    const userDetails = User.findById(userId, (err, result) => {
        if (err) {
            return err;
        }
        return result;
    });
    return userDetails.lean();
};

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

exports.getPostagePrices = () => {
    const postagePrices = Postage.findOne()
        .lean()
        .map((x) => x.postageTypes);
    return postagePrices
}
