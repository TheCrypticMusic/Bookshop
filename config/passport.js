const passport = require("passport");
const User = require("../models/user");
const LocalStrategy = require("passport-local").Strategy;

passport.use(
    new LocalStrategy(
        {
            usernameField: "email",
        },
        function (usernameField, password, done) {

            User.findOne({ email: usernameField }, function (err, user) {
                if (err) {
                    return done(err);
                }
                if (!user) {
                    console.log("User not found");
                    return done(null, false, {
                        message: "Incorrect email or password.",
                    });
                }

                user.comparePassword(password, (err, isMatch) => {
                    if (err) {
                        return err;
                    }

                    if (!isMatch) {
                        console.log("Incorrect email or username");
                        return done(null, false, {
                            message: "Incorrect email or password.",
                        });
                    }

                    return done(null, user);
                });
            });
        }
    )
);

passport.serializeUser((user, done) => {
    done(null, user.id);
});

passport.deserializeUser((id, done) => {
    User.findById(id, function (err, user) {
        done(null, user);
    });
});

module.export = passport;