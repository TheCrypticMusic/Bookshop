const express = require("express");
const router = express.Router();
const booksController = require("../controllers/books")

router.get("/", booksController.getAllBooks, (req, res, next) => {

    return res.render("books", { "books": res.books })
})

router.get("/get-sku", booksController.getSku, (req, res, next) => {
    res.send({ "price": res.currentPrice, "stock": res.currentStockLevel })
})

router.get("/edit/:bookId", booksController.getBook, (req, res, next) => {
    res.render("edit-books", { "book": res.book })
})

router.put("/edit/book/:bookId", booksController.updateBook)

router.put("/edit/book/:bookId/sku/:skuId", booksController.updateBookAndSku)


router.get("/create-book", (req, res, next) => {
    res.render("create-book")
})

router.post("/create-book", booksController.createBook)

router.post("/edit/book/:bookId/add-sku", booksController.addSku)

module.exports = router;