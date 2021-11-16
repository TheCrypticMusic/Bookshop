const express = require("express");
const path = require("path");
require("dotenv").config({ path: "../config/.env" })
const cookieParser = require("cookie-parser");
const expressHbs = require("express-handlebars");
const session = require("express-session");
const passport = require("passport");
const flash = require("connect-flash");
const MongoStore = require("connect-mongo");
require("../config/passport");
const cmsApp = express();
const dbConnection = require("../config/dbConnection")


dbConnection.connectToBookshopServer("CMS")

cmsApp.use(express.json());
cmsApp.use(express.urlencoded({ extended: true }))

const cmsPublicDirectory = path.join(__dirname, "./public");
const cmsScriptDirectory = path.join(__dirname, "./scripts");


cmsApp.use(express.static(cmsPublicDirectory));
cmsApp.use(express.static(cmsScriptDirectory))


cmsApp.use(cookieParser());

cmsApp.use(
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

cmsApp.use(flash());
cmsApp.use(passport.initialize());
cmsApp.use(passport.session());

const hbs = expressHbs.create({
    defaultLayout: "layout",
    layoutsDir: path.join(__dirname, "./views/layouts"),
    partialsDir: path.join(__dirname, "./views/partials"),
    helpers: require("../config/handlebars-helpers"),

});

cmsApp.engine("handlebars", hbs.engine);
cmsApp.set("view engine", "handlebars");
cmsApp.set("views", [
    path.join(__dirname, "./views"),
]
)

cmsApp.use((req, res, next) => {

    res.locals.success = req.flash('success')
    res.locals.error = req.flash('error')
    res.locals.section = req.url
    next()

})

// cms routes
cmsApp.use("/", require("./routes/index"))
cmsApp.use("/dashboard", require("./routes/dashboard"))
cmsApp.use("/books", require("./routes/books"))
cmsApp.use("/users", require("./routes/users"))

const cmsPortNumber = 5004

cmsApp.listen(cmsPortNumber, () => {
    console.log(`CMS server started on Port ${cmsPortNumber}`);
});
