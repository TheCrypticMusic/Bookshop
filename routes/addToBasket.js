const express = require("express");
const addToBasketController = require("../controlllers/addToBasket.js")
const router = express.Router();


router.post("/:id", addToBasketController.addItemToBasket)



module.exports = router;