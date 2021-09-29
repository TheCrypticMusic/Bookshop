const Basket = require("../models/basket");
const router = require("../routes/pages");
const Book = require("../models/books");

//////////// REWRITE TO USE BASKET ID //////////////
exports.removeItemFromBasket = async (req, res, next) => {
    const skuId = req.params.id;

    const userId = req.session.passport.user;

    await Basket.findOne({userId: userId}, async (err, userBasket) => {
        if (err) {
            console.log("Error:", err);
            return res.status(404);
        }

        const index = userBasket.items.map((x) => x.bookSkuId).indexOf(skuId);
        const totalPriceBook = userBasket.items.map((x) => x.total)[index];
        const newSubtotal = (userBasket.subTotal -= totalPriceBook).toFixed(2);
        await Basket.updateOne(
            {userId},
            {$pull: {items: userBasket.items[index]}},
            (err, result) => {
                if (err) {
                    return err;
                }
                console.log(userBasket.items[index].bookTitle, "successfully removed");
            }
        );
        await Basket.updateOne(
            { userId },
            { $set: { subTotal: newSubtotal } },
            (err, result) => {
                if (err) {
                    return err;
                }
                console.log("Subtotal is now", userBasket.subTotal);
            }
        );
        res.redirect("/basket");
    });
};
