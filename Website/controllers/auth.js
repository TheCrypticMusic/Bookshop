const passport = require("passport");
const crypto = require("crypto");
const mongooseHelpers = require("../../config/mongooseHelpers");

const generateAuthToken = () => {
	return crypto.randomBytes(30).toString("hex");
};

exports.validateEmail = (req, res, next) => {
	const { email } = req.body;

	mongooseHelpers._vaildateEmail(email).then((emailExists) => {
		if (emailExists) {
			console.log("Email already taken:", emailExists);
			return res.render("register", { message: "Email already taken" });
		}
		next();
	});
};

exports.validateUsername = (req, res, next) => {
	const { username } = req.body;

	mongooseHelpers._vaildateUsername(username).then((usernameExists) => {
		if (usernameExists) {
			console.log("Username already taken");
			return res.render("register", { message: "Username already taken" });
		}
		next();
	});
};

exports.checkPasswords = (req, res, next) => {
	const { password, passwordConfirm } = req.body;

	if (password !== passwordConfirm) {
		console.log("Passwords don't match");
		return res.render("register", { message: "Passwords do not match" });
	}
	next()
};

exports.registerUser = async (req, res, next) => {

	const { username, email, password, } = req.body

	mongooseHelpers.createUser(username, email, password, "User", false, false).then((result) => {
		console.log(result)
		return res.render("register", { message: "Account created" })
	})
};

exports.login = (req, res, next) => {
	res.cookie("token", generateAuthToken(), { maxAge: 60000 });

	passport.authenticate("local", {
		successRedirect: "/",
		failureRedirect: "/login",
		failureFlash: true,
	})(req, res, next);
};
