const express = require('express')
const request = require('request')
const router = express.Router()

router.get('/', (req, res) => {
  let url = req.originalUrl.split('?')
  url.shift()
  try {
    url = new URL(url.join('?'))
  } catch (err) {
    url = null
  }

  if (url) {
    req.pipe(request(url.toString())).pipe(res)
  } else {
    res.status(400).send('you need to provide a url!')
  }
})

router.get('/nobrowser', (req, res, next) => {
  let url = req.originalUrl.split('?').slice(1)
  try {
    url = new URL(url.join('?'))

    let headers = Object.assign({}, req.headers)
    Reflect.deleteProperty(headers, 'referer')
    headers['user-agent'] = 'roads0/fling'
    headers.host = url.host

    let options = {
      url: url.toString(),
      headers
    }

    try {
      request(options).on('error', (err) => {
        next(err)
      })
        .pipe(res)
    } catch (err) {
      next(err)
    }
  } catch (err) {
    res.status(400).send('you need to provide a url!')
  }
})

module.exports = router
