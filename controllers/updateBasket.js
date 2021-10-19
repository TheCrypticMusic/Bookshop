const Basket = require("../models/basket");
const mongoose = require("mongoose");
const mongooseHelpers = require("../config/mongooseHelpers")


exports.updateBasket = async (req, res, next) => {
    const { items } = req.body;
    const userId = req.session.passport.user;

    const qty = Object.values(items).map(x => parseInt(x.basketData.qty));
    const basketItemIds = Object.keys(items).map(x => x)

    await mongooseHelpers.updateBasketItemQuantity(userId, basketItemIds, qty).then(() => {
        return res.render("checkout");
    })
};

