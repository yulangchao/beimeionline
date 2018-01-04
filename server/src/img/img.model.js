'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var ImgSchema = new Schema({
  topicId: String,
  imgs: [String]
});

module.exports = mongoose.model('imgs', ImgSchema);
