const express = require('express');
const config = require('../config');
const weather = require('weather-js')
const api = express.Router();


api.get('/weather/:place', (req, res) => {
  weather.find({search: req.params.place, degreeType: 'F'}, function (err, result) {
    if(err) console.log(err)
    res.json(result[0])
  })
})
module.exports = api
