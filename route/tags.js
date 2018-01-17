var express = require('express'),
    router = express.Router(),
    Tags = require('../model/tags'),
    Articles = require('../model/article'),
    Chats = require('../model/chats'),
    Groups = require('../model/groups'),
    Events = require('../model/events'),
    Notice = require('../config/notification');

router.route('/')
  .get(function(req, res){
    res.send(200);
  })
router.route("/sort")
  .put(function(req, res){
    var urlType = req.body.type,
        tagName = req.body.tagname,
        nodeId = req.body.nodeid;

    addTag(urlType, tagName, nodeId, res);
  })
router.route("/clean")
  .put(function(req, res){
    var urlType = req.body.type,
        tagName = req.body.tagname,
        nodeId = req.body.nodeid;

    removeTag(urlType, tagName, nodeId, res);
  })
router.route('/getAutocompleteJson')
  .get(function(req, res){
    Tags
      .find({isDeleted: {$ne: true}})
      .exec(function(error, tags){
        var data = [];
        tags.map(function(tag){
          var tagname = (tag.name)?tag.name:"empty";
          data.push(tagname);
        })
        //console.log(data);
        res.send(data);
      })
  })
router.route('/delete/:name')
  .put(isLoggedIn, function(req, res){
    Tags
      .findOne({name:req.params.name})
      .exec(function(err, tag){
        tag.isDeleted = !tag.isDeleted;
        tag.save(function(err){
          var mes = (err)?Notice.profile_setting_save.error:Notice.profile_setting_save.success;
          res.send({notification: mes});
        })
      })
  })
router.route('/:name')
  .get(function(req, res){
    Tags.find({name:req.params.name}, function(err,nodes){
      res.send({nodes:nodes});
    });
  });

router.param('contentType', function( req, res, next, contentType ) {
  req.contentType_from_param = contentType;
  next();
});
router.param('id', function( req, res, next, id ) {
  req.id_from_param = id;
  next();
});
router.route("/:contentType/:id/add")
  .put(function(req, res){
    var urlType = req.contentType_from_param,
        nodeId = req.id_from_param,
        tagName = req.body.tag;
    var db = getDbObj(urlType); /* 整個物件 */

    db.update({ _id: nodeId },
      { $push:{ tags: tagName }},
      { upsert: true },
      function(err) {
      // var mes = (err)?Notice.timelines_create.error:Notice.timelines_create.success;
        if(err) {
          res.send({
            error: err
          });
        } else{
          addTag(urlType, tagName, nodeId, res);
        }
      }
    )
  })
router.route("/:contentType/:id/remove")
  .put(function(req, res){
    var urlType = req.contentType_from_param,
        nodeId = req.id_from_param,
        tagName = req.body.tag;
    var db = getDbObj(urlType); /* 整個物件 */
    db.update({ _id: nodeId },
      { $pull:{ tags: tagName } },
      function(err) {
      // var mes = (err)?Notice.timelines_create.error:Notice.timelines_create.success;
        if(err) {
          res.send({
            error: err
          });
        } else{
          removeTag(urlType, tagName, nodeId, res);
        }
      }
    )
  })
