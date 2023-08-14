const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const bcrypt = require("bcrypt");
const User = require("../../models/userModel");
const createToken = require("../../utils/createToken");
const { sanitizeUser } = require("../../utils/sanitizeData");
// Configure passport with the Google strategy
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_REDIRECT_URL, //"/auth/google/callback"
    },
    async (accessToken, refreshToken, profile, done) => {
      const user = await User.findOne({ email: profile.emails[0].value });

      if (user) {
        const isMatch = bcrypt.compare(profile.id, user.password);
        if (isMatch) {
          const token = createToken(user._id);
          return done(null, { "data": sanitizeUser(user), "token": token });
        }
      }



      const newUser = await User.create({
        name: profile.displayName,
        email: profile.emails[0].value,
        profileImage: profile.photos[0].value,
        password: profile.id,
        accountVerification: true,
        provider: "google"
      });

      const token = createToken(newUser._id);
      return done(null, { "data": sanitizeUser(newUser), "token": token });
    }
  )
);

// Serialize and deserialize user data
passport.serializeUser((user, done) => {
  done(null, user);
});

passport.deserializeUser((user, done) => {
  done(null, user);
});
