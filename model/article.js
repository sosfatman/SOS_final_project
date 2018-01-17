// /model/article.js

var mongoose = require('mongoose');

module.exports = mongoose.model('Article', {
  title: String,
  link: String,
  content: String,
  createdDate: String,
  tags: [String],
  bannerImgSrc: String,
  isDeleted: Boolean
});
