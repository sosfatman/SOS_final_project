var express = require('express'),
    passport = require('passport'),
    router = express.Router(),
    request = require('request'),
    Users = require('../model/users'),
    Articles = require('../model/article'),
    Chats = require('../model/chats'),
    Groups = require('../model/groups'),
    Events = require('../model/events'),
    Tags = require('../model/tags');
var nodemailer = require('nodemailer'),
    async = require('async'),
    crypto = require('crypto');
var recaptcha = require('express-recaptcha');
recaptcha.init('6Leg4hgUAAAAAHjQtBukaF5Pqh-DBuKNc_RmFo_z', '6Leg4hgUAAAAAIj3TTpc2_bN_f0D3TeuvNEEpyHf',
  {theme: 'dark', callback: 'verifyCallback', expired_callback: 'verifyCallback'});

var anonAuthor = {
    "_id" : "anonymous",
    "local" : {
        "email" : "匿名者@9emba.com"
    },
    "name" : "匿名者",
    "avatarImgSrc" : "/images/b1.png"
};

router.route('/')
  .get(function(req, res){
    res.redirect('/articles');
  });

router.route('/landing')
  .get(function(req, res){
    res.render('front/landing-page.ejs');
  });

router.route('/upload')
  .get(function(req, res){
    res.render('front/upload.ejs');
  });

router.route('/signup')
  .get(recaptcha.middleware.render, function(req, res){
    res.render('front/signup.ejs', { message: req.flash('signupMessage'), captcha:req.recaptcha });
  })
  .post(recaptcha.middleware.verify, function(req, res, next){
    if(!req.recaptcha.error) {
      // success code
      return next();
    } else {
      // error code
      res.render('front/error.ejs');
    }
  }, passport.authenticate('local-signup', {
    successRedirect: '/profile/edit',
    failureRedirect: '/signup',
    failureFlash: true,
  }));

router.route('/login')
  .get(function(req, res, next){
    res.render('front/login.ejs', { message: req.flash('loginMessage') });
  })
  .post(passport.authenticate('local-login', {
    successReturnToOrRedirect: '/profile',
    failureRedirect: '/login',
    failureFlash: true,
  }));
router.route('/logout')
  .get(function(req, res){
    req.logout();
    res.redirect('/');
});

router.route('/profile')
  .get(isLoggedIn, renderProfileNode);
router.route('/profile/edit')
  .get(isLoggedIn, renderProfileEdit);
router.route('/profile/:id')
  .get(renderProfileNode);

function renderProfileNode(req, res, next){
  var find_id;
  if(req.params.id){
    find_id = req.params.id;
  } else if (req.user._id) {
    find_id = req.user._id;
  }
  Users
    .findOne({_id: find_id, isDeleted: {$ne: true}})
    .populate({
      path: 'favArticles.node',
      match: {isDeleted: {$ne: true}}
    })
    .populate({
      path: 'favChats.node',
      match: {isDeleted: {$ne: true}},
      populate: { path: 'author', match: {isDeleted: {$ne: true}} }
    })
    .populate({
      path: 'favGroups.node',
      match: {isDeleted: {$ne: true}}
    })
    .populate({
      path: 'favEvents.node',
      match: {isDeleted: {$ne: true}}
    })
    .exec(function(err, user){
      if (user) {
        if(user.favArticles){
          user.favArticles = user.favArticles.filter(function(item){
            return item.node;
          })
        }
        if(user.favGroups){
          user.favGroups = user.favGroups.filter(function(item){
            return item.node;
          })
        }
        if(user.favChats){
          user.favChats = user.favChats.filter(function(item){
            return item.node;
          })
          if (user.favChats.length > 0) {
            user.favChats.forEach(function(item){
              if (!item.node.author) {
                item.node.author = anonAuthor;
              }
            })
          }
        }
        if(user.favEvents){
          user.favEvents = user.favEvents.filter(function(item){
            return item.node;
          })
        }

        var isAuthor = false;
        if(req.params.id){
          if (req.user) {
            if (String(req.user._id) === String(req.params.id)) {
              isAuthor = true;
            }
          }
        } else if (req.user._id) {
          isAuthor = true;
        }
        res.render('front/profile.ejs', {user: user, isAuthor: isAuthor, message: req.flash()});
        // res.send(user);
      } else {
        res.render('front/error.ejs', {message: "你要求的頁面不存在喔"});
      }
    });
}

