const express = require('express');
const config = require('../config.json')
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const mongoose = require('mongoose');
const User = require('../models/User')
const router = express.Router();

function auth(passport) {
  passport.use(new GoogleStrategy({
    clientID: config.oauth.clientID,
    clientSecret: config.oauth.clientSecret,
    callbackURL: config.oauth.callbackURL
  }, (accessToken, refreshToken, profile, cb) => {
    User.findOne({googleId: profile.id}).then(user => { // will return a User or null
      if(user) { //check that it's not null
        // user = user.toObject()
        // user.gProfile = profile //Attach google login data
        cb(null, user)
      } else {
        User.create({name: profile.displayName, googleId: profile.id, token: refreshToken}).then(newUser => {
          // user = newUser.toObject()
          // user.gProfile = profile //Attach google login data
          cb(null, user)
        }).catch(err => {
          console.error(err)
        })
      }
    }).catch(err => {
      console.error(err)
    })
    profile.accessToken = accessToken,
    profile.refreshToken = refreshToken
  }))

  router.get('/', passport.authenticate('google', { scope: ['profile'], accessType: 'offline', prompt: 'consent' }), (req, res) => {
    res.redirect('/')
  })

  router.get('/logout', (req, res) => {
    req.logout()
    res.redirect('/')
  })

  return router
}

module.exports = auth;
