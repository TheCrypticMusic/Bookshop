const mongoose = require("mongoose");

exports.connectToBookshopServer = (nameOfConnectionLocation) => {
    mongoose.connect("mongodb://localhost:27017/shopping", {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    });

    const db = mongoose.connection;
    db.on("Error", console.error.bind(console, "connection error:"));
    db.once("open", function () {
        console.log(
            `
***** Database Connection *****

Name: ${nameOfConnectionLocation}
Message: successfully connected to database

*******************************
    `)
    });

}
