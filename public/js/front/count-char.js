$(function() {
	var countText = $('.count-char');
    //countText.siblings('.char-counter').html(countText.val().length + '/'+ countText.attr('maxlength'));
    countText.each(function(){
    	$(this).siblings('.char-counter').html($(this).val().length + '/'+ $(this).attr('maxlength'));
    	//console.log(this.parentparentElement);

    	$(this).keyup(function(){  
        	//get the limit from maxlength attribute  
        	var limit = parseInt($(this).attr('maxlength'));  
        	//get the current text inside the textarea  
        	var text = $(this).val();  
        	//count the number of characters in the text  
        	var chars = text.length;  
  
        		//check if there are more characters then allowed  
        	if(chars > limit){  
            	//and if there are use substr to get the text before the limit  
            	var new_text = text.substr(0, limit);  
  
            	//and change the current text with the new text  
            	$(this).val(new_text);  
        	}

        	$(this).siblings('.char-counter').html(chars + '/' + limit);
    	});
    });
    
})