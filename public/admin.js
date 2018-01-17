$(function(){
  $.get('/articles', appendToList);

  $(".rib-alert-section").hide();

  $('form').on('submit', function(event) {
    event.preventDefault();
    var a_id = $(".rib-btn-save").attr("data-id");
    var form = $(this);
    var articleData = form.serialize();

    $('.alert').hide();

    $.ajax({
      type: 'PUT',
      url: '/articles/'+a_id,
      data: articleData,
    })
    .error(function(error) {
      $('.alert-danger').show();
      console.log(error)
    })
    .success(function(articleData){
      $('.alert-success').show();
      console.log(articleData);
    });
  })

  $('.rib-btn-delete').click(function(){
    var a_id = $(this).attr("data-id");
    console.log(a_id);
    $.ajax({
      type: 'DELETE',
      url: '/articles/'+a_id,
      success: function(){
        $('.alert-success').show();
        window.location.href = '../';
      },
      error: function(error){
        $('.alert-danger').show();
      }
    })

  });

  function appendToList(data){
    var list = [];
    var articles = data.articles;
    var content, city;
    articles.map(function(article, i){
      content = '<th scope="row">'+i+'</th>'+ // + // example on how to serve static images
        '<td><a href="/admin/articles/'+article._id+'">'+article.title+'</a></td>'+
        '<td>'+article.createdDate+'</td>'+
        '<td><button type="button" data-id="'+article._id+'" class="btn btn-sm btn-outline-primary">編輯</button></td>'+
        '<td><button type="button" data-id="'+article._id+'" class="btn btn-sm btn-danger btn-outline-primary">刪除</button></td>';
      list.push($('<tr>', { html: content }));
    })
    $('tbody').append(list);
  }
})
