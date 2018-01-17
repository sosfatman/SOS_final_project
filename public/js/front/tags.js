jQuery(function(){

  var $input = $(".form-input-tags"),
      $taglist = $(".ribo-tag-list"),
      $inputBtn = $(".input-tags-btn");
  var currentTags = [];

  var existTags = $("input[name*='tagArray']").map(function(){return $(this).val();}).get();
  if(existTags.length >0){
    for(var i = 0; i < existTags.length; i++) {
      currentTags.push(existTags[i]);
    }
  }
  console.log(currentTags);

  var $exploreBar = $("#explore-bar");
  
  console.log($exploreBar);

  $exploreBar.typeahead({
    source:function(query, process) {
      return $.get('/api/tags/getAutocompleteJson', {query: query}, function(data) {
        //console.log(query);
        //console.log(data);
        
        return process(data);
      });
    },
    autoSelect: true
  })

  $exploreBar.change(function() {
      var current = $exploreBar.typeahead("getActive");
      //console.log(current);
      
      if (current) {
        console.log("4");
          // Some item from your model is active!
          if (current == $exploreBar.val()) {
            $exploreBar.val("");
            location.href = "/explore/"+current;
              // This means the exact match is found. Use toLowerCase() if you want case insensitive match.
          } else {
            console.log("5");

              // This means it is only a partial match, you can either add a new item
              // or take the active if you don't want new items
          }
      } else {
          // Nothing is active so it is a new value (or maybe empty value)
      }
  });

  $input.keydown(function(event) {
    if ( event.which == 13 || event.which == 32 ) {
      event.preventDefault();
      var tag = $input.val();
      if(tag.length !== 0){
        if (currentTags.indexOf(tag) >= 0) {
          alert("該標籤已經被輸入過了喔");
          $input.val("");
        } else {
          $taglist.append('<span class="badge badge-pill rib-text-color-3 mr-2 rib-bg-tag">'+tag+'<i class="fa fa-times tag-delete-icon" aria-hidden="true"></i></span>');
          $taglist.append('<input type="hidden" name="tagArray[]" value="'+tag+'">');
          $input.val("");
          currentTags.push(tag);
        }
        
        console.log($("input[name*='tagArray']").map(function(){return $(this).val();}).get());
      }
    }
  });

  $taglist.on("click", ".tag-delete-icon", function(){
    var $el = $(this).parent("span"),
        tag = $el.text();
        
    if(tag.length !== 0){
      $('.alert-success').show();
      $("input[name*='tagArray']").each(function() {
        if ($(this).val() === tag) {
            $(this).remove();
        }
      });
      tagIndex = currentTags.indexOf(tag);
      if (tagIndex >= 0) {
        currentTags.splice(tagIndex, 1);
      }
      $el.remove();
      console.log($("input[name*='tagArray']").map(function(){return $(this).val();}).get());
    }
  });

  $inputBtn.click(".input-tags-btn", function(){
    var tag = $input.val();
    if(tag.length !== 0){
      if (currentTags.indexOf(tag) >= 0) {
          alert("該標籤已經被輸入過了喔");
          $input.val("");
        } else {
          $taglist.append('<span class="badge badge-pill rib-text-color-3 mr-2 rib-bg-tag">'+tag+'<i class="fa fa-times tag-delete-icon" aria-hidden="true"></i></span>');
          $taglist.append('<input type="hidden" name="tagArray[]" value="'+tag+'">');
          $input.val("");
          currentTags.push(tag);
        }
    }
  });
});
