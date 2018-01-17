var express = require('express'),
    mongoose = require('mongoose'),
    bodyParser = require('body-parser'),
    cors = require('cors'),
    passport = require('passport'),
    LocalStrategy = require('passport-local').Strategy,
    cookieParser = require('cookie-parser'),
    flash = require('connect-flash'),
    session = require('express-session');

var db = require('./config/db');

var article = require('./route/article'),
    admin = require('./route/admin'),
    user = require('./route/user'),
    front = require('./route/front'),
    chats = require('./route/chats'),
    groups = require('./route/groups'),
    events = require('./route/events'),
    images = require('./route/images'),
    tags = require('./route/tags');

var app = express();
mongoose.connect(db.url);

app.use(function(req, res, next) {
  var allowedOrigins = ['http://127.0.0.1:8000', 'http://localhost:8000'];
  var origin = req.headers.origin;
  if(allowedOrigins.indexOf(origin) > -1){
       res.setHeader('Access-Control-Allow-Origin', origin);
  }
  //res.header('Access-Control-Allow-Origin', 'http://127.0.0.1:8020');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.header('Access-Control-Allow-Credentials', true);
  return next();
});

/* middleware */
app.use(bodyParser.json({limit: '3mb'}));
app.use(bodyParser.urlencoded({limit: '3mb', extended: true}));
app.use(cookieParser());
app.use(express.static(__dirname + '/public'));

/* 身份認證 */
app.use(session({ secret: 'shhsecret' }));
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());

/* route */
app.use(cors());
app.use('/', front);
app.use('/images', images);
app.use('/admin', admin);
app.use('/api/articles', article);
app.use('/api/users', user);
app.use('/api/chats', chats);
app.use('/api/events', events);
app.use('/api/tags', tags);
app.use('/api/groups', groups);

require('./config/passport')(passport);

module.exports = app;
