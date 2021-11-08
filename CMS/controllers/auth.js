const mongooseHelpers = require("../../config/mongooseHelpers");
const passport = require("passport");
const fetch = require("node-fetch");

exports.login = (req, res, next) => {
    passport.authenticate("local", {
        failureRedirect: "/",
        failureFlash: true,
    })(req, res, next);
};

exports.checkUserRoleTitle = (req, res, next) => {
    const userId = req.session.passport.user;

    fetch("http://localhost:5003/api/users/" + userId)
        .then((res) => res.json())
        .then((json) => {
            if (json.data.role === "User") {
                req.error = req.flash("error", "Invalid User")
                res.redirect(req.originalUrl);
            } else {
                next()
            }
        })
};
