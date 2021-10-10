const Basket = require("../models/basket");
const mongoose = require("mongoose");
const mongooseHelpers = require("../config/mongooseHelpers")


exports.updateBasket = async (req, res, next) => {
    const {items} = req.body;
    const userId = req.session.passport.user;
    const total = Object.values(items).map(x => parseFloat(x.basketData.subtotal));
   
    const qty = Object.values(items).map(x => parseInt(x.basketData.qty));
    const basketItemIds = Object.keys(items).map(x => x)

    mongooseHelpers.updateBasketItemQuantityAndTotal(userId, basketItemIds, qty)
 
    
    // mongooseHelpers.updateBasketItemTotal(userId, basketItemIds)
 
    





    // await mongooseHelpers.updateBasketSubtotal(userId)
 
   
    // await Promise.all(basketItemId.map((elem, index) => {

    //     Basket.updateOne({userId: userId, "items._id": elem}, {
    //         $set: {
    //             "items.$.quantity": qty[index],
    //             "items.$.total": total[index]
    //         }
    //     }, (err) => {
    //         if (err) {
    //             console.log(err);
    //         }
    //     }).then(() => {
    //         Basket.findOne({userId: userId}, (err, userBasket) => {
    //                 userBasket.subTotal = mongooseHelpers.updateBasketSubtotal();
    //                 userBasket.save();
    //             }
    //         );
    //     });
    // }));


    return res.render("basket");

};

