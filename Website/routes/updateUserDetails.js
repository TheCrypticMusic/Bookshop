const express = require("express");
const amendmentController = require("../controllers/updateUserDetails");
const userValidationController = require("../controllers/userValidation")
const router = express.Router();

router.post(
	"/email",
	userValidationController.validateEmail,
	userValidationController.validatePassword,
	amendmentController.updateEmail
);

router.post(
	"/password",
	userValidationController.validatePassword,
	userValidationController.checkPasswordsMatch,
	amendmentController.updateUserPassword
);

router.post("/username", userValidationController.validateUsername, amendmentController.updateUsername);

router.post("/addressDetails", amendmentController.addressDetails);

module.exports = router;
