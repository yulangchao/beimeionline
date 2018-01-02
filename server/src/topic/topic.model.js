'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var TopicSchema = new Schema({
  id: String,
  author: Object,
  author_id: String,
  content: String,
  good: {
    type: Boolean,
    default: false
  },
  tab: {
    type: String
  },
  title: String,
  top: {
    type: Boolean,
    default: false
  },
  visit_count: {
    type: Number,
    default: 0
  },
  hasImage: Boolean,
  replies: [],
  city: String
},
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
  });

module.exports = mongoose.model('Topic', TopicSchema);
