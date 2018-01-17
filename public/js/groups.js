$(function() {
  var currentUser;
  $.get("/api/users/getCurrentUser", function(data){
    currentUser = data;
  });

  $(".group-create-page #create-group-form").on("submit", function(event){
    event.preventDefault();
    if (!$("#create-group-submit").hasClass("disabled")) {
      var bannerImgSrc = $(".form-input-bannerImgSrc").val();
      var title = $(".form-input-title").val();
      var abstract = $(".form-input-abstract").val();
      var content = $(".form-input-content").val();
      var tags = $("input[name*='tagArray']").map(function(){return $(this).val();}).get();
      var members = $("input[name*='memberArray']").map(function(){return $(this).val();}).get();
      var leaders = $("input[name*='leaderArray']").map(function(){return $(this).val();}).get();
      console.log(members);
      $.ajax({
        type: 'POST',
        url: '/api/groups/front',
        data: {bannerImgSrc: bannerImgSrc, title: title, abstract: abstract, content: content, tags: tags, members: members, leaders: leaders},
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
$(".group-edit-page #edit-group-form").on("submit", function(event){
    event.preventDefault();
    if (!$("#edit-group-submit").hasClass("disabled")) {
      var bannerImgSrc = $(".form-input-bannerImgSrc").val();
      var title = $(".form-input-title").val();
      var abstract = $(".form-input-abstract").val();
      var content = $(".form-input-content").val();
      var tags = $("input[name*='tagArray']").map(function(){return $(this).val();}).get();
      var members = $("input[name*='memberArray']").map(function(){return $(this).val();}).get();
      var leaders = $("input[name*='leaderArray']").map(function(){return $(this).val();}).get();
      var nodeid= $("body").data("nodeid");
      console.log(nodeid);

      $.ajax({
        type: "PUT",
        url: "/api/groups/front",
        data: {bannerImgSrc: bannerImgSrc, title: title, abstract: abstract, content: content, tags: tags, members: members, leaders: leaders, nodeid: nodeid},
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