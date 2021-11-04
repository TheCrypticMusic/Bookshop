exports.checkEventType = (req, res, next) => {

    const event = req.body;

    if (event.type === "checkout.session.completed") {
        res.checkoutComplete = true
        res.user = event.data.object.metadata.userId
        next()
    }
}