function renderProfileEdit(req, res, next){
  var user_id = req.user._id;
  Users
    .findOne({_id: user_id, isDeleted: {$ne: true}})
    .exec(function(err, user){
      if (user) {
        res.render('front/profile-edit.ejs', {user: user});
      } else {
        res.render('front/error.ejs', {message: "你要求的頁面不存在喔"});
      }
    });
}

router.route('/articles')
  .get(renderArticleList);
router.route('/articles/:id')
  .get(renderArticleNode, isLoggedIn);

function renderArticleList(req, res, next){
  Articles
    .find({isDeleted: {$ne: true}})
    .skip(req.params.skip)
    .limit(req.params.limit)
    .exec(function(err, articles){
      var rand_articles = [];
      var rand_nums = [];
      var isListFull = false;
      var articlesCount = 0;
      var totalArticles = 20;
      if (articles.length < 20) {
        totalArticles = articles.length;
      }
      //console.log(articles[0]);
      while(!isListFull) {
        if (articlesCount < totalArticles) {
          var rand_num = Math.floor((Math.random() * articles.length));
          if (rand_nums.indexOf(rand_num)==-1) {
            rand_nums.push(rand_num);
            rand_articles.push(articles[rand_num]);
            articlesCount++;
          }
        } else {
          isListFull = true;
        }
      }
      //console.log(rand_article);
      res.render('front/article.ejs',
        {articles: rand_articles}
      );
    });
}

function renderArticleNode(req, res, next){
  if(req.query.requestLogin) {
    req.url = req.url.substring(0, req.url.indexOf("?"));
    return next();
  } else {
    Articles.findOne({_id: req.params.id, isDeleted: {$ne: true}}, function(err, article){
      if (article) {
        var isLike = false;
        if(!req.user) {
          res.render('front/article-node.ejs', {article: article, isLike: isLike});
        } else {
          if(req.user.favArticles){
            req.user.favArticles = req.user.favArticles.filter(function(item){
              return item.node;
            })
          }
          req.user.favArticles.map(function(favArticle){
            if(favArticle.node == req.params.id){
              isLike = true;
              return false;
            }
          })
          res.render('front/article-node.ejs', {article: article, isLike: isLike});
        }
      } else {
        res.render('front/error.ejs', {message: "你要求的頁面不存在喔"});
      }
    });
  }
}

router.route('/explore')
  .get(renderExploreList);
router.route('/explore/app')
  .get(function(req, res){
    res.render('front/explore-app-node.ejs');
  });
router.route('/explore/:tagName')
  .get(renderExploreNode, isLoggedIn)

function renderExploreList(req, res, next){
  Tags
    .find({isDeleted: {$ne: true}})
    .sort({count: -1})
    .exec(function(err, tags){
      res.render('front/explore.ejs', {tags: tags});
  });
}

