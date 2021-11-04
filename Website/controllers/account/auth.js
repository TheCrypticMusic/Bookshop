const passport = require("passport");
const crypto = require("crypto");
const mongooseHelpers = require("../../../config/mongooseHelpers");

const generateAuthToken = () => {
	return crypto.randomBytes(30).toString("hex");
};

exports.validateEmail = (req, res, next) => {
	const { email } = req.body;

	mongooseHelpers._vaildateEmail(email).then((emailExists) => {

		if (emailExists) {
			req.error = req.flash("error", "Email already taken");

			const statusCode = req.method === "POST" ? 303 : 304
			res.redirect(statusCode, req.originalUrl)
		} else {
			next();
		}

	});
};

exports.validateUsername = (req, res, next) => {
	const { username } = req.body;

	mongooseHelpers._vaildateUsername(username).then((usernameExists) => {

		if (usernameExists) {
			req.error = req.flash("error", "Username already taken");

			const statusCode = req.method === "POST" ? 303 : 304

			res.redirect(statusCode, req.originalUrl)
		} else {
			next();
		}
	});
};


exports.validateOldPassword = async (req, res, next) => {
	const { oldPassword } = req.body;
	const userId = req.session.passport.user;

	mongooseHelpers._validatePassword(userId, oldPassword).then((result) => {

		if (result) {
			next();
		} else {
			req.error = req.flash("error", "Password provided is incorrect");
			const statusCode = req.method === "POST" ? 303 : 304
			res.redirect(statusCode, req.originalUrl)
		}
	});
};

exports.validateNewPasswords = (req, res, next) => {

	const { password, passwordConfirm } = req.body;

	if (password !== passwordConfirm) {
		req.error = req.flash("error", "Passwords do not match. Please try again")
		const statusCode = req.method === "POST" ? 303 : 304
		res.redirect(statusCode, req.originalUrl)
	} else {
		next()
	}
}


exports.login = (req, res, next) => {
	res.cookie("token", generateAuthToken(), { maxAge: 60000 });

	passport.authenticate("local", {
		successRedirect: "/",
		failureRedirect: "/account/login",
		failureFlash: true,
	})(req, res, next);
};
