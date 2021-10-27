const mongooseHelpers = require("../config/mongooseHelpers")






exports.updateEmail = (req, res, next) => {
    const { email } = req.body;
    const userId = req.session.passport.user;


    mongooseHelpers.updateUser(userId, { "email": email }).then((update => {
        console.log(update)
        if (update.nModified > 0) {
            req.success = req.flash("success", "Email changed to", email)
            res.redirect(req.originalUrl)
        } else {
            req.error = req.flash("error", "Email already exists:", email)
            res.redirect(req.originalUrl)
        }
    }))

};

exports.updateUserPassword = async (req, res, next) => {
    const { newPassword } = req.body;
    const userId = req.session.passport.user;

    mongooseHelpers.updateUser(userId, { "password": newPassword }).then(successfulUpdate => {
        if (successfulUpdate) {
            req.success = req.flash("success", "Password changed")
            res.redirect(req.originalUrl)
        } else {
            req.success = req.flash("error", "Unknown error:", successfulUpdate)
            res.redirect(req.originalUrl)
        }
    })
};


exports.updateUsername = async (req, res, next) => {

    const userId = req.session.passport.user;
    const { username } = req.body

    mongooseHelpers.updateUser(userId, { "username": username }).then(successfulUpdate => {
        if (successfulUpdate) {
            req.flash("success", "Username successfully changed to", username)
            res.redirect(req.originalUrl)
        } else {
            req.flash("error", "Username already in use:", username + ". Please choose another one")
            res.redirect(req.originalUrl)
        }
    })
}

exports.addressDetails = async (req, res, next) => {

    const { addressLine1, addressLine2, town, postcode } = req.body
    const userId = req.session.passport.user

    await User.findOneAndUpdate({ _id: userId },
        {
            "address.addressLine1": addressLine1,
            "address.addressLine2": addressLine2,
            "address.town": town,
            "address.postcode": postcode,
        }, (err, result) => {
            if (err) {
                return err
            }
            return result

        })
    res.redirect("/address")

}