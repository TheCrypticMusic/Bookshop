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

exports.getBook = (req, res, next) => {
    const { bookId } = req.params


    fetch(`http://localhost:5003/api/books/${bookId}`).then(res => res.json()).then(text => {
        res.book = text.data.book
        next()
    })

}

exports.updateBook = (req, res, next) => {

    const { bookId } = req.params

    fetch(`http://localhost:5003/api/books/${bookId}`, {
        method: "put",
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        }, body: JSON.stringify(req.body)
    }).then(res => res.json()).then(text => {

        if (text.code === 200) {
            res.sendStatus(text.code)
        }

    })

}

exports.updateBookAndSku = (req, res, next) => {

    const { bookId, skuId } = req.params

    fetch(`http://localhost:5003/api/books/${bookId}/skus/${skuId}`, {
        method: "put",
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        }, body: JSON.stringify(req.body)
    }).then(res => res.json()).then(text => {

        if (text.code === 200) {
            res.sendStatus(text.code)
        }

    })


}


exports.createBook = (req, res, next) => {

    const updateData = req.body

    updateData["imagePath"] = "images/default.jpg"
    fetch(`http://localhost:5003/api/books`, {
        method: "POST",
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        }, body: JSON.stringify(updateData)
    }).then(res => res.json()).then(text => {


        res.sendStatus(200)


    })


}


exports.addSku = (req, res, next) => {

    const bookId = req.params.bookId

    fetch(`http://localhost:5003/api/books/${bookId}/skus`, {
        method: "POST",
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        }, body: JSON.stringify(req.body)
    }).then(res => res.json()).then(text => {


        res.sendStatus(text.code)


    })
}