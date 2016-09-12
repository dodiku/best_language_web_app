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

// amazon unique Associate ID = bestlanguag0a-20


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
  yesterday.setDate(yesterday.getDate()-1);
  var dd = yesterday.getDate();
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

function getGitHubDataFirstTime(){
  var time = timeForApi();
  var tempArray = [];
  var url = "https://api.github.com/search/repositories?sort=stars&per_page=1000&q=+created:>="+time;

  return new Promise(function(resolve, reject) {

    var options = {
      // url: "http://api.github.com/search/repositories?per_page=1000&sort=stars&q=+created:"+time,
      url: url,
      // url: "https://api.github.com/search/repositories?per_page=1000&sort=stars&q=+created%3A2016-08-10",
      headers: {
        'User-Agent': 'best_language_web_app',
        'Accept': 'application/vnd.github.v3+json',
        }
    };

    Request(options, function (error, response, body) {
      if (!error && response.statusCode == 200) {
        var headers = response.headers;
        // var nextLink = 0;
        var lastPageNumber = 0;

        // geting the total number of pages
        if (headers.link.search('rel="last"') > 0){
          // console.log("there are more pages");
          // nextLink = headers.link.substring(1, headers.link.indexOf('>'));

          lastPageNumber = headers.link;
          var CutFrom = lastPageNumber.indexOf('rel="last"');
          CutFrom = CutFrom - 10;
          var CutTo = lastPageNumber.length;
          lastPageNumber = lastPageNumber.slice(CutFrom,CutTo);
          // console.log(lastPageNumber);

          CutFrom = 4;
          lastPageNumber = lastPageNumber.substring(5, lastPageNumber.indexOf('>'));
          console.log(lastPageNumber);

        }

        if (lastPageNumber > 10) {
          lastPageNumber = 10;
        }

        // return tempArray;
        var gitObj = {
          // array: tempArray,
          number_of_pages: lastPageNumber,
          // number_of_pages: 2,
          // time: time,
          url: url,
        };
        console.log(gitObj);
        resolve(gitObj);

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

// returns an object (ex. array) with github data and number of pages from github api
function getGitHubData(url){
// function getGitHubData(){
  console.log("[1]in github function");
  // var time = timeForApi();
  var tempArray = [];

  return new Promise(function(resolve, reject) {

    var options = {
      // url: "http://api.github.com/search/repositories?per_page=1000&sort=stars&q=+created:"+time,
      url: url,
      // url: "https://api.github.com/search/repositories?per_page=1000&sort=stars&q=+created%3A2016-08-10",
      headers: {
        'User-Agent': 'best_language_web_app'
        }
    };

    Request(options, function (error, response, body) {
      if (!error && response.statusCode == 200) {

        var gitData = JSON.parse(body);
        var repositories = gitData.items;
        var sumRepositories = 0;

        // counting number of new repositories per lnaguage
        for (var i = 0; i < repositories.length; i++){
          var language = repositories[i].language;
          var exists = 0;

          if (language === null){
            // sumRepositories++;
            continue;
          }

          if (language.toLowerCase() === "css" || language.toLowerCase() === "html"){
            sumRepositories++;
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
        // var sumRepositories = 0;
        for (i = 0; i < tempArray.length; i++){
          sumRepositories = sumRepositories + tempArray[i].repos;
        }

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

app.get("/api", function(req, res){
  res.render('api');
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
    // getGitHubData()
    getGitHubDataFirstTime()
    .then(function(obj){
      console.log("this is the the 1st .then:");
      console.log(obj);
      var url = obj.url;
      var pages = obj.number_of_pages;
      var array = [];
      for (var i=0;i<pages;i++){
        array[i] = url + "&page=" + (i+1);
      }
      console.log("array of pages numbers:");
      console.log(array);

      return Promise.all(array.map(function(value){
        return getGitHubData(value);
      }));
    })
    .then(function(array){
      console.log("this is the array on the 2nd .then:");

      var singleArray = array[0];

      console.log("090909090===========BEFORE============");
      console.log(singleArray);


      for (var num=1;num<(array.length);num++){
        var smallArray = array[num];
        for (var i = 0 ; i < smallArray.length ; i++){
          var language = smallArray[i].name;
          var repos = smallArray[i].repos;
          var exists = 0;
          for (var n = 0; n < singleArray.length ; n++){
            if (language == singleArray[n].name){
              singleArray[n].repos = singleArray[n].repos + repos;
              exists = 1;
            }
          }
          if (exists === 0){
            singleArray.push({
              name: language,
              repos: repos,
            });
          }
        }
      }

      // summarizing github repos
      var sumRepositories = 0;
      for (num = 0; num < singleArray.length; num++){
        sumRepositories = sumRepositories + singleArray[num].repos;
      }
      console.log(sumRepositories);

      console.log("090909090===========AFTER SUM REPOS============");
      console.log(singleArray);

      // triming the array according to langNum
      if (singleArray.length > langNum) {
        var trimmedArray = [];
        for (var x=0;x<langNum;x++){
          trimmedArray[x] = singleArray[x];
        }
        singleArray=trimmedArray;
      }

      console.log("090909090===========AFTER TRIM============");
      console.log(singleArray);

      // sorting the array
      singleArray = singleArray.sort(compareForSort);

      console.log("090909090===========AFTER SORT============");
      console.log(singleArray);


      // calculating repos_percent
      for (num = 0; num < singleArray.length; num++){
        singleArray[num].repos_percent = Math.round(singleArray[num].repos / sumRepositories * 100);
      }

      console.log("090909090===========AFTER REPOS_PERCENT============");
      console.log(singleArray);

      return Promise.resolve(singleArray);

    })
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
