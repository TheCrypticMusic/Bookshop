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

    mongooseHelpers.getUserBasket(userId).then((result) => {
        if (!(result)) {
            return mongooseHelpers.createUserBasket(userId)
        }
    })

    mongooseHelpers.addBookToBasket(userId, bookId, bookSkuId, quantity).then(() => {
        res.redirect("/");
    })

};
