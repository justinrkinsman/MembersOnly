const { body, validationResult } = require("express-validator")
const express = require('express')
const passport = require('passport')
const LocalStrategy = require('passport-local').Strategy
const crypto = require('crypto')
//const db = require('../db')
const User = require('../models/user')
const app = require('../app')

const async = require('async')

// GET sign up page
exports.index = function (req, res, next) {
    res.render('login_page', { title: 'Log In' });
};

// POST login user
exports.login_user = (req, res, next) => {
   
}