const express = require('express');
const router = express.Router();

// Require controller modules
const signup = require('../controllers/signupController')

/* Get sign up page*/
router.get('/', signup.index)
  
module.exports = router;