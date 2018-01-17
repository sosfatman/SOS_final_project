jQuery(function($){

  var $input = $('input.form-input-members'),
      $memberlist = $("#ribo-member-list"),
      currentUsers = [],
      $leaderInput = $('input.form-input-leaders'),
      $leaderlist = $('#ribo-leader-list');

  var existUsers = $("input[name*='leaderArray']").map(function(){return $(this).val();}).get();
  if(existUsers.length >0){
    for(var i = 0; i < existUsers.length; i++) {
      currentUsers.push(existUsers[i]);
    }
  }
  existUsers = $("input[name*='memberArray']").map(function(){return $(this).val();}).get();
  if(existUsers.length >0){
    for(var i = 0; i < existUsers.length; i++) {
      currentUsers.push(existUsers[i]);
    }
  }
  console.log(currentUsers);

  var getFilteredUsersJson = {
    source:function(query, process) {
      return $.get('/api/users/getAutocompleteJson',{query: query} ,function(data) {
        currentUsers.map(function(id){
          for(var i = 0; i < data.length; i++) {
            if(data[i].id === id) {
              data.splice(i, 1)
            }
          }
        })
        return process(data);
      });
    },
    autoSelect: true
  };

  /*var userId=$("body").data("userid");
  console.log(userId);
  if(userId) {
    currentUsers.push(userId);
  }*/

  $input.typeahead(getFilteredUsersJson);

  $input.change(function() {
      var current = $input.typeahead("getActive");
      if (current) {
        console.log("4");
          // Some item from your model is active!
          if (current.name == $input.val()) {
            var tags = current.name.split(" - ");
            var tag;
            if(tags[0]===""||tags[0]==="undefined"||tags[0]===" ") {
              tag= tags[1];
            } else {
              tag=tags[0];
            }
            $memberlist.append('<span class="badge badge-pill rib-text-color-3 mr-2 rib-bg-tag" id="'+current.id+'">'+tag+'<i class="fa fa-times member-delete-icon" aria-hidden="true"></i></span>');
            $memberlist.append('<input type="hidden" name="memberArray[]" value="'+current.id+'">');
            $input.val("");
            currentUsers.push(current.id);
            console.log($("input[name*='memberArray']").map(function(){return $(this).val();}).get());
          }
          // This means the exact match is found. Use toLowerCase() if you want case insensitive match.
          else {
            console.log("5");

            // This means it is only a partial match, you can either add a new item
            // or take the active if you don't want new items
          }
      } else {
          // Nothing is active so it is a new value (or maybe empty value)
      }
  });

  $leaderInput.typeahead(getFilteredUsersJson);

  $leaderInput.change(function() {
      var current = $leaderInput.typeahead("getActive");
      if (current) {
        console.log("4");
          // Some item from your model is active!
          if (current.name == $leaderInput.val()) {
            var tags = current.name.split(" - ");
            var tag;
            if(tags[0]===""||tags[0]==="undefined"||tags[0]===" ") {
              tag= tags[1];
            } else {
              tag=tags[0];
            }
            var currentLeaders = $("input[name*='leaderArray']").map(function(){return $(this).val();}).get();
            if (currentLeaders.length > 0) {
              alert("只能有一名隊長喔");
              $leaderInput.val("");
            } else {
              $leaderlist.append('<span class="badge badge-pill rib-text-color-3 mr-2 rib-bg-tag" id="'+current.id+'">'+tag+'<i class="fa fa-times member-delete-icon" aria-hidden="true"></i></span>');
              $leaderlist.append('<input type="hidden" name="leaderArray[]" value="'+current.id+'">');
              $leaderInput.val("");
              currentUsers.push(current.id);
            }
            
            console.log($("input[name*='leaderArray']").map(function(){return $(this).val();}).get());
          }
          // This means the exact match is found. Use toLowerCase() if you want case insensitive match.
          else {
            console.log("5");

            // This means it is only a partial match, you can either add a new item
            // or take the active if you don't want new items
          }
      } else {
          // Nothing is active so it is a new value (or maybe empty value)
      }
  });

  $(".ribo-badge-container").on("click", ".member-delete-icon", function(){
    var $el = $(this).parent("span");
     //console.log($el);   
    $("input[name*='memberArray']").each(function() {
      if ($(this).val() === $el.attr('id')) {
        $(this).remove();
      }
    });
    $("input[name*='leaderArray']").each(function() {
      if ($(this).val() === $el.attr('id')) {
        $(this).remove();
      }
    });

    var index = currentUsers.indexOf($el.attr('id'));
    if (index >= 0) {
      currentUsers.splice( index, 1 );
    }
    $el.remove();
    console.log($("input[name*='memberArray']").map(function(){return $(this).val();}).get());
    console.log($("input[name*='leaderArray']").map(function(){return $(this).val();}).get());
    console.log(currentUsers);
  });
})
