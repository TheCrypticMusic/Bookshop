const express = require("express");
const router = express.Router();
const mongooseHelpers = require("../config/mongooseHelpers")

// get user basket
router.get("/:id", (req, res) => {
    const userId = req.params.id
    mongooseHelpers.getUserBasket(userId).then(userBasket => {
        if (userBasket === null) {
            return res.status(404).json({ error: "User does not have a basket" })
        } else {
            return res.status(200).json({
                "status": "success",
                "code": 200,
                "data": {
                    "user_basket": userBasket
                },
                "message": "user basket found",
                "path": `/api/baskets/${userId}`
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
            return res.status(404).json({
                "status": "error",
                "code": 404,
                "data": null,
                "message": "User does not have a basket",
                "path": `/api/baskets/${userId}`
            })
        }

        mongooseHelpers.getSingleBookBySku(bookId, bookSkuId).then(book => {
            if (!(book)) {
                return res.status(404).json({
                    "status": "error",
                    "code": 404,
                    "data": null,
                    "message": "Incorrect book id provided",
                    "path": `/api/baskets/${userId}`
                })
            } else if (!(book.hasOwnProperty("skus"))) {
                console.log(book)
                return res.status(404).json({
                    "status": "error",
                    "code": 404,
                    "data": null,
                    "message": "Incorrect book sku id provided",
                    "path": `/api/baskets/${userId}`
                })
            } else {
                const { imagePath, title, author } = book
                const { type, price } = book.skus[0]

                mongooseHelpers.updateBasketWithBook(userId, bookSkuId, imagePath, type, title, author, qty, price).then(() => {
                    return res.status(200).json({
                        "status": "success",
                        "code": 200,
                        "data": {
                            "sent": {
                                "book_id": bookId,
                                "book_sku_id": bookSkuId,
                                "quantity": qty
                            }
                        },
                        "message": `${title}, ${type} - added to basket`,
                        "path": `/api/baskets/${userId}`
                    })
                })
            }
        })
    })
})


// Create basket for user if one doesn't exist
router.post("/:id", (req, res) => {

    const userId = req.params.id

    mongooseHelpers.createUserBasket(userId).then(userHasBasket => {
        
        if (userHasBasket) {
            res.status(409).json({
                "status": "error",
                "code": 409,
                "data": null,
                "message": `User basket already exists`,
                "path": `/api/baskets/${userId}`
            })
        } else {
            res.status(201).json({
                "status": "success",
                "code": 201,
                "data": null,
                "message": `User basket created for ${userId}`,
                "path": `/api/baskets/${userId}`
            })
        }

    })
})

// Delete user basket if basket is present
router.delete("/:id", (req, res) => {
    const userId = req.params.id

    mongooseHelpers.deleteUserBasket(userId).then(basketDeletedResult => {
        if (basketDeletedResult) {
            res.status(200).json({
                "status": "success",
                "code": 200,
                "data": null,
                "message": "User basket deleted",
                "path": `/api/baskets/${userId}`
            })
        } else {
            res.status(404).json({
                "status": "error",
                "code": 404,
                "data": null,
                "message": "No user basket found",
                "path": `/api/baskets/${userId}`
            })
        }
    })
})

module.exports = router