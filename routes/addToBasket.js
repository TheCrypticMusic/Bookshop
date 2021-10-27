const express = require("express");
const addToBasketController = require("../controllers/addToBasket.js");
const router = express.Router();

router.post("/:id", addToBasketController.userHasBasket, addToBasketController.addItemToBasket);

module.exports = router;
