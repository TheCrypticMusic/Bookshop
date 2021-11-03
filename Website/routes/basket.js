const express = require("express");
const router = express.Router();
const expressHelpers = require("../../config/expressHelpers")
const basketController = require("../controllers/basket")


router.get("/", expressHelpers.isAuthenticated, basketController.getUserBasket, (req, res, next) => {
    if (res.basket) {
        const { basketItems, subTotal, basketId } = res.basket
        return res.render("basket", { basketItems: basketItems, subTotal: subTotal, basketId: basketId });
    } else {
        return res.render("basket", { basketItems: 0 })
    }
});

router.post("/:id", expressHelpers.isAuthenticated, basketController.userHasBasket, basketController.addItemToBasket, (req, res, next) => {
    return res.redirect("/")
});

router.delete("/:id", basketController.deleteItemFromBasket)

router.put("/:id", expressHelpers.isAuthenticated, basketController.userHasBasket, basketController.updateBasket, (req, res, next) => {
    return res.end("{Success}")
})

module.exports = router;