const mongooseHelpers = require("../../config/mongooseHelpers");

exports.validateUsername = async (req, res, next) => {
	const { username } = req.body;
	console.log(username.length);
	if (username.length != 0) {
		mongooseHelpers._vaildateUsername(username).then((result) => {
			if (result) {
				req.error = req.flash("error", "Username already in use");
				res.redirect(req.originalUrl);
			} else {
				next();
			}
		});
	} else {
		req.error = req.flash("error", "Username cannot be empty");
		res.redirect(req.originalUrl);
	}
};

exports.validateEmail = (req, res, next) => {
	const { email } = req.body;

	mongooseHelpers._vaildateEmail(email).then((result) => {
		if (result) {
			req.error = req.flash("error", "Email already exists");
			res.redirect(req.originalUrl);
		} else {
			next();
		}
	});
};

exports.validatePassword = (req, res, next) => {
	const { password } = req.body;

	const userId = req.session.passport.user;

	mongooseHelpers._validatePassword(userId, password).then((result) => {
		if (result) {
			next();
		} else {
			req.error = req.flash("error", "Password provided is incorrect");
			res.redirect(req.originalUrl);
		}
	});
};

exports.checkPasswordsMatch = (req, res, next) => {
	const { newPassword, newPasswordConfirm } = req.body;
	console.log(req.body);
	if (newPassword != newPasswordConfirm) {
		req.error = req.flash("error", "New passwords do not match");
		res.redirect(req.originalUrl);
	} else {
		next();
	}
};
