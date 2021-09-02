const mongoose = require("mongoose");

const bcrypt = require("bcryptjs");



const addressSchema = new mongoose.Schema({
  addressLine1: { type: String, required: false },
  addressLine2: { type: String, required: false },
  addressLine3: { type: String, required: false },
  town: { type: String, required: false },
  postcode: {type: String, required: false},
})

const shippingAddressSchema = new mongoose.Schema({
  addressLine1: { type: String, required: false },
  addressLine2: { type: String, required: false },
  addressLine3: { type: String, required: false },
  town: { type: String, required: false },
  postcode: {type: String, required: false},
})



const userSchema = new mongoose.Schema({
  username: { type: String, required: true},
  email: { type: String, required: true },
  password: { type: String, required: true},
  address: [addressSchema],
  shippingAddress: [shippingAddressSchema],
});

userSchema.pre("save", async function(next) {
  const user = this
  user.password = await bcrypt.hashSync(user.password, 10, function (err, hash) {
    if (err) {
      return next(err)
    }
      return next()
  })})



userSchema.methods.verifyPasswords = function(userPassword, callback) {
    return callback(null, bcrypt.compareSync(userPassword, this.password))
}

const User = mongoose.model("User", userSchema);

module.exports = User;
