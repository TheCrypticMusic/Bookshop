const mongooseHelpers = require("../../config/mongooseHelpers")

exports.userHasBasket = (req, res, next) => {
    const userId = req.session.passport.user;

    mongooseHelpers.getUserBasket(userId).then((userBasket) => {
        if (userBasket) {
            next();
        } else {
            mongooseHelpers.createUserBasket(userId).then((basketCreationSuccessful) => {
                if (basketCreationSuccessful) {
                    next();
                } else {
                    res.status(404).send("An error occurred");
                }

            });
        }
    });
};

exports.addItemToBasket = (req, res, next) => {
    const userId = req.session.passport.user;
    // When form is posted the book id is added to the url
    // We can grab the bookId and query the MONGODB with this param
    const bookId = req.params.id;

    const {
        bookSkuId,
        quantity
    } = req.body;

    mongooseHelpers.addBookToBasket(userId, bookId, bookSkuId, quantity).then(() => {
        next()
    });
};


exports.getUserBasket = (req, res, next) => {
    const userId = req.session.passport.user;
    mongooseHelpers.getUserBasket(userId).then((userBasket) => {

        if (userBasket) {
            const [basketItems, subTotal, basketId] = [
                userBasket.items,
                userBasket.subTotal,
                userBasket._id,
            ];

            res.basket = {
                "basketItems": basketItems,
                "subTotal": subTotal,
                "basketId": basketId
            }
            next()
        } else {
            res.basket = false
            next()
        }
    })
}

exports.deleteItemFromBasket = (req, res, next) => {
    const bookSkuId = req.params.id

    const userId = req.session.passport.user;

    mongooseHelpers.deleteItemFromBasket(userId, bookSkuId).then(() => {
        next()
    })
}

exports.updateBasket = (req, res, next) => {

    const { items } = req.body;
    const userId = req.session.passport.user;

    const qty = Object.values(items).map(x => parseInt(x.basketData.qty));
    const basketItemIds = Object.keys(items).map(x => x)

    mongooseHelpers.updateBasketItemQuantity(userId, basketItemIds, qty).then(() => {
        next()
    })
};