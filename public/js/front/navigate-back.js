$(function() {
  //讓footer上跟article有關的按鈕們active在正確的按鈕上
  var previous_path = document.referrer;//抓出上一頁的路徑
  //當聯結路徑上有探索的時候幫他加上正確的active
  if(previous_path.includes("explore")){
    $(".footer .nav-item").removeClass("active");
    $('.footer a[href$="/explore"]').parent().addClass("active");
    window.sessionStorage.setItem("parent_path", previous_path);
  }
  if(previous_path.includes("profile")){
    $(".footer .nav-item").removeClass("active");
    $('.footer a[href$="/profile"]').parent().addClass("active");
    window.sessionStorage.setItem("parent_path", previous_path);
  }

  var active_tab = window.sessionStorage.getItem("active_tab");
  var top_pos = window.sessionStorage.getItem("top_pos");
  //console.log($('.nav-tabs a[href$="'+active_tab+'"]').length);
  if($('.nav-tabs a[href$="'+active_tab+'"]').length && active_tab) {
    $('.nav-tabs a[href$="'+active_tab+'"]').tab('show');
    $(document).scrollTop(top_pos);
  }

  $(document).scroll(function(){
    window.sessionStorage.setItem("top_pos", $(document).scrollTop());  
  })

  $(".footer .nav-item a").click(function(){
    var parent_path = window.sessionStorage.getItem("parent_path");
    if(parent_path) {
      window.sessionStorage.removeItem("parent_path");
      window.sessionStorage.removeItem("active_tab");
    }
  })

  $(".nav-tabs .nav-item a").click(function(){
    window.sessionStorage.setItem("active_tab", $(this).attr('href'));
    window.sessionStorage.removeItem("top_pos");
  })

  //當按下返回上一頁時，正確的切到上一頁
  $(".rib-nav-back").click(function(){
    var parent_path = window.sessionStorage.getItem("parent_path");
    if(parent_path) {
      //window.history.back();
      location.href = parent_path;
      console.log(parent_path);
      window.sessionStorage.removeItem("parent_path");
    } else {
      if (previous_path.includes("login")) {
        edit_index = location.href.lastIndexOf("\/");
        location.href = location.href.substring(0, edit_index);
      } else if (previous_path.includes("edit")) {
        edit_index = location.href.lastIndexOf("\/");
        location.href = location.href.substring(0, edit_index);
      } else if (previous_path.includes("post")) {
        edit_index = location.href.lastIndexOf("\/");
        location.href = location.href.substring(0, edit_index);
      } else {
        if (window.history.length > 1) {
          window.history.back();
        } else{
          location.href = "/";
        }
        console.log(window.history.length);
      }
    }
    //window.location.replace("/articles");
  });

  $(".explore-node-page #explore-nav-back").click(function(){
    window.sessionStorage.removeItem("active_tab");
  })
})