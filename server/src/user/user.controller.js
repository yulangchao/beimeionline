'use strict';

var mongoose = require('mongoose'),
  jwt = require('jsonwebtoken'),
  bcrypt = require('bcrypt'),
  User = require('./user.model');
  var fs = require('fs');

exports.register = function(req, res) {
  

  var base64Data = req.body.avatar_url.replace(/^data:image\/\w+;base64,/, "");
  var path = __dirname + "/../../imgs/users/" + req.body.email + ".png";

  fs.writeFile(path, base64Data, 'base64', (err) => {
    console.log(err);
  });

  req.body.avatar_url = "/static/users/" + req.body.email + ".png";
  var newUser = new User(req.body);
  newUser.hash_password = bcrypt.hashSync(req.body.password, 10);
  newUser.save(function(err, user) {
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

exports.sign_in = function(req, res) {
  User.findOne({
    email: req.body.email
  }, function(err, user) {
    if (err) throw err;
    if (!user || !user.comparePassword(req.body.password)) {
      return res.status(401).json({ message: 'Authentication failed. Invalid user or password.' });
    }
    return res.json({ token: jwt.sign({ email: user.email, fullName: user.fullName, _id: user._id, avatar_url: user.avatar_url }, 'RESTFULAPIs') });
  });
};

exports.loginRequired = function(req, res, next) {
  if (req.user) {
    next();
  } else {
    return res.status(401).json({ message: 'Unauthorized user!' });
  }
};