let request = require('request')

module.exports = (req, res) => {
  let url = req.originalUrl.split('?')
  url.shift()
  url = url.join('?')
  if (url) {
    req.pipe(request(url)).pipe(res)
  } else {
    res.status(400).send('you need to provide a url!')
  }
}
