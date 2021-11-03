const express = require("express");
const router = express.Router();
const checkoutController = require("../controllers/checkout.js");
const basketController = require("../controllers/basket");
const userController = require("../controllers/account/user")
const expressHelpers = require("../../config/expressHelpers");

router.get(
    "/",
    expressHelpers.isAuthenticated,
    basketController.userHasBasket,
    basketController.getUserBasket,
    checkoutController.getPostagePrices,
    userController.getUserDetails,
    (req, res, next) => {

        return res.render("checkout", {
            items: res.basket.basketItems,
            subTotal: res.basket.subTotal,
            basketId: res.basket.basketId,
            total: res.basket.total,
            postage: res.postagePrices,
            username: res.user.username,
            shippingAddress: res.user.shippingAddress,
        });
    }
);

router.post("/:id", checkoutController.session);

module.exports = router;
