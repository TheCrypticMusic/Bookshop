const express = require("express");
const wishlistController = require("../controllers/wishlist.js");
const router = express.Router();

router.post("/:id", wishlistController.userHasWishlist, wishlistController.itemInWishlist);

module.exports = router;