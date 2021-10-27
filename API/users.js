const express = require("express");
const router = express.Router();
const mongooseHelpers = require("../config/mongooseHelpers");
const apiHelpers = require("../config/apiHelpers");

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

router.put("/:userid", apiHelpers.userExists, (req, res) => {

    const userId = req.params.userid

    const updateBody = req.body

    mongooseHelpers.updateUser(userId, updateBody).then((result) => {
        if (result.nModified > 0) {
            apiHelpers.sendStatus(200, "success", result, "User test", req, res)
        } else {
            apiHelpers.sendStatus(409, "error", null, "Successful request but data already exists", req, res)
        }
    })

})


module.exports = router;