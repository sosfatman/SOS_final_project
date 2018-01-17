var express = require('express'),
    router = express.Router(),
    mongoose = require('mongoose'),
    bodyParser = require('body-parser'),
    Cities = require('../model/cities');


// 首頁路由 (http://localhost:8080)
router.route('/:id')
  .get(function(request, response){
    console.log(request.params.id);
    Cities.findOne({_id:request.params.id},function(err,cities){
      response.send({cities:cities});
      console.log(cities);
    });
  })


// 另一張網頁路由 (http://localhost:8080/about)
router.get('/about', function(req, res) {
  res.send('about page!');
});

module.exports = router;
