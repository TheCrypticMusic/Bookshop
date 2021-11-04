const mongooseHelpers = require("../../config/mongooseHelpers")

exports.getUserOrder = (req, res, next) => {

    const userId = res.checkoutComplete === true ? res.user : req.session.passport.user

    mongooseHelpers.createNewOrderDocumentForUser(userId).then(() => {
        next()
    })

}

exports.createOrder = (req, res, next) => {

    const userId = res.user

    mongooseHelpers.createUserOrder(userId).then(result => {
        next()
    })
}