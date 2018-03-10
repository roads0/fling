const express = require('express');
const path = require('path');
const favicon = require('serve-favicon');
const logger = require('morgan');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const sassMiddleware = require('node-sass-middleware');
const session = require('express-session');
const MongoStore = require('connect-mongo')(session);
const mongoose = require('mongoose');
const passport = require('passport');

const User = require('./models/User')

const config = require('./config.json')

const app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(sassMiddleware({
  src: path.join(__dirname, 'public'),
  dest: path.join(__dirname, 'public'),
  indentedSyntax: false, // true = .sass and false = .scss
  sourceMap: true
}));

mongoose.connect(config.db.url);
const db = mongoose.connection;

db.on('error', console.error.bind(console, 'connection error:'))
db.once('open', () => {
  console.log(`DB at ${config.db.url} Ready!`)
})

app.use(session({
  secret: config.sessionSecret,
  store: new MongoStore({ url: config.db.url }),
  maxAge: 6.307e+10
}));

passport.serializeUser((user, done) => {
  User.findById(user._id, (err, userDb) => {
    if (err) {
      done (err);
    } else {
      done(null, userDb);
    }
  })
});
passport.deserializeUser((obj, done) => {
  User.findById(obj._id, (err, userDb) => {
    if (err) {
      done (err);
    } else {
      done(null, userDb);
    }
  })
});

app.use(passport.initialize())
app.use(passport.session())

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "*");
  next();
});

app.use((req, res, next) => {
  let token = req.get('Authorization')
  if (token && !req.user) {
    User.findOne({api_token: token}, (err, usr) => {
      req.user = usr
      next();
    })
  } else {
    next()
  }
})

app.use(express.static(path.join(__dirname, 'public')));

app.use('/', require('./routes/index'));
app.use('/api', require('./routes/api'));
app.use('/users', require('./routes/users'));
app.use('/auth', require('./routes/auth')(passport));

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  let err = new Error('>:^(');
  err.status = 404;
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

app.listen(process.env.PORT || 6789, () => {
  console.log(`Listening on port ${process.env.PORT || 6789}`)
})
