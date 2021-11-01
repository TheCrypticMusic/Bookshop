const Postage = require("../../models/postageCosts")
const mongoose = require("mongoose");

const Costs = [
  new Postage({
    postageTypes: [{
      postageName: "3 - 5 Days Delivery",
      postageCost: 0.00
    }, {
      postageName: "Next Day Delivery",
      postageCost: 3.99
    }, {
      postageName: "Before 12pm Delivery",
      postageCost: 5.99
    },
    ]
  })
]

mongoose
  .connect("mongodb://localhost:27017/shopping", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then((connection_obj) => {
    Costs.map(async (p, index) => {
      await p.save((err, result) => {
        if (index === Costs.length - 1) {
          console.log("DONE!");
          mongoose.disconnect();
        }
      });
    });
  })
  .catch((err) => {
    console.log(err);
  });