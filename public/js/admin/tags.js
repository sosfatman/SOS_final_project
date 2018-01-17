$(function(){

  var $input = $(".form-input-tags"),
      $taglist = $(".ribo-tag-list"),
      $addBtn = $(".tag-add-btn"),
      currentTags = [];

  var existTags = $("input[name*='tags']").map(function(){return $(this).val();}).get();
  if(existTags.length >0){
    for(var i = 0; i < existTags.length; i++) {
      currentTags.push(existTags[i]);
    }
  }

  console.log(currentTags);

  $input.keydown(function(event) {
    if ( event.which == 13 || event.which == 32 ) {
      event.preventDefault();
      var tag = $input.val();
      if(tag.length !== 0) {
        if(currentTags.indexOf(tag)>=0){
          $input.val("");
          alert("該標籤已經輸入過了喔");
        } else {
          $taglist.append('<span class="badge badge-default">'+tag+'<i class="fa fa-times tag-delete-icon" aria-hidden="true"></i></span>');
          $taglist.append('<input type="hidden" name="tags[]" value="'+tag+'">');
          currentTags.push(tag);
          $input.val("");
          console.log(currentTags);
        }
      }
    }
    
  });

  $addBtn.click(function(){
    var tag = $input.val();
    if(tag.length !== 0) {
      if(currentTags.indexOf(tag)>=0){
          $input.val("");
          alert("該標籤已經輸入過了喔");
        } else {
          $taglist.append('<span class="badge badge-default">'+tag+'<i class="fa fa-times tag-delete-icon" aria-hidden="true"></i></span>');
          $taglist.append('<input type="hidden" name="tags[]" value="'+tag+'">');
          currentTags.push(tag);
          $input.val("");
          console.log(currentTags);
        }
    }
  })


  $taglist.on("click", ".tag-delete-icon", function(){
    var $el = $(this).parent("span"),
        tag = $el.text();

    if(tag.length !== 0) {
      $el.remove();
      $("input[name*='tags']").each(function(){
        if($(this).val() === tag) {
          $(this).remove();
        }
      });
    var index = currentTags.indexOf(tag);
    if (index >= 0) {
      currentTags.splice( index, 1 );
    }
    }
  })

  $('.ribo-tag-sort').click(function (event) {
    var $row = $(this).parents('tr'),
        $tds = $row.find("td");
    var tagname = $tds.eq(0).text(),
        type = $tds.eq(2).text(),
        nodeid = $tds.eq(3).text();
    console.log(tagname+type+nodeid);


     if(tagname.length !== 0){
       $.ajax({
          type: 'PUT',
          url: "/api/tags/sort",
          data: {tagname: tagname, type: type, nodeid: nodeid},
          success: function(eventData){
            $('.alert-success').show();
            $row.remove();
            location.reload();
          },
          error: function(error) {
            $('.alert-danger').show();
            console.log(error);
          }
        });
     }

  });

  $('.ribo-tag-clean').click(function (event) {
    var $row = $(this).parents('tr'),
        $tds = $row.find("td");
    var tagname = $tds.eq(0).text(),
        type = $tds.eq(2).text(),
        nodeid = $tds.eq(3).text();
    console.log(tagname+type+nodeid);


     if(tagname.length !== 0){
       $.ajax({
          type: 'PUT',
          url: "/api/tags/clean",
          data: {tagname: tagname, type: type, nodeid: nodeid},
          success: function(eventData){
            $('.alert-success').show();
            $row.remove();
            location.reload();
          },
          error: function(error) {
            $('.alert-danger').show();
            console.log(error);
          }
        });
     }

  });

})

function fetchContentType(){
  var pageType = $("body").data("type");
  return pageType;
}
function fetchNodeId(){
  var nodeId = $("body").data("nodeid");
  return nodeId;
}
