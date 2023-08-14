const passport = require("passport");
// eslint-disable-next-line no-unused-vars
const FacebookStrategy = require('../controller/outhFacebook');

const OAuthFacebookRoutes = (app) => {

  app.get("/auth/facebook", passport.authenticate("facebook"));

  app.get(
    "/auth/facebook/callback",
    passport.authenticate("facebook", { failureRedirect: "/login" }),
    (req, res) => {
      console.log("req.user");
      console.log(req.user);
      res.redirect("/current_user");
    }
  );

  app.get("/current_user", (req, res) => {
    res.send(req.user.displayName);
  });
};


module.exports = OAuthFacebookRoutes;