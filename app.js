const express = require("express");
const path = require("path");
require("dotenv").config({path: "./config/.env"})
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
const {use} = require("express/lib/router");
const {env} = require("express-handlebars/.eslintrc");

const app = express();

mongoose.connect("mongodb://localhost:27017/shopping", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

const db = mongoose.connection;
db.on("Error", console.error.bind(console, "connection error:"));
db.once("open", function () {
    console.log("Database Opened Succcesfully")
});

const publicDirectory = path.join(__dirname, "./public");
const scriptDirectory = path.join(__dirname, "./scripts")

// Allow nodejs to use styles, js, html in the public folder
app.use(express.static(publicDirectory));
app.use(express.static(scriptDirectory))

// Parse URL-Encoded bodies (as sent by HTML forms)
app.use(express.urlencoded({extended: false}));

// Parse JSON bodies (as sent by HTML forms)
app.use(express.json());

app.use(cookieParser());
app.set("trust proxy", 1);
app.use(
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

app.use(flash());
app.use(passport.initialize());
app.use(passport.session());

const hbs = expressHbs.create({
    defaultLayout: "layout",
    layoutsDir: path.join(__dirname, "views/layouts"),
    partialsDir: path.join(__dirname, "views/partials"),
    helpers: require("./config/handlebars-helpers"),

});


app.engine("handlebars", hbs.engine);
app.set("view engine", "handlebars");
app.set("views", [
        path.join(__dirname, "views"),
        path.join(__dirname, "views/account")
    ]
)

//Define Routes
app.use("/", require("./routes/pages"));

app.use("/auth", require("./routes/auth"));

app.use("/amendments", require("./routes/amendments"))

app.use("/add-to-basket", require("./routes/addToBasket"))
app.use("/remove-from-basket", require("./routes/removeFromBasket"))
app.use("/update-basket", require("./routes/updateBasket"))
app.use("/stripe-checkout-session", require("./routes/checkoutSession"))
app.use("/wishlist", require("./routes/wishlist"))

app.post('/webhook', express.raw({type: 'application/json'}), async (req, res) => {
    const event = req.body;

    console.log(event)
    if (event.type === "charge.succeeded") {
        console.log("Logging to Database")

    } else if (event.type === "checkout.session.completed") {
        const {userId, basketId} = event.data.object.metadata
        console.log(userId, basketId)
        await Basket.findOne({userId: userId}, (err, userBasket) => {
            Order.findOne({userId: userId}, (err, userOrder) => {
                if (userOrder) {
                    userOrder.basketIds.push({
                        basketId: userBasket._id,
                        subTotal: userBasket.subTotal,
                        order: userBasket.items.map(x => x)
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

    return res.json({received: true})
})


app.listen(5002, () => {
    console.log("Server started on Port 5002");
});
