$(function() {
  var currentUser;
  $.get("/api/users/getCurrentUser", function(data){
    currentUser = data;
  });
  
  $(".event-create-page #create-event-form").on("submit", function(event){
    event.preventDefault();
    if (!$("#create-event-submit").hasClass("disabled")) {
      var bannerImgSrc = $(".form-input-bannerImgSrc").val();
      var title = $(".form-input-title").val();
      var abstract = $(".form-input-abstract").val();
      var content = $(".form-input-content").val();
      var address = $(".form-input-address").val();
      var startDate = $(".form-input-startDate").val();
      var endDate = $(".form-input-endDate").val();
      var tags = $("input[name*='tagArray']").map(function(){return $(this).val();}).get();
      var participants = [];
      $("input[name*='participantArray']").each(function(){
        var participant = {};
        if ($(this).data('node-type')==="user") {
          participant.type = "user";
          participant.user = $(this).val();
        } else if($(this).data('node-type')==="group"){
          participant.type = "group";
          participant.group = $(this).val();
        }
        participants.push(participant);
      })
      console.log(participants);

      $.ajax({
        type: 'POST',
        url: '/api/events/front',
        data: {bannerImgSrc: bannerImgSrc, title: title, abstract: abstract, content: content, address: address, 
               startDate: startDate, endDate: endDate, participants: participants, tags: tags},
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

  $(".event-edit-page #edit-event-form").on("submit", function(event){
    event.preventDefault();
    if (!$("#edit-event-submit").hasClass("disabled")) {
      var bannerImgSrc = $(".form-input-bannerImgSrc").val();
      var title = $(".form-input-title").val();
      var abstract = $(".form-input-abstract").val();
      var content = $(".form-input-content").val();
      var address = $(".form-input-address").val();
      var startDate = $(".form-input-startDate").val();
      var endDate = $(".form-input-endDate").val();
      var tags = $("input[name*='tagArray']").map(function(){return $(this).val();}).get();
      var nodeid= $("body").data("nodeid");
      console.log(nodeid);
      var participants = [];
      $("input[name*='participantArray']").each(function(){
        var participant = {};
        if ($(this).data('node-type')==="user") {
          participant.type = "user";
          participant.user = $(this).val();
        } else if($(this).data('node-type')==="group"){
          participant.type = "group";
          participant.group = $(this).val();
        }
        participants.push(participant);
      })
      console.log(participants);

      $.ajax({
        type: "PUT",
        url: "/api/events/front",
        data: {bannerImgSrc: bannerImgSrc, title: title, abstract: abstract, content: content, address: address,
               startDate: startDate, endDate: endDate, participants: participants, tags: tags, nodeid: nodeid},
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
  
  $('#postBtn').click(function(event){
    console.log('in');
    console.log(!currentUser);
    if(!currentUser) {
      event.preventDefault();
      $('#loginModal').modal('show');
    }
  });

})
