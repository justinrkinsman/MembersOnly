const express = require('express');
const router = express.Router();

// Require controller modules
const signup = require('../controllers/signupController')

/// SIGN UP ROUTES ///

// GET sign up page
router.get('/signup_form', signup.index)

// POST sign up page
router.post('/signup_form', signup.create_user_post)

module.exports = router;