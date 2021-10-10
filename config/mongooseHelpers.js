const Book = require("../models/books");
const User = require("../models/user");
const Basket = require("../models/basket");
const Wishlist = require("../models/wishlist");
const Postage = require("../models/postageCosts");
const Order = require("../models/completedOrders");
const mongoose = require("mongoose")


exports.getUserBasket = (userId) => {
    const userBasket =  Basket.findOne({ userId: userId }, (err, result) => {
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
    const book = Book.findOne({_id: bookId}, {"skus": {"$elemMatch": {"_id": skuId}}}).select("title author imagePath _id genre").lean().exec()
    return book

}


exports.getSingleBook = (bookId) => {
    const book = Book.findOne({_id: bookId}).lean().exec()
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

exports.deleteBookFromBasket = async (userId, bookSkuId) => {
    
    const userBasket = await Basket.updateOne({userId: userId, "$pull": {"items": {"_id": bookSkuId}}}).exec()
    return userBasket

}

exports.updateBasketSubtotal = async (userId) => {
    const userBasket = await Basket.findOne({userId}).exec()
    await userBasket.updateSubTotalPrice()
    return userBasket
}

exports.updateBasketItemQuantityAndTotal = async (userId, basketItemIds, quantity) => {

    const basketUpdate = await basketItemIds.map( async (id, index) => {
      Basket.updateMany({userId: userId}, { $set: {"items.$[elem].quantity": quantity[index]}}, { arrayFilters: [{ "elem._id": id}]}).exec().then( async () => {
        const userBasket = await Basket.findOne({userId: userId}).exec()
  
        userBasket.items.map((x) => {
          x.total = x.price * x.quantity
        })

        await userBasket.save().then(result => {
          userBasket.updateSubTotalPrice()
          return result
          })
        })
    })

      return basketUpdate
}

exports.filterBasketByBasketItemId = async (userId, basketItemIds) => {
    
    const objectIdBasketItemIds = basketItemIds.map(item => mongoose.Types.ObjectId(item))
    const objectIdUserId = mongoose.Types.ObjectId(userId)

    Basket.aggregate([
        {
          '$match': {
            'userId': objectIdUserId
          }
        }, {
          '$unwind': {
            'path': '$items'
          }
        }, {
          '$match': {
            'items._id': {
              '$in': 
                objectIdBasketItemIds
            }
          }
        }, {
            '$project': {
              'subTotal': 0, 
              'userId': 0, 
              '_id': 0
            }
          }
      ]).exec()
}
