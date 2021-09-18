const Basket = require("../models/basket");


exports.update = async (req, res, next) => {
    const { basketId, items, totalValue } = req.body;

    const bookId = Object.keys(items);
 
    Object.values(items).forEach((element, index) => {
        const qty = element.basketData.qty;
        const subtotal = element.basketData.subtotal;

        Basket.updateOne(
            { _id: basketId, "items._id": bookId[index] },
            {
                $set: {
                    "items.$.quantity": qty,
                    "items.$.total": subtotal,
                    subTotal: totalValue,
                },
            },
            (err, result) => {
                if (err) {
                    return err;
                }
                console.log(bookId[index], "now has", qty)
                return result;
            }
        );
    });
    return res.render("checkout")
};
