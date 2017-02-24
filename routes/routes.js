var express = require('express');
var router = express.Router();
var pgp = require('pg-promise')();
var db = pgp('gres://ubuntu:sqltest@localhost');

// gettting all the users
router.get('/', function(req,res,next){
  db.any('SELECT * FROM posts ORDER BY id ASC;')
    .then(function(data){
      return res.render('pages/index', {data: data});
    })
    .catch(function(err){
      return next(err);
    });
});

// edit users
router.get('/posts/:id/edit', function(req,res,next){
  var id = parseInt(req.params.id);
  db.one('SELECT * FROM posts where id = $1', id)
    .then(function (title) {
      res.render('pages/edit', {title: title})
    })
    .catch(function (err) {
      return next(err);
    });
});

router.get('/post/:id', function(req,res,next){
  var id = parseInt(req.params.id);
  db.one('SELECT * FROM posts WHERE id = $1', id)
    .then(function (title) {
      res.render('pages/post', {title: title})
    })
    .catch(function (err) {
      return next(err);
    });
});

router.post('/posts/:id/edit', function(req,res,next){
  db.none('update posts set title=$1, entry=$2 where id=$3',
    [req.body.title, req.body.entry, parseInt(req.params.id)])
    .then(function () {
      res.redirect('/');
    })
    .catch(function (err) {
      return next(err);
    });
});

router.post('/posts/create', function(req,res,next){
  db.none('INSERT INTO posts(title, entry) VALUES($1, $2)',
    [req.body.title, req.body.entry])
    .then(function () {
      res.redirect('/');
    })
    .catch(function (err) {
      return next(err);
    });
});

router.delete('/posts/:id', function(req, res, next){
  var id = parseInt(req.params.id);
  db.result('DELETE FROM posts WHERE id = $1', id)
    .then(function (result) {
      res.redirect('/');
    })
    .catch(function (err) {
      return next(err);
    });
});

module.exports = router;
