const express = require('express')
const weather = require('weather-js')
const snoowrap = require('snoowrap')
const superagent = require('superagent')
const Todo = require('../models/Todo')
const config = require('../config')
const router = express.Router()

const reddit = new snoowrap({
  userAgent: 'An in-browser dashboard service',
  clientId: config.snoowrap.clientId,
  clientSecret: config.snoowrap.clientSecret,
  refreshToken: config.snoowrap.refreshToken
})

const defaultReddits = [
  'EarthPorn',
  'SpacePorn',
  'ExposurePorn'
] //add dankmemes for style points

/* gET home page. */
router.get('/', function(req, res, next) {
  res.json([
    'welcome',
    'to',
    'memeland'
  ])
})

router.get('/me', checkAuth, function(req, res, next) {
  let cleanUser = Object.assign({}, req.user.toObject())
  delete cleanUser.token
  delete cleanUser.api_token
  cleanUser.settings = JSON.parse(cleanUser.settings)
  res.json(cleanUser)
})

router.get('/me/todos', checkAuth, function(req, res, next) {
  res.json(req.user.toObject().todo)
})

router.get('/me/token', checkAuth, function(req, res, next) {
  res.json(req.user.api_token)
})

router.post('/me/token', checkAuth, function(req, res, next) {
  req.user.token_reset((err, api_token) => {
    if (err) {
      next(err)
    } else {
      res.json(api_token)
    }
  })
})

router.get('/weather/:place', (req, res, next) => {
  weather.find({
    search: req.params.place,
    degreeType: req.query.unit || 'F'
  }, function (err, result) {
    if (err) {
      next(err)
    } else {
      res.json(result[0])
    }
  })
})

router.get('/background', (req, res, next) => {
  let userreddits = Object.assign([], defaultReddits)
  if (req.user && req.user.settings.subreddits != undefined && req.user.settings.subreddits.length != 0 && !(req.user.settings.subreddits.length == 1 && req.user.settings.subreddits[0] == '')) {
    userreddits = Object.assign([], req.user.settings.subreddits)
  } else if (req.query && req.query.subreddits) {
    userreddits = `${req.query.subreddits}`.split(',')
  }
  get_image(userreddits, (err, img) => {
    if (err) {
      console.error(err)
      res.redirect('/images/nopic.png')
    } else {
      res.set('Content-Length', img.body.length)
      res.set('Content-Type', img.type)
      res.set('X-More-Info', encodeURI(JSON.stringify(img.src)))
      res.write(img.body)
      res.end()
    }
  })
})

router.post('/todo/create', checkAuth, (req, res, next) => {
  if (!req.body || !req.body.title) {
    res.status(400).json({err: 'missing title param!'})
  } else {
    req.user.add_todo(req.body.title, (err, todo) => {
      if (err) {
        next(err)
      } else {
        res.json(todo)
      }
    })
  }
})

router.post('/todo/edit/:id', checkAuth, (req, res, next) => {
  if (req.body) {
    req.user.edit_todo(req.params.id, {
      edited_todo: req.body.edited_todo,
      checked: req.body.checked
    }, (err, todo) => {
      if (err) {
        next(err)
      } else {
        res.json(todo)
      }
    })
  } else {
    res.status(400).json({err: 'missing param!'})
  }
})

router.delete('/todo/:id', checkAuth, (req, res, next) => {
  req.user.remove_todo(req.params.id, (err, todo) => {
    if (err) {
      next(err)
    } else {
      res.json(todo)
    }
  })
})

router.post('/me/settings', checkAuth, (req, res, next) => {
  // let count = 0
  // let invalidReddits = [],
  //   validReddits = []
  //
  // if (Array.isArray(req.body.subreddits) && req.body.subreddits.length > 0) {
  //   req.body.subreddits.forEach((reddit) => {
  //     check_subreddit(reddit, (err, valid) => {
  //       if (err || !valid) {
  //         invalidReddits.push(reddit)
  //       } else {
  //         validReddits.push(reddit)
  //       }
  //       count++
  //       if (count == req.body.subreddits.length) {
  //         req.body.subreddits = validReddits
  //         req.user.setting_manager(req.body, (err, setting) => {
  //           if (err) {
  //             next(err)
  //           } else {
  //             setting.subreddits = {
  //               valid: validReddits,
  //               invalid: invalidReddits
  //             }
  //             res.json(setting)
  //           }
  //         })
  //       }
  //     })
  //   })
  // } else {
  req.user.setting_manager(req.body, (err, setting) => {
    if (err) {
      next(err)
    } else {
      res.json(setting)
    }
  })
  // }
})

router.post('/me/plugins', checkAuth, (req, res, next) => {
  req.user.plugin_manager(req.body, (err, plugins) => {
    if (err) {
      next(err)
    } else {
      res.json(plugins)
    }
  })
})

router.get('/pkg.json', (req, res, next) => {
  res.json(require('../package.json'))
})

module.exports = router

function random_subreddit(subreddit_list, cb) {
  let mySubreddit = subreddit_list[Math.floor(Math.random() * subreddit_list.length)]
  check_subreddit(mySubreddit, (err, valid) => {
    if (err) {
      cb(err)
    } else if (valid) {
      cb(null, mySubreddit)
    } else {
      cb(new Error('subreddit not valid'))
    }
  })
}

function check_subreddit(subreddit, cb) {
  superagent.get(`https://reddit.com/r/${subreddit}.json`).redirects(1)
    .end((err, resp) => {
      cb(err, resp.statusCode == 200)
    })
}

function get_image(subreddits, cb, repeated) {
  repeated = repeated || 1
  if (repeated > 4) {
    cb(null, {
      body: require('fs').readFileSync('./public/images/nopic.png'),
      type: 'image/png'
    })
  }

  random_subreddit(subreddits, (err, subreddit) => {
    if (err) {
      cb(err)
    } else {
      reddit.getSubreddit(subreddit).getTop({time: 'week'})
        .then((data) => {
          let rand = Math.floor(Math.random() * data.length)
          superagent.get(data[rand].url).end((err, resp) => {
            if (err) {
              cb(err)
            } else if ((/image\/.+/i).test(resp.headers['content-type'])) {
              cb(null, {
                body: resp.body,
                type: resp.headers['content-type'],
                size: resp.headers['content-length'],
                src: data[rand]
              })
            } else {
              get_image(subreddits, cb, repeated++)
            }
          })
        })
        .catch((err) => {
          cb(err)
        })
    }
  })
}

function checkAuth(req, res, next) {
  if (req.user) {
    next()
  } else {
    res.status(401).json('log in you dumbo')
  }
}
