const mongooseHelpers = require("../config/mongooseHelpers");

exports.userHasBasket = async (req, res, next) => {
	const userId = req.session.passport.user;

	mongooseHelpers.getUserBasket(userId).then((userBasket) => {
		if (userBasket) {
			next();
		} else {
			mongooseHelpers.createUserBasket(userId).then((basketCreationSuccessful) => {
				if (basketCreationSuccessful) {
					next();
				}
				res.status(404).send("An error occurred");
			});
		}
	});
};

exports.addItemToBasket = async (req, res, next) => {
	const userId = req.session.passport.user;
	// When form is posted the book id is added to the url
	// We can grab the bookId and query the MONGODB with this param
	const bookId = req.params.id;

	const { bookSkuId, quantity } = req.body;

	mongooseHelpers.addBookToBasket(userId, bookId, bookSkuId, quantity).then(() => {
		res.redirect("/");
	});
};
