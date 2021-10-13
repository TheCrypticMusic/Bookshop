const express = require("express");
const router = express.Router();
const mongooseHelpers = require("../../config/mongooseHelpers")

// get user basket
router.get("/:id", (req, res) => {
    const userId = req.params.id
    mongooseHelpers.getUserBasket(userId).then(userBasket => {
        if (userBasket === null) {
            return res.status(404).json({ error: "User does not have a basket" })
        } else {
            return res.status(200).json({
                success: {
                    "User Basket": userBasket
                }
            })
        }
    })
})

// update user basket with single sku and quantity
router.put("/:id", (req, res) => {

    const { bookId, bookSkuId, qty } = req.body

    const userId = req.params.id

    mongooseHelpers.getUserBasket(userId).then(userBasket => {
        if (userBasket === null) {
            return res.status(404).json({ error: "User does not have a basket" })
        }

        mongooseHelpers.getSingleBookBySku(bookId, bookSkuId).then(book => {
            if (!(book)) {
                return res.status(404).json({ error: "Book not found" })
            } else if (!(book.hasOwnProperty("skus"))) {
                console.log(book)
                return res.status(400).json({ "error": "book found but book sku is incorrect" })
            } else {

                const { imagePath, title, author } = book
                const { type, price } = book.skus[0]

                mongooseHelpers.updateBasketWithBook(userId, bookSkuId, imagePath, type, title, author, qty, price).then(() => {
                    return res.status(200).json({ success: `${title} x ${qty} added to basket` })
                })
            }
        })
    })
})

// Create basket for user if one doesn't exist
router.post("/:id", (req, res) => {

    const userId = req.params.id

    mongooseHelpers.createBasket(userId).then(userHasBasket => {
        if (userHasBasket) {
            res.status(409).json({ error: "User basket already exists for " + userId })
        } else {
            res.status(201).json({ success: "User basket created for " + userId })
        }

    })


})

module.exports = router