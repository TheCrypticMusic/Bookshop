const Basket = require("../models/basket");
const router = require("../routes/pages");
const Book = require("../models/books");

exports.addItemToBasket = async (req, res, next) => {
    // Grab userId from passport session

    const userId = req.session.passport.user;
  
    // When form is posted the book id is added to the url
    // We can grab the bookId and query the MONGODB with this param
    const bookId = req.params.id;

    const {bookType, bookSkuId, skuIndex } = req.body


    // find Book in database
    await Book.findById(bookId, async (err, result) => {
        if (err) {
            return err;
        }      
        // deconstruct the result
        const { imagePath, title, author } = result;
        
        const price = result.skus[skuIndex].price;

        let quantity = 1;
        try {
            let userBasket = await Basket.findOne({ userId });
            if (userBasket) {
                await userBasket.add(bookSkuId, bookType, imagePath, title, author, quantity, price)
            } else {
                console.log("Initialising New Basket");
                await Basket.create({
                    userId,
                    subTotal: price,
                    items: [
                        {
                            bookImage: imagePath,
                            bookSkuId: bookSkuId,
                            bookType: bookType,
                            bookTitle: title,
                            bookAuthor: author,
                            quantity: quantity,
                            price: price,
                            total: price * quantity,
                        },
                    ],
                })
            }
        } catch (err) {
            console.log(err);
        }
    });
    res.redirect("/");
};
