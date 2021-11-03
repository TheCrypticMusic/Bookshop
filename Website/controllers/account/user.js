const mongooseHelpers = require("../../../config/mongooseHelpers")

exports.getUserDetails = (req, res, next) => {

    const userId = req.session.passport.user;
    mongooseHelpers.getUser(userId).then((result) => {
        res.user = result
        next()
    })
}

exports.getUserWishlist = (req, res, next) => {

    const userId = req.session.passport.user
    mongooseHelpers.getUserWishlist(userId).then((result) => {
        res.wishlist = result
        next()
    })
}

exports.getUserOrders = (req, res, next) => {

    const userId = req.session.passport.user
    mongooseHelpers.getUserOrders(userId).then((result) => {

        res.orders = result !== null ? result.basketIds.map((x) => x) : false

        next()
    })

}

exports.updateEmail = (req, res, next) => {
    const { email } = req.body;
    const userId = req.session.passport.user;

    mongooseHelpers.updateUser(userId, { "email": email }).then((update => {

        const flashMessage = update.nModified > 0 ? { status: "success", message: `Email changed to ${email}` } : { status: "error", message: `Email already exists: ${email}` }


        req[flashMessage.status] = req.flash(flashMessage.status, flashMessage.message)

        res.sendStatus(200)
    }))

};

exports.updatePassword = async (req, res, next) => {
    const { password } = req.body;
    const userId = req.session.passport.user;

    mongooseHelpers.updateUser(userId, { "password": password }).then(successfulUpdate => {

        const flashMessage = successfulUpdate.nModified > 0 ? { status: "success", message: `Password successfully changed` } : { status: "error", message: `Unknown error` }
        req[flashMessage.status] = req.flash(flashMessage.status, flashMessage.message)

        res.sendStatus(200)
    })
};


exports.updateUsername = async (req, res, next) => {

    const { username } = req.body
    const userId = req.session.passport.user

    mongooseHelpers.updateUser(userId, { "username": username }).then((result) => {

        const flashMessage = result.nModified > 0 ? { status: "success", message: `Username successfully changed` } : { status: "error", message: `Unknown error` }
        req[flashMessage.status] = req.flash(flashMessage.status, flashMessage.message)

        res.sendStatus(200)
    })

}

exports.updateAddress = async (req, res, next) => {

    const updateData = req.body
    const userId = req.session.passport.user
    mongooseHelpers.createAddressForUser(userId, updateData).then((result) => {
        const flashMessage = result.nModified > 0 ? { status: "success", message: `Address successfully changed` } : { status: "error", message: `Unknown error` }
        req[flashMessage.status] = req.flash(flashMessage.status, flashMessage.message)

        res.sendStatus(200)
    })

}


exports.registerUser = async (req, res, next) => {

    const { username, email, password, } = req.body

    mongooseHelpers.createUser(username, email, password, "User", false, false).then((error) => {

        res.success = req.flash("success", "User account created")
        next()
    })
};
