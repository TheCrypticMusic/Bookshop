const mongoose = require("mongoose");

const basketItemSchema = new mongoose.Schema(
    {
        bookId: { type: String, required: true },
        bookTitle: { type: String, required: true },
        bookAuthor: { type: String, required: true },
        quantity: { type: Number, required: true },
        price: { type: Number, required: true },
        total: { type: Number, required: true }
    })


const basketSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User"},
    items: [basketItemSchema],
    subTotal: {
        default: 0,
        type: Number
    }
})



module.exports = mongoose.model("Basket", basketSchema)