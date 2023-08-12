// /services/passport.js

const mongoose = require("mongoose");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const passport = require("passport");

const User = mongoose.model("User");

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: "http://localhost:8080/auth/google/callback",
    }, 
    (accessToken, refreshToken, profile, done) => {
      console.log(profile);
      console.log(accessToken);

      try {
        User.findOne({ googleId: profile.id }).then((existingUser) => {
          if (existingUser) {
            done(null, existingUser);
          } else {
            new User({
              googleId: profile.id,
              name: profile.displayName,
              email: profile.emails[0].value,
              profileImage: profile.photos[0].value,
            })
              .save()
              .then((user) => done(null, user));
          }
        });
      } catch (error) {
        console.log(error);
        done(error);
      }
    }
  )
);

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser((id, done) => {
  User.findById(id).then((user) => {
    done(null, user);
  });
});
