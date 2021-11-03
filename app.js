const express = require("express");
const path = require("path");
require("dotenv").config({ path: "./config/.env" })
const cookieParser = require("cookie-parser");
const expressHbs = require("express-handlebars");
const session = require("express-session");
const passport = require("passport");
const flash = require("connect-flash");
const mongoose = require("mongoose");
const MongoStore = require("connect-mongo");
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY)
const bodyParser = require("body-parser")
const Order = require("./models/completedOrders")
const Basket = require("./models/basket")
require("./config/passport");
const Wishlist = require("./models/wishlist")
const websiteApp = express();
const apiApp = express();
const cmsApp = express();


mongoose.connect("mongodb://localhost:27017/shopping", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

const db = mongoose.connection;
db.on("Error", console.error.bind(console, "connection error:"));
db.once("open", function () {
    console.log("Database Opened Succcesfully")
});




// WEBSITE SETUP (I will be moving website, CMS, API into separate files )
const websitePublicDirectory = path.join(__dirname, "./Website/public/");
const websiteScriptDirectory = path.join(__dirname, "./Website/scripts")

// Allow nodejs to use styles, js, html in the public folder
websiteApp.use(express.static(websitePublicDirectory));
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
        store: MongoStore.create({
            mongoUrl: "mongodb://localhost:27017/shopping",
        }),
    })
);

websiteApp.use(flash());
websiteApp.use(passport.initialize());
websiteApp.use(passport.session());

const hbs = expressHbs.create({
    defaultLayout: "layout",
    layoutsDir: path.join(__dirname, "./Website/views/layouts"),
    partialsDir: path.join(__dirname, "./Website/views/partials"),
    helpers: require("./config/handlebars-helpers"),

});


websiteApp.engine("handlebars", hbs.engine);
websiteApp.set("view engine", "handlebars");
websiteApp.set("views", [
    path.join(__dirname, "./Website/views"),
    path.join(__dirname, "./Website/views/account")
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

// Website Routes


websiteApp.use("/", require("./Website/routes"));
websiteApp.use("/basket", require("./Website/routes/basket"))
websiteApp.use("/account", require("./Website/routes/account"))
websiteApp.use("/checkout", require("./Website/routes/checkout"))
websiteApp.use("/wishlist", require("./Website/routes/wishlist"))


// API Setup (I will be moving website, CMS, API into separate files)

websiteApp.use(express.json());

apiApp.use(express.json());
apiApp.use(express.urlencoded({ extended: false }));

//API Routes
apiApp.use("/api/books", require("./API/books"))
apiApp.use("/api/baskets", require("./API/baskets"))
apiApp.use("/api/postages", require("./API/postages"))
apiApp.use("/api/orders", require("./API/orders"))
apiApp.use("/api/wishlists", require("./API/wishlists"))
apiApp.use("/api/users", require("./API/users"))



// CMS Setup (I will be moving website, CMS, API into separate files)

cmsApp.use(express.json());



// TODO: MOVE THIS INTO CONTROLLER FOLDER
websiteApp.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
    const event = req.body;
    if (event.type === "charge.succeeded") {
        console.log("Logging to Database")

    } else if (event.type === "checkout.session.completed") {
        const { userId, basketId } = event.data.object.metadata
        await Basket.findOne({ userId: userId }, (err, userBasket) => {
            Order.findOne({ userId: userId }, (err, userOrder) => {
                if (userOrder) {
                    userOrder.basketIds.push({
                        basketId: userBasket._id,
                        subTotal: userBasket.subTotal,
                        items: userBasket.items.map(x => x)
                    })
                    userOrder.save().then(() => {
                        userBasket.remove()
                    })
                } else {
                    Order.create(
                        {
                            userId: userBasket.userId,
                            basketIds: [
                                {
                                    basketId: userBasket._id,
                                    subTotal: userBasket.subTotal,
                                    order: userBasket.items.map(x => x)
                                }
                            ]
                        }
                    ).then(() => {
                        userBasket.remove()
                    })
                }
            })
        })
    }
    return res.json({ received: true })
})


const websitePortNumber = 5002
const apiPortNumber = 5003
const cmsPortNumber = 5004


websiteApp.listen(5002, () => {
    console.log(`Website server started on Port ${websitePortNumber}`);
});

apiApp.listen(5003, () => {
    console.log(`API server started on Port ${apiPortNumber}`)
})

cmsApp.listen(5004, () => {
    console.log(`CMS server started on Port ${cmsPortNumber}`)
})

