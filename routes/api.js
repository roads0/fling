const express = require('express');
const bodyParser = require('body-parser');
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
const reddits = ['EarthPorn', 'SpacePorn', 'ExposurePorn']

api.use(bodyParser.json());

api.get('/weather/:place', (req, res) => {
  weather.find({search: req.params.place, degreeType: 'F'}, function (err, result) {
    if(err) console.log(err)
    res.json(result[0])
  })
})

api.get('/background', (req, res) => {
  if(req.get('Authorization')) {
    r.table('settings').get(req.get('Authorization')).then(result => {
      var customstring = result.reddit;
      customstring = customstring.replace(/\s/g, '');
      var customreddits = customstring.split(',');
      reddit.getSubreddit(customreddits[Math.floor(Math.random()*customreddits.length)]).getTop({time: 'week'}).then(data => {
      res.json(data[Math.floor(Math.random() * data.length)])
    }).catch(e => {
      console.log(e + "invalid reddit")
      reddit.getSubreddit(reddits[Math.floor(Math.random()*reddits.length)]).getTop({time: 'week'}).then(data => {
      res.json(data[Math.floor(Math.random() * data.length)])
      })
    })
  })
} else {
    reddit.getSubreddit(reddits[Math.floor(Math.random()*reddits.length)]).getTop({time: 'week'}).then(data => {
    res.json(data[Math.floor(Math.random() * data.length)])
    })
  }
})

api.post('/settings', (req, res) => {
  if(req.get('Authorization')) {
    r.table('settings').get(req.get('Authorization')).update(req.body).then((result) => {
      res.json({status: 'OK!'})
    }).catch((err) => {
      res.json({status: 'Error', error: err})
    })
  } else {
    res.status(401).json({status: 'Error', error: 'Unauthorized'})
  }
})

api.get('/settings', (req, res) => {
  if(req.get('Authorization')) {
    r.table('settings').get(req.get('Authorization')).then(result => {
      res.json(result)
    }).catch((err) => {
      res.json({status: 'Error', error: err})
    })
  } else {
    res.status(401).json({status: 'Error', error: 'Unauthorized'})
  }
})

api.get('/user', (req, res) => {
  if(req.get('Authorization')) {
    r.table('users').get(req.get('Authorization')).then(result => {
      res.json(result)
    }).catch((err) => {
      res.json({status: 'Error', error: err})
    })
  } else {
    res.status(401).json({status: 'Error', error: 'Unauthorized'})
  }
})

module.exports = api
