// **** design ****
//
// (*) for root -->
// > run function that gets the data from github and stackoverflow (later, store the data)
// > send object of data to the view (index.html)
// > use object on script file to draw everything
//
// (*) for route /<lang> --> show clicked state of this specific language
// asdfaskdjfasdklm asdm,f asdf
// (*) think about changing the layout and the ux

var express = require('express');
var app = express();
var logger = require('morgan');
var Request = require('request');


// CONFIGURATIONS
app.use(logger('dev'));

// app.set("views", __dirname + '/views');
app.engine('.html', require('ejs').__express);
app.set('view engine', 'html');

// app.use(express.static( __dirname + '/static' ));




// TEMP DATABASE
var dataArray = [];
var langNum = 10; // number of languages to handled




// USEFUL FUNCTIONS
function timeForApi(){
  var yesterday = new Date();
  var dd = yesterday.getDate()-1; //today - 1 = yesterday
  var mm = yesterday.getMonth()+1; //January is 0!
  var yyyy = yesterday.getFullYear();

  if(dd<10) {
      dd='0'+dd;
  }

  if(mm<10) {
      mm='0'+mm;
  }

  yesterday = yyyy+"-"+mm+"-"+dd;
  console.log("Yesderday's date for GitHub: " + yesterday);
  return yesterday;
}





// ROUTERS
app.get('/',function(req, res){

  var time = timeForApi();

  var options = {
    url: "http://api.github.com/search/repositories?per_page=1000&sort=stars&q=+created:>"+time,
    headers: {
      'User-Agent': 'best_language_web_app'
      }
  };

  function callback (error, response, body) {
    console.log("GETTING DATA FROM GITHUB: ATTEMPTING...");
    // console.log(JSON.parse(body));
    if (!error && response.statusCode == 200) {
      console.log("GETTING DATA FROM GITHUB: SUCCEEDED :)");

      var gitData = JSON.parse(body);
      var repositories = gitData.items;
      // res.json(gitData);

      // COUNTING NUMBER OF NEW GITHUB REPOSITORIES PER LANGUAGE
      for (var i = 0; i < repositories.length; i++){

        var language = repositories[i].language;
        var exists = 0;

        if (language === null){
          continue;
        }

        for (var n = 0; n < dataArray.length; n++) {
          if (dataArray[n].name == language) {
            dataArray[n].repos++;
            exists = 1;
            continue;
          }
        }

        if(exists === 0 && dataArray.length < langNum) {
          dataArray.push({
            name: language,
            repos: 1
          });
        }

      }

      res.json(dataArray);


    }
    else if (error){
      console.error(error);
    }
    else {
      console.error("GETTING DATA FROM GITHUB: FAILED :(");
      res.end();
    }
  }

  Request(options, callback);

  // set up url

  // get data from github

  // get data from stackoverflow

  // render view with data object
  // res.sendFile( path.join( __dirname, 'static', 'index.html' ));
  // console.log("Served index.html successfully");
});

app.get("*", function(req, res){
	res.send('Sorry, there\'s nothing here.');
});

app.listen(3000);
console.log("App is served on localhost:3000");
