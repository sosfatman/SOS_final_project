var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var User = require('./users'),
    Groups = require('./groups');

var Participant = new Schema({
  type: String,
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  group: {
    type: Schema.Types.ObjectId,
    ref: 'Groups'
  }
  
});

var Events = new Schema({
  author: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  bannerImgSrc: String,
  title: String,
  startDate: Date,
  endDate:  Date,
  address: String,
  abstract: String,
  content: String,
  participants: [Participant],
  tags: [String],
  createdDate: Date,
  isDeleted: Boolean
});

module.exports = mongoose.model('Events', Events);
