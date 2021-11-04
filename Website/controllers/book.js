const mongooseHelpers = require("../../config/mongooseHelpers");

exports.getSku = (req, res, next) => {

    const bookId = req.params.bookId
    const skuId = req.params.skuId

    mongooseHelpers.getSingleSkuOfBook(bookId, skuId, ["title", "author", "imagePath"]).then((bookSku) => {

        const skuDetails = bookSku.skus[0];
        res.book = bookSku
        res.sku = skuDetails
        next()
    })
}