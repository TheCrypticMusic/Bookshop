const Basket = require("../models/basket");
const router = require("../routes/pages");
const Book = require("../models/books");
const mongoose = require("mongoose")

exports.addItemToBasket = async (req, res, next) => {
    // Grab userId from passport session

    const userId = req.session.passport.user;

    // When form is posted the book id is added to the url
    // We can grab the bookId and query the MONGODB with this param
    const bookId = req.params.id;

    const {bookSkuId} = req.body


    await Book.findOne({"_id": bookId}, {"skus": {"$elemMatch": {"_id": bookSkuId}}}).select("title imagePath author").exec(async (err, book) => {

        if (err) {
            return err;
        }
        // deconstruct the result
        const {imagePath, title, author} = book;
        const bookPrice = book.skus[0].price;
        const bookType = book.skus[0].type

        let quantity = 1;
        try {
            const userBasket = await Basket.findOne({userId: userId})
            if (userBasket) {
                console.log("Hello")
                userBasket.add(bookSkuId, bookType, imagePath, title, author, quantity, bookPrice);
            } else {
                console.log("Initialising New Basket");
                await Basket.create({
                    userId: userId,
                    subTotal: bookPrice,
                    items: [
                        {
                            bookImage: imagePath,
                            bookSkuId: bookSkuId,
                            bookType: bookType,
                            bookTitle: title,
                            bookAuthor: author,
                            quantity: quantity,
                            price: bookPrice,
                            total: bookPrice * quantity,
                        },
                    ],
                });
            }
        } catch (err) {
            console.log(err);
        }
    })
    res.redirect("/");
};
