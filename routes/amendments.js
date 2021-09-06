const express = require("express");
const amendmentController = require("../controlllers/amendments")
const router = express.Router();




router.post("/email", amendmentController.email)

router.post("/password", amendmentController.password)

router.post("/username", amendmentController.username)

module.exports = router;