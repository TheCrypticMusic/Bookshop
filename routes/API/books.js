const express = require("express");
const router = express.Router();
const mongooseHelpers = require("../../config/mongooseHelpers")


// get all books 
router.get("/", (req, res) => {
    mongooseHelpers.getAllBooks().then(result => {
        res.send(result)
    })
})

// get a single book
router.get("/:id", (req, res) => {
    const bookId = req.params.id

    mongooseHelpers.getSingleBook(bookId).then(result => {
        res.send(result)
    })
})


// get a single sku of a book
router.get("/:id/sku/:sku", (req, res) => {
    const bookId = req.params.id
    const skuId = req.params.sku

    mongooseHelpers.getSingleBookBySku(bookId, skuId).then(result => {
        res.send(result)
    })
})



module.exports = router