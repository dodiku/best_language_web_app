// Create - A basic Express app from one of your existing projects.
//
// Bonus - try to include a "dynamic" route where the url affects the page content.
// The app should run locally on your computer. You do not need to push it up to the web.


// *** getting started ***
var http = require("http");
var express = require('express');
var app = express();


var path = require('path');


app.use(express.static( __dirname + '/static' ));

app.get('/',function(request, response){
  response.sendFile( path.join( __dirname, 'static', '
  index.html' ));
  console.log("Served index.html successfully");
});

http.createServer(app).listen(1337);
console.log("App is served on localhost:1337");