function renderExploreNode(req, res, next){
  if(req.query.requestLogin) {
    req.url = req.url.substring(0, req.url.indexOf("?"));
    return next();
  } else {
    Tags
      .findOne({name: req.params.tagName, isDeleted: {$ne: true}})
      .populate({
        path: 'articles',
        match: {isDeleted: {$ne: true}}
      })
      .populate({
        path: 'chats',
        match: {isDeleted: {$ne: true}},
        populate: { path: 'author', match: {isDeleted: {$ne: true}} }
      })
      .populate({
        path: 'groups',
        match: {isDeleted: {$ne: true}}
      })
      .populate({
        path: 'events',
        match: {isDeleted: {$ne: true}},
        populate: [{ path: 'participants.group', match: {isDeleted: {$ne: true}}},
                   { path: 'participants.user', match: {isDeleted: {$ne: true}}}]
      })
      .exec(function(err, tag){
        //console.log(tag);
        if(tag) {
          var tagArticles = [],
              tagChats = [],
              tagGroups = [],
              tagEvents = [];
          if(tag.articles) {
            tagArticles = tag.articles;
            for (var i = 0; i < tagArticles.length; i++) {
              tagArticles[i].type = "article";
              //console.log(tagArticles[i].title);
            }
          }
          if(tag.chats) {
            tag.chats.forEach(function(item){
              if (!item.author) {
                item.author = anonAuthor;
              }
            });
            tagChats = tag.chats;
            for (var i = 0; i < tagChats.length; i++) {
              tagChats[i].type = "chat";
            }
          }
          if(tag.groups) {
            tagGroups = tag.groups;
            for (var i = 0; i < tagGroups.length; i++) {
              tagGroups[i].type = "group";
            }
          }
          if(tag.events) {
            tag.events.forEach(function(event){
              if(event.participants){
                event.participants = event.participants.filter(function(participant){
                  if (participant.type === "user") {
                    return participant.user;
                  } else if (participant.type === "group") {
                    return participant.group;
                  }
                })
              }
            });
            tagEvents = tag.events;
            for (var i = 0; i < tagEvents.length; i++) {
              tagEvents[i].type = "event";
            }
          }
          var content = tagArticles.concat(tagChats);
          content = content.concat(tagGroups);
          content = content.concat(tagEvents);
          var sortedContent = [];
          if(content.length > 0) {
            sortedContent = content.sort(function(a,b){
              return new Date(b.createdDate) - new Date(a.createdDate);
            });
          }
          //console.log(sortedContent);
          if(sortedContent.length > 0) {
            tag.content = sortedContent;
          }

          var user_id;
          if(req.user) {
            if(req.user._id) {
              user_id = req.user._id;
            }
          }
          //console.log(tag[0].content[0].type);
          res.render('front/explore-node.ejs', {tag: tag, user_id: user_id});
        } else {
          res.render('front/error.ejs', {message: "你要求的頁面不存在喔"});
        }
      })
  }
}

router.param('id', function(req, res, next, id){
  req.id_from_param = id;
  next();
});

router.route('/chats')
  .get(renderChatList);
router.route('/chats/post')
  .get(isLoggedIn, function(req, res){
    res.render('front/chat-post.ejs');
  });
router.route('/chats/edit/:id')
  .get(isLoggedIn, renderChatEdit);
router.route('/chats/:id')
  .get(renderChatNode, isLoggedIn);

function renderChatList(req, res, next){
  Chats
    .find({isDeleted: {$ne: true}})
    .skip(req.params.skip)
    .limit(req.params.limit)
    .populate({path: 'author',
               select: "local.email _id avatarImgSrc",
               match: {isDeleted: {$ne: true}}
              })
    .sort({createdDate: -1})
    .exec(function(err, chats) {
      chats.forEach(function(item){
        if (!item.author) {
          item.author = anonAuthor;
        }
      })
      res.render('front/chat.ejs', {chats: chats});
    });
}

function renderChatEdit(req, res, next){
  Chats
    .findOne({_id: req.id_from_param, isDeleted: {$ne: true}})
    .populate({
      path: 'author',
      match: {isDeleted: {$ne: true}}
    })
    .populate({
      path: 'comments.author',
      select: "local.email _id avatarImgSrc",
      match: {isDeleted: {$ne: true}}
    })
    .exec(function(err, chat){
      if (chat) {
        if(!chat.author)
          chat.author = anonAuthor;
        if (chat.comments) {
          chat.comments.forEach(function(item){
            if (!item.author) {
              item.author = anonAuthor;
            }
          })
        }
        //console.log(typeof req.user._id+" - "+ typeof timeline.author._id);
        if(String(req.user._id) === String(chat.author._id)){
          res.render('front/chat-edit.ejs', {node: chat});
        } else {
          res.redirect("/chats/"+chat._id);
        }
      } else {
        res.render('front/error.ejs', {message: "你要求的頁面不存在喔"});
      }
    })
}

