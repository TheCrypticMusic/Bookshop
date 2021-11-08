const mongoose = require("mongoose");

const orderItemSchema = new mongoose.Schema({
    bookImage: { type: String, required: true },
    bookSkuId: { type: mongoose.Schema.Types.ObjectId, ref: "Book Sku Id" },
    bookType: { type: String, required: true },
    bookTitle: { type: String, required: true },
    bookAuthor: { type: String, required: true },
    quantity: { type: Number, required: true },
    price: { type: Number, required: true },
    total: { type: Number, required: true },
});

const basketIdSchema = new mongoose.Schema({
    basketId: { type: mongoose.Schema.Types.ObjectId, ref: "Basket" },
    subTotal: { type: Number, required: true },
    items: [orderItemSchema]
},
    { timestamps: { createdAt: "created", updatedAt: "updated" } }
);


const completedOrderSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    basketIds: [basketIdSchema],
});

module.exports = mongoose.model("Order", completedOrderSchema);