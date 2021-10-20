const express = require("express");
const router = express.Router();
const mongooseHelpers = require("../config/mongooseHelpers");
const APIHelpers = require("../config/APIHelpers");



// get user basket
router.get("/:userid", APIHelpers.basketExists, (req, res) => {
    const userId = req.params.userid;
    mongooseHelpers.getUserBasket(userId).then((userBasket) => {
        APIHelpers.sendStatus(
            200,
            "success",
            { basket: userBasket },
            "User basket found",
            req,
            res
        );
    });
});

// Create basket for user if one doesn't exist
router.post("/:userid", (req, res) => {
    const userId = req.params.userid;

    mongooseHelpers.createUserBasket(userId).then((userHasBasket) => {
        if (userHasBasket) {
            APIHelpers.sendStatus(
                409,
                "error",
                null,
                `User basket already exists for ${userId}`,
                req,
                res
            );
        } else {
            APIHelpers.sendStatus(
                201,
                "success",
                null,
                `User basket created for ${userId}`,
                req,
                res
            );
        }
    });
});

// Delete user basket if basket is present
router.delete("/:userid", APIHelpers.basketExists, (req, res) => {
    const userId = req.params.userid;

    mongooseHelpers.deleteUserBasket(userId).then((basketDeletedResult) => {
        if (basketDeletedResult) {
            APIHelpers.sendStatus(
                200,
                "success",
                null,
                `User basket, ${userId}, deleted`,
                req,
                res
            );
        }
    });
});

// get all items from basket
router.get("/:userid/items", APIHelpers.basketExists, (req, res) => {
    const userId = req.params.userid;

    mongooseHelpers.getAllItemsInUserBasket(userId).then((userBasketItems) => {
        APIHelpers.sendStatus(
            200,
            "success",
            userBasketItems,
            "Basket items found",
            req,
            res
        );
    });
});

// delete all items from basket
router.delete("/:userid/items", APIHelpers.basketExists, (req, res) => {
    const userId = req.params.userid;

    mongooseHelpers.deleteAllItemsFromBasket(userId).then((deletedBasketResult) => {
        if (deletedBasketResult.nModified > 0) {
            APIHelpers.sendStatus(200, "success", null, "Items deleted", req, res);
        } else {
            APIHelpers.sendStatus(
                200,
                "success",
                null,
                "Request successful but no items in basket to be deleted",
                req,
                res
            );
        }
    });
});

// add book to basket
// bookSkuId has to be sent for it to be a vaild post

router.post("/:userid/items", APIHelpers.basketExists, APIHelpers.bookExists, APIHelpers.skuExists, (req, res) => {
    const userId = req.params.userid;
    const { bookSkuId, bookId, qty } = req.body;

    mongooseHelpers.addBookToBasket(userId, bookId, bookSkuId, qty).then((update) => {
        APIHelpers.sendStatus(
            200,
            "success",
            null,
            `${bookSkuId} added to basket`,
            req,
            res
        );
    });
});

// get single item in basket
router.get("/:userid/items/:itemid", APIHelpers.basketExists, APIHelpers.basketItemExists, (req, res) => {

    APIHelpers.sendStatus(200, "success", req.result, "Single item found", req, res)

})

router.put("/:userid/items/:itemid", APIHelpers.basketExists, APIHelpers.basketItemExists, (req, res) => {

    const userId = req.params.userid;
    const itemId = req.params.itemid;

    const updateData = mongooseHelpers._updateZeroDepthSubdocumentBuilder("items", req.body)

    mongooseHelpers.updateBasketItem(userId, itemId, updateData).then((result) => {
        if (result.nModified > 0) {
            APIHelpers.sendStatus(200, "success", null, "Item update successful", req, res)
        } else {
            APIHelpers.sendStatus(200, "success", null, "Request successful but items already contain data sent in request", req, res)
        }

    })
})


router.delete("/:userid/items/:itemid", APIHelpers.basketExists, APIHelpers.basketItemExists, (req, res) => {

    const userId = req.params.userid
    const itemId = req.params.itemid
    console.log(userId, itemId)
    mongooseHelpers.deleteItemFromBasket(userId, itemId).then((result) => {
        APIHelpers.sendStatus(200, "success", result, "Item deleted from basket", req, res)
    })

})

module.exports = router;
