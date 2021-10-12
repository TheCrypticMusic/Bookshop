const Basket = require("../models/basket");
const router = require("../routes/pages");
const Book = require("../models/books");
const mongoose = require("mongoose")
const mongooseHelpers = require("../config/mongooseHelpers")

exports.addItemToBasket = async (req, res, next) => {
    // Grab userId from passport session

    const userId = req.session.passport.user;

    // When form is posted the book id is added to the url
    // We can grab the bookId and query the MONGODB with this param
    const bookId = req.params.id;

    const { bookSkuId, quantity } = req.body
    try {
        mongooseHelpers.getSingleBookBySku(bookId, bookSkuId).then(singleBook => {
            const { imagePath, title, author } = singleBook
            const [bookPrice, bookType] = [singleBook.skus[0].price, singleBook.skus[0].type]
          
            mongooseHelpers.updateBasketWithBook(userId, bookSkuId, imagePath, bookType, title, author, quantity, bookPrice)
        })
    } catch (err) {
        console.log(err);
    }


    res.redirect("/")

    //     try {
    //         const userBasket = await Basket.findOne({userId: userId})
    //         if (userBasket) {
    //             console.log("Hello")
    //             userBasket.add(bookSkuId, bookType, imagePath, title, author, quantity, bookPrice);
    //         } else {
    //             console.log("Initialising New Basket");
    //             await Basket.create({
    //                 userId: userId,
    //                 subTotal: bookPrice,
    //                 items: [
    //                     {
    //                         bookImage: imagePath,
    //                         bookSkuId: bookSkuId,
    //                         bookType: bookType,
    //                         bookTitle: title,
    //                         bookAuthor: author,
    //                         quantity: quantity,
    //                         price: bookPrice,
    //                         total: bookPrice * quantity,
    //                     },
    //                 ],
    //             });
    //         }
    //     } catch (err) {
    //         console.log(err);
    //     }
    // })
    // res.redirect("/");
};
