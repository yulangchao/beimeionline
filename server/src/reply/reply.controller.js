'use strict';

var Reply = require('./reply.model');

/**
 * GET /replys
 *
 * @description
 * list of replys
 *
 */
exports.find = function(req, res, next) {
  Reply.find({
    topicId: req.params.id
  },function(err, replys) {
    if (err) {
      return next(err);
    }
    return res.status(200).json(replys);
  });
};

/**
 * GET /replys/:id
 *
 * @description
 * Find reply by id
 *
 */
exports.get = function(req, res, next) {
  Reply.findById(req.params.id, function(err, reply) {
    if (err) {
      return next(err);
    }
    if (!reply) {
      return res.status(404).send('Not Found');
    }
    return res.status(200).json(reply);
  });
};




exports.test = function(req, res, next) {
  return res.status(200).json("123");
};

/**
 * POST /replys
 *
 * @description
 * Create a new reply
 *
 */
exports.post = function(req, res, next) {
  console.log(req);
  Reply.create(req.body, function(err, reply) {
    if (err) {
      return next(err);
    }
    return res.status(201).json(reply);
  });
};

/**
 * PUT /replys/:id
 *
 * @description
 * Update a reply
 *
 */
exports.put = function(req, res, next) {
  Reply.findById(req.params.id, function(err, reply) {
    if (err) {
      return next(err);
    }
    if (!reply) {
      return res.status(404).send('Not Found');
    }

    reply.name = req.body.name;
    reply.description = req.body.description;

    reply.save(function(err) {
      if (err) {
        return next(err);
      }
      return res.status(200).json(reply);
    });
  });
};
