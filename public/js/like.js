$(function(){
  var currentUser;
  $.get("/api/users/getCurrentUser", function(data){
    currentUser = data;
    if(currentUser) {

      if($("body").hasClass("social-page")){
        var elementsForGroups = initNodeIdList("groups");
        var elementsForEvents = initNodeIdList("events");
        var currentUserFavGroups = currentUser.favGroups;
        var currentUserFavEvents = currentUser.favEvents;
        elementsForGroups.map(function(el, data){
          currentUserFavGroups.map(function(fav){
            if($(data).data("id") == fav.node){
              $(data).addClass("color-5 like-active");
            }
          })
        })
        elementsForEvents.map(function(el, data){
          currentUserFavEvents.map(function(fav){
            if($(data).data("id") == fav.node){
              $(data).addClass("color-5 like-active");
            } else {
            }
          })
        })
      } else if($("body").hasClass("article-node-page")){
        var targerId = initNodeId();
        var currentUserFavs = currentUser.favArticles;
        currentUserFavs.map(function(fav){
          if(targerId == fav.node){
            $(".rib-nav-like").addClass("color-5 like-active");
          }
        })
      } else if($("body").hasClass("chat-node-page")){
        var targerId = initNodeId();
        var currentUserFavs = currentUser.favChats;
        currentUserFavs.map(function(fav){
          if(targerId == fav.node){
            $(".rib-nav-like").addClass("color-5 like-active");
          }
        })
      } else if($("body").hasClass("social-event-node-page")){
        var targerId = initNodeId();
        var currentEventFavs = currentUser.favEvents;
        currentEventFavs.map(function(fav){
          if(targerId == fav.node){
            $(".rib-nav-like").addClass("color-5 like-active");
          }
        })
      } else if($("body").hasClass("social-group-node-page")){
        var targerId = initNodeId();
        var currentGroupFavs = currentUser.favGroups;
        currentGroupFavs.map(function(fav){
          if(targerId == fav.node){
            $(".rib-nav-like").addClass("color-5 like-active");
          }
        })
      } else if($("body").hasClass("explore-node-page")){
        var elementsForGroups = initNodeIdList("groups");
        var elementsForEvents = initNodeIdList("events");
        var currentUserFavGroups = currentUser.favGroups;
        var currentUserFavEvents = currentUser.favEvents;
        elementsForGroups.map(function(el, data){
          currentUserFavGroups.map(function(fav){
            if($(data).data("id") == fav.node){
              $(data).addClass("color-5 like-active");
            }
          })
        })
        elementsForEvents.map(function(el, data){
          currentUserFavEvents.map(function(fav){
            if($(data).data("id") == fav.node){
              $(data).addClass("color-5 like-active");
            } else {
            }
          })
        })
      }
    }
  })

  $(".rib-nav-like").on("click", function(event){
    event.preventDefault();
    event.stopPropagation();
    var $likeBtn = $(this),
        nodeId = $likeBtn.data("id"),
        nodeType;
    if(!currentUser) {
      $('#loginModal.collection').modal('show');
    } else {
      /*
      listen to click event on Like Button
      */
    
      if ($likeBtn.hasClass("rib-list-like")){
        nodeType = $likeBtn.data("type");
      } else {
        nodeType = $("body").data("type");
      }
      if(!$likeBtn.hasClass("like-active")) {
        $.ajax({
          type: "POST",
          url: "/api/users/like/"+nodeType,
          data: {nodeId: nodeId},
          success: function(resData){
            if(resData.notAuth){
              alert("請先登入！")
            } else {
              $likeBtn.addClass("color-5 like-active");
              console.log("成功收藏！");
            }
          },
          error: function(err) {
            if(err){
              console.log(err);
            }
          }
        })
      } else {
        $.ajax({
          type: "PUT",
          url: "/api/users/like/"+nodeType,
          data: {nodeId: nodeId},
          success: function(resData){
            if(resData.notAuth){
              alert("請先登入！")
            } else {
              $likeBtn.removeClass("color-5 like-active");
              console.log("成功取消收藏");
            }
            
          },
          error: function(err) {
            if(err){
              console.log(err);
            }
          }
        })
      }
    }
    
  })
  function initNodeIdList(type){
    var ids = [];
    var className = ".rib-list-"+type;
    var result = $(className).find(".rib-list-like");
    return result;
  }
  function initNodeId(){
    var id = $("body").data("id");
    return id;
  }
})
