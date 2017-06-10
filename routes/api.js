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
      if (customreddits[0] < customreddits.length) {
        reddit.getSubreddit(reddits[Math.floor(Math.random()*reddits.length)]).getTop({time: 'week'}).then(data => {
        res.json(data[Math.floor(Math.random() * data.length)])
        })
      } else {
      reddit.getSubreddit(customreddits[Math.floor(Math.random()*customreddits.length)]).getTop({time: 'week'}).then(data => {
      res.json(data[Math.floor(Math.random() * data.length)])
    }).catch(e => {
      console.log(e + "invalid reddit") // add a warning that says invalid reddit
      reddit.getSubreddit(reddits[Math.floor(Math.random()*reddits.length)]).getTop({time: 'week'}).then(data => {
      res.json(data[Math.floor(Math.random() * data.length)])
      })
    })
  }
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

api.post('/todo', (req, res) => {
  if(req.get('Authorization')) {
    r.table('todos').get(req.get('Authorization')).then(rslt => {
      let id = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8);
        return v.toString(16); // TODO: do a thing make this better
      });
      var list = rslt
      if (rslt != null) {
        list.id = req.get('Authorization')
        list.todos[id] = req.body.value
      } else {
        list = {id: req.get('Authorization'), todos: {}}
        list.todos[id] = req.body.value
      }
      r.table('todos').insert(list, {conflict: "update"}).then((result) => {
        list.id = undefined
        res.json(list.todos)
      }).catch((err) => {
        res.json({status: 'Error', error: err})
      })
    })
  } else {
    res.status(401).json({status: 'Error', error: 'Unauthorized'})
  }
})

api.get('/todo', (req, res) => {
  if(req.get('Authorization')) {
    r.table('todos').get(req.get('Authorization')).then(result => {
      res.json(result.todos)
    }).catch((err) => {
      res.json({status: 'Error', error: err})
    })
  } else {
    res.status(401).json({status: 'Error', error: 'Unauthorized'})
  }
})

api.delete('/todo/:id', (req, res) => {
  if(req.get('Authorization')) {
    r.table('todos').get(req.get('Authorization')).then(rslt => {
      var list = rslt
      delete list.todos[req.params.id]
      r.table('todos').insert(list, {conflict: "replace"}).then((result) => {
        res.status(200).json(result)
      }).catch((err) => {
        res.status(500).json({status: 'Error', error: err})
      })
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
