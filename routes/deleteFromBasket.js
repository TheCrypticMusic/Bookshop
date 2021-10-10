const express = require("express");
const deleteFromBasketController = require("../controllers/deleteFromBasket.js");
const router = express.Router();


router.delete("/:id", deleteFromBasketController.deleteItemFromBasket);


module.exports = router;