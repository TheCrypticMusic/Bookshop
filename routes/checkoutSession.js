const express = require("express");

const checkoutSessionController = require("../controllers/checkoutSession.js");
const router = express.Router();

router.post("/:id", checkoutSessionController.session);

module.exports = router;