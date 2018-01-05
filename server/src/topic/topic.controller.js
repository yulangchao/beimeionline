'use strict';

var Topic = require('./topic.model');
var Img = require('../img/img.model');
var Reply = require('../reply/reply.model');
var jwt = require('jsonwebtoken');
var fs = require('fs');
var mkdirp = require('mkdirp');
var thumb = require('node-thumbnail').thumb;
/**
 * GET /topics
 *
 * @description
 * list of topics
 *
 */
exports.find = function (req, res, next) {
  if (req.query.tab == "all") {
    Topic.find({}, function (err, topics) {
      if (err) {
        return next(err);
      }
      return res.status(200).json(topics);
    }).skip((req.query.page - 1) * 5).limit(Number(req.query.limit)).
      sort({ top: -1, created_at: -1 });
  } else if (req.query.tab == "good") {
    Topic.find({
      "good": true
    }, function (err, topics) {
      if (err) {
        return next(err);
      }
      return res.status(200).json(topics);
    }).skip((req.query.page - 1) * 5).limit(Number(req.query.limit)).
      sort({ top: -1, created_at: -1 });
  } else {
    Topic.find({
      "tab": req.query.tab
    }, function (err, topics) {
      if (err) {
        return next(err);
      }
      return res.status(200).json(topics);
    }).skip((req.query.page - 1) * 5).limit(Number(req.query.limit)).
      sort({ top: -1, created_at: -1 });
  }
};

/**
 * GET /topics/:id
 *
 * @description
 * Find topic by id
 *
 */
// exports.get = function (req, res, next) {

//   Topic.findById(req.params.id, function (err, topic) {
//     if (err) {
//       return next(err);
//     }
//     if (!topic) {
//       return res.status(404).send('Not Found');
//     }

//     topic.visit_count++;

//     topic.save(function (err) {
//       if (err) {
//         return next(err);
//       }


//       Topic.aggregate([
//         { "$match": { id: req.params.id } },
//         {
//           "$lookup": {
//             "from": "imgs",
//             "localField": "id",
//             "foreignField": "topicId",
//             "as": "imgs"
//           }
//         }
//       ], function (err, topic) {
//         if (err) {
//           return next(err);
//         }
//         if (!topic) {
//           return res.status(404).send('Not Found');
//         }
//         return res.status(200).json(topic[0]);
//       });


//     });
//   });
// };
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
  var user = jwt.decode(req.body.accesstoken);
  req.body.author = {
    loginname: user.fullName,
    avatar_url: user.avatar_url
  }
  req.body.author_id = user._id;
  console.log("Topic:"+req.body.title + " created");
  Topic.create(req.body, function (err, topic) {
    if (err) {
      return next(err);
    }
    return res.status(201).json(topic);

  });
};

exports.upload = function (req, res, next) {

  mkdirp(__dirname + "/../../imgs/posts/" + req.body.id, function (err) {
    let small_imgs = [];
    let imgs = [];
    if (err) return cb(err);
    let i = 0;
    let count = 0;
    for (var key in req.files) {
      req.files[key].mv(__dirname + "/../../imgs/posts/" + req.body.id + "/" + i + ".png", function (err) {
        if (err)
          return res.status(500).send(err);

        small_imgs.push("/static/posts/" + req.body.id + "/" + count + "_thumb.png");
        imgs.push("/static/posts/" + req.body.id + "/" + count + ".png");
        count++;
      });
      i++;
    }
    var myVar = setInterval(function () {
      if (count == i) {
        clearInterval(myVar);
        thumb({
          source: __dirname + "/../../imgs/posts/" + req.body.id + "/", 
          destination: __dirname + "/../../imgs/posts/" + req.body.id + "/",
          concurrency: 6,
          width: 200
        }, function (files, err, stdout, stderr) {

          Topic.findById(req.body.id, function (err, topic) {
            if (err) {
              return next(err);
            }
            if (!topic) {
              return res.status(404).send('Not Found');
            }

            topic.small_imgs = small_imgs;
            topic.imgs = imgs;

            topic.save(function (err) {
              if (err) {
                return next(err);
              }
              console.log("User upload "+ i +" images to topic:"+req.body.id);
              return res.status(200).json(topic);
            });
          });
        });
      }
    }, 1000);
  });

};

// exports.post = function (req, res, next) {
//   var user = jwt.decode(req.body.accesstoken);
//   req.body.author = {
//     loginname: user.fullName,
//     avatar_url: user.avatar_url
//   }
//   req.body.author_id = user._id;
//   Topic.create(req.body, function (err, topic) {
//     if (err) {
//       return next(err);
//     }

//     if (req.body.imgs) {
//       var imgs = [];
//       var smaill_imgs = [];
//       var count = 0;
//       for (let i in req.body.imgs) {
//         smaill_imgs.push("/static/"+ topic._id + "/" + i + "_thumb.png");
//       }
//       mkdirp(__dirname + "/../../imgs/" + topic._id, function (err) {

//         if (err) return cb(err);

//         for (let i in req.body.imgs) {
//           var base64Data = req.body.imgs[i].replace(/^data:image\/\w+;base64,/, "");
//           console.log(123);
//           var path = __dirname + "/../../imgs/" + topic._id + "/" + i + ".png";
//           fs.writeFile(path, base64Data, 'base64', (err) => {
//             console.log(err);
//             count++;
//           });

//           imgs.push("/static/"+ topic._id + "/" + i + ".png");

//         }

//         var img_data = {
//           topicId: topic._id,
//           imgs: imgs
//         }
//         Img.create(img_data, function (err, imgs) {
//           if (err) {
//             return next(err);
//           }
//         });


//         var myVar = setInterval(function(){
//              console.log(count);
//              if(count == req.body.imgs.length){
//               clearInterval(myVar);
//               thumb({
//                 source: __dirname + "/../../imgs/" + topic._id + "/", // could be a filename: dest/path/image.jpg
//                 destination: __dirname + "/../../imgs/" + topic._id + "/",
//                 concurrency: 6,
//                 width: 200
//               }, function(files, err, stdout, stderr) {

//                 topic.hasImage = true;
//                 topic.smaill_imgs = smaill_imgs;
//                 topic.imgs = imgs;
//                 topic.id = topic._id;

//                 topic.save(function (err) {
//                   if (err) {
//                     return next(err);
//                   }
//                 });
//                 return res.status(201).json(topic);
//               });

//              }
//         }, 1000);
//       });



//     } else {
//       topic.hasImage = false;

//       topic.id = topic._id;

//       topic.save(function (err) {
//         if (err) {
//           return next(err);
//         }
//       });

//       return res.status(201).json(topic);
//     }

//   });
// };

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
      created_at: new Date(),
      articleId: topic._id,
      articleAuthorId: topic.author_id,
      read: false
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