function renderChatNode(req, res, next){
  if(req.query.requestLogin) {
    req.url = req.url.substring(0, req.url.indexOf("?"));
    return next();
  } else {
    Chats
      .findOne({_id: req.id_from_param, isDeleted: {$ne: true}})
      .populate({
        path: 'author',
        match: {isDeleted: {$ne: true}}
      })
      .populate({
        path: 'comments.author',
        select: "local.email _id avatarImgSrc",
        match: {isDeleted: {$ne: true}}
      })
      .exec(function(err, chat) {
        if (chat) {
          if(!chat.author)
          chat.author = anonAuthor;
          if (chat.comments) {
            chat.comments.forEach(function(item){
              if (!item.author) {
                item.author = anonAuthor;
              }
            })
          }
          var isLike = false;
          var isAuthor = false;
          if(!req.user) {
            res.render('front/chat-node.ejs', {chat: chat, isLike: isLike, isAuthor: isAuthor});
          } else {
            if(req.user.favChats){
              req.user.favChats = req.user.favChats.filter(function(item){
                return item.node;
              })
            }
            req.user.favChats.map(function(favChat){
              if(favChat.node == req.params.id){
                isLike = true;
                return false;
              }
            })
            if (chat.author) {
              if (String(req.user._id) === String(chat.author._id)) {
                isAuthor = true;
              }
            }

            res.render('front/chat-node.ejs', {chat: chat, isLike: isLike, isAuthor: isAuthor});
          }
        } else {
          res.render('front/error.ejs', {message: "你要求的頁面不存在喔"});
        }
      });
  }
}

router.route('/social')
  .get(renderSocialGroup, isLoggedIn);
router.route('/social/groups')
  .get(renderSocialGroup, isLoggedIn);

function renderSocialGroup(req, res, next){
  if(req.query.requestLogin) {
    req.url = req.url.substring(0, req.url.indexOf("?"));
    return next();
  } else {
    Groups
      .find({isDeleted: {$ne: true}})
      .exec(function(err, groups){
        var user_id;
        if(req.user) {
          if(req.user._id) {
            user_id = req.user._id;
          }
        }
        res.render('front/social-group.ejs', {groups: groups, user_id: user_id});
      })
  }
}

router.route('/social/groups/post')
  .get(isLoggedIn, function(req, res){
    res.render('front/social-group-post.ejs');
  });
router.route('/social/groups/edit/:id')
  .get(isLoggedIn, renderSocialGroupEdit);
router.route('/social/groups/:id')
  .get(renderSocialGroupNode, isLoggedIn);

function renderSocialGroupEdit(req, res, next){
  Groups
    .findOne({_id: req.params.id, isDeleted: {$ne: true}})
    .populate({
      path: 'author',
      match: {isDeleted: {$ne: true}}
    })
    .populate({
      path: "members.data",
      match: {isDeleted: {$ne: true}}
    })
    .exec(function(err, group){
      if (group) {
        if(!group.author)
          group.author = anonAuthor;

        if(group.members){
          group.members = group.members.filter(function(item){
            return item.data;
          })
        }
        var members_ids = [];
        for(var i = 0; i < group.members.length; i++){
          members_ids.push(String(group.members[i].data._id));
        }
        var memberIndex = members_ids.indexOf(String(req.user._id));
        if(group.author) {
          if(String(req.user._id) === String(group.author._id)) {
            res.render('front/social-group-edit.ejs', {node: group});
            return false;
          }
        }
        if(memberIndex >= 0 && group.members[memberIndex].isLeader) {
          res.render('front/social-group-edit.ejs', {node: group});
          console.log("test return");
        } else {
          res.redirect("/social/groups/"+group._id);
        }
      } else {
        res.render('front/error.ejs', {message: "你要求的頁面不存在喔"});
      }
    })
}

