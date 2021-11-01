const express = require("express");
const updateBasketController = require("../controllers/updateBasket");
const router = express.Router();

router.put("/:id", updateBasketController.updateBasket);

module.exports = router;