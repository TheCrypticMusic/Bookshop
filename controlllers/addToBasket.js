const Basket = require("../models/basket");
const router = require("../routes/pages");
const Book = require("../models/books");

exports.addItemToBasket = async (req, res, next) => {
    // Grab userId from passport session

    const userId = req.session.passport.user;

    // When form is posted the book id is added to the url
    // We can grab the bookId and query the MONGODB with this param
    const bookId = req.params.id;

    // find Book in database
    await Book.findById(bookId, async (err, result) => {
        if (err) {
            return err;
        }
        // deconstruct the result
        const { title, author } = result;

        //TODO - for testing purposes I am using the paperback price

        const price = result.skus[0].price;

        

        let quantity = 1;
        try {
            let userBasket = await Basket.findOne({ userId });
            if (userBasket) {
                let bookCartIndex = userBasket.items.findIndex(
                    (book) => book.bookId == bookId
                );

                if (bookCartIndex > -1) {
                    let bookItem = userBasket.items[bookCartIndex];
                    bookItem.quantity += 1;
                    bookItem.total = bookItem.price * bookItem.quantity;
                    console.log(
                        "\n" + title,
                        "already in basket: \nQuantity:",
                        bookItem.quantity,
                        "\nTotal:",
                        bookItem.total
                    );
                } else {
                    console.log(title, "Added to basket");
                    userBasket.items.push({
                        bookId: bookId,
                        bookTitle: title,
                        bookAuthor: author,
                        quantity: quantity,
                        price: price,
                        total: price * quantity,
                    });
                }
                userBasket.subTotal = userBasket.items.map(x => x.total).reduce((a, b) => a + b, 0)
                console.log("Complete Basket Value:", userBasket.subTotal)
                await userBasket.save();
            } else {
                console.log("Initialising New Basket");
                await Basket.create({
                    userId,
                    subTotal: price,
                    items: [
                        {
                            bookId: bookId,
                            bookTitle: title,
                            bookAuthor: author,
                            quantity: quantity,
                            price: price,
                            total: price * quantity,
                        },
                    ],
                });
            }
        } catch (err) {
            console.log(err);
        }
    });
    // res.send(req.params)
    res.redirect("/");
};