function renderSocialGroupNode(req, res, next){
  if(req.query.requestLogin) {
    req.url = req.url.substring(0, req.url.indexOf("?"));
    return next();
  } else {
    Groups
      .findOne({_id: req.params.id, isDeleted: {$ne: true}})
      .populate({
        path: 'author',
        match: {isDeleted: {$ne: true}}
      })
      .populate({
        path: 'members.data',
        match: {isDeleted: {$ne: true}},
        populate: { path: 'favArticles.node', match: {isDeleted: {$ne: true}} }
      })
      .populate({
        path: 'members.data',
        match: {isDeleted: {$ne: true}},
        populate: { path: 'favChats.node', match: {isDeleted: {$ne: true}}, populate: {path: 'author'} }
      })
      .populate({
        path: 'members.data',
        match: {isDeleted: {$ne: true}},
        populate: { path: 'favGroups.node', match: {isDeleted: {$ne: true}} }
      })
      .populate({
        path: 'members.data',
        match: {isDeleted: {$ne: true}},
        populate: { path: 'favEvents.node', match: {isDeleted: {$ne: true}} }
      })
      .exec(function(err, group){
        if (group) {
          if(group.members){
            group.members = group.members.filter(function(member){
              return member.data;
            })
          }
          for(var i = 0; i < group.members.length; i++){
            if(group.members[i].data.favArticles){
              group.members[i].data.favArticles = group.members[i].data.favArticles.filter(function(item){
                return item.node;
              })
            }
            if(group.members[i].data.favGroups){
              group.members[i].data.favGroups = group.members[i].data.favGroups.filter(function(item){
                return item.node;
              })
            }
            if(group.members[i].data.favChats){
              group.members[i].data.favChats = group.members[i].data.favChats.filter(function(item){
                return item.node;
              })
              group.members[i].data.favChats.forEach(function(item){
                if (!item.node.author) {
                  item.node.author = anonAuthor;
                }
              })
            }
            if(group.members[i].data.favEvents){
              group.members[i].data.favEvents = group.members[i].data.favEvents.filter(function(item){
                return item.node;
              })
            }
          }
          Users.find({"favGroups.node": req.params.id, isDeleted: {$ne: true}}, function(err, favUsers){
            var isAuthor = false;
            if(req.user){
              var members_ids = [];
              for(var i = 0; i < group.members.length; i++){
                members_ids.push(String(group.members[i].data._id));
              }
              var memberIndex = members_ids.indexOf(String(req.user._id));
              if(group.author) {
                if(String(req.user._id) === String(group.author._id)) {
                  isAuthor = true;
                }
              }
              if(memberIndex >= 0 && group.members[memberIndex].isLeader) {
                isAuthor = true;
              }
            }
            res.render('front/social-group-node.ejs', {group: group, favUsers: favUsers, isAuthor: isAuthor});
          })
        } else {
          res.render('front/error.ejs', {message: "你要求的頁面不存在喔"});
        }
      });
  }
}

router.route('/social/events')
    .get(renderSocialEvent, isLoggedIn);

function renderSocialEvent(req, res, next){
  if (req.query.requestLogin) {
    req.url = req.url.substring(0, req.url.indexOf("?"));
    return next();
  } else {
    Events
      .find({isDeleted: {$ne: true}})
      .exec(function(err, events){
        var user_id;
        if(req.user) {
          if (req.user._id) {
            user_id = req.user._id;
          }
        }
        res.render('front/social-event.ejs', {events: events, user_id: user_id});
      })
  }
}

router.route('/social/events/post')
  .get(isLoggedIn, function(req, res){
    res.render('front/social-event-post.ejs');
  });
router.route('/social/events/edit/:id')
  .get(isLoggedIn, renderSocialEventEdit);
