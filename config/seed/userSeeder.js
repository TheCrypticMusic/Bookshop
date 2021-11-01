const User = require("../models/user");
const mongoose = require("mongoose");

const users = [
  new User({
    username: "DanielGibson",
    email: "testmcliveson@live.co.uk",
    password: "1",
    address: {
      addressLine1: "123 Test Lane",
      town: "Testville",
      postcode: "TE128EG",
    },
    shippingAddress: {
      addressLine1: "Test Company",
      addressLine2: "Test Department",
      town: "Testville",
      postcode: "TE452PZ",
    },
  }),
  new User({
    username: "EmilyTaylor",
    email: "testytesty@ymail.com",
    password: "1",
    address: {
      addressLine1: "ADD Ltd",
      addressLine2: "IT Department",
      town: "Testville",
      postcode: "TE128EG",
    },
    shippingAddress: {
      addressLine1: "ADD Ltd",
      addressLine2: "IT Department",
      town: "Testville",
      postcode: "TE128EG",
    },
  }),
];

mongoose
  .connect("mongodb://localhost:27017/shopping", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .catch((err) => {
    console.log(err);
  })
  .then(() => {
    console.log("Connected");
  });

users.map(async (p, index) => {
  await p.save((err, result) => {
    if (index === users.length - 1) {
      console.log("DONE!");
      mongoose.disconnect();
    }
  });
});
