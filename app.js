var express = require('express');
var app = express();
var logger = require('morgan');
var Request = require('request');


// *************************
// CONFIGURATIONS
// *************************
app.use(logger('dev'));

app.set("views", __dirname + '/views');
app.engine('.html', require('ejs').__express);
app.set('view engine', 'html');
app.use(express.static( __dirname + '/public' ));

var port = process.env.PORT || 3000;


// *************************
// TEMP DATABASE
// *************************
var dataArray = {
  "update_date":0,
  "data":[],
};

var langNum = 10; // number of languages to handled


var cloudant_USER = 'dodiku';
var cloudant_DB = 'best_programming_lang';
var cloudant_KEY = 'themaytolondisenceirtioc';
var cloudant_PASSWORD = 'ae4e1b81ed72fc3d42f04008c154198d8c6ce315';

var cloudant_URL = "https://" + cloudant_USER + ".cloudant.com/" + cloudant_DB;

// *************************
// FUNCTIONS
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

// return an array with github data
function getGitHubData(){
  console.log("[1]in github function");

  return new Promise(function(resolve, reject) {
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
        var countMax = langNum;
        var countActual = 1;

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

          if(exists === 0 && countActual <= countMax) {
            tempArray.push({
              name: language,
              repos: 1
            });
            countActual = countActual + 1;

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
        console.log("[2]GETTING DATA FROM GITHUB: SUCCEEDED. RECEIVED " + sumRepositories + " VALID RESULTS OUT OF " + repositories.length + ".");

        // return tempArray;
        resolve(tempArray);


      }
      else if (error){
        console.error(error);
        // return tempArray;
        reject(Error(error));
      }
      else {
        console.error("GETTING DATA FROM GITHUB: FAILED");
        // return tempArray;
        reject(Error("GETTING DATA FROM GITHUB: FAILED"));
      }

    });
  });



}

// receives an array of github data, language name, and array index, and adds stack data to this language
function getStackOverflowData(tempArray, lang, i){

  return new Promise(function(resolve, reject) {
    var time = timeForApi();
    var stackURL = "https://api.stackexchange.com/2.2/questions/?filter=total&fromdate="+time+"&site=stackoverflow&tagged="+lang;
    console.log("Stackoverflow URL: " + stackURL);

    Request({url: stackURL, gzip: true}, function (error, response, body) {
      if (!error && response.statusCode == 200) {
        var langStackQuestions = JSON.parse(body);
        var total = langStackQuestions.total;
        tempArray[i].questions = total + 1;
        console.log("GETTING DATA FROM STACKOVERFLOW: SUCCEEDED :) [" + lang + " :"+ total + "]");
        console.log("[3]request return:" + total);
        // return total;
        resolve(tempArray);
      }
      else if (error){
        console.log(error);
        // reject(Error(error));
        tempArray[i].questions = Math.random() * 100 + 1;
        tempArray[i].questions_num_is_random = true;
        resolve(tempArray);
      }
      else {
        console.log("GETTING DATA FROM STACKOVERFLOW: FAILED :( [" + lang + "]");
        // reject(Error("GETTING DATA FROM STACKOVERFLOW: FAILED :( [" + lang + "]"));
        tempArray[i].questions = Math.random() * 100 + 1;
        tempArray[i].questions_num_is_random = true;
        resolve(tempArray);
      }
    });
  });

}

function getQuestionsPercent(array){

  return new Promise(function(resolve, reject) {

    var sumQuestions = 0;
    for ( i = 0; i < array.length; i++){
      if (array[i].questions){
        sumQuestions = sumQuestions + array[i].questions;
      }
    }

    for (i = 0; i < array.length; i++){
      if (array[i].questions){
        array[i].questions_percent = Math.round(array[i].questions / sumQuestions * 100);
      }
    }

    console.log("total questions: " + sumQuestions);
    console.log("[5]added questions percent. example for " + array[3].name + " = " + array[3].questions_percent);
    console.log("printing from getQuestionsPercent: ");
    console.log(array);
    resolve(array);

  });

}

function saveDataToDB(array){
  console.log("this is the array on saveDataToDB:");
  // array = JSON.stringify(array);
  console.log(array);
  Request.post({
    url: cloudant_URL,
    auth: {
      user: cloudant_KEY,
      pass: cloudant_PASSWORD
    },
    json: true,
    body: array,
    headers: {} ,
  },
  function (error, response, body){
    if (response.statusCode == 201){
      console.log("Saved!");
      // res.json(array);
    }
    else{
      console.log("Uh oh...");
      console.log("Error: " + response.statusCode);
      console.log(error);
      // res.send("Something went wrong...");
    }
  });
}


// *************************
// ROUTERS
// *************************
app.get('/', function(req, res){
  res.render('index', {page: 'get all data'});
});

app.get('/circles', function(req, res){
  res.render('index_circles', {page: 'get all data'});
});

app.get('/api/yesterday',function(req, res){

  var time = timeForApi();

  function sendBack(array){
    console.log("[4]sending back data");
    console.log(array);
    dataArray.data = array;
    dataArray.update_date = timeForApi();
    res.json(dataArray);
    saveDataToDB(dataArray);
  }

  if (dataArray.update_date == time){
    console.log("DATA ON THE SERVER IS UP-TO-DATE.");
    res.json(dataArray);
  }
  else {
    getGitHubData()
    .then(function(array){var i = 0; return getStackOverflowData(array, array[i].name, i);})
    .then(function(array){var i = 1; return getStackOverflowData(array, array[i].name, i);})
    .then(function(array){var i = 2; return getStackOverflowData(array, array[i].name, i);})
    .then(function(array){var i = 3; return getStackOverflowData(array, array[i].name, i);})
    .then(function(array){var i = 4; return getStackOverflowData(array, array[i].name, i);})
    .then(function(array){var i = 5; return getStackOverflowData(array, array[i].name, i);})
    .then(function(array){var i = 6; return getStackOverflowData(array, array[i].name, i);})
    .then(function(array){var i = 7; return getStackOverflowData(array, array[i].name, i);})
    .then(function(array){var i = 8; return getStackOverflowData(array, array[i].name, i);})
    .then(function(array){var i = 9; return getStackOverflowData(array, array[i].name, i);})
    .then(function(array){return getQuestionsPercent(array);})
    .then(function(array){sendBack(array);});
  }

});

app.get("/api/all", function(req, res){

	Request.get({
		url: cloudant_URL+"/_all_docs?include_docs=true",
		auth: {
			user: cloudant_KEY,
			pass: cloudant_PASSWORD
		},
		json: true
	},
	function (error, response, body){
		res.json(body);
	});
});

app.get('/:word', function(req, res){
  var language = req.params.word;

  function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
  }

  language = capitalizeFirstLetter(language);

  res.render('lang', {language: language});
});

app.get("*", function(req, res){
	res.send('Ooops.. nothing here.');
});

app.listen(port);
console.log("App is served on localhost: " + port);
