const Order = require("../models/completedOrders");
const mongoose = require("mongoose");

const completedOrders = [
    new Order({
        userId: "testId",
        basketIds: [
            {
                basketId: "1234",
                order: [
                    {
                        bookImage: "test",
                        bookSkuId: "test",
                        bookType: "Paperback",
                        bookTitle: "Harry Potter",
                        bookAuthor: "J.K Rowling",
                        quantity: 12,
                        price: 12.99,
                        total: 30.00
                    },
                    {
                        bookImage: "test",
                        bookSkuId: "test",
                        bookType: "Paperback",
                        bookTitle: "Harry Potter",
                        bookAuthor: "J.K Rowling",
                        quantity: 12,
                        price: 12.99,
                        total: 30.00
                    },
                ]
            },
            {
                basketId: "122222",
                order: [
                    {
                        bookImage: "test",
                        bookSkuId: "test",
                        bookType: "Paperback",
                        bookTitle: "Harry Potter",
                        bookAuthor: "J.K Rowling",
                        quantity: 12,
                        price: 12.99,
                        total: 30.00
                    },
                    {
                        bookImage: "test",
                        bookSkuId: "test",
                        bookType: "Paperback",
                        bookTitle: "Harry Potter",
                        bookAuthor: "J.K Rowling",
                        quantity: 12,
                        price: 12.99,
                        total: 30.00
                    },
                ]
            }
        ]
    })
];

mongoose
    .connect("mongodb://localhost:27017/shopping", {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    })
    .then((connection_obj) => {
        completedOrders.map(async (p, index) => {
            await p.save((err, result) => {
                if (index === completedOrders.length - 1) {
                    console.log("DONE!");
                    mongoose.disconnect();
                }
            });
        });
    })
    .catch((err) => {
        console.log(err);
    });
