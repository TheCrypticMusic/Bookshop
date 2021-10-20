const express = require("express");
const deleteFromBasketController = require("../controllers/deleteFromBasket.js");
const router = express.Router();


router.post("/:id", deleteFromBasketController.deleteItemFromBasket);


module.exports = router;