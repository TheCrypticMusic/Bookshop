const express = require("express");
const authController = require("../controllers/auth")
const router = express.Router();

router.get("/", (req, res, next) => {
    return res.render("index", { layout: "login-layout" })
})

router.post("/", authController.login, authController.checkUserRoleTitle, (req, res, next) => {
    return res.redirect("/dashboard")
})


module.exports = router;
