var LocalStrategy = require('passport-local').Strategy;
var User = require('../model/users'),
    Moment = require('moment'),
    mongoose = require('mongoose');

module.exports = function(passport){

  passport.serializeUser(function(user, done){
    done(null, user.id);
  });

  passport.deserializeUser(function(id, done){
    User.findById(id, function(err, user){
      done(err, user);
    });
  });

  passport.use('local-signup', new LocalStrategy({
    usernameField: 'email',
    passwordField: 'password',
    passReqToCallback: true,
    },
    function(req, email, password, done){
      process.nextTick(function(){
        User.findOne({ 'local.email':  email }, function(err, user){
          if(err)
            return done(err);
          if(user) {
            return done(null, false, req.flash('signupMessage', 'That email is already taken.'));
          } else {
            var newUser = new User();
            newUser.local.email = email;
            newUser.local.password = newUser.generateHash(password);
            newUser.avatarImgSrc = "/images/b1.png";
            newUser.createdDate = Moment().format();
            newUser.favArticles = [];
            var firstArtcle = {};
            firstArtcle.node = mongoose.Types.ObjectId("58c2871c7cc7402e502dc48e");
            firstArtcle.createdDate = Moment().format();
            newUser.favArticles.push(firstArtcle);
            newUser.favChats = [];
            var firstChat = {};
            firstChat.node =  mongoose.Types.ObjectId("58c27b3d89357423fea2d7a9");
            firstChat.createdDate = Moment().format();
            newUser.favChats.push(firstChat);
            newUser.save(function(err){
              if(err)
                throw err;
              return done(null, newUser);
            });
          }
        });
      });
    })
  );

  passport.use('local-login', new LocalStrategy({
    usernameField: 'email',
    passwordField: 'password',
    passReqToCallback: true,
    },
    function(req, email, password, done){
      User.findOne({ 'local.email':  email }, function(err, user){
        if(err)
          return done(err);
        if(!user)
          return done(null, false, req.flash('loginMessage', 'No user found.'));
        if(!user.validPassword(password))
          return done(null, false, req.flash('loginMessage', 'Oops! Wrong password.'));
        user.lastLoginDate = Moment().format();
        user.save();
        return done(null, user);
      });
    })
  );
};
