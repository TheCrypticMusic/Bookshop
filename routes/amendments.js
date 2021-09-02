const express = require("express");
const amendmentController = require("../controlllers/amendments")
const router = express.Router();



router.get("/email", (req, res, next) => {
  return res.render("email", { csrfToken: req.csrfToken() });
})

router.post("/email", amendmentController.email)

module.exports = router;