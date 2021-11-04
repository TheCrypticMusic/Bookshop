const express = require("express");
const router = express.Router();
const bookController = require("../controllers/book")


router.get("/:bookId/:skuId", bookController.getSku, (req, res, next) => {
    return res.render("product", { book: res.book, sku: res.sku })
})

module.exports = router;

