const express = require("express");
const router = express.Router();
const userController = require("../controllers/users.js")

router.get("/", userController.getUsers, (req, res, next) => {
    return res.render("users", { "users": res.users })
})

module.exports = router;