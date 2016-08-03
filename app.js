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

// *************************
// CONFIGURATIONS
// *************************
app.use(logger('dev'));

// app.set("views", __dirname + '/views');
app.engine('.html', require('ejs').__express);
app.set('view engine', 'html');

// app.use(express.static( __dirname + '/static' ));


// *************************
// TEMP DATABASE
// *************************
var dataArray = {
  "github_last_update":0,
  "stackoverflow_last_update":0,
  "data":[],
};

var langNum = 10; // number of languages to handled


// *************************
// USEFUL FUNCTIONS
// *************************
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




// sorting arrat according to the number of new repositories
function compareForSort(a,b){
  if (a.repos == b.repos)
    return 0;
  if (a.repos > b.repos)
    return -1;
  else
    return 1;
}

// *************************
// ROUTERS
// *************************
app.get('/',function(req, res){

  var time = timeForApi();

  var options = {
    url: "http://api.github.com/search/repositories?per_page=1000&sort=stars&q=+created:"+time,
    headers: {
      'User-Agent': 'best_language_web_app'
      }
  };
  console.log("dataArray.github_last_update: " + dataArray.github_last_update);
  console.log("time: " + time);

  // checking to see if data is up-to-date
  if (dataArray.github_last_update !== time) {
    console.log("GITHUB DATA IS NOT UP-TO-DATE: GETTING FRESH DATA...");

    // getting data from github
    Request(options, function (error, response, body) {
      console.log("GETTING DATA FROM GITHUB: ATTEMPTING...");

      if (!error && response.statusCode == 200) {
        console.log("GETTING DATA FROM GITHUB: SUCCEEDED :)");
        var gitData = JSON.parse(body);
        var repositories = gitData.items;
        var tempArray = [];

        // counting number of new repositories per lnaguage
        for (var i = 0; i < repositories.length; i++){
          var language = repositories[i].language;
          var exists = 0;
          if (language === null){
            continue;
          }

          for (var n = 0; n < tempArray.length; n++) {
            if (tempArray[n].name == language) {
              tempArray[n].repos++;
              exists = 1;
              continue;
            }
          }

          if(exists === 0) {
            tempArray.push({
              name: language,
              repos: 1
            });
          }
        }

        // calculating repos_percent out of total new repositories per language
        var sumRepositories = 0;
        for (i = 0; i < tempArray.length; i++){
          sumRepositories = sumRepositories + tempArray[i].repos;
        }

        for (i = 0; i < tempArray.length; i++){
          tempArray[i].repos_percent = Math.round(tempArray[i].repos / sumRepositories * 100);
        }

        tempArray = tempArray.sort(compareForSort);
        dataArray.data = tempArray;

      }
      else if (error){
        console.error(error);
      }
      else {
        console.error("GETTING DATA FROM GITHUB: FAILED :(");
        res.end();
      }
      dataArray.github_last_update = time;
      res.json(dataArray);
    });
  }
  else {
    console.log("GITHUB DATA IS UP-TO-DATE: USING EXISTING DATA!");
    res.json(dataArray);
  }
});

app.get("*", function(req, res){
	res.send('Sorry, there\'s nothing here.');
});

app.listen(3000);
console.log("App is served on localhost:3000");
