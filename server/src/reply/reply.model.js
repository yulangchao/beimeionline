'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var ReplySchema = new Schema({
  topicId: String,
  imgs: [String]
});

module.exports = mongoose.model('replies', ReplySchema);