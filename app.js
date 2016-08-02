// **** design ****
//
// (*) for root -->
// > run function that gets the data from github and stackoverflow (later, store the data)
// > send object of data to the view (index.html)
// > use object on script file to draw everything
//
// (*) for route /<lang> --> show clicked state of this specific language
//
// (*) think about changing the layout and the ux

var express = require('express');
var app = express();


app.use(express.static( __dirname + '/static' ));

app.get('/',function(request, response){
  response.sendFile( path.join( __dirname, 'static', 'index.html' ));
  console.log("Served index.html successfully");
});

app.listen(3000);
console.log("App is served on localhost:3000");
