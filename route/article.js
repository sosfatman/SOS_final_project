var express = require('express'),
    router = express.Router(),
    bodyParser = require('body-parser'),
    urlencode = bodyParser.urlencoded({extended: false}),
    Moment = require('moment'),
    Notice = require('../config/notification'),
    Article = require('../model/article');//,
    //data = require('../data');

router.use(isLoggedIn)

function createArticle(req, res, next){
  var article = new Article({
    title: req.body.title,
    content: req.body.content,
    bannerImgSrc: req.body.bannerImgSrc,
    link: req.body.link,
    tags: req.body.tags,
    createdDate: Moment().format()
  });
 
  article.save(function(err, article){
    console.log("saving");
    //var mes = (err)?Notice.chats_create.error:Notice.chats_create.success;
    res.redirect('/admin/articles/'+article.id);
    // req.flash("loginMessage", "成功po");
  });
}

function editArticle(req, res, next){
  Article.update({_id:req.params.id}, {
    $set:{
      title: req.body.title,
      content: req.body.content,
      bannerImgSrc: req.body.bannerImgSrc,
      link: req.body.link,
      tags: req.body.tags,
      createdDate: req.body.createdDate
    }
  }, function(err, numberAffected, raw){
    if (err) {
      console.log(err);
    }
    res.redirect('/admin/articles/'+req.params.id);
  })
}

router.route('/')
  .get(function(req, res){
    Article
      .find()
      .skip(req.params.skip)
      .limit(req.params.limit)
      .exec(function(err, articles) {
        res.send({articles:articles});
      });
  })
  .post(createArticle);
router.route('/delete/:id')
  .put(function(req, res){
    Article
      .findOne({_id:req.params.id})
      .exec(function(err, article){
        article.isDeleted = !article.isDeleted;
        article.save(function(err){
          var mes = (err)?Notice.profile_setting_save.error:Notice.profile_setting_save.success;
          res.send({notification: mes});
        })
      })
  })
router.route('/:id')
  .get(function(req, res){
    Article.find({_id:req.params.id}, function(err,article){
      res.send({article:article});
    });
  })
  .post(editArticle)
  .delete(function(req,res){
    Article.remove({_id: req.params.id}, function(err){
      console.log(err);
    })
    res.send(200);
  })

function isLoggedIn(req, res, next) {
  if (req.isAuthenticated())
    return next();
  // req.flash("loginMessage", "請先登入");
  if (req.xhr || req.headers.accept.indexOf('json') > -1) {
    // send your xhr response here
    res.send({
      notification: Notice.notAuth,
      notAuth: true
    });
  } else {
    // send your normal response here
    res.redirect('/admin');
  }
}

module.exports = router;
