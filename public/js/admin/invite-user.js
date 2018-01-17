$(function(){

  var $input = $('input#node-form-members'),
      $memberlist = $(".ribo-member-list"),
      currentUsers = [];
      $authorInput = $('input#node-form-author'),
      $leaderInput = $('input#node-form-leaders'),
      $leaderlist = $('.ribo-leader-list');

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

  var getAllUsersJson = {
    source:function(query, process) {
      return $.get('/api/users/getAutocompleteJson',{query: query} ,function(data) {
        return process(data);
      });
    },
    autoSelect: true
  };
  var existUsers = $("input[name*='leaders']").map(function(){return $(this).val();}).get();
  if(existUsers.length >0){
    for(var i = 0; i < existUsers.length; i++) {
      currentUsers.push(existUsers[i]);
    }
  }

  existUsers = $("input[name*='members']").map(function(){return $(this).val();}).get();
  if(existUsers.length >0){
    for(var i = 0; i < existUsers.length; i++) {
      currentUsers.push(existUsers[i]);
    }
  }
  console.log(currentUsers);

  $input.typeahead(getFilteredUsersJson);

  $input.change(function() {
      var current = $input.typeahead("getActive");
      if (current) {
        console.log("4");
          // Some item from your model is active!
          if (current.name == $input.val()) {
            $('.alert-success').show();
            var tags = current.name.split(" - ");
            var tag;
            if(tags[0].length===0||tags[0]==="undefined") {
              tag = tags[1];
            } else {
              tag = tags[0];
            }
            $memberlist.append('<span class="badge badge-default" id="'+current.id+'">'+tag+'<i class="fa fa-times member-delete-icon" aria-hidden="true"></i></span>');
            $memberlist.append('<input type="hidden" name="members[]" value="'+current.id+'">');
            $input.val("");
            currentUsers.push(current.id);
            console.log($("input[name*='members']").map(function(){return $(this).val();}).get());
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
    $("input[name*='members']").each(function() {
      if ($(this).val() === $el.attr('id')) {
        $(this).remove();
      }
    });
    $("input[name*='leaders']").each(function() {
      if ($(this).val() === $el.attr('id')) {
        $(this).remove();
      }
    });
    var index = currentUsers.indexOf($el.attr('id'));
    if (index >= 0) {
      currentUsers.splice( index, 1 );
    }
    $el.remove();
    console.log($("input[name*='members']").map(function(){return $(this).val();}).get());
    console.log($("input[name*='leaders']").map(function(){return $(this).val();}).get());
    console.log(currentUsers);
  });

  var existAuthor = $authorInput.val();

  $authorInput.typeahead(getAllUsersJson);
  $authorInput.change(function() {
      var current = $authorInput.typeahead("getActive");
      if (current) {
        console.log("4");
          // Some item from your model is active!
          if (current.name == $authorInput.val()) {
            $("input[name=author]").val(current.id);
            console.log($("input[name=author]").val().length);
            existAuthor = current.name;
            console.log(existAuthor);
          }
          // This means the exact match is found. Use toLowerCase() if you want case insensitive match.
          else {
            console.log("5");
            // This means it is only a partial match, you can either add a new item
            // or take the active if you don't want new items
          }
      } else {
          // Nothing is active so it is a new value (or maybe empty value)
          if ($authorInput.val()==="") {
            $("input[name=author]").val("");
            existAuthor="";
          }
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
            if(tags[0].length===0||tags[0]==="undefined") {
              tag = tags[1];
            } else {
              tag = tags[0];
            }
            $leaderlist.append('<span class="badge badge-default" id="'+current.id+'">'+tag+'<i class="fa fa-times member-delete-icon" aria-hidden="true"></i></span>');
            $leaderlist.append('<input type="hidden" name="leaders[]" value="'+current.id+'">');
            $leaderInput.val("");
            currentUsers.push(current.id);
            console.log($("input[name*='leaders']").map(function(){return $(this).val();}).get());
            console.log(currentUsers);
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

  $('#group-node-form').submit(function(){
    if ($authorInput.val()!==existAuthor) {
      alert("作者欄位請填寫完整姓名與信箱，或重新選擇作者");
      return false;
    }
  })
})
