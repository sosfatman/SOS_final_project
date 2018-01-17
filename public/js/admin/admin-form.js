$(function(){
  if($("body").hasClass("admin-article-node-edit")){
    alert();
    $.ajax({
      type: "GET",
      url: "/api/users/getarticle",
      success: function(eventData){
        $('.alert-success').show();
         console.log(eventData);
      },
      error: function(rror) {
        $('.alert-danger').show();
        console.log(error);
      }
    })
  }

  $("#article-node-form").on("submit", function(event){
    event.preventDefault();
    var nodeId = $(".rib-btn-save").data("id"),
        data = {};
    data.title = $("#node-form-title").val();
    data.bannerImgSrc = $("#node-form-bannerImgSrc").val();
    data.content = $("#node-form-content").val();
    
    $.ajax({
      type: "PUT",
      url: "/api/articles/"+nodeId,
      data: data,
      success: function(eventData){
        $('.alert-success').show();
         console.log(eventData);
      },
      error: function(error) {
        $('.alert-danger').show();
        console.log(error);
      }
    })
  })

  $("#chatroom-node-form").on("submit", function(event){
    event.preventDefault();
    var nodeId = $(".rib-btn-save").data("id"),
        data = {};
    data.title = $("#node-form-title").val();
    data.content = $("#node-form-content").val();
    $.ajax({
      data: data,
      type: "PUT",
      url: "/api/chats/"+nodeId,
      success: function(eventData){
        $('.alert-success').show();
         console.log(eventData);
      },
      error: function(rror) {
        $('.alert-danger').show();
        console.log(error);
      }
    });
  })
  $("#chatrooms-add-form").on("submit", function(event){
    var data = {};
    event.preventDefault();
    data.title = $("#node-form-title").val();
    data.content = $("#node-form-content").val();
    data.bannerUrl = $("#node-form-banner-url").val();
    $.ajax({
      type: "POST",
      url: "/api/chats",
      data: data,
      success: function(eventData){
        $('.alert-success').show();
         console.log(eventData);
         window.location = eventData.redirect;
      },
      error: function(error) {
        $('.alert-danger').show();
        console.log(error);
      }
    })
  })
  $("#groups-add-form").on("submit", function(event){
    var data = {};
    event.preventDefault();
    data.title = $("#node-form-title").val();
    data.bannerUrl = $("#node-form-banner-url").val();
    data.abstract = $("#node-form-abstract").val();
    data.content = $("#node-form-content").val();
    $.ajax({
      type: "POST",
      url: "/api/groups",
      data: data,
      success: function(eventData){
        $('.alert-success').show();
         console.log(eventData);
         window.location = eventData.redirect;
      },
      error: function(error) {
        $('.alert-danger').show();
        console.log(error);
      }
    })
  })
  $("#groups-edit-form").on("submit", function(event){
    var data = {};
    var nodeId = $("body").data("nodeid");
    event.preventDefault();
    data.title = $("#node-form-title").val();
    data.bannerUrl = $("#node-form-banner-url").val();
    data.abstract = $("#node-form-abstract").val();
    data.content = $("#node-form-content").val();
    $.ajax({
      type: "PUT",
      url: "/api/groups/"+nodeId,
      data: data,
      success: function(eventData){
        $('.alert-success').show();
         console.log(eventData);
      },
      error: function(error) {
        $('.alert-danger').show();
        console.log(error);
      }
    })
  })

  $("#events-add-form").on("submit", function(event){
    var data = {};
    event.preventDefault();
    data.title = $("#node-form-title").val();
    data.bannerUrl = $("#node-form-banner-url").val();
    data.abstract = $("#node-form-abstract").val();
    data.content = $("#node-form-content").val();
    data.memberSection = $("#node-form-memberSection").val();
    data.createdDate = $("#node-form-createdDate").val();
    data.address = $("#node-form-address").val();
    data.startDate = $("#node-form-startDate").val();
    $.ajax({
      type: "POST",
      url: "/api/events",
      data: data,
      success: function(eventData){
        $('.alert-success').show();
         console.log(eventData);
         window.location = eventData.redirect;
      },
      error: function(error) {
        $('.alert-danger').show();
        console.log(error);
      }
    })
  })
  $("#events-edit-form").on("submit", function(event){
    var data = {};
    var nodeId = $("body").data("nodeid");
    console.log(nodeId);
    event.preventDefault();
    data.title = $("#node-form-title").val();
    data.bannerUrl = $("#node-form-banner-url").val();
    data.abstract = $("#node-form-abstract").val();
    data.content = $("#node-form-content").val();
    data.memberSection = $("#node-form-memberSection").val();
    data.createdDate = $("#node-form-createdDate").val();
    data.address = $("#node-form-address").val();
    data.startDate = $("#node-form-startDate").val();
    $.ajax({
      type: "PUT",
      url: "/api/events/"+nodeId,
      data: data,
      success: function(eventData){
        $('.alert-success').show();
         console.log(eventData);
      },
      error: function(error) {
        $('.alert-danger').show();
        console.log(error);
      }
    })
  })
})
