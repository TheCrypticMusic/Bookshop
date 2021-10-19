const mongoose = require("mongoose")

const postageTypeSchema = new mongoose.Schema({
    postageName: { type: String, required: true },
    postageCost: { type: Number, required: true }
})

const postageSchema = new mongoose.Schema({
    postageTypes: [postageTypeSchema]
})

module.exports = mongoose.model("Postage", postageSchema)