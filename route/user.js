var express = require('express'),
    router = express.Router(),
    request = require('request'),
    Moment = require('moment'),
    bodyParser = require('body-parser'),
    urlencode = bodyParser.urlencoded({extended: false}),
    User = require('../model/users'),
    Notice = require('../config/notification'),
    Chats = require('../model/chats');

var alexId = "5835051f1aab8e53b2468a59";
/* 收藏功能 */
router.route('/like/:type')
  .post(isLoggedIn, function(req, res){
    var createdDate = Moment().format(),
        updateDate,
        user_id = req.user._id;
        // userId = alexId;

    User.update({_id: user_id},
      {$push: genFavObj(req.params.type, createdDate, req.body.nodeId)},
      {safe: true, upsert: true},
      function(err){
        var mes = (err)?Notice.article_favorite_post.error:Notice.article_favorite_post.success;
        res.send({notification: mes});
      })
  })
  .put(isLoggedIn, function(req, res){
    var user_id = req.user._id;
    User.update({_id: user_id},
      {$pull: genFavObj(req.params.type, null, req.body.nodeId),
        // $set: {name: req.body.name}
      },
      function(err){
        var mes = (err)?Notice.article_unfavorite_post.error:Notice.article_unfavorite_post.success;
        res.send({notification: mes});
      })
  });

router.route('/')
  .get(function(req, res){
    // var userId = req.user._id;
    // 先訂一個user
    var user_id = alexId;
    User
      .findById(user_id)
      .populate('favArticles.node')
      .populate('favChats.node')
      .populate('favGroups.node')
      .populate('favEvents.node')
      .exec(function(err, user){
        res.send(user);
      });
  })
  .post(urlencode, function(req, res){
    // var userId = req.user._id;
    var user_id = alexId;
    User.update({_id: user_id},
      {name: req.body.userName,
       intro: req.body.userIntro
      },
      function(err){
        var mes = (err)?Notice.profile_setting_save.error:Notice.profile_setting_save.success;
        res.send({notification: mes});
      }
    );
  })
  .put(function(req, res){
    var user_id = req.user.id;
    User.update({_id: user_id},
      {$set: {name: req.body.name,
              intro: req.body.intro,
              about: req.body.about,
              school: req.body.school,
              department: req.body.department,
              position: req.body.position,
              avatarImgSrc: req.body.avatarImgSrc
             }
      },
      {upsert: true},
      function(err){
        var mes = (err)?Notice.profile_setting_save.error:Notice.profile_setting_save.success;
        res.send({
          notification: mes,
          redirect: "/profile"
        });
      })
  })
router.route('/delete/:id')
  .put(isLoggedIn, function(req, res){
    User
      .findOne({_id:req.params.id})
      .exec(function(err, user){
        user.isDeleted = !user.isDeleted;
        user.save(function(err){
          var mes = (err)?Notice.profile_setting_save.error:Notice.profile_setting_save.success;
          res.send({notification: mes});
        })
      })
  })
router.route('/:id')
  .post(function(req, res){
    User.update({_id: req.params.id},
      {$set: {
        name: req.body.name,
        intro: req.body.intro,
        about: req.body.about,
        school: req.body.school,
        department: req.body.department,
        position: req.body.position,
        avatarImgSrc: req.body.avatarImgSrc
        }
      },
      {upsert: true},
      function(err){
        if(err){
          res.send(err);
        }
        res.redirect('/admin/users/'+req.params.id);
      })
  })

router.route('/avatar')
  .post(urlencode, function(req, res){
    // var userId = req.user._id;
    var user_id = alexId;
    // res.send(200);
    User.update({_id: user_id},
      {avatarImgSrc: req.body.avatarImgSrc},
      function(err){
        var mes = (err)?Notice.profile_avatar_change.error:Notice.profile_avatar_change.success;
        res.send({notification: mes});
    })

  });

router.route('/posts')
  .get(function(req, res){
    // var userId = req.user._id;
    var user_id = alexId;
    Chats
      .find({author: user_id})
      .exec(function(err, posts){
        res.send(posts);
      });
  });
router.route('/getFavCount/:type')
  .get(function(req, res){
    // res.send(200);
    var favType = req.params.type;
    User
      .aggregate([{$unwind: "$fav"+favType},
        {$unwind: "$fav"+favType+".node"},
        {$group: {_id: "$fav"+favType+".node", "count": {"$sum": 1}}}
      ])
      .exec(function(err, data){
        if(err){
          return res.send(err);
        }
        res.send(data);
      })

    // 可行
    // User
    //   .find({"favArticles.node": "581d87ce71c3cd16275472e3"})
    //   .exec(function(err, data){
    //     res.send(data);
    //   })
  })
router.route('/collected')
  .get(function(req, res){
    // var userId = req.user._id;
    var user_id = alexId;
    User
      .findOne({_id: user_id})
      .exec(function(err, user){
        res.send(user["favArticles"]);
      });
  });

router.route('/getAutocompleteJson')
  .get(function(req, res){
    User
      .find({isDeleted: {$ne: true}})
      .exec(function(err, users){
        var data = [];
        users.map(function(user){
          var name = (user.name)?user.name:"empty";
          var email = (user.local.email)?user.local.email:"empty";
          data.push({
            id: user._id,
            name: name+" - "+email,
            type: "user"
          })
        })
        //console.log(data);
        res.send(data);
      });
  });

router.route('/getCurrentUser')
  .get(function(req, res){
    if(req.user) {
      res.send(req.user);
    } else {
      res.send(null);
    }
  })
  .post(function(req, res){

  })
  .put(function(req, res){

  })
  .delete(function(req, res){

  })

function isLoggedIn(req, res, next) {
  if (req.isAuthenticated())
    return next();
  // req.flash("loginMessage", "請先登入");
  res.send({
    notification: Notice.notAuth,
    notAuth: true
  });
}

function genFavObj(type, createdDate, nodeId){
  var obj = {},
      key;

  if(type == "articles") {
    key = "favArticles";
  } else if(type == "chats") {
    key = "favChats";
  } else if(type == "groups") {
    key = "favGroups";
  } else if(type == "events") {
    key = "favEvents";
  }
  obj[key] = {};
  obj[key].node = nodeId;
  if(createdDate) {
      obj[key].createdDate = createdDate;
  }

  return obj;
}
module.exports = router;
