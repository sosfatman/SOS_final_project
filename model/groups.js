var mongoose = require('mongoose');
var User = require('./users');
var Schema = mongoose.Schema;

var Member = new Schema({
  data: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  isLeader: Boolean
});

var Groups = new Schema({
  author: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  bannerImgSrc: String,
  title: String,
  abstract: String,
  content: String,
  members: [Member],
  tags: [String],
  createdDate: Date,
  isDeleted: Boolean
});

module.exports = mongoose.model('Groups', Groups);
