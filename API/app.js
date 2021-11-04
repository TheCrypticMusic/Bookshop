const express = require("express");
const apiApp = express();
const MongoStore = require("connect-mongo");
const session = require("express-session");
const dbConnection = require("../config/dbConnection")

dbConnection.connectToBookshopServer("API")


apiApp.use(express.json());
apiApp.use(express.urlencoded({ extended: false }));

apiApp.use(
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



//API Routes
apiApp.use("/api/books", require("./routes/books"))
apiApp.use("/api/baskets", require("./routes/baskets"))
apiApp.use("/api/postages", require("./routes/postages"))
apiApp.use("/api/orders", require("./routes/orders"))
apiApp.use("/api/wishlists", require("./routes/wishlists"))
apiApp.use("/api/users", require("./routes/users"))




const apiPortNumber = 5003

apiApp.listen(apiPortNumber, () => {
    console.log(`API server started on Port ${apiPortNumber}`);
});
