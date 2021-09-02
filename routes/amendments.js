const express = require("express");
const amendmentController = require("../controlllers/amendments")
const router = express.Router();



router.get("/email", (req, res, next) => {
  return res.render("email", { csrfToken: req.csrfToken() });
})

router.post("/email", amendmentController.email)

router.get("/password", (req, res, next) => {
  return res.render("password", { csrfToken: req.csrfToken() });
})

router.post("/password", amendmentController.password)

router.get("/username", (req, res, next) => {
  return res.render("username", { csrfToken: req.csrfToken() });
})

router.post("/username", amendmentController.username)

module.exports = router;