const express = require('express')
const app = express()
const path = require('path')
const config = require('./config.json')

app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'pug')
app.set('port', process.env.PORT || config.port || 3002)
app.use(express.static(path.join(__dirname, 'public')))

app.use('/', require('./routes/index.js'))
app.use('/static', express.static('./static'))

app.use( (req, res) => {
  res.status(404)
  res.send('40'.repeat(1000) + '4')
})

app.listen(app.get('port'), () => {
  console.log('Listening on port: ', app.get('port'))
})
