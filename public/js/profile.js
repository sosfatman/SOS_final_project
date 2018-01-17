$(function() {
  
  $(".profile-edit-page #edit-profile-form").on("submit", function(event){
    event.preventDefault();
    if (!$("#edit-profile-submit").hasClass("disabled")) {
      var name = $(".form-input-name").val();
      var intro = $(".form-input-intro").val();
      var about = $(".form-input-about").val();
      var school = $(".form-input-school").val();
      var department = $(".form-input-department").val();
      var position = $(".form-input-position").val();
      var avatarImgSrc = $(".form-input-avatarImgSrc").val();

      $.ajax({
        type: "PUT",
        url: "/api/users",
        data: {name: name, intro: intro, about: about, school: school, department: department, position: position, avatarImgSrc: avatarImgSrc},
        success: function(data){
          $('.alert-success').show();
          console.log(data);
          console.log("put success");
          window.location = data.redirect;
        },
        error: function(error) {
          $('.alert-danger').show();
          console.log(error);
          console.log("put fail");
        }
      })
    }

  })
  
})