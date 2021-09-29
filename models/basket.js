const mongoose = require("mongoose");

const basketItemSchema = new mongoose.Schema({
    bookImage: { type: String, required: true },
    bookSkuId: { type: mongoose.Schema.Types.ObjectId, ref: "Book Sku Id" },
    bookType: { type: String, required: true },
    bookTitle: { type: String, required: true },
    bookAuthor: { type: String, required: true },
    quantity: { type: Number, required: true },
    price: { type: Number, required: true },
    total: { type: Number, required: true },
});

const basketSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    subTotal: { default: 0, type: Number },
    items: [basketItemSchema],
});

basketSchema.methods.subTotalPrice = function() {
    
    const newSubtotal = this.items.map((elem) => elem.total).reduce((a, b) => a + b)
    return newSubtotal.toFixed(2);

}

basketSchema.methods.amendItemPrice = function(basketQty, index) {

    const itemPrice = (this.items[index].price * basketQty).toFixed(2);
    return itemPrice;
}

basketSchema.methods.add = function (
    bookSkuId,
    bookType,
    bookImage,
    bookTitle,
    bookAuthor,
    quantity,
    price
) {
    const bookCartIndex = this.items.findIndex(
        (book) => book.bookSkuId == bookSkuId
    );
    if (bookCartIndex > -1) {
        const bookItem = this.items[bookCartIndex];
        bookItem.quantity += 1;
        bookItem.total = bookItem.price * bookItem.quantity;
        console.log(
            "\n***** CURRENT BASKET *****\n" + bookTitle,
            "already in basket: \nQuantity:",
            bookItem.quantity,
            "\nTotal:",
            bookItem.total,
            "\n"
        );
    } else {
        this.items.push({
            bookImage: bookImage,
            bookSkuId: bookSkuId,
            bookType: bookType,
            bookTitle: bookTitle,
            bookAuthor: bookAuthor,
            quantity: quantity,
            price: price,
            total: price * quantity,
        });
        console.log(
            "\n***** BASKET *****\n" + bookTitle,
            "Added to basket: \nQuantity:",
            quantity,
            "\nTotal:",
            price,
            "\n"
        );
    }
    this.subTotal = this.items.map((x) => x.total).reduce((a, b) => a + b, 0);
    this.save();
};

module.exports = mongoose.model("Basket", basketSchema);
