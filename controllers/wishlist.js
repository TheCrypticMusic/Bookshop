const router = require("../routes/pages");
const Wishlist = require("../models/wishlist");


exports.add = async (req, res, next) => {
    const bookId = req.params.id;
    const userId = req.session.passport.user;

    await Wishlist.findOne({userId: userId}, async (err, userWishlist) => {
        if (userWishlist) {
            const userWishlistList = userWishlist.wishlist.map(x => x.bookId);

            if (userWishlistList.includes(bookId)) {
                const wishlistItemIndex = userWishlistList.indexOf(bookId);
                userWishlist.wishlist[wishlistItemIndex].remove();
                userWishlist.save();
            } else {
                userWishlist.wishlist.push({
                    bookId: bookId
                });
                userWishlist.save();
            }
        } else {
            await Wishlist.create({
                userId: userId,
                wishlist: [
                    {
                        bookId: bookId,
                    }
                ]
            });
        }
    });


    res.redirect("http://localhost:5002");
};