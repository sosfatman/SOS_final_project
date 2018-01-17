$(function(){
  var favType;
  var groupFlag = true;
  var eventFlag = true;
  if($(".nav-tabs a[href$='/social/groups']").hasClass('active')) {
    favType = 'Groups';
    getFavCount();
    groupFlag = false;
  } else if($(".nav-tabs a[href$='/social/events']").hasClass('active')) {
    favType = 'Events';
    getFavCount();
    eventFlag = false;
  } 

  if($(".nav-tabs a[href$='#group']").hasClass('active')) {
    favType = 'Groups';
    getFavCount();
    groupFlag = false;
  } else if($(".nav-tabs a[href$='#event']").hasClass('active')) {
    favType = 'Events';
    getFavCount();
    eventFlag = false;
  } 

  $(".nav-tabs a[href$='#group']").click(function(){
    if (groupFlag) {
      favType = 'Groups';
      getFavCount();
      groupFlag = false;
    }
    
  })
  $(".nav-tabs a[href$='#event']").click(function(){
    if (eventFlag) {
      favType = 'Events';
      getFavCount();
      eventFlag = false;
    }
    
  })

  function getFavCount(){
    console.log(favType);
    $.get("/api/users/getFavCount/"+favType, function(nodes){
    //console.log(nodes);
      var className = ".rib-list-"+favType.toLowerCase(),
          elements = $(className).find(".rib-like-count");
      elements.map(function(index, el){
        var element = $(el);
            elementId = element.data("id"),
        nodes.map(function(each){
          if(each._id == elementId){
            var count = each.count;
            element.text(count);
          }
        })
      })
    })
  }
})
