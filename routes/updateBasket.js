const express = require("express");
const updateBasketController = require("../controllers/updateBasket.js");
const router = express.Router();

router.put("/:id", updateBasketController.updateBasket);

module.exports = router;