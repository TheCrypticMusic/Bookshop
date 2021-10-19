const express = require("express");
const router = express.Router();
const mongooseHelpers = require("../config/mongooseHelpers");
const APIHelpers = require("../config/APIHelpers");



const bookExists = (req, res, next) => {
    const bookId = req.params.id;

    mongooseHelpers.getSingleBook(bookId).then((result) => {
        if (result === null) {
            APIHelpers.sendStatus(404, "error", null, "Book not found", req.originalUrl, res)
        } else {
            next()
        }
    })
};


// get all books or can specify a filter in the url query
// api/books?type=paperback

router.get("/", (req, res) => {
    const urlQuery = APIHelpers.createTitleCaseQuery(req.query);

    mongooseHelpers.getBooks(urlQuery).then((books) => {
        if (books.length > 0) {
            APIHelpers.sendStatus(
                201,
                "success",
                { books: books },
                "Book found",
                req.originalUrl,
                res
            );
        } else {
            APIHelpers.sendStatus(
                404,
                "error",
                null,
                "No books found",
                req.originalUrl,
                res
            );
        }
    });
});

// create new book
// This will not create skus for the book
// if you need that then you will need to use
// /api/books/{id}
router.post("/", (req, res) => {
    const { imagePath, title, author, genre } = req.body;

    mongooseHelpers
        .createBook(imagePath, title, author, genre)
        .then((createdBook) => {
            if (!createdBook) {
                APIHelpers.sendStatus(
                    409,
                    "error",
                    null,
                    "Book already exists",
                    req.originalUrl,
                    res
                );
            } else {
                APIHelpers.sendStatus(
                    201,
                    "success",
                    { new_book: createdBook },
                    "New book created",
                    req.originalUrl,
                    res
                );
            }
        });
});

// get a single book
router.get("/:id", (req, res) => {
    const bookId = req.params.id;
    mongooseHelpers.getSingleBook(bookId).then((book) => {
        if (book !== null) {
            APIHelpers.sendStatus(
                201,
                "success",
                { book: book },
                "Book found",
                req.originalUrl,
                res
            );
        } else {
            APIHelpers.sendStatus(
                404,
                "error",
                null,
                "No book found",
                req.originalUrl,
                res
            );
        }
    });
});

// update single book - this can change the following fields:
// title
// author
// genre
router.put("/:id", bookExists, (req, res) => {
    const bodyContent = req.body;
    const bookId = req.params.id;

    mongooseHelpers
        .updateBookDetails(bookId, bodyContent)
        .then((updateSuccessful) => {
            if (updateSuccessful.nModified > 0) {
                APIHelpers.sendStatus(
                    200,
                    "success",
                    { updated_book_fields: bodyContent },
                    "Book updated",
                    req.originalUrl,
                    res
                );
            } else if (updateSuccessful.n > 0) {
                APIHelpers.sendStatus(
                    422,
                    "success",
                    null,
                    "Book found but not updated due to fields already containing data sent",
                    req.originalUrl,
                    res
                );
            } else {
                APIHelpers.sendStatus(
                    404,
                    "error",
                    null,
                    "Book not found",
                    req.originalUrl,
                    res
                );
            }
        });
});

// delete single book
router.delete("/:id", bookExists, (req, res) => {
    const bookId = req.params.id;
    mongooseHelpers.deleteBook(bookId).then((deletedBookResult) => {
        if (deletedBookResult.deletedCount > 0) {
            APIHelpers.sendStatus(
                200,
                "success",
                null,
                "Book deleted",
                req.originalUrl,
                res
            );
        } else {
            APIHelpers.sendStatus(
                404,
                "error",
                null,
                "Book not found",
                req.originalUrl,
                res
            );
        }
    });
});

// add sku to existing book
router.post("/:id/skus", bookExists, (req, res) => {
    const bookId = req.params.id;
    const { category, quantity, price, type } = req.body;

    mongooseHelpers.createSkuForBook(bookId, category, quantity, price, type).then((newSku) => {
        if (newSku) {
            APIHelpers.sendStatus(201, "success", null, "Sku created for book", req.originalUrl, res)
        } else {
            APIHelpers.sendStatus(404, "error", null, "Type of book already exists", req.originalUrl, res)
        }
    });

})

// get skus related to book
router.get("/:id/skus", bookExists, (req, res) => {
    const bookId = req.params.id;

    mongooseHelpers.getAllSkusOfBook(bookId).then((bookSkus) => {
        if (bookSkus != null) {
            APIHelpers.sendStatus(200, "success", { skus: bookSkus }, "Skus found", req.originalUrl, res)
        } else {
            APIHelpers.sendStatus(404, "error", null, "Skus not found. Try a different book ID", req.originalUrl, res)
        }
    })
})

// delete all skus from book

router.delete("/:id/skus", bookExists, (req, res) => {

    const bookId = req.params.id

    mongooseHelpers.deleteAllSkusFromBook(bookId).then((result) => {
        if (result.nModified > 0) {
            APIHelpers.sendStatus(200, "success", null, "All skus deleted from book", req.originalUrl, res)
        } else {
            APIHelpers.sendStatus(404, "error", null, "No skus found", req.originalUrl, res)
        }
    })

})



// Delete a specific sku from a book
router.delete("/:id/skus/:sku", bookExists, (req, res) => {
    const bookId = req.params.id
    const skuId = req.params.sku

    mongooseHelpers.deleteBookSku(bookId, skuId).then((result) => {
        if (result.nModified > 0) {
            APIHelpers.sendStatus(200, "success", null, "Sku deleted from book", req.originalUrl, res)
        } else {
            APIHelpers.sendStatus(404, "error", null, "No sku found", req.originalUrl, res)
        }
    });
})


// get a single sku of a book
// You can also get infomation from the parent document
// title
// author
// imagePath

router.get("/:id/skus/:sku", bookExists, (req, res) => {
    const bookId = req.params.id;
    const skuId = req.params.sku;

    const filter = APIHelpers.filterBuilder(req.query);

    mongooseHelpers.getSingleSkuOfBook(bookId, skuId, filter).then((book) => {
        APIHelpers.sendStatus(
            200,
            "success",
            { book_sku: book },
            "Book found",
            req.originalUrl,
            res
        );
    });
});

// update book sku. Fields available to update:
// category
// quantity
// price
// type
// sku
router.put("/:id/skus/:sku", bookExists, (req, res) => {

    const bookId = req.params.id
    const skuId = req.params.sku

    const bodyContent = req.body
    const newUpdate = mongooseHelpers.updateZeroDepthSubdocumentBuilder("skus", bodyContent)

    mongooseHelpers.updateSkuForBook(bookId, skuId, newUpdate).then((result => {
        if (result.nModified > 0) {
            APIHelpers.sendStatus(200, "success", null, "Book sku updated", req.originalUrl, res)
        } else {
            APIHelpers.sendStatus(422, "error", null, "Sku found but not updated due to fields already containing data sent", req.originalUrl, res)
        }
        return
    }))

})



// TODO: Vaildation checks on book update (Check if same title) plus sku (check if same sku)
// TODO: Write documentation for APIHelpers + more

module.exports = router;
