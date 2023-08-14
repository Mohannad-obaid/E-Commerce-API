const passport = require("passport");
// eslint-disable-next-line no-unused-vars
const passportSetup = require('../controller/outhGoogle'); // استيراد إعدادات Passport

const OAuthRoutes = (app) => {
  /**
   * SignIn.
   */
  app.get(
    "/auth/google",
    passport.authenticate("google", { scope: ['profile', 'email'] })
  );

  app.get(
    "/auth/google/callback",
    passport.authenticate("google", { failureRedirect: "/login" }),
    (req, res) => {
      // Successful authentication, redirect to a success page or perform any other necessary actions
      res.redirect("/dashboard");
    }
  );

  app.get("/success", (req, res) => {
    res.send("Sign up with Google successful");
  });

  app.get("/api/current_user", (req, res) => {
    res.send(req.user);
  });

  app.get("/dashboard", (req, res) => {
    if (req.user) {
      console.log(req.user);
      res.send(`Hello, ${req.user}! This is your dashboard.`);
    } else {
      res.redirect("/auth/google"); // يتم إعادة التوجيه إلى صفحة تسجيل الدخول إذا لم يكن المستخدم مسجل الدخول.
    }
  });

  app.get('/logout', (req, res) => {
    req.logout();
    res.redirect('/');
  });
};

module.exports = OAuthRoutes;
