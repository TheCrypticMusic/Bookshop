const express = require("express");
const router = express.Router();
const mongooseHelpers = require("../config/mongooseHelpers")
const APIHelpers = require("../config/APIHelpers");

router.get("/", (req, res) => {

    mongooseHelpers.getPostageTypes().then((postages) => {
        APIHelpers.sendStatus(200, "success", { postages: postages }, "Postages found", req.originalUrl, res)
    })

})


// Create new postage type
router.post("/", (req, res) => {
   
    const { postageName, price } = req.body

    mongooseHelpers.createPostageType(postageName, price).then((newPostage) => {

        if (!(newPostage)) {
            APIHelpers.sendStatus(404, "error", null, "Postage already exists", req.originalUrl, res)
        } else {
            APIHelpers.sendStatus(201, "success", null, "Postage created", req.originalUrl, res)
        }
    })

})

// Update existing postage type
router.put("/:id", (req, res) => {

    const postageTypeId = req.params.id
    const updateData = req.body

    const convertedUpdateData = APIHelpers.updateSubdocumentBuilder("postageTypes", updateData)

    mongooseHelpers.updatePostageType(postageTypeId, convertedUpdateData).then((result) => {

        if (result.nModified > 0) {
            APIHelpers.sendStatus(200, "success", null, "Postage type updated", req.originalUrl, res)
        } else if (result.n > 0) {
            APIHelpers.sendStatus(422, "error", null, "Postage type found but not updated due to fields already containing data sent", req.originalUrl, res)
        } else {
            APIHelpers.sendStatus(404, "error", null, "Postage type not found", req.originalUrl, res)
        }
    })

})

// Delete postage type
router.delete("/:id", (req, res) => {

    const postageTypeId = req.params.id

    mongooseHelpers.deletePostageType(postageTypeId).then((result) => {
        if (result.nModified > 0) {
            APIHelpers.sendStatus(200, "success", null, "Postage type deleted", req.originalUrl, res)
        } else {
            APIHelpers.sendStatus(404, "error", null, "Postage type not found", req.originalUrl, res)
        }
    })

})



module.exports = router;