var mongoose = require('mongoose');
var User = require('./users');
var Schema = mongoose.Schema;

var Comments = new Schema({
  author: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  content: String,
  createdDate: Date,
  isDeleted: Boolean
});

var Chats = new Schema({
  author: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  bannerImgSrc: String,
  title: String,
  content: String,
  tags: [String],
  comments: [Comments],
  createdDate: Date,
  isDeleted: Boolean
});

module.exports = mongoose.model('Chats', Chats);
