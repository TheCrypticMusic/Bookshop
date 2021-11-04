const express = require("express");
const router = express.Router();
const genreController = require("../controllers/genre")

router.get("/:genre", genreController.getGenre, (req, res, next) => {
    return res.render("genre")
})

module.exports = router;

