const express = require("express");
const Book = require("../models/books");
const csrf = require("csurf");
const User = require("../models/user");

const Basket = require("../models/basket");
const router = express.Router();
const Wishlist = require("../models/wishlist");

const Order = require("../models/completedOrders");
const {fiction} = require("../config/handlebars-helpers");

// const csrfProtection = csrf();

function isAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        next();
    } else {
        res.redirect("/login");
    }
}

// router.use(csrfProtection);

router.use(async (req, res, next) => {
    res.locals.isAuthenticated = req.isAuthenticated();
    if (req.isAuthenticated()) {
        res.locals.user = req.user.username;
    }
    res.locals.session = req.session;
    res.locals.section = req.url;
    if (req.session.passport) {
        await Wishlist.findOne({userId: req.session.passport.user}, (err, results) => {
            if (results) {
                res.locals.userWishlist = results.wishlist.map(x => x.bookId);
            }
        });
    }
    res.locals.genres = {
        nonfiction: "non-fiction",
        fiction: "fiction",
        scifi: "sci-fi",
        childrens: "children's",
        fantasy: "fantasy"
    }


    next();
});


router.get("/", (req, res, next) => {
    console.log("Is User Authenticated?", req.isAuthenticated());
    Book.find((err, docs) => {
        if (!err) {
            res.render("index", {title: "Bookstore", books: docs});
        } else {
            console.log("Error retrieving books:", +err);
        }
    }).lean();
});

router.get("/register", (req, res, next) => {
    res.render("register");
    // { csrfToken: req.csrfToken() };
});

router.get("/login", (req, res, next) => {
    res.render(
        "login"
        // { csrfToken: req.csrfToken() });
    );
});

router.get("/logout", (req, res, next) => {
    req.session.destroy();
    res.redirect("/");
});

router.get("/basket", isAuthenticated, async (req, res, next) => {
    const userId = req.session.passport.user;

    if (userId) {
        await Basket.findOne({userId: userId}, (err, userBasket) => {
            if (!err) {
                if (userBasket) {
                    const basketItems = userBasket.items;
                    const subTotal = userBasket.subTotal;
                    const basketId = userBasket._id;

                    return res.render("basket", {
                        basketItems: basketItems,
                        subTotal: subTotal,
                        basketId: basketId,
                    });
                } else {
                    return res.render("basket", {basketItems: 0});
                }
            }
        }).lean();
    }
});

router.get("/genre/:genre", (req, res, next) => {
    const genre = req.params.genre

    Book.find({
        "genre": {
            $regex: new RegExp("^" + genre),
            $options: "i"
        }
    }, {"skus": {"$elemMatch": {"type": "Paperback"}}}).select("title imagePath author genre").lean().exec((err, result) => {

        return res.render("genre", {"books": result, "genre": result[0].genre});
    });
})


router.get("/add-to-basket/:id", (req, res, next) => {
    return res.render(
        "index"
        // { csrfToken: req.csrfToken()})
    );
});

router.get("/remove-from-basket/:id", (req, res, next) => {
    return res.render(
        "/basket"
        // { csrfToken: req.csrfToken()})
    );
});

router.get("/update-basket/:id", (req, res, next) => {
    return res.render(
        "/basket"
        // { csrfToken: req.csrfToken()})
    );
});


router.get("/stripe-checkout-session/:id", isAuthenticated, (req, res, next) => {
    return res.render("/checkout");
});

router.get("/account", isAuthenticated, (req, res, next) => {

    User.findById(req.user.id, (err, result) => {
        if (err) {
            return err;
        } else {
            return res.render("account", {layout: "account-layout", user: result});
        }
    }).lean();
});


router.get("/checkout", isAuthenticated, async (req, res, next) => {
    const userId = req.session.passport.user;
    await User.findById(userId, async (err, result) => {
        if (err) {
            return err;
        } else {
            const userAddress = result.address;
            const user = result;
            await Basket.findOne({userId: userId}, (err, userBasket) => {
                if (!err) {
                    if (userBasket) {
                        const basketItems = userBasket.items;
                        const subTotal = userBasket.subTotal;
                        const basketId = userBasket._id;
                        return res.render("checkout", {
                            user: user,
                            userAddress: userAddress,
                            items: basketItems,
                            subTotal: subTotal,
                            basketId: basketId
                        });
                    } else {
                        console.log("No basket");
                    }
                }
            }).lean();
        }
    }).lean();
});

router.get("/product/:index/:id", async (req, res, next) => {
    const bookId = req.params.id;
    const index = req.params.index
    await Book.findOne({_id: bookId}, (err, book) => {
        if (err) {
            return err;
        }
        const sku = book.skus[index]

        return res.render("product", {"book": book, "sku": sku});
    }).lean();
})


router.get("/user-wishlist", isAuthenticated, async (req, res, next) => {
    const userId = req.session.passport.user;
    await Wishlist.findOne({userId: userId}, async (err, userWishlist) => {
        const userWishlistArray = userWishlist.wishlist.map(x => x.bookId);
        await Book.find({_id: {$in: userWishlistArray}}, (err, books) => {
            const bookInfo = books.map(({title, author, imagePath}) => ({title, author, imagePath}));
            return res.render("user-wishlist", {layout: "account-layout", "bookInfo": bookInfo});
        });
    });
});

router.get("/address", isAuthenticated, (req, res, next) => {
    User.findById(req.user.id, (err, result) => {
        if (err) {
            return err;
        } else {
            const userAddress = result.address;
            return res.render("address", {
                layout: "account-layout",
                user: userAddress,
            });
        }
    }).lean();
});

router.get("/order-history", isAuthenticated, (req, res, next) => {
    const userId = req.user.id;
    Order.findOne({userId: userId}, (err, orders) => {
        const userOrders = orders.basketIds.map(x => x);
        return res.render("order-history", {layout: "account-layout", "userOrders": userOrders});
    }).lean();
});


router.get("/amendments/email", isAuthenticated, (req, res, next) => {
    return res.render("email", {layout: "account-layout"});
    // { csrfToken: req.csrfToken() });
});

router.get("/amendments/password", isAuthenticated, (req, res, next) => {
    return res.render("password", {layout: "account-layout"});
    // { csrfToken: req.csrfToken() });
});

router.get("/amendments/username", isAuthenticated, (req, res, next) => {
    return res.render("username", {layout: "account-layout"});
    // { csrfToken: req.csrfToken() });
});

module.exports = router;
