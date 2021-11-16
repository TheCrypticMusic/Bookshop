const express = require("express");
const path = require("path");
require("dotenv").config({ path: "../config/.env" })
const cookieParser = require("cookie-parser");
const expressHbs = require("express-handlebars");
const session = require("express-session");
const passport = require("passport");
const flash = require("connect-flash");
const connection = require("../config/dbConnection")
const MongoStore = require("connect-mongo");
require("../config/passport");
const Wishlist = require("../models/wishlist")
const websiteApp = express();


connection.connectToBookshopServer("Website")




const websitePublicDirectory = path.join(__dirname, "./public");
const websiteScriptDirectory = path.join(__dirname, "./scripts");

websiteApp.use(express.static(websitePublicDirectory));
websiteApp.use(express.static(websiteScriptDirectory))


websiteApp.use(express.static(websiteScriptDirectory))

// Parse URL-Encoded bodies (as sent by HTML forms)
websiteApp.use(express.urlencoded({ extended: false }));

// Parse JSON bodies (as sent by HTML forms)
websiteApp.use(express.json());

websiteApp.use(cookieParser());


websiteApp.set("trust proxy", 1);
websiteApp.use(
    session({
        secret: "test123",
        name: "test",
        resave: false,
        saveUninitialized: false,
        cookie: {
            httpOnly: true,
            secure: false,
            sameSite: true,
            // 1 day cookie
            maxAge: 24 * 60 * 60 * 1000,
        },
        // store: MongoStore.create({
        //     mongoUrl: "mongodb://localhost:27017/shopping",
        // }),
    })
);


websiteApp.use(flash());
websiteApp.use(passport.initialize());
websiteApp.use(passport.session());

const hbs = expressHbs.create({
    defaultLayout: "layout",
    layoutsDir: path.join(__dirname, "./views/layouts"),
    partialsDir: path.join(__dirname, "./views/partials"),
    helpers: require("../config/handlebars-helpers"),

});

websiteApp.engine("handlebars", hbs.engine);
websiteApp.set("view engine", "handlebars");
websiteApp.set("views", [
    path.join(__dirname, "./views"),
    path.join(__dirname, "./views/account")
]
)

websiteApp.use(async (req, res, next) => {

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

websiteApp.use("/", require("./routes"));
websiteApp.use("/basket", require("./routes/basket"))
websiteApp.use("/account", require("./routes/account"))
websiteApp.use("/checkout", require("./routes/checkout"))
websiteApp.use("/wishlist", require("./routes/wishlist"))
websiteApp.use("/book", require("./routes/book"))
websiteApp.use("/webhook", require("./routes/webhook"))
websiteApp.use("/genre", require("./routes/genre"))

const WEBSITEPORTNUMBER = 5002
const HOST = '0.0.0.0';
websiteApp.listen(WEBSITEPORTNUMBER, () => {
    console.log(`Website server started on Port ${WEBSITEPORTNUMBER}`);
});
