const express = require("express");
const router = express.Router();
const mongooseHelpers = require("../config/mongooseHelpers")

exports.isAuthenticated = (req, res, next) => {
    if (req.isAuthenticated()) {
        next();
    } else {
        res.render("login")
    }
};

// Checks to see if the user has items in their basket, if they do then they are allowed to access the checkout screen
exports.allowedToAccessPaymentScreen = async (req, res, next) => {
    const userId = req.session.passport.user;
    mongooseHelpers.getUserBasket(userId).then((userBasket) => {
        userBasket.items.length > 0 ? next() : res.redirect("/basket")
    })
};

