const Basket = require("../models/basket");
const mongoose = require("mongoose");
const mongooseHelpers = require("../config/mongooseHelpers")


exports.updateBasket = async (req, res, next) => {
    const {items} = req.body;
    const userId = req.session.passport.user;
    const total = Object.values(items).map(x => parseFloat(x.basketData.subtotal));
   
    const qty = Object.values(items).map(x => parseInt(x.basketData.qty));
    const basketItemIds = Object.keys(items).map(x => x)

    console.log(req.body)

    await mongooseHelpers.updateBasketItemQuantity(userId, basketItemIds, qty).then(result => {
        console.log(result)
    })

    return res.render("checkout");

};

