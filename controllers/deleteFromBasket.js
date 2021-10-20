const Basket = require("../models/basket");
const router = require("../routes/pages");
const Book = require("../models/books");
const mongooseHelpers = require("../config/mongooseHelpers")


exports.deleteItemFromBasket = async (req, res, next) => {

    const bookSkuId = req.params.id
    const userId = req.session.passport.user;

    mongooseHelpers.deleteItemFromBasket(userId, bookSkuId).then(() => {
        res.redirect("/basket")
    })

};
