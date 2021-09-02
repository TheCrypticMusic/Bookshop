const Book = require("../models/books");
const mongoose = require("mongoose");




const books = [
  new Book({
    imagePath: "images/harrypotter.jpg",
    title: "Harry Potter and the Philosopher's Stone",
    author: "J.K. Rowling",
    genre: "Fantasy",
    skus: [{
      sku: null,
      quantity: 10,
      price: 15.99,
      type: "Paperback"
    },{
      sku: null,
      quantity: 10,
      price: 25.99,
      type: "Hardback"
    }]
  }),
  new Book({
    imagePath: "images/dune.jpg",
    title: "Dune",
    author: "Frank Herbert",
    genre: "Sci-Fi",
    skus: [{
      sku: null,
      quantity: 10,
      price: 15.99,
      type: "Paperback"
    },{
      sku: null,
      quantity: 10,
      price: 20.99,
      type: "Hardback"
    }]

  }),
  new Book({
    imagePath: "images/metro.jpg",
    title: "Metro 2033",
    author: "Dmitry Glukhovsky",
    genre: "Sci-Fi",
    skus: [{
      sku: null,
      quantity: 10,
      price: 15.99,
      type: "Hardback"
    },{
      sku: null,
      quantity: 10,
      price: 22.99,
      type: "Paperback"
    }]
  }),
  new Book({
    imagePath: "images/tml.jpg",
    title: "The Midnight Library",
    author: "Matt Haig",
    genre: "Fiction",
    skus: [{
      sku: null,
      quantity: 10,
      price: 15.99,
      type: "Paperback"
    },{
      sku: null,
      quantity: 10,
      price: 25.99,
      type: "Hardback"
    }]
  }),
  new Book({
    imagePath: "images/kafka.jpg",
    title: "Kafka on the Shore",
    author: "Haruki Murakami",
    genre: "Fantasy",
    skus: [{
      sku: null,
      quantity: 10,
      price: 15.99,
      type: "Paperback"
    },{
      sku: null,
      quantity: 10,
      price: 25.99,
      type: "Hardback"
    }]
  }),
  new Book({
    imagePath: "images/imperium.jpg",
    title: "Imperium",
    author: "Robert Harris",
    genre: "Fiction",
    skus: [{
      sku: null,
      quantity: 10,
      price: 15.99,
      type: "Hardback"
    },{
      sku: null,
      quantity: 10,
      price: 12.99,
      type: "Paperback"
    }]
  }),
  new Book({
    imagePath: "images/thecatcherintherye.jpg",
    title: "The Catcher in the Rye",
    author: "J. D. Salinger",
    genre: "Fiction",
    skus: [{
      sku: null,
      quantity: 10,
      price: 15.99,
      type: "Paperback"
    },{
      sku: null,
      quantity: 10,
      price: 19.99,
      type: "Hardback"
    }]
  })
];


mongoose.connect("mongodb://localhost:27017/shopping", { useNewUrlParser: true, useUnifiedTopology: true }).then(connection_obj => {
  books.map(async (p, index) => {

    await p.save((err, result) => {
      if (index === books.length - 1) {
        console.log("DONE!")
        mongoose.disconnect()
      }
    })
  })

}).catch(err => {
  console.log(err)
})
