// /routes/passport.js

const passport = require('passport');

const OAuthRoutes  = (app) => {



    /**
     * SignIn.
     */
    app.get('/auth/google',  passport.authenticate('google', { scope: ['profile', 'email'] }));

    /**
     * Callback from Google.
     */
    app.get('/auth/google/callback', passport.authenticate('google'));

    /**
     * Logout.
     */
    app.get('/api/logout', (req, res) => {
        req.logout();
        res.send(req.user);
    });

    /**
     * Get current user.
     */
    app.get('/api/current_user', (req, res) => {
        console.log(req.user);
        res.send(req.user);
    });
};

module.exports = OAuthRoutes;