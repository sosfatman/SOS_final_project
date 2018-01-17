var express = require('express'),
    router = express.Router(),
    Moment = require('moment'),
    bodyParser = require('body-parser'),
    urlencode = bodyParser.urlencoded({extended: false}),
    Notice = require('../config/notification'),
    Events = require('../model/events'),
    User = require('../model/users'),
    fs = require('fs');

router.route('/')
  .get(function(req, res){
    Events
      .find()
      .exec(function(err, events) {
           res.send(events);
      });
  })
  .post(function(req, res){
    var author = req.user._id;
    if(req.body.author.length === 24)
      author = req.body.author;

    var participants = [];
    var particJSON = req.body.participants;
    if (particJSON) {
      for (var i = 0; i < particJSON.length; i++) {
        participants.push(JSON.parse(particJSON[i]));
      }
    }
    
    console.log(participants);

    var event = new Events({
      title: req.body.title,
      abstract: req.body.abstract,
      content: req.body.content,
      bannerImgSrc: req.body.bannerImgSrc,
      address: req.body.address,
      startDate: req.body.startDate,
      endDate: req.body.endDate,
      participants: participants,
      createdDate: Moment().format(),
      tags: req.body.tags,
      author: author
    });
    event.save(function(err, event){
      var mes = (err)?Notice.chats_create.error:Notice.chats_create.success;
      if(!err) {
        autoFavoriteNode(req, res, event, function(res, mes){
          console.log(mes);
          res.redirect('/admin/events/'+event.id);
        });
      } else {
        res.redirect('/admin/events/');
      }
    });
  });
router.route('/front')
  .post(isLoggedIn, function(req,res){
    
    var event = new Events({
      title: req.body.title,
      abstract: req.body.abstract,
      content: req.body.content,
      bannerImgSrc: req.body.bannerImgSrc,
      address: req.body.address,
      startDate: req.body.startDate,
      endDate: req.body.endDate,
      participants: req.body.participants,
      createdDate: Moment().format(),
      tags: req.body.tags,
      author: req.user._id
    });
    //console.log(event);
    // res.send(req.user);
    event.save(function(err,event){
      console.log("saving");
      var mes = (err)?Notice.chats_create.error:Notice.chats_create.success;
      if(!err){
        if(event.bannerImgSrc.includes('temp')) {
          var oldPath = '/home/webmaster/exp/public'+event.bannerImgSrc;
          var filename = event.bannerImgSrc.substring(event.bannerImgSrc.lastIndexOf('_')+1);
          var newPath = '/home/webmaster/exp/public/images/events/'+event.id+"_"+filename;
          fs.rename(oldPath, newPath, function (err) {
            if(err)
              console.log('rename callback ', err); 
          });
          var updateBannerImgSrc = '/images/events/'+event.id+"_"+filename;
          Events.update({_id:event.id}, {
            $set:{
              bannerImgSrc: updateBannerImgSrc
            }
          }, function(err){
            var mes = (err)?Notice.profile_setting_save.error:Notice.profile_setting_save.success;
            console.log(mes);
          })
        }        

        autoFavoriteNode(req, res, event, function(res, mes){
          res.send({
            notification: mes,
            redirect: "/social/events/"+event.id
          });
        });

        console.log("success");
      }else {
        res.send({
          notification: Notice.chats_create.notAuth,
        });
        console.log("fail");
      }
    });
  })
  .put(isLoggedIn,function(req, res){

    console.log(req.body);
    Events.update({_id:req.body.nodeid},{
      $set:{
      title: req.body.title,
      abstract: req.body.abstract,
      content: req.body.content,
      bannerImgSrc: req.body.bannerImgSrc,
      address: req.body.address,
      startDate: req.body.startDate,
      endDate: req.body.endDate,
      participants: req.body.participants,
      tags: req.body.tags
      }
    }, {upsert: true}, function(err){
        var mes = (err)?Notice.profile_setting_save.error:Notice.profile_setting_save.success;
        res.send({
          notification: mes,
          redirect: "/social/events/"+req.body.nodeid
        });
      })
  });
router.route('/delete/:id')
  .put(isLoggedIn, function(req, res){
    Events
      .findOne({_id:req.params.id})
      .exec(function(err, event){
        event.isDeleted = !event.isDeleted;
        event.save(function(err){
          var mes = (err)?Notice.profile_setting_save.error:Notice.profile_setting_save.success;
          res.send({notification: mes});
        })
      })
  })
router.route('/:id')
  .get(function(req, res){
    Events.find({_id:req.params.id}, function(err,data){
      res.send(data);
    });
  })
  .post(function(req, res){
    var author = req.user._id;
    if(req.body.author.length === 24)
      author = req.body.author;

    var participants = [];
    var particJSON = req.body.participants;
    for (var i = 0; i < particJSON.length; i++) {
      participants.push(JSON.parse(particJSON[i]));
    }

    Events.update({_id:req.params.id},{
      $set:{
        title: req.body.title,
        abstract: req.body.abstract,
        content: req.body.content,
        bannerImgSrc: req.body.bannerImgSrc,
        address: req.body.address,
        startDate: req.body.startDate,
        endDate: req.body.endDate,
        participants: participants,
        tags: req.body.tags,
        createdDate: req.body.createdDate,
        author: author
      }
    },function(err,numberAffected,raw){
      if (err) {
        console.log(err);
      }else {
        res.redirect('/admin/events/'+req.params.id);
      }

    })
  })
  .delete(function(req, res){
    Events.remove({_id: req.params.id}, function(err){
      if(err){
        console.log(err);
      }
      res.send(200);
    })

  })

function autoFavoriteNode(req, res, event, next){
  var createdDate = Moment().format(),
      userId = event.author,
      obj = {};

  obj["favEvents"] = {};
  obj["favEvents"].node = event.id;
  if(createdDate){
    obj["favEvents"].createdDate = createdDate;
  }

  User.update({_id: userId},
    { $push: obj },
    { safe: true, upsert: true },
    function(err, model) {
      var mes = (err)?Notice.article_favorite_post.error:Notice.article_favorite_post.success;
      return next(res, mes);
  });
}

function isLoggedIn(req, res, next) {
  if (req.isAuthenticated())
    return next();
  // req.flash("loginMessage", "請先登入");
  res.send({
    notification: Notice.chats_create.notAuth,
    redirect: "/",
    notAuth: true
  });

}
module.exports = router;
