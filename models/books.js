const mongoose = require("mongoose");

const skuCreator = async (titleOfBook, authorOfBook, typeOfBook) => {

    const firstLettersOfTitle = titleOfBook.split(" ").length > 1 ? titleOfBook
        .split(" ")
        .filter((x) => x[0] == x[0].toUpperCase())
        .map((x) => x[0]).join("") : titleOfBook[0]

    const firstLettersOfAuthor = authorOfBook
        .split(" ")
        .filter((x) => x[0] == x[0].toUpperCase())
        .map((x) => x[0]);
    
    const firstLetterAndLastLetterOfType = typeOfBook[0] + typeOfBook[typeOfBook.length - 1];
    
    const sku = (firstLettersOfTitle + firstLettersOfAuthor.join("") + firstLetterAndLastLetterOfType).toUpperCase()
    return sku
};

const skuSchema = new mongoose.Schema({
    sku: { type: String, required: false },
    category: { type: String },
    quantity: { type: Number, required: true },
    price: { type: Number, required: true },
    type: { type: String, required: true },
});


const bookSchema = new mongoose.Schema({
    imagePath: { type: String, required: true },
    title: { type: String, required: true },
    author: { type: String, required: true },
    genre: { type: String, required: true },

    skus: [skuSchema],
});

bookSchema.post("updateOne", async function (doc, next) {

    const book = await this.model.findOne(this.getQuery());

    const isPullOrSetOnSku = Object.keys(this._update)[0] == "$pull" || "$set"
    
    if (isPullOrSetOnSku) {
        next()
    }
    
    const latestSku = book.skus[book.skus.length - 1]

    skuCreator(book.title, book.author, latestSku.type).then(sku => {
        latestSku.set({ "sku": sku })
        book.save().then(() => {
            next();
        })

    })
});

const Book = mongoose.model("Book", bookSchema);

module.exports = Book;
