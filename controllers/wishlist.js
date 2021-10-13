const router = require("../routes/pages");
const Wishlist = require("../models/wishlist");
const mongoosHelpers = require("../config/mongooseHelpers");



exports.add = async (req, res, next) => {
    
    const bookId = req.params.id;
    const userId = req.session.passport.user;
    
    mongoosHelpers.updateWishListWithBook(userId, bookId)

};