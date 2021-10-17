const Basket = require("../models/basket");
const router = require("../routes/pages");
const Book = require("../models/books");
const mongoose = require("mongoose");
const mongooseHelpers = require("../config/mongooseHelpers");

exports.addItemToBasket = async (req, res, next) => {
    // Grab userId from passport session
    const userId = req.session.passport.user;

    // When form is posted the book id is added to the url
    // We can grab the bookId and query the MONGODB with this param
    const bookId = req.params.id;

    const { bookSkuId, quantity } = req.body;
    try {
        // const userBasket = mongooseHelpers.getUserBasket(userId)
        const selectFilter = ["title", "author", "imagePath", "genre", "price"]
        mongooseHelpers.getSingleSkuOfBook(bookId, bookSkuId, selectFilter).then((singleBook) => {
            console.log(singleBook)
            const { imagePath, title, author } = singleBook;
            const [bookPrice, bookType] = [
                singleBook.skus[0].price,
                singleBook.skus[0].type,
            ];
            mongooseHelpers.updateBasketWithBook(
                userId,
                bookSkuId,
                imagePath,
                bookType,
                title,
                author,
                quantity,
                bookPrice
            );
        });
    } catch (err) {
        return err;
    }

    res.redirect("/");
};
