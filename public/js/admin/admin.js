$(function(){

  var tagList = [];

  var $input = $(".form-input-tags"),
      $taglist = $(".ribo-tag-list");

  /* tag begin*/

  tagInit(tagList);
  $input.keydown(function(event) {
    if ( event.which == 13 || event.which == 32 ) {
     event.preventDefault();
     var tag = $input.val(),
         pageType = fetchContentType(),
         data = {},
         nodeid = fetchNodeId();
     data.tag = tag
     if(tag.length !== 0){
       $.ajax({
          type: 'PUT',
          url: "/api/tags/"+pageType+"/"+nodeid+"/add",
          data: data,
          success: function(eventData){
            $('.alert-success').show();
            $taglist.append('<span class="tag tag-pill tag-default" data-index="'+tagList.length+'">'+tag+'<i class="fa fa-times tag-delete-icon" aria-hidden="true"></i></span>');
            tagList.push(tag);
            $input.val("");
          },
          error: function(error) {
            $('.alert-danger').show();
            console.log(error);
          }
        });
     }
    }
  });

  $taglist.on("click", ".tag-delete-icon", function(){
    var $el = $(this).parent("span"),
        tag = $el.text(),
        pageType = fetchContentType(),
        data = {},
        nodeid = fetchNodeId();
    data.tag = tag
    if(tag.length !== 0){
      $.ajax({
         type: 'PUT',
         url: "/api/tags/"+pageType+"/"+nodeid+"/remove",
         data: data,
         success: function(eventData){
           $('.alert-success').show();
           $el.remove();
         },
         error: function(error) {
           $('.alert-danger').show();
           console.log(error);
         }
       });
    }
  })

  /* tag end */

})
function tagInit(arr){
  $(".ribo-tag-list span").map(function(el, index){
    arr.push($(this).text());
  })
}
function removeTag(index, arr){
  arr.splice(index, 1);
}
function fetchContentType(){
  var pageType = $("body").data("type");
  return pageType;
}
function fetchNodeId(){
  var nodeId = $("body").data("nodeid");
  return nodeId;
}
