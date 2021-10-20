const router = require("../routes/pages");
const Wishlist = require("../models/wishlist");
const mongooseHelpers = require("../config/mongooseHelpers");



exports.add = async (req, res, next) => {

    const bookId = req.params.id;
    const userId = req.session.passport.user;


    mongooseHelpers.getUserWishlist(userId).then((result) => {
        if (!(result)) {
            mongooseHelpers.createWishlist(userId)
        }
        mongooseHelpers.getSingleItemInWishlist(userId, bookId).then((result) => {
            if (!result) {
                mongooseHelpers.addBookToWishlist(userId, bookId)
            } else {
                mongooseHelpers.deleteSingleItemFromWishlist(userId, bookId)
            }
        })

    })



};