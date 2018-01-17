jQuery(function($){

  var $particInput = $('input.form-input-participants'),
      $particList = $("#ribo-participant-list"),
      currentParticipants = [];

  var existParticipants = $("input[name*='participantArray']").map(function(){return $(this).val();}).get();
  if(existParticipants.length >0){
    for(var i = 0; i < existParticipants.length; i++) {
      currentParticipants.push(existParticipants[i]);
    }
    console.log(currentParticipants);
  }

  var getFilteredParticsJson = {
    source:function(query, process) {
      //var users;
      var ajaxUsers = $.get('/api/users/getAutocompleteJson',{query: query}); 
      //var groups;
      var ajaxGroups = $.get('/api/groups/getAutocompleteJson',{query: query});

      var result;
      $.when(ajaxUsers, ajaxGroups).done(function(xhrObject1, xhrObject2){
        users = xhrObject1[0];
        groups = xhrObject2[0];

        result = users.concat(groups);

        currentParticipants.map(function(id){
          for(var i = 0; i < result.length; i++) {
            if(result[i].id === id) {
              result.splice(i, 1);
            }
          }
        });
        result.forEach(function(participant){
          participant.name = participant.type+": "+participant.name;
        })
        //console.log(result);
        return process(result);
      });
      
    },
    autoSelect: true
  };

  /*var userId=$("body").data("userid");
  console.log(userId);
  if(userId) {
    currentUsers.push(userId);
  }*/

  $particInput.typeahead(getFilteredParticsJson);

  $particInput.change(function() {
      var current = $particInput.typeahead("getActive");
      if (current) {
        console.log("4");
          // Some item from your model is active!
          if (current.name == $particInput.val()) {
            var tags = current.name.split(" - ");
            var tag;
            if(tags[0].includes("empty")||tags[0]==="user:  ") {
              tag = "user: "+tags[1];
            } else {
              tag = tags[0];
            }
            $particList.append('<span class="badge badge-pill rib-text-color-3 mr-2 rib-bg-tag" id="'+current.id+'">'+tag+'<i class="fa fa-times partic-delete-icon" aria-hidden="true"></i></span>');
            $particList.append('<input type="hidden" name="participantArray[]" data-node-type="'+current.type+'" value="'+current.id+'">');
            $particInput.val("");
            currentParticipants.push(current.id);
            console.log($("input[name*='participantArray']").map(function(){return $(this).val();}).get());
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

  

  $(".ribo-badge-container").on("click", ".partic-delete-icon", function(){
    var $el = $(this).parent("span");
     //console.log($el);   
    $("input[name*='participantArray']").each(function() {
      if ($(this).val() === $el.attr('id')) {
        $(this).remove();
      }
    });

    var index = currentParticipants.indexOf($el.attr('id'));
    if (index >= 0) {
      currentParticipants.splice( index, 1 );
    }
    $el.remove();
    console.log($("input[name*='participantArray']").map(function(){return $(this).val();}).get());
    console.log(currentParticipants);
  });
})