function addTag(db, tagName, nodeId, res){
  if(db == "articles"){
    Tags.findOneAndUpdate({name:tagName},{
      $push:{ articles: nodeId },
      $inc: {count: 1 }},
      { upsert: true, new: true },
      function(err, tag){
      // var mes = (err)?Notice.timelines_create.error:Notice.timelines_create.success;
        console.log(tag);
        if(err){
          res.send({
            error: err
          });
        }
        var totalCount = tag.articles.length+tag.chats.length+tag.groups.length+tag.events.length;
        if (tag.count !== totalCount) {
          Tags.Tags.findOneAndUpdate({name:tagName}, {$push:{count: totalCount}}, function(err){
            if(err){
              res.send({
                error: err
              });
            }
          });
        }
        res.sendStatus(200);
      }
    )
  }else if(db == "chats"){
    Tags.findOneAndUpdate({name:tagName},{
      $push:{ chats: nodeId },
      $inc: {count: 1 }},
      { upsert: true, new: true },
      function(err, tag){
        console.log(tag);
      // var mes = (err)?Notice.timelines_create.error:Notice.timelines_create.success;
        if(err){
          res.send({
            error: err
          });
        }
        var totalCount = tag.articles.length+tag.chats.length+tag.groups.length+tag.events.length;
        if (tag.count !== totalCount) {
          Tags.Tags.findOneAndUpdate({name:tagName}, {$push:{count: totalCount}}, function(err){
            if(err){
              res.send({
                error: err
              });
            }
          });
        }
        res.sendStatus(200);
      }
    )
  } else if(db == "groups"){
    Tags.findOneAndUpdate({name:tagName},{
      $push:{ groups: nodeId },
      $inc: {count: 1 }},
      { upsert: true, new: true },
      function(err, tag){
      // var mes = (err)?Notice.timelines_create.error:Notice.timelines_create.success;
        if(err){
          res.send({
            error: err
          });
        }
        var totalCount = tag.articles.length+tag.chats.length+tag.groups.length+tag.events.length;
        if (tag.count !== totalCount) {
          Tags.Tags.findOneAndUpdate({name:tagName}, {$push:{count: totalCount}}, function(err){
            if(err){
              res.send({
                error: err
              });
            }
          });
        }
        res.sendStatus(200);
      }
    )
  } else if(db == "events"){
    Tags.findOneAndUpdate({name:tagName},{
      $push:{ events: nodeId },
      $inc: {count: 1 }},
      { upsert: true, new: true },
      function(err, tag){
      // var mes = (err)?Notice.timelines_create.error:Notice.timelines_create.success;
        if(err){
          res.send({
            error: err
          });
        }
        var totalCount = tag.articles.length+tag.chats.length+tag.groups.length+tag.events.length;
        if (tag.count !== totalCount) {
          Tags.Tags.findOneAndUpdate({name:tagName}, {$push:{count: totalCount}}, function(err){
            if(err){
              res.send({
                error: err
              });
            }
          });
        }
        res.sendStatus(200);
      }
    )
  }
}
function removeTag(db, tagName, nodeId, res){
  if(db == "articles"){
    Tags.findOneAndUpdate({name: tagName},{
      $pull:{ articles: nodeId },
      $inc: {count: -1 }},
      { new: true },
      function(err, tag){
      // var mes = (err)?Notice.timelines_create.error:Notice.timelines_create.success;
        if(err){
          res.send({
            error: err
          });
        }
        var totalCount = tag.articles.length+tag.chats.length+tag.groups.length+tag.events.length;
        if (tag.count !== totalCount) {
          Tags.Tags.findOneAndUpdate({name:tagName}, {$push:{count: totalCount}}, function(err){
            if(err){
              res.send({
                error: err
              });
            }
          });
        }
        res.sendStatus(200);
      }
    )
  } else if(db == "chats"){
    Tags.findOneAndUpdate({name: tagName},{
      $pull:{ chats: nodeId },
      $inc: {count: -1 }},
      { new: true },
      function(err, tag){
      // var mes = (err)?Notice.timelines_create.error:Notice.timelines_create.success;
        if(err){
          res.send({
            error: err
          });
        }
        var totalCount = tag.articles.length+tag.chats.length+tag.groups.length+tag.events.length;
        if (tag.count !== totalCount) {
          Tags.Tags.findOneAndUpdate({name:tagName}, {$push:{count: totalCount}}, function(err){
            if(err){
              res.send({
                error: err
              });
            }
          });
        }
        res.sendStatus(200);
      }
    )
  } else if(db == "groups"){
    Tags.findOneAndUpdate({name: tagName},{
      $pull:{ groups: nodeId },
      $inc: {count: -1 }},
      { new: true },
      function(err, tag){
      // var mes = (err)?Notice.timelines_create.error:Notice.timelines_create.success;
        if(err){
          res.send({
            error: err
          });
        }
        var totalCount = tag.articles.length+tag.chats.length+tag.groups.length+tag.events.length;
        if (tag.count !== totalCount) {
          Tags.Tags.findOneAndUpdate({name:tagName}, {$push:{count: totalCount}}, function(err){
            if(err){
              res.send({
                error: err
              });
            }
          });
        }
        res.sendStatus(200);
      }
    )
  } else if(db == "events"){
    Tags.findOneAndUpdate({name: tagName},{
      $pull:{ events: nodeId },
      $inc: {count: -1 }},
      { new: true },
      function(err, tag){
      // var mes = (err)?Notice.timelines_create.error:Notice.timelines_create.success;
        if(err){
          res.send({
            error: err
          });
        }
        var totalCount = tag.articles.length+tag.chats.length+tag.groups.length+tag.events.length;
        if (tag.count !== totalCount) {
          Tags.Tags.findOneAndUpdate({name:tagName}, {$push:{count: totalCount}}, function(err){
            if(err){
              res.send({
                error: err
              });
            }
          });
        }
        res.sendStatus(200);
      }
    )
  }
}
function getDbObj(type){
  if(type == "articles") {
    return Articles;
  }else if(type == "chats"){
    return Chats;
  } else if(type == "groups"){
    return Groups;
  } else if(type == "events"){
    return Events;
  }
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
