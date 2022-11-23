const express = require('express');
const router = express.Router();

// Require controller modules
const signup = require('../controllers/signupController')
const login = require('../controllers/loginController')

/// SIGN UP ROUTES ///

// GET sign up page
router.get('/signup_form', signup.index)

// POST sign up page
router.post('/signup_form', signup.create_user_post)


/// LOGIN ROUTES ///

// GET login page
router.get('/login', login.index)

// POST login page
router.post('/login', login.login_user)

module.exports = router;