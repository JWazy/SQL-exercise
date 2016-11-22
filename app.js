var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var path = require('path');
var pgp = require('pg-promise')();
var db = pgp('gres://ubuntu:sqltest@localhost');

// this is to serve the css and js from the public folder to your app
// it's a little magical, but essentially you put files in there and link
// to them in you head of your files with css/styles.css
app.use(express.static(__dirname + '/public'));

// this is setting the template engine to use ejs
app.set('view engine', 'ejs');

// setting your view folder
app.set('views', __dirname+'/views');

app.use(express.static(path.join(__dirname, 'public')));

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))

// parse application/json
app.use(bodyParser.json())

// for your routes to know where to know if there is param _method DELETE
// it will change the req.method to DELETE and know where to go by setting
// your req.url path to the regular path without the parameters
app.use( function( req, res, next ) {
  if (req.query._method == 'DELETE') {
    req.method = 'DELETE';
    req.url = req.path;
  }
  next();
});

// gettting all the users
app.get('/', function(req,res,next){
  db.any('SELECT * FROM posts ORDER BY id ASC;')
    .then(function(data){
      return res.render('pages/index', {data: data});
    })
    .catch(function(err){
      return next(err);
    });
});

// edit users
app.get('/posts/:id/edit', function(req,res,next){
  var id = parseInt(req.params.id);
  db.one('SELECT * FROM posts where id = $1', id)
    .then(function (title) {
      res.render('pages/edit', {title: title})
    })
    .catch(function (err) {
      return next(err);
    });
});

app.get('/post/:id', function(req,res,next){
  var id = parseInt(req.params.id);
  db.one('SELECT * FROM posts WHERE id = $1', id)
    .then(function (title) {
      res.render('pages/post', {title: title})
    })
    .catch(function (err) {
      return next(err);
    });
});

app.post('/posts/:id/edit', function(req,res,next){
  db.none('update posts set title=$1, entry=$2 where id=$3',
    [req.body.title, req.body.entry, parseInt(req.params.id)])
    .then(function () {
      res.redirect('/');
    })
    .catch(function (err) {
      return next(err);
    });
});

app.post('/posts/create', function(req,res,next){
  db.none('INSERT INTO posts(title, entry) VALUES($1, $2)',
    [req.body.title, req.body.entry])
    .then(function () {
      res.redirect('/');
    })
    .catch(function (err) {
      return next(err);
    });
});

app.delete('/posts/:id', function(req, res, next){
  var id = parseInt(req.params.id);
  db.result('DELETE FROM posts WHERE id = $1', id)
    .then(function (result) {
      res.redirect('/');
    })
    .catch(function (err) {
      return next(err);
    });
});

app.listen(8080, function(){
  console.log('Application running on localhost on port 8080');
});
