const express = require("express");
const amendmentController = require("../controllers/amendments");
const router = express.Router();

router.post("/email", amendmentController.email);

router.post("/password", amendmentController.password);

router.post("/username", amendmentController.username);

router.post("/addressDetails", amendmentController.addressDetails)

module.exports = router;
