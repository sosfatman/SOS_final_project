$(function() {
  var currentUser;
  $.get("/api/users/getCurrentUser", function(data){
    currentUser = data;
  });
  
  $(".chat-node-page .rib-message-send-btn").on("click", function() {
    var text = $(".send-message-input").val();
    var chatId = $("body").data("id");
    if (text.length !== 0) {
      $.ajax({
        type: 'PUT',
        url: '/api/chats/create/'+chatId,
        data: {content: text},
        success: function(data, textStatus, jqXHR) {
          console.log("post成功");
          if(data.notAuth) {
            alert("請先登入！");
          } else {
            var el = '<li class="list-group-item">'+
              '<div class="card">'+
                '<div class="card-block rounded">'+
                  '<p class="rib-mb-05rem"><span class="rib-text-color-1 rib-f-size-1rem">'+data.content+'</span></p>'+
                  '<div class="mb-4"></div>'+
                  '<a href="/profile/'+currentUser._id+'">'+
                    '<div class="chip">'+
                      '<img src="'+currentUser.avatarImgSrc+'" class="rounded-circle img-fluid" />'+
                      '<span class="rib-text-color-3 rib-f-size-dot8rem">'+currentUser.local.email.split("@")[0]+'</span>'+
                    '</div>'+
                  '</a>'+
                '</div>'+
              '</div>'+
            '</li>';
            $(".list-group.comments").append(el);
            $(".send-message-input").val("");
            console.log(data);
          }
        },
        error: function(error) {
          console.log("post失敗");
          console.log(error);
        }
      })
    }
    
  })
  $(".chat-create-page #create-chat-form").on("submit", function(event){
    event.preventDefault();
    if (!$("#create-chat-submit").hasClass("disabled")) {
      var title = $(".form-input-title").val();
      var content = $(".form-input-content").val();
      var tags = $("input[name*='tagArray']").map(function(){return $(this).val();}).get();

      $.ajax({
        type: 'POST',
        url: '/api/chats/front',
        data: {title: title, content: content, tags: tags},
        success: function(data, textStatus, jqXHR) {
          console.log("post成功");

          if(data.notAuth) {
            alert("請先登入！");
          } else {
            window.location = data.redirect;
          }
        },
        error: function(error) {
          console.log("post失敗");
          console.log(error);
        }
      })
    }
  })

  $(".chat-edit-page #edit-chat-form").on("submit", function(event){
    event.preventDefault();
    if (!$("#edit-chat-submit").hasClass("disabled")) {
      var title = $(".form-input-title").val();
      var content = $(".form-input-content").val();
      var tags = $("input[name*='tagArray']").map(function(){return $(this).val();}).get();
      var nodeid= $("body").data("nodeid");
      console.log(nodeid);

      $.ajax({
        type: "PUT",
        url: "/api/chats/front",
        data: {title: title, content: content, tags: tags, nodeid: nodeid},
        success: function(data, textStatus, jqXHR) {
          console.log("put成功");

          if(data.notAuth) {
            alert("請先登入！");
          } else {
            window.location = data.redirect;
          }
        },
        error: function(error) {
          console.log("put失敗");
          console.log(error);
        }
      })
    }

  })

  $(".chat-list-page .chip").on("click", function(event){
    event.preventDefault();
    event.stopPropagation();
    var $profileBtn = $(this),
        nodeId = $profileBtn.data("id");
    console.log(nodeId);
    location.href="/profile/"+nodeId;
  })

  $('.send-message-input:text').focus(function(){
    if($(this).val() === "" && !currentUser) {
      $('#loginModal').modal('show');
    }
  });

  $('#loginBtn').click(function(){
    var requestLogin = true;
    var nodeid = $("body").data("id");
    location.href="/chats/"+nodeid+"?requestLogin="+requestLogin;
  });

  $('#postBtn').click(function(event){
    console.log('in');
    console.log(!currentUser);
    if(!currentUser) {
      event.preventDefault();
      $('#loginModal').modal('show');
    } 
  });
})
