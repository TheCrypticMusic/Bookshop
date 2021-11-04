const express = require("express");
const router = express.Router();
const basketController = require("../controllers/basket");
const orderController = require("../controllers/order");
const webhookController = require("../controllers/webhook")

router.post(
    "/",
    express.raw({ type: "application/json" }),
    webhookController.checkEventType,
    basketController.getUserBasket,
    orderController.getUserOrder,
    orderController.createOrder, (req, res, next) => {
        return res.sendStatus(200)
    })

module.exports = router;
