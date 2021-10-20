const express = require("express");
const csrf = require("csurf");
const router = express.Router();
const Wishlist = require("../models/wishlist");
const mongooseHelpers = require("../config/mongooseHelpers");



// const csrfProtection = csrf();

const isAuthenticated = (req, res, next) => {
    if (req.isAuthenticated()) {
        next();
    } else {
        res.redirect("/login");
    }
};

// Checks to see if the user has items in their basket, if they do then they are allowed to access the checkout screen
const allowedToAccessPaymentScreen = async (req, res, next) => {
    const userId = req.session.passport.user;
    mongooseHelpers.getUserBasket(userId).then((userBasket) => {
        userBasket.items.length > 0 ? next() : res.redirect("/basket")
    })


};

// router.use(csrfProtection);

router.use(async (req, res, next) => {
    res.locals.isAuthenticated = req.isAuthenticated();
    if (req.isAuthenticated()) {
        res.locals.user = req.user.username;
    }
    res.locals.session = req.session;
    res.locals.section = req.url;
    if (req.session.passport) {
        await Wishlist.findOne(
            { userId: req.session.passport.user },
            (err, results) => {
                if (results) {
                    res.locals.userWishlist = results.wishlist.map((x) => x.bookId);
                }
            }
        );
    }
    res.locals.genres = {
        nonfiction: "non-fiction",
        fiction: "fiction",
        scifi: "sci-fi",
        childrens: "children's",
        fantasy: "fantasy",
    };
    res.locals.success = req.flash('success')
    res.locals.error = req.flash('error')
    next();
});

router.get("/", async (req, res, next) => {

    console.log("Is User Authenticated?", req.isAuthenticated());
    mongooseHelpers.getBooks({}).then(books => {
        return res.render("index", { title: "Bookstore", books: books });
    })

});

router.get("/register", (req, res, next) => {
    res.render("register");
    // { csrfToken: req.csrfToken() };
});

router.get("/login", (req, res, next) => {
    res.render("login");
    // { csrfToken: req.csrfToken() });
});

router.get("/logout", (req, res, next) => {
    req.session.destroy();
    res.redirect("/");
});

router.get("/basket", isAuthenticated, async (req, res, next) => {
    const userId = req.session.passport.user;
    const userBasket = await mongooseHelpers.getUserBasket(userId);
    if (userBasket) {
        const [basketItems, subTotal, basketId] = [
            userBasket.items,
            userBasket.subTotal,
            userBasket._id,
        ];

        return res.render("basket", {
            basketItems: basketItems,
            subTotal: subTotal,
            basketId: basketId,
        });
    }
    return res.render("basket", { basketItems: 0 });
});

router.get("/genre/:genre", async (req, res, next) => {
    const genre = req.params.genre;

    mongooseHelpers.getBookGenre(genre).then(books => {
        console.log(books)
        const pageHeader = books[0].genre;

        return res.render("genre", { books: books, genre: pageHeader });
    })

});

router.get("/add-to-basket/:id", (req, res, next) => {
    return res.render(
        "index"
        // { csrfToken: req.csrfToken()})
    );
});

router.get("/delete-from-basket/:id", (req, res) => {
    return res.render("basket")
})


router.get("/update-basket/:id", (req, res, next) => {
    return res.render(
        "/basket"
        // { csrfToken: req.csrfToken()})
    );
});

router.get(
    "/stripe-checkout-session/:id",
    isAuthenticated,
    (req, res, next) => {
        return res.render("/checkout");
    }
);

router.get("/account", isAuthenticated, async (req, res, next) => {
    const userId = req.session.passport.user;

    const userDetails = await mongooseHelpers.getUser(userId);

    return res.render("account", { layout: "account-layout", user: userDetails });
});

router.get(
    "/checkout",
    isAuthenticated,
    allowedToAccessPaymentScreen,
    async (req, res, next) => {
        const userId = req.session.passport.user;

        const postage = await mongooseHelpers.getPostagePrices();
        const userDetails = await mongooseHelpers.getUser(userId);
        const userAddress = userDetails.address;

        const userBasket = await mongooseHelpers.getUserBasket(userId);

        const [basketItems, subTotal, basketId] = [
            userBasket.items,
            userBasket.subTotal,
            userBasket._id,
        ];

        return res.render("checkout", {
            user: userDetails,
            userAddress: userAddress,
            items: basketItems,
            subTotal: subTotal,
            basketId: basketId,
            postage: postage,
        });
    }
);

router.get("/book/:bookId/:skuId", async (req, res, next) => {
    const bookId = req.params.bookId;
    const skuId = req.params.skuId;

    mongooseHelpers.getSingleSkuOfBook(bookId, skuId, ["title", "author", "imagePath"]).then((bookSku) => {

        const skuDetails = bookSku.skus[0];

        return res.render("product", { book: bookSku, sku: skuDetails });
    })


});


router.get("/user-wishlist", isAuthenticated, async (req, res, next) => {
    const userId = req.session.passport.user;

    const bookInfo = await mongooseHelpers.getUserWishlist(userId);

    return res.render("user-wishlist", {
        layout: "account-layout",
        bookInfo: bookInfo,
    });
});

router.get("/address", isAuthenticated, async (req, res, next) => {
    const userId = req.session.passport.user;
    const userDetails = await mongooseHelpers.getUser(userId);

    const userAddress = userDetails.address;

    return res.render("address", {
        layout: "account-layout",
        user: userAddress,
    });
});

router.get("/order-history", isAuthenticated, async (req, res, next) => {
    const userId = req.session.passport.user;

    mongooseHelpers.getUserOrders(userId).then((orders) => {
        if (orders) {
            const userOrders = orders.basketIds.map((x) => x);
            return res.render("order-history", {
                layout: "account-layout",
                userOrders: userOrders,
            });
        } else {
            return res.render("order-history", {
                layout: "account-layout",
            })
        }
    });
})

router.get("/amendments/email", isAuthenticated, (req, res, next) => {
    return res.render("email", { layout: "account-layout" });
    // { csrfToken: req.csrfToken() });
});

router.get("/amendments/password", isAuthenticated, (req, res, next) => {
    return res.render("password", { layout: "account-layout" });
    // { csrfToken: req.csrfToken() });
});

router.get("/amendments/username", isAuthenticated, async (req, res, next) => {
    const userId = req.session.passport.user;

    mongooseHelpers.getUser(userId).then(result => {
        const username = result.username
        res.render("username", { layout: "account-layout", "username": username });
    })

    // { csrfToken: req.csrfToken() });
});

router.get(
    "/amendments/address-details",
    isAuthenticated,
    async (req, res, next) => {
        const userId = req.session.passport.user;
        const userDetails = await mongooseHelpers.getUser(userId);

        const userAddress = userDetails.address;

        return res.render("address-details", {
            layout: "account-layout",
            user: userAddress,
        });
    }
);

module.exports = router;
