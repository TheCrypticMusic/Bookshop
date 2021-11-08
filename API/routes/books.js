const express = require("express");
const router = express.Router(); 1
const mongooseHelpers = require("../../config/mongooseHelpers")
const apiHelpers = require("../../config/apiHelpers");


// get all books or can specify a filter in the url query
// api/books?type=paperback
router.get("/", (req, res) => {
    const urlQuery = apiHelpers.createTitleCaseQuery(req.query);

    mongooseHelpers.getBooks(urlQuery).then((books) => {
        if (books.length > 0) {
            apiHelpers.sendStatus(
                200,
                "success",
                { books: books },
                "Books found",
                req,
                res
            );
        } else {
            apiHelpers.sendStatus(
                404,
                "error",
                null,
                "No books found",
                req,
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
                apiHelpers.sendStatus(
                    409,
                    "error",
                    null,
                    "Book already exists",
                    req,
                    res
                );
            } else {
                apiHelpers.sendStatus(
                    201,
                    "success",
                    { new_book: createdBook },
                    "New book created",
                    req,
                    res
                );
            }
        });
});

// get a single book
router.get("/:bookid", apiHelpers.bookExists, (req, res) => {


    mongooseHelpers.getSingleBook(res.bookid).then((book) => {
        if (book !== null) {
            apiHelpers.sendStatus(
                200,
                "success",
                { book: book },
                "Book found",
                req,
                res
            );
        } else {
            apiHelpers.sendStatus(
                404,
                "error",
                null,
                "Book not found",
                req,
                res
            );
        }
    });
});

// update single book - this can change the following fields:
// title
// author
// genre
router.put("/:bookid", apiHelpers.bookExists, (req, res) => {
    const bodyContent = req.body;


    mongooseHelpers
        .updateBookDetails(res.bookid, bodyContent)
        .then((updateSuccessful) => {
            if (updateSuccessful.nModified > 0) {
                apiHelpers.sendStatus(
                    200,
                    "success",
                    { updated_book_fields: bodyContent },
                    "Book updated",
                    req,
                    res
                );
            } else {
                apiHelpers.sendStatus(
                    422,
                    "success",
                    null,
                    "Book found but not updated due to fields already containing data sent",
                    req,
                    res
                );
            }
        });
});

// delete single book
router.delete("/:id", apiHelpers.bookExists, (req, res) => {


    mongooseHelpers.deleteBook(res.bookid).then((deletedBookResult) => {
        if (deletedBookResult.deletedCount > 0) {
            apiHelpers.sendStatus(
                200,
                "success",
                null,
                "Book deleted",
                req,
                res
            );
        }
    });
});

// add sku to existing book
router.post("/:id/skus", apiHelpers.bookExists, (req, res) => {

    const { category, quantity, price, type } = req.body;

    mongooseHelpers.createSkuForBook(res.bookid, category, quantity, price, type).then((newSku) => {
        if (newSku) {
            apiHelpers.sendStatus(201, "success", null, "Sku created for book", req, res)
        } else {
            apiHelpers.sendStatus(404, "error", null, "Type of book already exists", req, res)
        }
    });

})

// get skus related to book
router.get("/:id/skus", apiHelpers.bookExists, (req, res) => {

    mongooseHelpers.getAllSkusOfBook(res.bookid).then((bookSkus) => {
        if (bookSkus != null) {
            apiHelpers.sendStatus(200, "success", { skus: bookSkus }, "Skus found", req, res)
        } else {
            apiHelpers.sendStatus(404, "error", null, "Skus not found. Try a different book ID", req, res)
        }
    })
})

// delete all skus from book
router.delete("/:id/skus", apiHelpers.bookExists, (req, res) => {

    mongooseHelpers.deleteAllSkusFromBook(res.bookid).then((result) => {
        if (result.nModified > 0) {
            apiHelpers.sendStatus(200, "success", null, "All skus deleted from book", req, res)
        } else {
            apiHelpers.sendStatus(404, "error", null, "No skus found", req, res)
        }
    })

})



// Delete a specific sku from a book
router.delete("/:id/skus/:sku", apiHelpers.bookExists, (req, res) => {

    const skuId = req.params.sku

    mongooseHelpers.deleteBookSku(res.bookid, skuId).then((result) => {
        if (result.nModified > 0) {
            apiHelpers.sendStatus(200, "success", null, "Sku deleted from book", req, res)
        } else {
            apiHelpers.sendStatus(404, "error", null, "No sku found", req, res)
        }
    });
})


// get a single sku of a book
// You can also get infomation from the parent document
// title
// author
// imagePath

router.get("/:id/skus/:sku", apiHelpers.bookExists, (req, res) => {

    const skuId = req.params.sku;

    const filter = apiHelpers.filterBuilder(req.query);

    mongooseHelpers.getSingleSkuOfBook(res.bookid, skuId, filter).then((book) => {
        apiHelpers.sendStatus(
            200,
            "success",
            { book_sku: book },
            "Book found",
            req,
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
router.put("/:id/skus/:sku", apiHelpers.bookExists, (req, res) => {


    const skuId = req.params.sku

    const bodyContent = req.body
    const newUpdate = mongooseHelpers._updateZeroDepthSubdocumentBuilder("skus", bodyContent)

    mongooseHelpers.updateSkuForBook(res.bookid, skuId, newUpdate).then((result => {
        if (result.nModified > 0) {
            apiHelpers.sendStatus(200, "success", null, "Book sku updated", req, res)
        } else {
            apiHelpers.sendStatus(422, "error", null, "Sku found but not updated due to fields already containing data sent", req, res)
        }
        return
    }))

})



// TODO: Vaildation checks on book update (Check if same title) plus sku (check if same sku)
// TODO: Write documentation for apiHelpers + more

module.exports = router;