router.route('/social/events/:id')
  .get(renderSocialEventNode, isLoggedIn);

function renderSocialEventEdit(req, res, next){
  Events
    .findOne({_id: req.params.id, isDeleted: {$ne: true}})
    .populate({
      path: 'author',
      match: {isDeleted: {$ne: true}}
    })
    .populate({
      path: 'participants.user',
      match: {isDeleted: {$ne: true}}
    })
    .populate({
      path: 'participants.group',
      match: {isDeleted: {$ne: true}}
    })
    .exec(function(err, event){
      if (event) {
        if(!event.author)
          event.author = anonAuthor;
        if(event.participants){
          event.participants = event.participants.filter(function(participant){
            if (participant.type === "user") {
              return participant.user;
            } else if (participant.type === "group") {
              return participant.group;
            }
          })
        }
        if(event.author) {
          if(String(req.user._id) === String(event.author._id)){
            res.render('front/social-event-edit.ejs', {node: event});
          }
        } else {
          res.redirect("/events/"+event._id);
        }
      } else {
        res.render('front/error.ejs', {message: "你要求的頁面不存在喔"});
      }
    })
}

function renderSocialEventNode(req, res, next){
  if (req.query.requestLogin) {
    req.url = req.url.substring(0, req.url.indexOf("?"));
    return next();
  } else {
    Events.findOne({_id: req.params.id, isDeleted: {$ne: true}})
      .populate({
        path: 'author',
        match: {isDeleted: {$ne: true}}
      })
      .populate({
        path: 'participants.user',
        match: {isDeleted: {$ne: true}}
      })
      .populate({
        path: 'participants.group',
        match: {isDeleted: {$ne: true}}
      })
      .exec(function(err, event){
        if (event) {
          if(!event.author)
            event.author = anonAuthor;
          if(event.participants){
            event.participants = event.participants.filter(function(participant){
              if (participant.type === "user") {
                return participant.user;
              } else if (participant.type === "group") {
                return participant.group;
              }
            })
          }
          Users.find({"favEvents.node": req.params.id, isDeleted: {$ne: true}}, function(err, favUsers){
            var isAuthor = false;
            if(req.user) {
              if(event.author) {
                if (String(req.user._id) === String(event.author._id)) {
                  isAuthor = true;
                }
              }
            }
            res.render('front/social-event-node.ejs', {event: event, favUsers: favUsers, isAuthor: isAuthor});
            // res.render('front/social-group-node.ejs',{ groups:groups, favList: data});
          })
        } else {
          res.render('front/error.ejs', {message: "你要求的頁面不存在喔"});
        }
      });
  }
}

router.route('/notauth')
  .get(function(req, res){
    res.render('front/notAuth.ejs', { message: req.flash('notLoginMessage') });
  });

function isLoggedIn(req, res, next){
  if (req.isAuthenticated())
      return next();
  req.session.returnTo = req.url;
  //console.log(req.session.returnTo);
  req.flash("loginMessage", "登入才能使用此功能喔！");
  if(req.url.includes("profile"))
    req.flash();
    //req.flash("loginMessage", "您好，歡迎登入！");
  res.redirect('/login');
}

