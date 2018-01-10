'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var ReplySchema = new Schema({
  topicId: String,
  author: Object,
  content: String,
  create_at: {
    type: Date,
    default: Date.now
  },
  is_uped: Boolean,
  ups: [String],
  is_read: Boolean,
  articleAuthorId: String,
  replyTo: String,
  type: String,
  topic_title: String
});

module.exports = mongoose.model('replies', ReplySchema);