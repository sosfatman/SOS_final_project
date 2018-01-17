var express = require('express'),
    passport = require('passport'),
    bodyParser = require('body-parser'),
    Moment = require('moment'),
    urlencode = bodyParser.urlencoded({extended: false}),
    Groups = require('../model/groups'),
    Notice = require('../config/notification'),
    User = require('../model/users'),
    fs = require('fs');


var router = express.Router();

router.route('/')
  .get(function(req, res){
    Groups
      .find()
      .skip(req.params.skip)
      .limit(req.params.limit)
      .populate('author', "local.email _id avatarImgSrc")
      .sort({ createdDate: -1 })
      .exec(function(err, chats) {
         res.send(chats);
      });
  })
  .post(isLoggedIn, function(req, res){
    var author = req.user._id;
    if(req.body.author.length === 24)
      author = req.body.author;
    var group = new Groups({
      title: req.body.title,
      abstract: req.body.abstract,
      content: req.body.content,
      bannerImgSrc: req.body.bannerImgSrc,
      createdDate: Moment().format(),
      tags: req.body.tags,
      author: author
    });

    var leaderArray = req.body.leaders;

    if(Array.isArray(leaderArray)){
      for (var i = 0; i < leaderArray.length; i++){
        group.members.push({
          data: leaderArray[i],
          isLeader: true });
      }
    } else {
      if(leaderArray) {
        group.members.push({
          data: leaderArray,
          isLeader: true });
      }
    }

    var memberArray = req.body.members;

    if(Array.isArray(memberArray)){
      for (var i = 0; i < memberArray.length; i++){
        group.members.push({
          data: memberArray[i],
          isLeader: false });
      }
    } else {
      if(memberArray) {
        group.members.push({
          data: memberArray,
          isLeader: false });
      }
    }

    console.log(group.members);

    group.save(function(err, group){
      var mes = (err)?Notice.chats_create.error:Notice.chats_create.success;
      if(!err) {
         autoFavoriteNode(req, res, group, function(res, mes){
          console.log(mes);
          res.redirect('/admin/groups/'+group.id);
        });
      } else {
        res.send({
          notification: Notice.chats_create.notAuth,
        });
      }
      console.log(group.id);
      // res.send({
      //   notification: mes
      // });

      // req.flash("loginMessage", "成功po");
    });
  });
router.route('/getAutocompleteJson')
  .get(function(req, res){
    Groups
      .find({isDeleted: {$ne: true}})
      .exec(function(err, groups){
        var data = [];
        groups.map(function(group){
          var title = (group.title)?group.title:"empty"
          data.push({
            id: group._id,
            name: title,
            type: "group"
          })
        })
        //console.log(data);
        res.send(data);
      });
  });

router.route('/front')
  .post(isLoggedIn, function(req,res){

    var group = new Groups({
      title: req.body.title,
      abstract: req.body.abstract,
      content: req.body.content,
      bannerImgSrc: req.body.bannerImgSrc,
      createdDate: Moment().format(),
      tags: req.body.tags,
      author: req.user._id
    });

    var leaderArray = req.body.leaders;

    if(Array.isArray(leaderArray)){
      for (var i = 0; i < leaderArray.length; i++){
        group.members.push({
          data: leaderArray[i],
          isLeader: true });
      }
    } else {
      if(leaderArray) {
        group.members.push({
          data: leaderArray,
          isLeader: true });
      }
    }

    var memberArray = req.body.members;

    if(Array.isArray(memberArray)){
      for (var i = 0; i < memberArray.length; i++){
        group.members.push({
          data: memberArray[i],
          isLeader: false });
      }
    } else {
      if(memberArray) {
        group.members.push({
          data: memberArray,
          isLeader: false });
      }
    }


    console.log(group.members);
    // res.send(req.user);
    group.save(function(err,group){
      console.log("saving");
      var mes = (err)?Notice.chats_create.error:Notice.chats_create.success;
      if(!err){
        /*res.send({
          notification: Notice.timelines_create.notAuth,
          redirect: "/social/groups/"+group.id
        });*/
        if(group.bannerImgSrc.includes('temp')) {
          var oldPath = '/home/webmaster/exp/public'+group.bannerImgSrc;
          var filename = group.bannerImgSrc.substring(group.bannerImgSrc.lastIndexOf('_')+1);
          var newPath = '/home/webmaster/exp/public/images/groups/'+group.id+"_"+filename;
          fs.rename(oldPath, newPath, function (err) {
            if(err)
              console.log('rename callback ', err);
          });
          var updateBannerImgSrc = '/images/groups/'+group.id+"_"+filename;
          Groups.update({_id:group.id},{
            $set:{
              bannerImgSrc: updateBannerImgSrc
            }
          }, function(err){
            var mes = (err)?Notice.profile_setting_save.error:Notice.profile_setting_save.success;
            console.log(mes);
          })
        }

        autoFavoriteNode(req, res, group, function(res, mes){
          res.send({
            notification: mes,
            redirect: "/social/groups/"+group.id
          });
        });

        console.log("success");
      }else {
        res.send({
          notification: Notice.chats_create.notAuth,
        });
        console.log("fail");
      }
      // res.send({
      //   notification: mes
      // });

      // req.flash("loginMessage", "成功po");
    });
  })
  .put(isLoggedIn,function(req, res){
    console.log(req.body);
    var memberRefArray = [];
    var leaderArray = req.body.leaders;

    if(Array.isArray(leaderArray)){
      for (var i = 0; i < leaderArray.length; i++){
        memberRefArray.push({
          data: leaderArray[i],
          isLeader: true });
      }
    } else {
      if(leaderArray) {
        memberRefArray.push({
          data: leaderArray,
          isLeader: true });
      }
    }
    
    var memberArray = req.body.members;

    if(Array.isArray(memberArray)){
      for (var i = 0; i < memberArray.length; i++){
        memberRefArray.push({
          data: memberArray[i],
          isLeader: false });
      }
    } else {
      if(memberArray) {
        memberRefArray.push({
          data: memberArray,
          isLeader: false });
      }
    }

    Groups.update({_id:req.body.nodeid},{
      $set:{
      title: req.body.title,
      abstract: req.body.abstract,
      content: req.body.content,
      bannerImgSrc: req.body.bannerImgSrc,
      tags: req.body.tags,
      members: memberRefArray
      }
    }, {upsert: true}, function(err){
        var mes = (err)?Notice.profile_setting_save.error:Notice.profile_setting_save.success;
        res.send({
          notification: mes,
          redirect: "/social/groups/"+req.body.nodeid
        });
      })
  })
