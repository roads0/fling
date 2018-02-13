const express = require('express');
const weather = require('weather-js');
const snoowrap = require('snoowrap');
const superagent = require('superagent');
const Todo = require('../models/Todo');
const config = require('../config');
const router = express.Router();

const reddit = new snoowrap({
  userAgent: 'An in-browser dashboard service',
  clientId: config.snoowrap.clientId,
  clientSecret: config.snoowrap.clientSecret,
  refreshToken: config.snoowrap.refreshToken
});

const defaultReddits = ['EarthPorn', 'SpacePorn', 'ExposurePorn'] //add dankmemes for style points

/* GET home page. */
router.get('/', function(req, res, next) {
  res.json(['welcome','to','memeland'])
});

router.get('/me', checkAuth, function(req, res, next) {
  let cleanUser = Object.assign({}, req.user)
  delete cleanUser.token
  res.json(cleanUser)
});

router.get('/weather/:place', (req, res, next) => {
  weather.find({search: req.params.place, degreeType: /*req.user.settings.degreeType ||*/ 'F'}, function (err, result) {
    if(err) {
      next(err)
    } else {
      res.json(result[0])
    }
  })
})

router.get('/background', (req, res) => {
  if (req.user && req.user.settings.subreddits != undefined && req.user.settings.subreddits.length != 0) {
    reddit.getSubreddit(random_subreddit(req.user.settings.subreddits)).getTop({time: 'week'}).then((data) => {
      superagent.get(data[Math.floor(Math.random() * data.length)].url).end((err, resp) => {
        res.set('Content-Type', res.headers['Content-Type'])
        res.send(res.body)
      })
    })
  } else {
    reddit.getSubreddit(random_subreddit(defaultReddits)).getTop({time: 'week'}).then((data) => {
      superagent.get(data[Math.floor(Math.random() * data.length)].url).end((err, resp) => {
        res.set('Content-Type', resp.headers['content-type'])
        res.send(resp.body)
      })
    });
  }
})

module.exports = router;

function random_subreddit(subreddit_list){
  return subreddit_list[Math.floor(Math.random() * subreddit_list.length)]
}

function checkAuth(req, res, next) {
  if(req.user) {
    next()
  } else {
    res.status(401).json('log in you dumbo')
  }
}
