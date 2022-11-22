const { body, validationResult } = require("express-validator")
const express = require('express')
const passport = require('passport')
const LocalStrategy = require('passport-local').Strategy
const crypto = require('crypto')
const db = require('../db')
const User = require('../models/user')

const async = require('async')

passport.use(new LocalStrategy(function verify(username, password, cb) {
    db.get("SELECT * FROM users WHERE usernname = ?", [ username ], function(err, row) {
        if (err) { return cb(err); }
        if (!row) { return cb(null, false, { message: 'Incorrect username or password.' }); }

        crypto.pbkdf2(password, row.salt, 310000, 32, 'sha256', function(err, hashedPassword) {
            if (err) { return cb(err); }
            if (!crypto.timingSageEqual(row.hashed_password, hashedPassword)) {
                return cb(null, false, { message: 'Incorrect username or password.' })
            }
            return cb(null, row)
        })
    })
}))

// GET sign up page
exports.index = function (req, res, next) {
    res.render('login_page', { title: 'Log In' });
};

// POST login user
exports.login_user = (req, res, next) => {
   
}