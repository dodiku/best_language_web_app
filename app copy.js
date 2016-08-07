var express = require('express');
var app = express();
var logger = require('morgan');
var Request = require('request');
var zlib = require("zlib");

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
  "last_update":0,
  "data":[],
};

var langNum = 10; // number of languages to handled


// *************************
// USEFUL FUNCTIONS
// *************************

// returning a string that represnts time in the correct format for API calls
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
  console.log("Yesderday's date is: " + yesterday);
  return yesterday;
}

// compare array of objects
function compareForSort(a,b){
  if (a.repos == b.repos)
    return 0;
  if (a.repos > b.repos)
    return -1;
  else
    return 1;
}

// getting data from stackoverflow for a single language
function requestStackoverflowAPI(lang, time) {

  var stackURL = "https://api.stackexchange.com/2.2/questions/?filter=total&fromdate="+time+"&site=stackoverflow&tagged="+lang;
  // var stackURL = 'http://en.wikipedia.org/w/api.php?action=opensearch&format=json&search=computers';
  console.log("Stackoverflow URL: " + stackURL);
  var total = 0;

  var headers = {
      'Accept-Encoding': 'gzip'
    };

  // var options = {
  //   url: stackURL,
  //   // encoding: 'utf-8',
  //   'headers':
  //   'Accept-Encoding': 'gzip',
  // };
  //
  // Request({url:'http://localhost:8000/', 'headers': headers})
  //       .pipe(zlib.createGunzip()) // unzip
  //       .pipe(process.stdout);



  Request({method: 'GET', uri: stackURL, gzip: true}, function (error, response, body) {
    if (!error && response.statusCode == 200) {
      // console.log(body);
      // console.log(response.headers['content-type']);
      // console.log(JSON.parse(body.total));

      // var langStackQuestions = body;
      // var gunzip = zlib.createGunzip();
      // body.pipe(gunzip);
      // console.log("this is gunzip: " +gunzip.total);
      console.log('server encoded the data as: ' + (response.headers['content-encoding'] || 'identity'));
      console.log("this is body: " + body);
      var langStackQuestions = JSON.parse(body);
      console.log("body is a: " + typeof langStackQuestions);
      console.log(langStackQuestions);
      // langStackQuestions = body.total;


      // total = langStackQuestions.total;
      total = langStackQuestions.total;
      // total = body.total;
      console.log(total);
      console.error("GETTING DATA FROM STACKOVERFLOW: SUCCEEDED :) [" + lang + " :"+ total + "]");
      return total;
    }

    else if (error){
      console.error(error);
    }
    else {
      console.error("GETTING DATA FROM STACKOVERFLOW: FAILED :( [" + lang + "]");
      return total;
    }
  });
}

// *************************
// ROUTERS
// *************************
app.get('/api/yesterday',function(req, res){

  var time = timeForApi();
  var tempArray = [];

  var options = {
    url: "http://api.github.com/search/repositories?per_page=1000&sort=stars&q=+created:"+time,
    headers: {
      'User-Agent': 'best_language_web_app'
      }
  };

  Request(options, function (error, response, body) {
    if (!error && response.statusCode == 200) {
      var gitData = JSON.parse(body);
      var repositories = gitData.items;

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

      // summarizing github repos
      var sumRepositories = 0;
      for (i = 0; i < tempArray.length; i++){
        sumRepositories = sumRepositories + tempArray[i].repos;
      }

      // calculating repos_percent
      for (i = 0; i < tempArray.length; i++){
        tempArray[i].repos_percent = Math.round(tempArray[i].repos / sumRepositories * 100);
      }

      // sorting the array
      tempArray = tempArray.sort(compareForSort);

      // done with github
      console.log("GETTING DATA FROM GITHUB: SUCCEEDED. RECEIVED " + sumRepositories + " VALID RESULTS OUT OF " + repositories.length + ".");

      // getting data from stackoverflow
      var questions = 0;
      // for (i = 0; i < tempArray.length; i++){

      for (i = 0; i < 1; i++){
        var lang = tempArray[i].name;
        console.log("lang is: " + lang);
        questions = requestStackoverflowAPI(lang, time);
        console.log("number of questions is: " + questions);
        tempArray[i].questions = questions;
        // console.log("adddddeeeedddd:");
        console.log(tempArray[i]);
      }

      

      // summing up the number of questions
      var sumQuestions = 0;
      for (i = 0; i < tempArray.length; i++){
        sumQuestions = sumQuestions + tempArray[i].questions;
      }

      // calculating questions_percent
      for (i = 0; i < tempArray.length; i++){
        tempArray[i].questions_percent = Math.round(tempArray[i].questions / sumQuestions * 100);
      }

      // returning data
      console.log("returning tempArray");
      res.json(tempArray);

    }
    else if (error){
      console.error(error);
      res.end();
    }
    else {
      console.error("GETTING DATA FROM GITHUB: FAILED :(");
      // return tempArray;
      res.end();
    }

  });

});

app.get("*", function(req, res){
	res.send('Sorry, there\'s nothing here.');
});

app.listen(3000);
console.log("App is served on localhost:3000");
