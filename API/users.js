const express = require("express");
const router = express.Router();
const mongooseHelpers = require("../config/mongooseHelpers");
const apiHelpers = require("../config/apiHelpers");
const authController = require("../controllers/auth")
//create new user
router.post("/", apiHelpers.vaildateRegisterData, (req, res) => {

    const { username, email, password } = req.body

    mongooseHelpers.createUser(username, email, password).then((result) => {
        apiHelpers.sendStatus(200, "success", null, "User created", req, res)
    })
})

router.get("/:userid", apiHelpers.userExists, (req, res) => {
    apiHelpers.sendStatus(200, "success", req.result, "User found", req, res)
})



module.exports = router;