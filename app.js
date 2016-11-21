var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var pgp = require('pg-promise')();
var db = pgp('postgres://localhost:5432/generator');

// this is to serve the css and js from the public folder to your app
// it's a little magical, but essentially you put files in there and link
// to them in you head of your files with css/styles.css
app.use(express.static(__dirname + '/public'));

// this is setting the template engine to use ejs
app.set('view engine', 'ejs');

// setting your view folder
app.set('views', __dirname+'/views');

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
  db.any('SELECT * FROM users')
    .then(function(data){
      return res.render('index', {data: data})
    })
    .catch(function(err){
      return next(err);
    });
});

// edit users
app.get('/users/:id/edit', function(req,res,next){
  var id = parseInt(req.params.id);
  db.one('select * from users where id = $1', id)
    .then(function (user) {
      res.render('edit', {user: user})
    })
    .catch(function (err) {
      return next(err);
    });
});

app.post('/users/:id/edit', function(req,res,next){
  db.none('update users set name=$1, email=$2, password=$3 where id=$4',
    [req.body.name, req.body.email, req.body.password, parseInt(req.params.id)])
    .then(function () {
      res.redirect('/');
    })
    .catch(function (err) {
      return next(err);
    });
});

app.delete('/users/:id', function(req, res, next){
  var id = parseInt(req.params.id);
  db.result('delete from users where id = $1', id)
    .then(function (result) {
      res.redirect('/');
    })
    .catch(function (err) {
      return next(err);
    });
});

app.listen(3000, function(){
  console.log('Application running on localhost on port 3000');
});
