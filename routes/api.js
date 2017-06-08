const express = require('express');
const config = require('../config');
const weather = require('weather-js')
const snoowrap = require('snoowrap');
const api = express.Router();
const reddit = new snoowrap({
  userAgent: 'An in-browser dashboard service',
  clientId: config.snoowrap.clientIdS,
  clientSecret: config.snoowrap.client_secretS,
  refreshToken: config.snoowrap.refresh_token
});

api.get('/weather/:place', (req, res) => {
  weather.find({search: req.params.place, degreeType: 'F'}, function (err, result) {
    if(err) console.log(err)
    res.json(result[0])
  })
})
module.exports = api

api.get('/background', (req, res) => {
  reddit.getSubreddit('EarthPorn').getTop({time: 'month'}).then(data => {
    res.json(data[Math.floor(Math.random() * data.length)])
  })
})
