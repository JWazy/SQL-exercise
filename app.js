var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var path = require('path');

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
app.use(bodyParser.urlencoded({ extended: false }));

// parse application/json
app.use(bodyParser.json());

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

var routes = require('./routes/routes');

app.use('/', routes);

app.listen(8080, function(){
  console.log('Application running on localhost on port 8080');
});
