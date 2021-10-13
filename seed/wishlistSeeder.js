const Wishlist = require("../models/wishlist");
const mongoose = require("mongoose");

const Wishlists = [
    new Wishlist({
        userId: mongoose.Types.ObjectId("6165ef18659181004cd1f55e"),
        wishlist: [
            {
                bookId: mongoose.Types.ObjectId("613f01c7ec4e7041b98cc55e")
            },
            {
                bookId: mongoose.Types.ObjectId("613f01c7ec4e7041b98cc552")
            },
            {
                bookId: mongoose.Types.ObjectId("613f01c7ec4e7041b98cc546")
            }
        ]
    }),
]



mongoose
    .connect("mongodb://localhost:27017/shopping", {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    })
    .then((connection_obj) => {
        Wishlists.map(async (p, index) => {
            await p.save((err, result) => {
                if (index === Wishlists.length - 1) {
                    console.log("DONE!");
                    mongoose.disconnect();
                }
            });
        });
    })
    .catch((err) => {
        console.log(err);
    });
