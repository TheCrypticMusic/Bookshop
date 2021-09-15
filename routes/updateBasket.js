const express = require("express");
const updateBasketController = require("../controllers/updateBasket.js");
const router = express.Router();

router.post("/:id", updateBasketController.update);

module.exports = router;