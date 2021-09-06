const express = require("express");
const path = require("path");
const dotenv = require("dotenv");
const cookieParser = require("cookie-parser");
const expressHbs = require("express-handlebars");
const session = require("express-session");
const passport = require("passport");
const flash = require("connect-flash");
const mongoose = require("mongoose");

const MongoStore = require("connect-mongo");

dotenv.config({
  path: "./config/.env",
});

require("./config/passport");

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

// Allow nodejs to use styles, js, html in the public folder
app.use(express.static(publicDirectory));

// Parse URL-Encoded bodies (as sent by HTML forms)
app.use(express.urlencoded({ extended: false }));

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
  helpers: require("./config/handlebars-helpers")
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

app.listen(5002, () => {
  console.log("Server started on Port 5002");
});
