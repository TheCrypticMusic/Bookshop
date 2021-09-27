const Basket = require("../models/basket");
const mongoose = require("mongoose");


exports.update = async (req, res, next) => {
    const {items} = req.body;

    const userId = req.session.passport.user;
    const total = Object.values(items).map(x => parseFloat(x.basketData.subtotal));

    const qty = Object.values(items).map(x => parseInt(x.basketData.qty));

    const basketItemId = Object.keys(items);
    await Promise.all(basketItemId.map((elem, index) => {

        Basket.updateOne({userId: userId, "items._id": elem}, {
            $set: {
                "items.$.quantity": qty[index],
                "items.$.total": total[index]
            }
        }, (err) => {
            if (err) {
                console.log(err);
            }
        }).then(() => {
            Basket.findOne({userId: userId}, (err, userBasket) => {
                    userBasket.subTotal = userBasket.subTotalPrice();
                    userBasket.save();
                }
            );
        });
    }));


    return res.render("checkout");

};

