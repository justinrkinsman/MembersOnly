const express = require('express');
const router = express.Router();
const { body, validationResult } = require("express-validator")
const app = require("../app")
const bcrypt = require('bcryptjs')

const User = require('../models/user')
const Post = require('../models/post')

const async = require('async')

/// SIGN UP ROUTES ///

// GET sign up page
router.get('/signup_form', (req, res, next) => {
    res.render('signup_form.pug', { title: 'Sign Up' });
})

router.get('/new-post', (req, res, next) => {
    res.render('new_post.pug')
})

module.exports = router;