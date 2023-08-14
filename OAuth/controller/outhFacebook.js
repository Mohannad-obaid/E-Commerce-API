const passport = require("passport");
const FacebookStrategy = require('passport-facebook').Strategy;
const User = require("../../models/userModel");
const createToken = require("../../utils/createToken");
const { sanitizeUser } = require("../../utils/sanitizeData");
// Configure passport with the Facebook strategy

passport.use(new FacebookStrategy({
    clientID: process.env.FACEBOOK_APP_ID,
    clientSecret: process.env.FACEBOOK_APP_SECRET,
    callbackURL: process.env.FACEBOOK_REDIRECT_URL,
    profileFields: ['id', 'displayName', 'photos', 'email'],
    scope: ['email']
  },
  async (accessToken, refreshToken, profile, done) => {

   console.log(profile);

    const user = await User.findOne({ email: profile.emails[0].value });

    if (user) {
        const token = createToken(user._id);
        return done(null, { "data": sanitizeUser(user), "token": token });
    }

    const newUser = await User.create({
      name: profile.displayName,
      email: profile.emails[0].value,
      profileImage: profile.photos[0].value,
      password: profile.id,
      accountVerification: true,
      provider : "facebook"
    });

    const token = createToken(newUser._id);
    return done(null, { "data": sanitizeUser(newUser), "token": token });
  }
));

// Serialize and deserialize user data
passport.serializeUser((user, done) => {
    done(null, user);
  });
  
  passport.deserializeUser((user, done) => {
    done(null, user);
  });
  