var express = require('express'),
    Moment = require('moment'),
    router = express.Router(),
    bodyParser = require('body-parser'),
    urlencode = bodyParser.urlencoded(),
    Article = require('../model/article'),
    Chats = require('../model/chats'),
    Events = require('../model/events'),
    Groups = require('../model/groups'),
    Users = require('../model/users'),
    Tags = require('../model/tags');

router.use(isLoggedIn)

router.route('/')
  .get(function(req, res){
    res.render('admin/portal.ejs');
  });

router.route('/articles')
  .get(function(req, res){
    Article.find({isDeleted: {$ne: true}}, function(err, articles){
      res.render('admin/list-page.ejs',{
        listData:articles,
        nodeType: "articles",
        addNodeType: "articles",
        pageTitle: "文章管理",
        pageClass: "admin-article-list-page"
      });
    });
  });
router.route('/articles/add')
  .get(function(req, res){
    res.render('admin/article-add.ejs',{
      addNodeType: "articles"
    });
  });
router.route('/articles/:id')
  .get(function(req, res){
    Article.findOne({_id:req.params.id}, function(err, article){
      res.render('admin/article-edit.ejs',{node: article});
    });
  })

// router.route('/timelines')

router.route('/chats')
  .get(function(req, res){
    Chats.find({isDeleted: {$ne: true}}, function(err, chats){
      res.render('admin/list-page.ejs',{
        listData: chats,
        nodeType: "chats",
        addNodeType: "chats",
        pageTitle: "聊天室管理",
        pageClass: "admin-chats-list-page"
      });
    });
    // res.render('admin/chatroom_list.ejs');
  });
router.route('/chats/add')
  .get(function(req, res){
    res.render('admin/chat-add.ejs',{
      addNodeType: "chats"
    });
  });
router.route('/chats/:id')
  .get(function(req, res){
    Chats
      .findOne({_id:req.params.id})
      .populate('author')
      .populate('comments.author', "local.email")
      .exec(function(err, chat){
        res.render('admin/chat-edit.ejs',{node: chat});
        // res.send(timeline);
    });

  });

router.route('/events')
  .get(function(req, res){
    Events.find({isDeleted: {$ne: true}}, function(err, events){
      res.render('admin/list-page.ejs',{
        listData: events,
        addNodeType: "events",
        nodeType: "events",
        pageTitle: "活動管理",
        pageClass: "admin-events-list-page"
      });
    });
  })
router.route('/events/add')
  .get(function(req, res){
    res.render('admin/event-add.ejs',{
      addNodeType: "events",
    });
  })
router.route('/events/:id')
  .get(function(req, res){
    Events
    .findOne({_id:req.params.id})
    .populate('author')
    .populate('participants.user')
    .populate('participants.group')
    .exec(function(err, event){
      res.render('admin/event-edit.ejs',{node: event});
    });
  })

router.route('/groups')
  .get(function(req, res){
    Groups.find({isDeleted: {$ne: true}}, function(err, groups){
      res.render('admin/list-page.ejs',{
        listData: groups,
        nodeType: "groups",
        addNodeType: "groups",
        pageTitle: "圈子管理",
        pageClass: "admin-groups-list-page"
      });
    });
  });

router.route('/groups/add')
  .get(function(req, res){
    res.render('admin/group-add.ejs',{
      addNodeType: "groups"
    });
  })
router.route('/groups/:id')
  .get(function(req, res){
    Groups
      .findOne({_id:req.params.id})
      .populate('author')
      .populate("members.data")
      .exec(function(err, group){
        res.render('admin/group-edit.ejs',{node: group});
      })
  })


router.route('/users')
  .get(function(req, res){
    Users.find({isDeleted: {$ne: true}}, function(err,users){
      res.render('admin/user-list.ejs',{
        listData: users,
        nodeType: "users",
        addNodeType: "users",
        pageTitle: "帳戶管理",
        pageClass: "admin-users-list-page"
      });
    });
  })
router.route('/users/add')
  .get(function(req, res){
    res.render('admin/user-add.ejs',{
      addNodeType: "users"
    });
  })
router.route('/users/:id')
  .get(function(req, res){
    Users
      .findOne({_id:req.params.id})
      .populate("favArticles.node", "title _id")
      .populate("favChats.node", "title _id")
      .populate("favGroups.node", "title _id")
      .populate("favEvents.node", "title _id")
      .exec(function(err, user){
        //console.log(user);
        res.render('admin/user-edit.ejs',{node: user});
      })
  })

router.route('/delete')
  .get(function(req, res){
    Article
      .find({isDeleted: true})
      .exec(function(err, articles){
        Chats
          .find({isDeleted: true})
          .exec(function(err, chats){
            Groups
              .find({isDeleted: true})
              .exec(function(err, groups){
                Events
                  .find({isDeleted: true})
                  .exec(function(err, events){
                    Tags
                      .find({isDeleted: true})
                      .exec(function(err, tags){
                        Users
                          .find({isDeleted: true})
                          .exec(function(err, users){
                            res.render('admin/delete-list.ejs', {pageTitle: "刪除管理", articles:articles, chats:chats, groups:groups, events:events, tags:tags, users:users});
                          })
                      })
                  })
              })
          })
      })
  })

router.route('/tags')
  .get(function(req, res){
    Article
      .find()
      .exec(function(err, articles){
        Chats
          .find()
          .exec(function(err, chats){
            Groups
              .find()
              .exec(function(err, groups){
                Events
                  .find()
                  .exec(function(err, events){
                    Tags
                     .find({isDeleted: {$ne: true}})
                     .exec(function(err, tags){
                        res.render('admin/tag-list.ejs', {pageTitle: "標籤管理", articles:articles, chats:chats, groups:groups, events:events, tags:tags});
                     })
                  })
              })
          })
      })
  })


function isLoggedIn(req, res, next) {
  if (req.isAuthenticated()) {
    if (String(req.user._id)==="587c28e391d06c67aeaa50a4"||String(req.user._id)==="582c9bd943f5cb17515680bd"||
        String(req.user._id)==="5872fec41cd3a215bb49b3fe"||String(req.user._id)==="586f398bc7cc9612cad68fd7"||
        String(req.user._id)==="58c26c9a8b54ce17d60666db"||String(req.user._id)==="5832ed7a71a18a111211f3bf") {
      return next();
    } else {
      req.flash('errorMessage', 'Sorry, but you are not administrator.');
      res.redirect("/profile")
    }
  }
  console.log(req.originalUrl);
  req.session.returnTo = req.originalUrl;
  res.redirect("/login");

}

router.route('/event')
  .put(isLoggedIn, urlencode, function(req,res){
    Events.update({_id:req.params.id},{
      $set:{
        type: req.body.type,
        title: req.body.title,
        subTitle: req.body.subTitle,
        detail: {
          content: req.body.content,
          bannerUrl: req.body.bannerUrl
        }
      }
    },function(err,numberAffected,raw){
      if (err) {
        console.log(err);
      }
      res.send(200);
    })
  })

router.route('/add/meta/:id')
  .get(isLoggedIn, function(req, res){
    res.render('admin/node-add-meta.ejs',{
      addNodeType: "groups"
    });
  })

module.exports = router;
