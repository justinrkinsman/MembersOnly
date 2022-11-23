require('dotenv').config()
const createError = require('http-errors');
const express = require('express');
const path = require('path');
const session = require("express-session")
const passport = require("passport")
const LocalStrategy = require('passport-local').Strategy
const cookieParser = require('cookie-parser');
const logger = require('morgan');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
const catalogRouter = require('./routes/catalog')

//const compression = require('compression')
//const helmet = require("helmet")

var app = express();

//app.use(helmet())

// Set up mongoose connection
const mongoose = require("mongoose")
const dev_db_url = process.env.MONGO_URL
const mongoDB = dev_db_url
mongoose.connect(mongoDB, { useNewUrlParser: true, useUnifiedTopology: true })
const db = mongoose.connection
db.on("error", console.error.bind(console, "MongoDB connection error:"))

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

/*
Add both engines and consolidate.js in your package.json
In yourapp.js

var engines = require('consolidate');

app.engine('jade', engines.jade);

app.engine('handlebars', engines.handlebars);
*/

/*passport.use(
  new LocalStrategy((username, password, done) => {
    user.findOne({ username: username}, (err, user) => {
      if (err) {
        return done(err)
      }
      if (!user) {
        return done(null, false, { message: "Incorrect username" })
      }
      if (user.password !== password) {
        return done(null, false, { message: "Incorrect password" })
      }
      return done(null, user)
    })
  })
)

passport.serializeUser(function(user, done) {
  done(null, user.id)
})

passport.deserializeUser(function(id, done) {
  User.findById(id, function(err, user) {
    done(err, user)
  })
})*/

app.use(session({ secret: "superSecretPassword", resave: false, saveUninitialized: true }))
app.use(passport.initialize())
app.use(passport.session())
app.use(express.urlencoded({ extended: false }))
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', catalogRouter);
app.use('/users', usersRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
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

module.exports = app;