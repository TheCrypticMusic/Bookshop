const mongoose = require("mongoose");


const itemDetailsSchema = new mongoose.Schema({
    bookId: {type: String, required: true}
})

const wishlistSchema = new mongoose.Schema({
    userId: {type: mongoose.Schema.Types.ObjectId, ref: "User"},
    wishlist: [itemDetailsSchema]
});

const Wishlist = mongoose.model("Wishlist", wishlistSchema);

module.exports = Wishlist;