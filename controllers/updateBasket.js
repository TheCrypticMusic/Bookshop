const Basket = require("../models/basket");
const router = require("../routes/pages");
const Book = require("../models/books");

exports.update = async (req, res, next) => {
    const { basketId, qty, basketBookId, totalValue, subtotal } = req.body;
    await Basket.updateOne(
        { _id: basketId, "items._id": basketBookId },
        { $set: { "items.$.quantity": qty } },
        (err, result) => {
            if (err) {
                return err;
            }
        }
    );
};
