var express = require('express'),
    fs = require('fs'),
    router = express.Router(),
    multer  =  require('multer');

var storage =   multer.diskStorage({
    destination: function (req, file, callback) {
      callback(null, './public/images/');
    },
    filename: function (req, file, callback) {
      //callback(null, file.fieldname + '-' + Date.now());
      callback(null, file.originalname);
    }
});
var upload = multer({ storage : storage, limits: {
    fieldSize: 3145728
  }}).single('userPhoto');

var storageUser =   multer.diskStorage({
    destination: function (req, file, callback) {
      callback(null, './public/images/users/');
    },
    filename: function (req, file, callback) {
      callback(null, req.user.id + "_" + file.originalname);
    }
});
var uploadUser = multer({ storage : storageUser, limits: {
    fieldSize: 3145728
  }}).single('userPhoto');

var storageTemp =   multer.diskStorage({
    destination: function (req, file, callback) {
      callback(null, './public/images/temp/');
    },
    filename: function (req, file, callback) {
      callback(null, "temp_"+Date.now()+"_"+file.originalname);
    }
});
var uploadTemp = multer({ storage : storageTemp, limits: {
    fieldSize: 3145728
  }}).single('tempPhoto');

var storageGroup =   multer.diskStorage({
    destination: function (req, file, callback) {
      callback(null, './public/images/groups/');
    },
    filename: function (req, file, callback) {
      callback(null, req.params.id + "_" + file.originalname);
    }
});
var uploadGroup = multer({ storage : storageGroup, limits: {
    fieldSize: 3145728
  }}).single('groupPhoto');

var storageEvent =   multer.diskStorage({
    destination: function (req, file, callback) {
      callback(null, './public/images/events/');
    },
    filename: function (req, file, callback) {
      callback(null, req.params.id + "_" + file.originalname);
    }
});
var uploadEvent = multer({ storage : storageEvent, limits: {
    fieldSize: 3145728
  }}).single('eventPhoto');

/*
router.route('/')
      .get(function(req, res){
         res.sendFile("/home/webmaster/exp/public/images/"+req.params.id+".png");
      });
*/

router.route('/articles/:id')
      .get(function(req, res){
         //res.sendFile("/home/webmaster/exp/public/images/articles/"+req.params.id+".png");
         //res.sendFile("/home/webmaster/exp/public/images/articles/default_img.jpg");
         fs.access('/home/webmaster/exp/public/images/articles/'+req.params.id+".jpg", fs.F_OK, function(err) {
            if (!err) {
                //console.log('/home/webmaster/exp/public/images/articles/'+req.params.id+".jpg 存在");
                res.sendFile('/home/webmaster/exp/public/images/articles/'+req.params.id+".jpg");
            } else {
                //console.log('/home/webmaster/exp/public/images/articles/'+req.params.id+".jpg 不存在");
                var img_num=Math.floor((Math.random() * 39)+1);
                if(img_num<10){
                      console.log(img_num);
                      res.sendFile("/home/webmaster/exp/public/images/articles/img_600x400_0"+img_num+".jpg");
                }else{
                      res.sendFile("/home/webmaster/exp/public/images/articles/img_600x400_"+img_num+".jpg");
                }

            }
        });
      });



router.route('/art')
      .get(function(req, res){
         res.sendFile("http://4.bp.blogspot.com/-txLlUaG0hug/VperKHjBf9I/AAAAAAAACNY/144m0O1KNKI/s640/111FP.jpg");
      });

router.route('/upload')
      .get(function(req, res){
         res.render('front/upload.ejs');
      })
      .post(function(req, res){
          upload(req,res,function(err) {
            if(err) {
                return res.end("Error uploading file.");
            }
            res.end("File is uploaded");
          });
      });

router.route('/upload/user')
      .post(function(req, res){
          uploadUser(req, res, function(err) {
            if(err) {
              console.log(err);
                return res.send(err);
            }
            //console.log(req.file);
            var pic_path = req.file.path.replace("public","");
            res.send(pic_path);
          });
      });

router.route('/upload/temp')
      .post(function(req, res){
          uploadTemp(req, res, function(err) {
            console.log(req.file);
            if(err) {
              console.log(err);
                return res.send(err);
            }
            //console.log(req.file);
            var pic_path = req.file.path.replace("public","");
            res.send(pic_path);
          });
      });

router.route('/upload/group/:id')
      .post(function(req, res){
          uploadGroup(req, res, function(err) {
            if(err) {
              console.log(err);
                return res.send(err);
            }
            //console.log(req.file);
            var pic_path = req.file.path.replace("public","");
            res.send(pic_path);
          });
      });

router.route('/upload/event/:id')
      .post(function(req, res){
          uploadEvent(req, res, function(err) {
            if(err) {
              console.log(err);
                return res.send(err);
            }
            //console.log(req.file);
            var pic_path = req.file.path.replace("public","");
            res.send(pic_path);
          });
      });

module.exports = router;
