const mongoose = require("mongoose");

const bcrypt = require("bcryptjs");

const addressSchema = new mongoose.Schema({
	addressLine1: { type: String },
	addressLine2: { type: String },
	town: { type: String },
	postcode: { type: String },
});

const shippingAddressSchema = new mongoose.Schema({
	addressLine1: { type: String },
	addressLine2: { type: String },
	town: { type: String },
	postcode: { type: String },
});

const roleSchema = new mongoose.Schema({
	title: { type: String, required: true },
	readAccess: { type: Boolean, required: true },
	writeAccess: { type: Boolean, required: true },
})

const userSchema = new mongoose.Schema({
	username: { type: String, required: true },
	email: { type: String, required: true },
	password: { type: String, required: true },
	address: addressSchema,
	shippingAddress: shippingAddressSchema,
	role: roleSchema

});

// hook to encrypt the password
userSchema.pre("save", async function (next) {
	if (!this.isModified("password")) {
		return next();
	}
	this.password = bcrypt.hashSync(this.password, 10, function (err, hash) {
		if (err) {
			return next(err);
		}
		return next();
	});
});

userSchema.pre("updateOne", async function (next) {
	try {
		if (this._update.password) {
			const hashed = bcrypt.hashSync(this._update.password, 10)
			this._update.password = hashed;
		}
		next();
	} catch (err) {
		return next(err);
	}
});

userSchema.methods.comparePassword = function (password, cb) {
	return cb(null, bcrypt.compareSync(password, this.password));
};

const User = mongoose.model("User", userSchema);

module.exports = User;
