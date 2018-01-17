var express = require('express'),
    passport = require('passport'),
    bodyParser = require('body-parser'),
    Moment = require('moment'),
    urlencode = bodyParser.urlencoded({extended: false}),
    Chats = require('../model/chats'),
    Notice = require('../config/notification'),
    User = require('../model/users');

var router = express.Router();

router.use(isLoggedIn)

function createChat(req, res, next){
  //  給j#: 新增聊天室功能
  var author = req.user._id;
  if (req.body.author) {
    if(req.body.author.length === 24)
      author = req.body.author;
  }
  
  var chat = new Chats({
    author: author,
    title: req.body.title,
    content: req.body.content,
    bannerImgSrc: req.body.bannerImgSrc,
    tags: req.body.tags,
    createdDate: Moment().format()
  });
  // res.send(req.user);
  chat.save(function(err, chat){
    console.log("saving");
    var mes = (err)?Notice.chats_create.error:Notice.chats_create.success;
    if(!err) {
      res.locals.autoCollector = chat.author;
      res.locals.chat = chat;
      next();
    } else {
      if (res.locals.isAjax) {
        res.send({
          notification: mes
        });
      } else {
        req.flash("errorMessage", mes);
        res.redirect('/admin/chats/add');
      }
    }
    // req.flash("loginMessage", "成功po");
  });
}

function autoFavoriteNode(req, res, next){
  var createdDate = Moment().format(),
      userId = res.locals.autoCollector,
      obj = {};

  obj.node = res.locals.chat.id;
  if(createdDate){
    obj.createdDate = createdDate;
  }

  User.findOne({_id: userId}, function(err, user){
    var favChats_ids = [];
    for(var i = 0; i < user.favChats.length; i++){
      favChats_ids.push(String(user.favChats[i].node));
    }
    if (favChats_ids.indexOf(res.locals.chat.id)==-1) {
      user.favChats.push(obj);
      user.save(function(err, user){
        var mes = (err)?Notice.article_favorite_post.error:Notice.article_favorite_post.success;
        if (!err) {
          res.locals.mes = mes;
          next();
        } else {
          if (res.locals.isAjax) {
            if (res.locals.isComment) {
              res.send({
                notification: mes,
                content: req.body.content
              })
            } else {
              res.send({
                notification: mes,
              });
            }
          } else {
            req.flash("errorMessage", mes);
            res.redirect('/admin/chats/'+res.locals.chat.id);
          }
        }
      })
    } else {
      res.send({
        notification: res.locals.mes,
        content: req.body.content
      });
    }
  })
}

function createComment(req, res, next){
  Chats.findOneAndUpdate({_id:req.params.id},{
    $push:{
      comments: {
        author: req.user._id,
        content: req.body.content,
        createdDate: Moment().format(),
      }
    }
  }, { new: true }, function(err, data){
    var mes = (err)?Notice.chats_create.error:Notice.chats_create.success;
    console.log(data);

    if (err) {
      res.send({
        notification: mes
      });
    } else {
      var commentsCount = 0;
      for (var i = 0; i <data.comments.length; i++) {
        if (String(data.comments[i].author)===String(req.user._id)) {
          commentsCount++;
        }
      }

      if (commentsCount === 1) {
        res.locals.isComment = true;
        res.locals.chat = data;
        res.locals.autoCollector = req.user._id;
        res.locals.mes = mes;
        next();
      } else {
        res.send({
          notification: mes,
          content: req.body.content
        });
      }
    }
  })
}

function editChat(req, res, next){
  var update_id = req.body.nodeid;
  var updateObj = {
    content: req.body.content,
    bannerImgSrc: req.body.bannerImgSrc,
    tags: req.body.tags
  };

  if (req.params.id) {
    update_id = req.params.id;
    updateObj.title = req.body.title;
    updateObj.createdDate = req.body.createdDate;
    
    if(req.body.author.length === 24)
      updateObj.author = req.body.author;
  }

  Chats.update({_id:update_id}, {$set:updateObj}, {upsert: true}, function(err, numberAffected, raw){
    var mes = (err)?Notice.profile_setting_save.error:Notice.profile_setting_save.success;
    if (err) {
      if (res.locals.isAjax) {
        res.send({
          notification: mes,
        });
      } else {
        req.flash("errorMessage", mes);
        res.redirect('/admin/chats/'+update_id);
      }
    } else {
      res.locals.mes = mes;
      next();
    }
  })
}

router.route('/')
  .get(function(req, res){
    Chats
      .find()
      .skip(req.params.skip)
      .limit(req.params.limit)
      .populate('author', "local.email _id avatarImgSrc")
      .sort({ createdDate: -1 })
      .exec(function(err, chats) {
         res.send(chats);
      });
  })
  .post(createChat, autoFavoriteNode, function(req, res){
    res.redirect('/admin/chats/'+res.locals.chat.id);
  });
router.route('/front')
  .post(createChat, autoFavoriteNode, function(req, res){
    res.send({
      notification: res.locals.mes,
      redirect: "/chats/"+res.locals.chat.id
    });  
  })
  .put(editChat, function(req, res){
    res.send({
      notification: res.locals.mes,
      redirect: "/chats/"+req.body.nodeid
    });
  });
router.route('/delete/:id')
  .put(isLoggedIn, function(req, res){
    Chats
      .findOne({_id:req.params.id})
      .exec(function(err, chat){
        chat.isDeleted = !chat.isDeleted;
        chat.save(function(err){
          var mes = (err)?Notice.profile_setting_save.error:Notice.profile_setting_save.success;
          res.send({notification: mes});
        })
      })
  })
router.route('/:id')
  .get(function(req, res){
    Chats
      .findOne({_id:req.params.id})
      .populate('author')
      .populate('comments.author', "local.email _id avatarImgSrc")
      .exec(function(err, chat) {
         res.send(chat);
      });
  })
  .post(editChat, function(req, res){
    res.redirect('/admin/chats/'+req.params.id);
  })
  .delete(function(req, res){
    Chats.remove({_id: req.params.id}, function(err){
      if(err){
        console.log(err);
      }
      res.send(200);
    })
  })

router.route('/create/:id')
  .put(urlencode, createComment, autoFavoriteNode, function(req, res){
    res.send({
      notification: res.locals.mes,
      content: req.body.content
    });
  });
router.route('/comments/:chid/:coid/remove')
  .put(isLoggedIn, function(req,res){
    Chats.findOneAndUpdate({_id:req.params.chid},{
      $pull:{ comments: {_id: req.params.coid} }
      },
      function(err, tag){
        if(err){
          console.log(err);
        }
        res.send(200);
      })
  });

function isLoggedIn(req, res, next) {
  if (req.xhr || req.headers.accept.indexOf('json') > -1) {
    // send your xhr response here
    res.locals.isAjax = true;
  } 

  if (req.isAuthenticated())
    return next();
  // req.flash("loginMessage", "請先登入");
  if (res.locals.isAjax) {
    // send your xhr response here
    res.send({
      notification: Notice.notAuth,
      notAuth: true
    });
  } else {
    // send your normal response here
    req.flash('errorMessage', 'Sorry, but you are not administrator.');
    res.redirect('/admin');
  }
}

module.exports = router;
