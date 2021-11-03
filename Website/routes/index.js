const express = require("express");
const mongooseHelpers = require("../../config/mongooseHelpers");
const router = express.Router();
const expressHelpers = require("../../config/expressHelpers")


router.get("/", async (req, res, next) => {

    console.log("Is User Authenticated?", req.isAuthenticated());
    mongooseHelpers.getBooks({}).then(books => {
        return res.render("index", { title: "Bookstore", books: books });
    })
});


module.exports = router;
