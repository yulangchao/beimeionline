'use strict';

var Topic = require('./topic.model');
var jwt = require('jsonwebtoken');
/**
 * GET /topics
 *
 * @description
 * list of topics
 *
 */
exports.find = function (req, res, next) {
  console.log(req.query.tab);
  if (req.query.tab == "all") {
    Topic.find({}, function (err, topics) {
      if (err) {
        return next(err);
      }
      return res.status(200).json(topics);
    }).skip((req.query.page - 1) * 20).limit(Number(req.query.limit)).
      sort({ top: -1 ,created_at: -1 });
  } else if (req.query.tab == "good") {
    Topic.find({
      "good": true
    }, function (err, topics) {
      if (err) {
        return next(err);
      }
      return res.status(200).json(topics);
    }).skip((req.query.page - 1) * 20).limit(Number(req.query.limit)).
      sort({ top: -1 ,created_at: -1 });
  } else {
    Topic.find({
      "tab": req.query.tab
    }, function (err, topics) {
      if (err) {
        return next(err);
      }
      return res.status(200).json(topics);
    }).skip((req.query.page - 1) * 20).limit(Number(req.query.limit)).
      sort({ top: -1 ,created_at: -1 });
  }
};

/**
 * GET /topics/:id
 *
 * @description
 * Find topic by id
 *
 */
exports.get = function (req, res, next) {
  Topic.findById(req.params.id, function (err, topic) {
    if (err) {
      return next(err);
    }
    if (!topic) {
      return res.status(404).send('Not Found');
    }

    topic.visit_count++;

    topic.save(function (err) {
      if (err) {
        return next(err);
      }
    });
    return res.status(200).json(topic);
  });
};

/**
 * POST /topics
 *
 * @description
 * Create a new topic
 *
 */
exports.post = function (req, res, next) {
  console.log(req.body);
  var user = jwt.decode(req.body.accesstoken);
  req.body.author = {
    loginname: user.fullName,
    avatar_url: user.avatar_url
  }
  req.body.author_id = user._id;
  Topic.create(req.body, function (err, topic) {
    if (err) {
      return next(err);
    }
    return res.status(201).json(topic);
  });
};

/**
 * PUT /topics/:id
 *
 * @description
 * Update a topic
 *
 */
exports.put = function (req, res, next) {
  Topic.findById(req.params.id, function (err, topic) {
    if (err) {
      return next(err);
    }
    if (!topic) {
      return res.status(404).send('Not Found');
    }

    topic.name = req.body.name;
    topic.description = req.body.description;

    topic.save(function (err) {
      if (err) {
        return next(err);
      }
      return res.status(200).json(topic);
    });
  });
};


exports.reply = function (req, res, next) {
  Topic.findById(req.params.id, function (err, topic) {
    if (err) {
      return next(err);
    }
    if (!topic) {
      return res.status(404).send('Not Found');
    }

    var user = jwt.decode(req.body.accesstoken);
    var reply = {
      author: {
        loginname: user.fullName,
        avatar_url: user.avatar_url
      },
      content: req.body.content,
      created_at: new Date()
    }

    topic.replies.push(reply);

    topic.save(function (err) {
      if (err) {
        return next(err);
      }
      return res.status(200).json(topic);
    });
  });
};