router.route('/delete/:id')
  .put(isLoggedIn, function(req, res){
    Groups
      .findOne({_id:req.params.id})
      .exec(function(err, group){
        group.isDeleted = !group.isDeleted;
        group.save(function(err){
          var mes = (err)?Notice.profile_setting_save.error:Notice.profile_setting_save.success;
          res.send({notification: mes});
        })
      })
  })
router.route('/:id')
  .get(function(req, res){
    Groups
      .find({_id:req.params.id})
      .populate('author')
      .populate('comments.author', "local.email _id avatarImgSrc")
      .exec(function(err, chat) {
         res.send(chat);
      });
  })
  .post(isLoggedIn, function(req, res){
    var author = req.user._id;
    if(req.body.author.length === 24)
      author = req.body.author;

    var memberRefArray = [];
    var leaderArray = req.body.leaders;

    if(Array.isArray(leaderArray)){
      for (var i = 0; i < leaderArray.length; i++){
        memberRefArray.push({
          data: leaderArray[i],
          isLeader: true });
      }
    } else {
      if(leaderArray) {
        memberRefArray.push({
          data: leaderArray,
          isLeader: true });
      }
    }

    var memberArray = req.body.members;

    if(Array.isArray(memberArray)){
      for (var i = 0; i < memberArray.length; i++){
        memberRefArray.push({
          data: memberArray[i],
          isLeader: false });
      }
    } else {
      if(memberArray) {
        memberRefArray.push({
          data: memberArray,
          isLeader: false });
      }
    }

    Groups.update({_id:req.params.id},{
      $set:{
        title: req.body.title,
        abstract: req.body.abstract,
        content: req.body.content,
        bannerImgSrc: req.body.bannerImgSrc,
        createdDate: req.body.createdDate,
        tags: req.body.tags,
        members: memberRefArray,
        author: author
      }
    },function(err,numberAffected,raw){
      if (err) {
        console.log(err);
      }
      res.redirect('/admin/groups/'+req.params.id);
    })
  })
  .delete(function(req, res){
    Groups.remove({_id: req.params.id}, function(err){
      if(err){
        console.log(err);
      }
      res.send(200);
    })

  })
router.route("/:id/add-member")
  .put(function(req, res){
    var nodeId = req.params.id;
    // var db = getDbObj(urlType); /* 整個物件 */
    Groups.update({ _id: nodeId },{
        $addToSet:{
          members: {
            data: req.body.uid,
            isLeader: req.body.isLeader,
          }
        }
      },
      { upsert: true },
      function(err) {
      // var mes = (err)?Notice.timelines_create.error:Notice.timelines_create.success;
        if(err) {
          console.log(err);
          res.send({
            error: err
          });
        } else{
          console.log("success");
          res.send(200);
          // addTag(urlType, tagName, nodeId, res);
        }
      }
    )
  })
router.route("/:id/remove-member")
  .delete(function(req, res){
    var nodeId = req.params.id;
    // var db = getDbObj(urlType); /* 整個物件 */
    Groups.update({ _id: nodeId },{
        $pull:{members: {_id: req.body.id}}
      },
      function(err) {
      // var mes = (err)?Notice.timelines_create.error:Notice.timelines_create.success;
        if(err) {
          console.log(err);
          res.send({
            error: err
          });
        } else{
          console.log("success");
          res.send(200);
          // addTag(urlType, tagName, nodeId, res);
        }
      }
    )
  })

function autoFavoriteNode(req, res, group, next){
  var createdDate = Moment().format(),
      userId = group.author,
      obj = {};

  obj["favGroups"] = {};
  obj["favGroups"].node = group.id;
  if(createdDate){
    obj["favGroups"].createdDate = createdDate;
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
    redirect: "/"
  });

}
module.exports = router;