//Forgot password from: http://sahatyalkabov.com/how-to-implement-password-reset-in-nodejs/
router.route('/forgot')
  .get(recaptcha.middleware.render, function(req, res){
    res.render('front/forgot.ejs', {user: req.user, message: req.flash(), captcha:req.recaptcha});
  })
  .post(recaptcha.middleware.verify, function(req, res, next){
    if(!req.recaptcha.error) {
      // success code
      return next();
    } else {
      // error code
      res.render('front/error.ejs');
    }

  }, function(req, res, next){
    async.waterfall([
      function(done){
        crypto.randomBytes(20, function(err, buf){
          var token = buf.toString('hex');
          done(err, token);
        });
      },
      function(token, done){
        Users.findOne({ 'local.email': req.body.email, isDeleted: {$ne: true} }, function(err, user){
          if(!user) {
            req.flash('errorMessage', 'No account with that email address exists.');
            return res.redirect('/forgot');
          }

          user.resetPasswordToken = token;
          user.resetPasswordExpires = Date.now() + 3600000; // 1 hour

          user.save(function(err){
            done(err, token, user);
          });
        });
      },
      function(token, user, done){
        var smtpTransport = nodemailer.createTransport('smtps://ribotestacct%40gmail.com:r1b0t3stacct@smtp.gmail.com');
        var mailOptions = {
          to: user.local.email,
          from: 'support@9emba.com',
          subject: '9EMBA Password Reset',
          text: 'You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n' +
            'Please click on the following link, or paste this into your browser to complete the process:\n\n' +
            'http://' + req.headers.host + '/reset/' + token + '\n\n' +
            'If you did not request this, please ignore this email and your password will remain unchanged.\n'
        };
        console.log('http://' + req.headers.host + '/reset/' + token);
        smtpTransport.sendMail(mailOptions, function(err){
          req.flash('successMessage', 'An e-mail has been sent to ' + user.local.email + ' with further instructions.');
          done(err, 'done');
          console.log(err);
        });
      }],
      function(err){
        if(err)
          return next(err);
        res.redirect('/forgot');
      });
  });
router.route('/reset')
  .get(isLoggedIn, function(req, res, next) {
    var token;
    async.waterfall([
      function(done) {
        crypto.randomBytes(20, function(err, buf) {
          token = buf.toString('hex');
          done(err, token);
          console.log("2");
        });
      },
      function(token, done){
        var user_id = req.user._id;
        Users.findOne({_id: user_id}, function(err, user){

          user.resetPasswordToken = token;
          user.resetPasswordExpires = Date.now() + 3600000; // 1 hour

          user.save(function(err) {
            done(err, token, user);
          });
        });
      }],
      function(err){
        if(err)
          return next(err);
        res.redirect('/reset/'+token);
      })
  });
router.route('/reset/:token')
  .get(recaptcha.middleware.render, function(req, res){
    Users.findOne({resetPasswordToken: req.params.token, resetPasswordExpires: { $gt: Date.now() }},
      function(err, user){
        if(!user) {
          req.flash('errorMessage', 'Password reset token is invalid or has expired.');
          return res.redirect('/forgot');
        }
        res.render('front/reset.ejs', {user: req.user, message: req.flash(), captcha:req.recaptcha});
    });
  })
  .post(recaptcha.middleware.verify, function(req, res, next){
    if(!req.recaptcha.error) {
      // success code
      return next();
    } else {
      // error code
      res.render('front/error.ejs');
    }

  }, function(req, res){
    async.waterfall([
      function(done){
        Users.findOne({ resetPasswordToken: req.params.token, resetPasswordExpires: { $gt: Date.now() } }, function(err, user) {
          if(!user) {
            req.flash('errorMessage', 'Password reset token is invalid or has expired.');
            return res.redirect('back');
          }

          user.local.password = user.generateHash(req.body.password);
          user.resetPasswordToken = undefined;
          user.resetPasswordExpires = undefined;

          user.save(function(err){
            req.logIn(user, function(err){
                done(err, user);
            });
          });
        });
      },
      function(user, done){
        var smtpTransport = nodemailer.createTransport('smtps://ribotestacct%40gmail.com:r1b0t3stacct@smtp.gmail.com');
        var mailOptions = {
          to: user.local.email,
          from: 'support@9emba.com',
          subject: 'Your password has been changed',
          text: 'Hello,\n\n' +
            'This is a confirmation that the password for your account ' + user.local.email + ' has just been changed.\n'
        };
        smtpTransport.sendMail(mailOptions, function(err){
          req.flash('successMessage', 'Success! Your password has been changed.');
          done(err);
        });
      }],
      function(err){
        res.redirect('/profile');
      });
  });
//Forgot password end
module.exports = router;
