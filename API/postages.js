const express = require("express");
const router = express.Router();
const mongooseHelpers = require("../config/mongooseHelpers");
const apiHelpers = require("../config/apiHelpers");


// get postage document
router.get("/", (req, res) => {
    mongooseHelpers.getPostageTypes().then((postages) => {
        apiHelpers.sendStatus(200, "success", { postages: postages }, "Postages found", req, res);
    });
});

// Create new postage type
// Fields:
// postageName
// postageCost
router.post("/", (req, res) => {
    const { postageName, price } = req.body;

    mongooseHelpers.createPostageType(postageName, price).then((newPostage) => {
        if (!newPostage) {
            apiHelpers.sendStatus(404, "error", null, "Postage already exists", req, res);
        } else {
            apiHelpers.sendStatus(201, "success", null, "Postage created", req, res);
        }
    });
});

// get single postage type
router.get("/:postagetypeid", apiHelpers.postageTypeExists, (req, res) => {
    apiHelpers.sendStatus(200, "success", req.result, "Postage type found", req, res);
});

// Update existing postage type
// Fields:
// postageTypes
// postageCost
router.put("/:postagetypeid", apiHelpers.postageTypeExists, (req, res) => {
    const postageTypeId = req.params.postagetypeid;
    const updateData = req.body;

    const convertedUpdateData = mongooseHelpers._updateZeroDepthSubdocumentBuilder(
        "postageTypes",
        updateData
    );

    mongooseHelpers.updatePostageType(postageTypeId, convertedUpdateData).then((result) => {
        if (result.nModified > 0) {
            apiHelpers.sendStatus(200, "success", null, "Postage type updated", req, res);
        } else {
            apiHelpers.sendStatus(
                422,
                "error",
                null,
                "Postage type found but not updated due to fields already containing data sent",
                req,
                res
            );
        }
    });
});

// Delete postage type
router.delete("/:postagetypeid", apiHelpers.postageTypeExists, (req, res) => {
    const postageTypeId = req.params.postagetypeid;

    mongooseHelpers.deletePostageType(postageTypeId).then((result) => {
        apiHelpers.sendStatus(200, "success", null, "Postage type deleted", req, res);
    });
});

module.exports = router;
