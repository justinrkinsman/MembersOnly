const { body, validationResult } = require("express-validator")

const async = require('async')

exports.index = function (req, res, next) {
    res.render('sign-up', { title: 'Sign Up' });
};