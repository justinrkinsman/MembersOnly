require('dotenv').config()
const createError = require('http-errors');
const express = require('express');
const path = require('path');
const session = require("express-session")
const passport = require("passport")
const LocalStrategy = require('passport-local').Strategy
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const bcrypt = require('bcryptjs')
const { body, validationResult, check } = require('express-validator')

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
const catalogRouter = require('./routes/catalog')

const User = require('./models/user')
const Post = require('./models/post')

//const compression = require('compression')
//const helmet = require("helmet")

var app = express();

app.use('/', catalogRouter);
app.use('/users', usersRouter);

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
app.set('view engine', 'ejs')
app.set('view engine', 'pug');

app.use(express.static(__dirname + '/public'))

/*
Add both engines and consolidate.js in your package.json
In yourapp.js
var engines = require('consolidate');
app.engine('jade', engines.jade);
app.engine('handlebars', engines.handlebars);
*/

passport.use(
  new LocalStrategy((username, password, done) => {
    User.findOne({ username: username}, (err, user) => {
      if (err) {
        return done(err)
      }
      if (!user) {
        return done(null, false, { message: "Incorrect username" })
      }
      bcrypt.compare(password, user.password, (err, res) => {
        if (res) {
          // passwords match! log user in
          return done(null, user)
        } else {
          // passwords do not match!
          return done(null, false, { message: "Incorrect password" })
        }
        return done (null, user)
      })
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
})

app.use(session({ 
  secret: "superSecretPassword",
  cookie: {
    secure: false,
    httpOnly: true,
    sameSite: true,
    maxAge: 24 * 60 * 60 * 1000
  },
  resave: false, 
  saveUninitialized: true, }))
app.use(passport.initialize())
app.use(passport.session())
app.use(express.urlencoded({ extended: false }))
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

post_list = function(req, res, next) {
  Post.find({}, "title post_body formatted_timestamp user")
    .sort({ timestamp: 1 })
    .populate("title post_body formatted_timestamp user")
    .exec(function (err, list_posts) {
      if (err) {
        return next(err)
      }
      // Successful, so render
      res.render("index.ejs", { title: "Home Page", post_list: list_posts})
    })
}

app.get("/", (req, res, next) => {
    Post.find({}, "title post_body timestamp user")
      .sort({ timestamp: -1 })
      .populate("title post_body timestamp user")
      .exec(function (err, list_posts) {
        if (err) {
          return next(err)
        }
        // Successful, so render
        res.render("index.ejs", { title: "Please Log In", user: req.user, posts: list_posts})
      })
  })

app.post(
  "/login",
  passport.authenticate("local", {
    successRedirect: '/',
    failureRedirect: '/'
  })
)

app.get("/logout", (req, res, next) => {
  req.logout(function (err) {
    if (err) {
      return next(err)
    }
    res.redirect('/')
  })
})

app.post("/signup_form", [
  // Validate and sanitize the fields
  body("first_name")
      .trim()
      .isLength({ min: 1, max: 100})
      .escape()
      .withMessage("First name is required"),
  body("last_name")
      .trim()
      .isLength({ min: 1, max: 100})
      .escape()
      .withMessage("Last name is required"),
  body("username")
      .trim()
      .isLength({ min: 1, max: 100})
      .toLowerCase()
      .escape()
      .withMessage("Email is required"),
  body("password")
      .trim()
      .isLength({ min: 1, max: 100})
      .escape()
      .withMessage("Password is required"),
  check("confirm_password")
      .exists()
      .custom((value, { req }) => value === req.body.password)
      .withMessage("Passwords must match"),
  // Process request after validation and sanitization
  (req, res, next) => {
      // Extract the validation errors form a request
      const errors = validationResult(req)

      // Create a User object with escaped and trimmed data
      const user = new User({
          first_name: req.body.first_name,
          last_name: req.body.last_name,
          username: req.body.username,
          password: req.body.password,
      })

      if (!errors.isEmpty()) {
          // There are no errors. Render form again with sanitized values/error messages
          res.render("signup_form.pug", {
              title: 'Sign Up',
              user: req.user,
              errors: errors.array(),
          })
          return
      } else {
          // Data from form is valid.
          // Check if user with same username exists
          User.findOne({ username: req.body.username }).exec((err, found_username) => {
              if (err) {
                  return next(err)
              }
              if (found_username) {
                  // Username is already in use
                  res.render("signup_form.pug", {info: "Username already in use"})
              } else {
                  bcrypt.hash(req.body.password, 10, (err, hashedPassword) => {
                      const user = new User({
                          first_name: req.body.first_name,
                          last_name: req.body.last_name,
                          username: req.body.username,
                          password: hashedPassword
                      }).save(err => {
                          if (err) {
                              return next(err)
                          }
                          res.redirect("/")
                      })
                  })
              }
          })
      }
  }
])

app.post('/new-post', [
  body("title")
    .trim()
    .isLength({ min: 1, max: 100 })
    .escape()
    .withMessage("Title is required"),
  body("post_body")
    .trim()
    .isLength({ min: 1 })
    .escape()
    .withMessage("Message is required"),
  // Process request after validation and sanitization
  (req, res, next) => {
    // Extract the validation errors from a request
      const errors = validationResult(req)

    // Find username
      const username = User.find({username: req.user.username}).exec((err, found_username) => {
        if (err) {
          return next(err)
        }
        if (found_username) {
          const post = new Post({
            title: req.body.title,
            post_body: req.body.post_body,
            timestamp: new Date(),
            user: found_username[0]._id,
          }).save(err => {
              if (err) {
                return next(err)
              }
              res.redirect('/')
          })
        }
      })

      if (!errors.isEmpty()) {
        // There are errors. Render form again with sanitized values and error messages
        Post.find({}, "title").exec(function (err, posts) {
          if (err) {
            return next(err)
          }
        
        // Successful, so render
        res.render("new_post.pug", {
          title: "New Post",
          user: req.user,
          errors: errors.array(),
          posts,
        })
      })
      return
    }
    }
])

/*app.post('/secret-signup', (req, res, next) => {
  res.render('secret-signup.pug', { info: req.user._id })
})*/

app.post('/secret-signup', [
  body("member_password")
    .trim()
    .escape(),

  (req, res, next) => {
    const errors = validationResult(req)

    const user = new User({
      first_name: req.user.first_name,
      last_name: req.user.last_name,
      username: req.user.username,
      password: req.user.password,
      membership: "member",
      _id: req.user._id,
    })

    if (errors.isEmpty()) {
        // Successful, so render
        if (!(req.body.member_password === process.env.MEMBER_PASSWORD)) {
          res.render("secret-signup.pug", {info:'Wrong Password'}
        )
        }
        if (req.body.member_password === process.env.MEMBER_PASSWORD) {
          User.findByIdAndUpdate(req.user._id, user, {}, function(err, theUser) {
            if (err) {
              return next(err)
            }
            res.redirect('/')
          })
        }
      }
      return
    }
])

app.post('/admin-signup', [
  body("admin_password")
    .trim()
    .escape(),

  (req, res, next) => {
    const errors = validationResult(req)

    const user = new User({
      first_name: req.user.first_name,
      last_name: req.user.last_name,
      username: req.user.username,
      password: req.user.password,
      membership: req.user.membership,
      admin: true,
      _id: req.user._id,
    })
    
    if (errors.isEmpty()) {
      // Successful, so render
      if (!(req.body.admin_password === process.env.ADMIN_PASSWORD)) {
        res.render("admin-signup.pug", {info:'Wrong Password'}
      )
      }
      if (req.body.admin_password === process.env.ADMIN_PASSWORD) {
        User.findByIdAndUpdate(req.user._id, user, {}, function(err, theUser) {
          if (err) {
            return next(err)
          }
          res.redirect('/')
        })
      }
    }
    return
  }
])

app.get('/delete-post/:id', (req, res, next) => {
  Post.findById(req.params.id)
    .populate("title post_body timestamp user")
    .exec(function (err, post) {
      if (err) {
        return next(err)
      }
      res.render("delete-post.ejs", {title: "Confirm Deletion", post: post})
    })
})

app.post("/delete-post/:id", (req, res, next) => {
  Post.findById(req.params.id)
    .populate("title post_body timestamp user")
    .exec(function (err, post) {
      if (err) {
        return next(err)
      }
      Post.findByIdAndRemove(req.params.id, function deletePost(err) {
        if (err) return next(err)
        res.redirect("/")
      })
    })
})

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
  res.render('error.pug');
});

module.exports = app;