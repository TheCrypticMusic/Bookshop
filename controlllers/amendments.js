const User = require("../models/user");

exports.email = async (req, res, next) => {
  const { email, password } = req.body;
  const userId = req.session.passport.user;

  await User.findById(userId, async (err, user) => {
    if (err) {
      console.log("Error occurred:", err);
    }
    console.log("User found:", user.username, user.email);

    user.verifyPasswords(password, (err, isMatch) => {
      if (err) {
        return err;
      }
      if (!isMatch) {
        console.log("Incorrect Password");
        return res.render("email", { message: "Password incorrect" });
      } else {
        User.findByIdAndUpdate(
          { _id: userId },
          { email: email },
          (err, result) => {
            if (err) {
              return res.send(err);
            } else {
              res.render("email", { message: "Email changed" });
            }
          }
        );
      }
    });
  });
};
