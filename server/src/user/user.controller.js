'use strict';

var mongoose = require('mongoose'),
  jwt = require('jsonwebtoken'),
  bcrypt = require('bcrypt'),
  User = require('./user.model'),
  Topic = require('../topic/topic.model'),
  Reply = require('../reply/reply.model');
var fs = require('fs');
var mkdirp = require('mkdirp');
var thumb = require('node-thumbnail').thumb;
var jwt = require('jsonwebtoken');


exports.register = function (req, res) {
  if (req.body.hasImg == "false") {
    req.body.avatar_url = "https://avatars1.githubusercontent.com/u/227713?v=3&s=120";
    console.log("User has created with the default imgs");
  } else {
    req.body.avatar_url = null;
  }
  var newUser = new User(req.body);
  newUser.hash_password = bcrypt.hashSync(req.body.password, 10);
  newUser.save(function (err, user) {
    if (err) {
      return res.status(400).send({
        message: err
      });
    } else {
      user.hash_password = undefined;
      return res.json(user);
    }
  });
};

exports.sign_in = function (req, res) {
  User.findOne({
    email: req.body.email
  }, function (err, user) {
    if (err) throw err;
    if (!user || !user.comparePassword(req.body.password)) {
      return res.status(401).json({ message: 'Authentication failed. Invalid user or password.' });
    }
    return res.json({ token: jwt.sign({ email: user.email, fullName: user.fullName, _id: user._id, avatar_url: user.avatar_url }, 'RESTFULAPIs') });
  });
};

exports.loginRequired = function (req, res, next) {
  if (req.user) {
    next();
  } else {
    return res.status(401).json({ message: 'Unauthorized user!' });
  }
};

exports.getInfo = function (req, res, next) {
  User.findOne({
    fullName: req.query.name
  }, function (err, user) {

    if (err) throw err;

    Topic.find({
      "author_id": user._id
    }, function (err, topics) {
      if (err) {
        return next(err);
      }

      Reply.find({
        'author.loginname': user.fullName
      }, function (err, replies) {
        if (err) {
          return next(err);
        }
        return res.status(200).json({ email: user.email, loginname: user.fullName, _id: user._id, avatar_url: user.avatar_url, create_at: user.created, topics: topics, replies: replies });
      }).limit(10).sort({ create_at: -1 });

    }).limit(10).sort({ created_at: -1 });

  });
};

exports.getMessage = function (req, res, next) {

  var user = jwt.decode(req.query.accesstoken);
  User.findOne({
    fullName: user.fullName
  }, function (err, user) {

    if (err) throw err;
    Reply.find({
      $or: [
        { 'articleAuthorId': user._id },
        { 'replyTo': user.fullName }
      ]
    }, function (err, replies) {
      if (err) {
        return next(err);
      }
      return res.status(200).json({replies: replies });
    }).limit(10).sort({ create_at: -1 });

  });
};


exports.visited = function(req, res, next) {
  Reply.findById(req.body.id, function(err, reply) {
    if (err) {
      return next(err);
    }
    if (!reply) {
      return res.status(404).send('Not Found');
    }
    reply.is_read = true;

    reply.save(function(err) {
      if (err) {
        return next(err);
      }
      return res.status(200).json("done");
    });


  });
};


exports.ups = function(req, res, next) {
  var user = jwt.decode(req.body.accesstoken);
  Reply.findById(req.body.id, function(err, reply) {
    if (err) {
      return next(err);
    }
    if (!reply) {
      return res.status(404).send('Not Found');
    }
    reply.ups.push(user._id);

    reply.save(function(err) {
      if (err) {
        return next(err);
      }
      return res.status(200).json("done");
    });


  });
};








exports.upload = function (req, res, next) {
  mkdirp(__dirname + "/../../imgs/users/" + req.body.id, function (err) {
    let small_imgs = [];
    if (err) return cb(err);
    let i = 0;
    let count = 0;
    for (var key in req.files) {
      req.files[key].mv(__dirname + "/../../imgs/users/" + req.body.id + "/" + i + ".png", function (err) {
        if (err)
          return res.status(500).send(err);

        small_imgs.push("/static/users/" + req.body.id + "/" + count + "_thumb.png");
        count++;
      });
      i++;
    }
    var myVar = setInterval(function () {
      if (count == i) {
        clearInterval(myVar);
        thumb({
          source: __dirname + "/../../imgs/users/" + req.body.id + "/",
          destination: __dirname + "/../../imgs/users/" + req.body.id + "/",
          concurrency: 6,
          width: 200
        }, function (files, err, stdout, stderr) {

          User.findById(req.body.id, function (err, user) {
            if (err) {
              return next(err);
            }
            if (!user) {
              return res.status(404).send('Not Found');
            }

            user.avatar_url = small_imgs[0];

            user.save(function (err) {
              if (err) {
                return next(err);
              }
              console.log("User has created with one iamge");
              return res.status(200).json(user);
            });
          });
        });
      }
    }, 1000);
  });

};