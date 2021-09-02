const mongoose = require("mongoose");

/**
 *
 * @param {String} titleOfBook
 * @param {String} typeOfBook
 */
const skuCreator = (titleOfBook, typeOfBook) => {
  // grab first letter of the type of book
  const firstLetterOfType = typeOfBook[0] + typeOfBook[typeOfBook.length - 1];
  // grab first letters of book title if they are capitals
  const firstLettersOfBookTitle = titleOfBook
    .split(" ")
    .filter((x) => x[0] == x[0].toUpperCase())
    .map((x) => x[0]);
  const sku = firstLettersOfBookTitle.join("") + firstLetterOfType;
  console.log(sku.toUpperCase());
  return sku.toUpperCase();
};

const skuSchema = new mongoose.Schema({
  sku: { type: String, required: false },
  quantity: { type: Number, required: true },
  price: { type: Number, required: true },
  type: { type: String, requred: true },
});

const bookSchema = new mongoose.Schema({
  imagePath: { type: String, required: true },
  title: { type: String, required: true },
  author: { type: String, required: true },
  genre: { type: String, required: true },
  skus: [skuSchema],
});

bookSchema.pre("save", async function (next) {
  const book = this;
  for (let index = 0; index < book.skus.length; index++) {
    book.skus[index].sku = await skuCreator(
      book.title,
      book.skus[index].type,
    );

  }
  next()
});

const Book = mongoose.model("Book", bookSchema);

module.exports = Book;
