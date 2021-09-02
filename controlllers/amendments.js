const User = require("../models/user");

exports.email = async (req, res, next) => {
  const { email, password } = req.body;
  const userId = req.session.passport.user;

  await User.findOne({ email: email }, (err, docs) => {
    if (docs) {
      console.log("Email already taken:", email);

      return res.render("email", { message: "Email already taken" });
    } else {
      User.findById(userId, async (err, user) => {
        if (err) {
          console.log("Email Change Error: error occurred:", err);
        }
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
    }
  });
};

exports.password = async (req, res, next) => {
  const { oldPassword, newPassword, newPasswordConfirm } = req.body;
  const userId = req.session.passport.user;

  await User.findById(userId, async (err, user) => {
    if (err) {
      console.log("Password Change Error: error occurred:", err);
    }
    user.encryptNewPassword(newPassword, (err, password) => {
      if (err) {
        return err;
      } else {
        User.findByIdAndUpdate(
          { _id: userId },
          { password: password },
          (err, result) => {
            if (err) {
              return res.send(err);
            } else {
              res.render("password", { message: "Password changed" });
            }
          }
        );
      }
    });
  });
};

exports.username = async (req, res, next) => {
  const { oldUsername, newUsername } = req.body;
  const userId = req.session.passport.user;

  await User.findOne({ username: newUsername }, async (err, docs) => {
    if (docs) {
      console.log("Username already taken:", docs);
      return res.render("username", { message: "Username already taken" });
    } else {
      await User.findById(userId, async (err, user) => {
        if (err) {
          console.log("Password Change Error: error occurred:", err);
        } else {
          User.findByIdAndUpdate(
            { _id: userId },
            { username: newUsername },
            (err, result) => {
              if (err) {
                return res.send(err);
              } else {
                res.render("Username", { message: "Username changed" });
              }
            }
          );
        }
      });
    }
  });
};
