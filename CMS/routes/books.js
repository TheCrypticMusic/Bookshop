const express = require("express");
const router = express.Router();
const booksController = require("../controllers/books")

router.get("/", booksController.getAllBooks, (req, res, next) => {
  
    return res.render("books", { "books": res.books })
})

router.get("/get-sku", booksController.getSku, (req, res, next) => {
    res.send({"price": res.currentPrice, "stock": res.currentStockLevel})
})


module.exports = router;