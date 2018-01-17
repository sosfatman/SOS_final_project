var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    bcrypt   = require('bcrypt-nodejs'),
    Article = require('./article'),
    Chats = require('./chats'),
    Groups = require('./groups'),
    Events = require('./events');

var FavoriteArticle = new Schema({
  createdDate: Date,
  node:{
    type: Schema.Types.ObjectId,
    ref: 'Article'
  }
})

var FavoriteChat = new Schema({
  createdDate: Date,
  node:{
    type: Schema.Types.ObjectId,
    ref: 'Chats'
  }
})

var FavoriteGroup = new Schema({
  createdDate: Date,
  node:{
    type: Schema.Types.ObjectId,
    ref: 'Groups'
  }
})

var FavoriteEvent = new Schema({
  createdDate: Date,
  node:{
    type: Schema.Types.ObjectId,
    ref: 'Events'
  }
})


var UserSchema = new Schema({
  local: {
    email: String,
    password: String,
  },
  avatarImgSrc: String,
  name: String,
  school: String,
  department: String,
  position: String,
  intro: String,
  about: String,
  favArticles: [FavoriteArticle],
  favChats: [FavoriteChat],
  favGroups: [FavoriteGroup],
  favEvents: [FavoriteEvent],
  resetPasswordToken: String,
  resetPasswordExpires: Date,
  createdDate: Date,
  isDeleted: Boolean,
  lastLoginDate: Date
});

UserSchema.methods.generateHash = function(password) {
  return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
};
UserSchema.methods.validPassword = function(password) {
  return bcrypt.compareSync(password, this.local.password);
};
module.exports = mongoose.model('User', UserSchema);
