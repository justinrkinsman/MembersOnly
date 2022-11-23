const { body, validationResult } = require("express-validator")
const express = require('express')
const router = express.Router();
const session = require("express-session")
const passport = require('passport')
const LocalStrategy = require('passport-local').Strategy
const crypto = require('crypto')
const User = require('../models/user')
const app = require('../app')

const async = require('async')

// Require controller modules
const signup = require('../controllers/signupController')
const login = require('../controllers/loginController')

passport.use(
    new LocalStrategy((username, password, done) => {
        User.findOne({ username: username}, (err, user) => {
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
})

/// SIGN UP ROUTES ///

// GET sign up page
router.get('/signup_form', function (req, res, next) {
    res.render('signup_form', { title: 'Sign Up' });
});


// POST sign up page
router.post('/signup_form', [
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
        .escape()
        .withMessage("Email is required"),
    body("password")
        .trim()
        .isLength({ min: 1, max: 100})
        .escape()
        .withMessage("Password is required"),
    body("confirm_password")
        .trim()
        .isLength({ min: 1, max: 100})
        .escape()
        .optional({ checkFalsy: true }),
    // Process request after validation and sanitization
    (req, res, next) => {
        // Extract the validation errors form a request
        const errors = validationResult(req)

        // Create a Console object with escaped and trimmed data
        const user = new User({
            first_name: req.body.first_name,
            last_name: req.body.last_name,
            username: req.body.username,
            password: req.body.password
        })

        if (!errors.isEmpty()) {
            // There are no errors. Render form again with sanitized values/error messages
            res.render("signup_form", {
                title: 'Sign Up',
                user: req.user,
                errors: errors.array(),
            })
            return
        } else {
            // Data from for is valid.
            // Check if user with same username exists
            User.findOne({ username: req.body.username }).exec((err, found_username) => {
                if (err) {
                    return next(err)
                }

                if (found_username) {
                    // Username is already in use
                    res.render("signup_form", {info: "Username already in use"})
                } else {
                    user.save((err) => {
                        if (err) {
                            return next(err)
                        }
                        // Successful - redirect to new post page.
                        res.redirect('/')
                    })
                }
            })
        }
    }
])


/// LOGIN ROUTES ///

// GET login page
router.get('/login', function (req, res, next) {
    res.render('login_page', { title: 'Log In' });
})


// POST login page
router.post('/login/password', (req, res, next) => {
    passport.authenticate('local', {
        successReturnToOrRedirect: '/',
        failureRedirect: '/login',
        failureMessage: true
    })
})

module.exports = router;