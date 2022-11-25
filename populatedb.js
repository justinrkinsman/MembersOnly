#! /usr/bin/env mode

// Get arguments passed on command line
var userArgs = process.argv.slice(2);  
require('dotenv').config()
/*
if (!userArgs[0].startsWith('mongodb')) {
    console.log('ERROR: You need to specify a valid mongodb URL as the first argument');
    return
}
*/
var async = require('async')
const User = require('./models/user')
const Post = require('./models/post')


var mongoose = require('mongoose');
const { Timestamp } = require('mongodb');
var mongoDB = process.env.MONGO_URL;   ///Add mongourl///
mongoose.connect(mongoDB, {useNewUrlParser: true, useUnifiedTopology: true});
mongoose.Promise = global.Promise;
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));

var users = []
var posts = []

function userCreate(first_name, last_name, username, password, membership, admin, cb) {
    userDetail = {
        first_name: first_name,
        last_name: last_name,
        username: username,
        password: password,
        membership: membership,
    }
    if (admin != false) userDetail.admin = admin
  
    var user = new User(userDetail);
       
    user.save(function (err) {
        if (err) {
            cb(err, null)
            return
        }
    console.log('New User: ' + user);
    users.push(user)
    cb(null, user)
    }  );
}

function postCreate(title, post_body, timestamp, user, cb) {
    postDetail = {
        title: title,
        post_body: post_body,
        timestamp: timestamp,
        user: user
    }

    var post = new Post(postDetail)
       
    post.save(function (err) {
        if (err) {
            cb(err, null);
            return;
        }
    console.log('New Post: ' + post);
    posts.push(post)
    cb(null, post);
  }   );
}


function createUsers(cb) {
    async.series([
        function(callback) {
          userCreate('Justin', "Kinsman", 'supercooljustindude@gmail.com', 'myPassword', "member", true, callback);
        },
        function(callback) {
            userCreate('Raymond', 'Kinsman', 'supercoolraymonddude@gmail.com', 'youPassword', 'non-member', false, callback)
        },
        ],
        // optional callback
        cb);
}
/*title, post_body, timestamp, user, cb*/
function createPosts(cb) {
    async.parallel([
        function(callback) {
            let date = new Date()
            postCreate("Winners Do All the Drugs", "I pity the fool who stays sober", date, users[0], callback);
        },
        ],
        // optional callback
        cb);
}

async.series([
    createUsers,
    createPosts,
],
// Optional callback
function(err, results) {
    if (err) {
        console.log('FINAL ERR: '+err);
    }
    else {
        console.log('Posts: '+posts);
        
    }
    // All done, disconnect from database
    mongoose.connection.close();
});