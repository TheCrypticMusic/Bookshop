const Basket = require("../models/basket");
const router = require("../routes/pages");
require("dotenv").config({ path: "./config/.env" });
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const express = require("express");
const Postage = require("../models/postageCosts");
const { compareSync } = require("bcryptjs");

const basketItems = async (basketId) => {
    return Basket.findById(basketId);
};

const convertToPence = (basketItemPrice) => {
    return Math.round(basketItemPrice * 100);
};

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
