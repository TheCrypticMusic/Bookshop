const express = require("express");
const removeFromBasketController = require("../controllers/removeFromBasket.js");
const router = express.Router();

router.post("/:id", removeFromBasketController.removeItemFromBasket);

module.exports = router;