const express = require("express");
const mongooseHelpers = require("../../config/mongooseHelpers");
const router = express.Router();

router.get("/", async (req, res, next) => {
    return res.render("index")
})


module.exports = router;
