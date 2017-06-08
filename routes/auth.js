const express = require('express');
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const config = require('../config');
const auth = express.Router();

passport.serializeUser((user, done) => {
  done(null, user);
});
passport.deserializeUser((obj, done) => {
  done(null, obj);
});

passport.use(new GoogleStrategy({
    clientID: config.oauth.clientID,
    clientSecret: config.oauth.clientSecret,
    callbackURL: config.oauth.callbackURL
  },
  function(accessToken, refreshToken, profile, cb) {
    let user = profile
    user.googleid = user.id
    user.id = undefined
    r.table("users").insert(user, {conflict: "update"}).run().then(result => {
      user.id = result['generated_keys'][0]
      return cb(null, user);
    })
  }
));

auth.get('/',
  passport.authenticate('google', { scope: ['profile'] }),
  function(req, res) {
    // Successful authentication, redirect home.
    res.json(req.user);
  });

module.exports = auth
