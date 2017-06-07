const express = require('express');
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const config = require('../config');
const auth = express.Router();

passport.use(new GoogleStrategy({
    clientID: config.oauth.clientID,
    clientSecret: config.oauth.clientSecret,
    callbackURL: config.oauth.callbackURL
  },
  function(accessToken, refreshToken, profile, cb) {
    return cb(null, profile);
  }
));

passport.serializeUser(function(user, cb) {
  cb(null, user);
});

passport.deserializeUser(function(obj, cb) {
  cb(null, obj);
});

auth.use(passport.initialize());
auth.use(passport.session());

auth.get('/',
  passport.authenticate('google', { scope: ['profile'] }),
  function(req, res) {
    // Successful authentication, redirect home.
    console.log('yay')
    console.log(req.user)
    res.redirect('/');
  });

module.exports = auth
