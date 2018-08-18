let express = require('express')
let router = express.Router()

/* gET users listing. */
router.get('/', function(req, res, next) {
  res.json(req.user)
})

module.exports = router
