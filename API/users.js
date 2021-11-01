const express = require("express");
const router = express.Router();
const mongooseHelpers = require("../config/mongooseHelpers");
const apiHelpers = require("../config/apiHelpers");

//create new user
router.post("/", apiHelpers.vaildateRegisterData, (req, res) => {

    const { username, email, password, title, readAccess, writeAccess } = req.body

    mongooseHelpers.createUser(username, email, password, title, readAccess, writeAccess).then((result) => {
        apiHelpers.sendStatus(200, "success", null, "User created", req, res)
    })
})

router.get("/:userid", apiHelpers.userExists, (req, res) => {
    apiHelpers.sendStatus(200, "success", req.result, "User found", req, res)
})

router.put("/:userid", apiHelpers.userExists, (req, res) => {

    const userId = req.result

    const updateBody = req.body

    mongooseHelpers.updateUser(userId, updateBody).then((result) => {
        if (result.nModified > 0) {
            apiHelpers.sendStatus(200, "success", result, "User test", req, res)
        } else {
            apiHelpers.sendStatus(409, "error", null, "Successful request but data already exists", req, res)
        }
    })

})

// Fields required:
// shipping-address = true or false
// address = true or false
// If you have both flagged as true this will create an address which is the same as the shipping address and vice versa

router.post("/:userid/addresses", apiHelpers.addressExists, apiHelpers.validQueryChecker(["shipping-address", "address"]), apiHelpers.userExists, (req, res) => {

    const userId = req.result
    const updateBody = req.body

    const query = req.query

    // console.log(q, updateBody)

    const filteredQuery = Object.keys(query).filter(x => {
        return query[x] !== "false"
    })

    const bodyIntoJSON = filteredQuery.map((elem, index) => {
        if (elem === "shipping-address") {
            return { ["shippingAddress"]: updateBody }
        } else {
            return { [elem]: updateBody }
        }
    })

    const newUpdateBody = Object.assign({}, ...bodyIntoJSON)

    mongooseHelpers.createAddressForUser(userId, newUpdateBody).then((result) => {
        if (result.nModified > 0) {
            apiHelpers.sendStatus(200, "success", result, "Address details successfully created", req, res)
        } else {
            apiHelpers.sendStatus(404, "error", null, "Unknown error", req, res)
        }
    })
})

// Fields required:
// shipping-address = true or false
// address = true or false
router.get("/:userid/addresses", apiHelpers.validQueryChecker(["shipping-address", "address"]), apiHelpers.userExists, (req, res) => {

    const userId = req.result
    const query = req.query

    const filteredQuery = Object.keys(query).filter(x => {
        return query[x] !== "false"
    })


    const databaseQuery = apiHelpers.createCamelCaseDatabaseEnquiry(filteredQuery)


    mongooseHelpers.getUserAddress(userId, databaseQuery).then((result) => {
        apiHelpers.sendStatus(200, "success", result, "Address details found", req, res)
    })
})


module.exports = router;