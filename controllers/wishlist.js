const mongooseHelpers = require("../config/mongooseHelpers");


exports.userHasWishlist = (req, res, next) => {

    const userId = req.session.passport.user

    mongooseHelpers.getUserWishlist(userId).then((userWishlistExists) => {
        if (!(userWishlistExists)) {
            mongooseHelpers.createWishlist(userId)
            next()
        } else {
            next()
        }
    })

}

exports.itemInWishlist = (req, res, next) => {

    const userId = req.session.passport.user
    const bookId = req.params.id

    mongooseHelpers.getSingleItemInWishlist(userId, bookId).then((result) => {
        if (!result) {
            mongooseHelpers.addBookToWishlist(userId, bookId)
        } else {
            mongooseHelpers.deleteSingleItemFromWishlist(userId, bookId)
        }
    })
}