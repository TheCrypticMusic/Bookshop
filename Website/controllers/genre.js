const mongooseHelpers = require("../../config/mongooseHelpers")

exports.getGenre = (req, res, next) => {
    const genre = req.params.genre;

    mongooseHelpers.getBookGenre(genre).then(books => {

        const pageHeader = books[0].genre;

        return res.render("genre", { books: books, genre: pageHeader });
    })
}