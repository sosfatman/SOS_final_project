$(function(){
	$('#upload-image-form').on("submit", function(event){
    event.preventDefault();
    var $form = $(this);

    if($('.form-control-file').val() !== "") {
      $form.ajaxSubmit({
        error: function(err) {
          console.log(err);
        },

        success: function(response) {
          console.log($form.data("node-type"));
          if($form.data("node-type") === "profile") {
            $("#profile-picture").attr("src", response);
            $(".form-input-avatarImgSrc").val(response);
            console.log($(".form-input-avatarImgSrc").val());
          } else {
            $("#banner-picture").attr("src", response);
            $(".form-input-bannerImgSrc").val(response);
            console.log($(".form-input-bannerImgSrc").val());
          }
          
          if($('#upload-collapse').hasClass('show')) {
            $('#upload-collapse').collapse('hide');
          }
        }
      });
      //Very important line, it disable the page refresh.
      return false;
    } else {
      alert('找不到上傳檔案！');
    }
  })

  $("input[name$='userPhoto']").change(function(){
    uploadFileCheck(this.files[0], $(this));
  });

  $("input[name$='groupPhoto']").change(function(){
    uploadFileCheck(this.files[0], $(this));
  });

  function uploadFileCheck(file, $input){
    var fileType = file.type;
    var fileSize = file.size / 1048576;
    console.log(fileType);
    if (!fileType.includes('image')) {
      $input.val('').clone(true);
      alert("很抱歉，檔案不是圖片無法上傳喔");
    } else {
      console.log(fileSize);
      if(fileSize > 3){
        $input.val('').clone(true);
        alert("很抱歉，檔案超過3MB無法上傳喔");
      }
    }
  }

  $("#profile-picture").on("load", function(){
    verticalPicResize();
  })

  function verticalPicResize(){
    var profilePic;
    if (document.getElementById('profile-picture')) {
      profilePic = document.getElementById('profile-picture');
    }
    if(profilePic){
      var nWidth = profilePic.naturalWidth,
          nHeight = profilePic.naturalHeight;
      if(nHeight > nWidth) {
        $("#profile-picture").addClass("vertical");
        console.log("t");
      } else {
        $("#profile-picture").removeClass("vertical");
        console.log("f");
      }
    }
  }

  verticalPicResize();
  
})