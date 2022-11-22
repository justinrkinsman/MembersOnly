const express = require('express');
const router = express.Router();

/* Get sign up page*/
router.get('/', function(req, res, next) {
    res.render('sign-up', { title: 'Sign Up' });
});
  
module.exports = router;