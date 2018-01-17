var mongoose = require('mongoose'),
    Schema = mongoose.Schema;
var User = require('./users'),
    Article = require('./article'),
    Chats = require('./chats'),
    Groups = require('./groups'),
    Events = require('./events');

var Tags = new Schema({
  name: String,
  articles: [{
    type: Schema.Types.ObjectId,
    ref: 'Article'
  }],
  chats: [{
    type: Schema.Types.ObjectId,
    ref: 'Chats'
  }],
  groups: [{
    type: Schema.Types.ObjectId,
    ref: 'Groups'
  }],
  events: [{
    type: Schema.Types.ObjectId,
    ref: 'Events'
  }],
  count: Number,
  isDeleted: Boolean
})

module.exports = mongoose.model('Tags', Tags);
