const Basket = require("../../models/basket");
const mongooseHelpers = require("../../config/mongooseHelpers")
require("dotenv").config({ path: "./config/.env" });
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);



const basketItems = async (basketId) => {
    return Basket.findById(basketId);
};

const convertToPence = (basketItemPrice) => {
    return Math.round(basketItemPrice * 100);
};


exports.checkoutBasket = (req, res, next) => {
    const userId = req.session.passport.user;

    const userDetails = mongooseHelpers.getUser(userId);
    const userAddress = userDetails.address;

    const userBasket = mongooseHelpers.getUserBasket(userId);

    const [basketItems, subTotal, basketId] = [
        userBasket.items,
        userBasket.subTotal,
        userBasket._id,
    ];

    return res.render("checkout", {
        user: userDetails,
        userAddress: userAddress,
        items: basketItems,
        subTotal: subTotal,
        basketId: basketId,
        postage: postage,
    });
}



exports.getPostagePrices = (req, res, next) => {

    mongooseHelpers.getPostagePrices().then((postage) => {
        res.postagePrices = postage
        next()
    })
}



exports.session = async (req, res, next) => {
    const basketId = req.params.id
    const userBasket = await basketItems(basketId);
    const postageCharge = req.body.postage

    const stripeShippingCharges = {
        "6159f95d9de2c60de7162509": "shr_1JgrTlHokHPo19BTeLpMrm95",
        "6159f95d9de2c60de716250a": "shr_1JgrYWHokHPo19BTsE0oHhx8",
        "6159f95d9de2c60de716250b": "shr_1JgrZNHokHPo19BTra69G5ZV"
    }


    try {
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ["card"],
            mode: "payment",
            shipping_rates: [stripeShippingCharges[postageCharge]],
            metadata: { "basketId": `${basketId}`, "userId": `${userBasket.userId}` },
            line_items: userBasket.items.map(basketItem => {
                return {
                    price_data: {
                        currency: "gbp",
                        product_data: {
                            name: basketItem.bookTitle,
                        },
                        unit_amount: convertToPence(basketItem.price),
                    },
                    quantity: basketItem.quantity
                };
            }),
            success_url: "http://localhost:5002/",
            cancel_url: "http://localhost:5002/"
        })
        res.json({ url: session.url });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }

}
