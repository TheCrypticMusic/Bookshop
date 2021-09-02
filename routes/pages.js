const express = require("express");
const Book = require("../models/books");
const csrf = require("csurf");
const e = require("connect-flash");
const User = require("../models/user")

const router = express.Router();

const csrfProtection = csrf();

function isAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    next();
  } else {
    res.redirect("/login");
  }
}

router.use(csrfProtection);

router.use((req, res, next) => {
  res.locals.isAuthenticated = req.isAuthenticated();
  if (req.isAuthenticated()) res.locals.user = req.user.username;
  next();
});

router.get("/", (req, res, next) => {
  console.log(req.isAuthenticated());
  
  Book.find((err, docs) => {
    if (!err) {
      res.render("index", { title: "Bookstore", books: docs });
    } else {
      console.log("Error retrieving books:", +err);
    }
  }).lean();
});

router.get("/register", (req, res, next) => {
  res.render("register"), { csrfToken: req.csrfToken() };
});

router.get("/login", (req, res, next) => {
  res.render("login", { csrfToken: req.csrfToken() });
});

router.get("/logout", (req, res, next) => {
  req.session.destroy();
  res.redirect("/");
});

router.get("/basket", (req, res, next) => {
  res.render("basket");
});

router.get("/account", isAuthenticated, (req, res, next) => {
  User.findById(req.user.id, (err, result) => {
    if (err) { 
      return err 
    } else { 
      return res.render("account", { user: result }); }

  }).lean()


});

module.exports = router;
