$(function(){
  /*$(".admin-groups-list-page .rib-delete-btn").on("click", function(){
    var $btn = $(this),
        nodeId = $btn.data("id");
    $.ajax({
       type: 'DELETE',
       url: "/api/groups/"+nodeId,
       success: function(eventData){
         ajaxSuccess(eventData, $btn);
       },
       error: function(error) {
         ajaxError(error);
       }
     });
   })
 $(".admin-events-list-page .rib-delete-btn").on("click", function(){
   var $btn = $(this),
       nodeId = $btn.data("id");
   $.ajax({
      type: 'DELETE',
      url: "/api/events/"+nodeId,
      success: function(eventData){
        ajaxSuccess(eventData, $btn);
      },
      error: function(error) {
        ajaxError(error);
      }
    });
  })
  $(".admin-chats-list-page .rib-delete-btn").on("click", function(){
    var $btn = $(this),
        nodeId = $btn.data("id");
    $.ajax({
       type: 'DELETE',
       url: "/api/timelines/"+nodeId,
       success: function(eventData){
         ajaxSuccess(eventData, $btn);
       },
       error: function(error) {
         ajaxError(error);
       }
     });
   })
   $(".admin-chat-comment-list .rib-delete-btn").on("click", function(){
     var $btn = $(this),
         chid = $("body").data("nodeid"), // chatroom id
         nodeId = $btn.data("id"); // comment id
         console.log(chid);
     $.ajax({
        type: 'PUT',
        url: "/api/chats/comments/"+chid+"/"+nodeId+"/remove",
        success: function(eventData){
          ajaxSuccess(eventData, $btn);
        },
        error: function(error) {
          ajaxError(error);
        }
      });
   })*/

  $(".rib-delete-btn").on("click", function(){
    var $btn = $(this),
        nodeId = $btn.data("id"),
        nodeType = $btn.data("node-type");
    $.ajax({
      type: 'PUT',
      url: "/api/"+nodeType+"/delete/"+nodeId,
      success: function(eventData){
        ajaxSuccess(eventData, $btn);
      },
      error: function(error) {
        ajaxError(error);
      }
    });
  })

  $(".ribo-badge-container").on("click", ".tag-delete-icon", function(){
    var $el = $(this).parent("span"),
        nodeName = $el.data("name");
    $.ajax({
      type: 'PUT',
      url: "/api/tags/delete/"+ nodeName,
      success: function(eventData){
        $('.alert-success').show();
        $el.remove();
      },
      error: function(error) {
        ajaxError(error);
      }
    });
  })
})

function ajaxSuccess(eventData, btn){
  $('.alert-success').show();
  btn.closest("tr").remove();
}
function ajaxError(error){
  $('.alert-danger').show();
  console.log(error);
}
