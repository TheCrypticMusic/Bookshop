const express = require("express");
const router = express.Router();
const mongooseHelpers = require("../config/mongooseHelpers");
const apiHelpers = require("../config/apiHelpers");

router.get("/:userid", apiHelpers.wishlistExists, (req, res) => {

    apiHelpers.sendStatus(200, "success", req.result, "Wishlist found", req, res)
})

//create a new wishlist for user if one doesn't exist
router.post("/:userid", (req, res) => {

    const userId = req.params.userid

    mongooseHelpers.createWishlist(userId).then((result) => {
        if (result) {
            apiHelpers.sendStatus(409, "error", null, "Wishlist already exists for user", req, res)
        } else {
            apiHelpers.sendStatus(200, "success", null, "Wishlist created", req, res)
        }

    })
})

// add a book
router.post("/:userid/items", apiHelpers.wishlistExists, (req, res) => {

    const userId = req.params.userid
    const bookId = req.query.bookid

    mongooseHelpers.addBookToWishlist(userId, bookId).then((result) => {
        console.log(result)
        apiHelpers.sendStatus(200, "success", null, "Book added", req, res)
    })

})

router.delete("/:userid/items", apiHelpers.wishlistExists, (req, res) => {

    const userId = req.params.userid

    mongooseHelpers.deleteWishlistItems(userId).then((result) => {
        if (result.nModified > 0) {
            apiHelpers.sendStatus(200, "success", null, "Wishlist items deleted", req, res)
        } else {
            apiHelpers.sendStatus(404, "error", null, "Request successful but no items to be deleted", req, res)

        }
    })
})

// get a single book from wishlist
// this will just return a _id
router.get("/:userid/items/:bookid", apiHelpers.wishlistExists, (req, res) => {

    const userId = req.params.userid
    const bookId = req.params.bookid

    mongooseHelpers.getSingleItemInWishlist(userId, bookId).then((result) => {
        if (result) {
            apiHelpers.sendStatus(200, "success", result, "Book found in wishlist", req, res)
        } else {
            apiHelpers.sendStatus(404, "error", null, "No book found in wishlist", req, res)
        }
    })
})

router.delete("/:userid/items/:bookid", apiHelpers.wishlistExists, (req, res) => {

    const userId = req.params.userid
    const bookId = req.params.bookid

    mongooseHelpers.deleteSingleItemFromWishlist(userId, bookId).then((result) => {
        if (result.nModified > 0) {
            apiHelpers.sendStatus(200, "success", result, "Book deleted from wishlist", req, res)
        } else {
            apiHelpers.sendStatus(404, "error", result, "Result successful but no item to be deleted", req, res)
        }

    })
})

module.exports = router;