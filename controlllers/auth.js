const User = require("../models/user");
const passport = require("passport");
const crypto = require("crypto");
const Basket = require("../models/basket")

const generateAuthToken = () => {
  return crypto.randomBytes(30).toString("hex");
};

exports.register = async (req, res) => {
  const { username, email, password, passwordConfirm } = req.body;
  if (!email || !password) {
    return res.status(400).render("register");
  }
  if (password !== passwordConfirm) {
    return res.render("register", { message: "Passwords do not match" });
  }

  await User.findOne({ email: email }, function (err, docs) {
    if (docs) {
      console.log("Email already taken:", docs);
      return res.render("register", { message: "Email already taken" });
    }

    new User({
      username: username,
      email: email,
      password: password,
    }).save((error, data) => {
      return res.render("register", { message: "Account Created" });
    });
  });
};

exports.login = (req, res, next) => {
  res.cookie("token", generateAuthToken(), { maxAge: 60000 });

  passport.authenticate("local", {
    successRedirect: "/",
    failureRedirect: "/login",
    failureFlash: true,
  })(req, res, next);
};
