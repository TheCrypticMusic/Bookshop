const fetch = require("node-fetch");

exports.getAllBooks = (req, res, next) => {

    fetch("http://localhost:5003/api/books").then(res => res.json()).then(text => {
        res.books = text.data.books
      
        next()  
    })


}

exports.getSku = (req, res, next) => {
    const { bookId, bookSkuId } = req.query

    fetch(`http://localhost:5003/api/books/${bookId}/skus/${bookSkuId}`).then(res => res.json()).then(text => {
        
        //TODO: Filter array so price and quantity is sent to view 
        res.currentPrice = text.data.book_sku.skus[0].price
        res.currentStockLevel = text.data.book_sku.skus[0].quantity
        next()
    }) 

}

