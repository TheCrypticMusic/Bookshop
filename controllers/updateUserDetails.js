const mongooseHelpers = require("../config/mongooseHelpers")

exports.email = (req, res, next) => {
    const { newEmail, password } = req.body;
    const userId = req.session.passport.user;

    mongooseHelpers.updateEmail(userId, newEmail, password).then((successfulUpdate => {
        if (successfulUpdate) {
            req.success = req.flash("success", "Email changed to", newEmail)
            res.redirect(req.originalUrl)
        } else {
            req.error = req.flash("error", "Email already exists:", newEmail)
            res.redirect(req.originalUrl)
        }
    }))
};

exports.password = async (req, res, next) => {
    const { newPassword, newPasswordConfirm } = req.body;
    const userId = req.session.passport.user;

    mongooseHelpers.updatePassword(userId, newPassword, newPasswordConfirm).then(successfullUpdate => {
        if (successfullUpdate) {
            req.success = req.flash("success", "Password changed")
            res.redirect(req.originalUrl)
        } else {
            req.success = req.flash("error", "Passwords do not match")
            res.redirect(req.originalUrl)
        }
    })
    // await User.findById(userId, async (err, user) => {
    // 	if (err) {
    // 		console.log("Password Change Error: error occurred:", err);
    // 	}
    // 	user.encryptNewPassword(newPassword, (err, password) => {
    // 		if (err) {
    // 			return err;
    // 		} else {
    // 			User.findByIdAndUpdate(
    // 				{ _id: userId },
    // 				{ password: password },
    // 				(err, result) => {
    // 					if (err) {
    // 						return res.send(err);
    // 					} else {
    // 						res.render("password", { message: "Password changed" });
    // 					}
    // 				}
    // 			);
    // 		}
    // 	});
    // });
};

exports.username = async (req, res, next) => {
    const userId = req.session.passport.user;
    const { newUsername } = req.body

    mongooseHelpers.updateUsername(userId, newUsername).then(successfulUpdate => {
        if (successfulUpdate) {
            req.flash("success", "Username successfully changed to", newUsername)
            res.redirect(req.originalUrl)
        } else {
            req.flash("error", "Username already in use:", newUsername + ". Please choose another one")
            res.redirect(req.originalUrl)
        }
    })
}

//   const { oldUsername, newUsername } = req.body;
//   const userId = req.session.passport.user;

//   await User.findOne({ username: newUsername }, async (err, docs) => {
//     if (docs) {
//       console.log("Username already taken:", docs);
//       return res.render("username", { message: "Username already taken" });
//     } else {
//       await User.findById(userId, async (err, user) => {
//         if (err) {
//           console.log("Password Change Error: error occurred:", err);
//         } else {
//           User.findByIdAndUpdate(
//             { _id: userId },
//             { username: newUsername },
//             (err, result) => {
//               if (err) {
//                 return res.send(err);
//               } else {
//                 res.render("username", { message: "Username changed" });
//               }
//             }
//           );
//         }
//       });
//     }
//   });
// };

exports.addressDetails = async (req, res, next) => {
    const { addressLine1, addressLine2, town, postcode } = req.body
    const userId = req.session.passport.user

    await User.findOneAndUpdate({ _id: userId },
        {
            "address.addressLine1": addressLine1,
            "address.addressLine2": addressLine2,
            "address.town": town,
            "address.postcode": postcode,
        }, (err, result) => {
            if (err) {
                return err
            }
            return result

        })
    res.redirect("/address")

}