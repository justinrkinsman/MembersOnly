const express = require('express');
const router = express.Router();
const { body, validationResult } = require("express-validator")
const app = require("../app")
const bcrypt = require('bcryptjs')

const User = require('../models/user')

const async = require('async')

/// SIGN UP ROUTES ///

// GET sign up page
router.get('/signup_form', (req, res, next) => {
    res.render('signup_form.pug', { title: 'Sign Up' });
})

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

module.exports = router;