// language

function getData(){
  $.ajax({
    async: false,
    url: '/api/yesterday',
    type: 'GET',
    dataType: 'json',
    error: function(err){
      console.log("Could not get data from the server :(");
      console.log(err);
    },
    success: function(data){
      console.log("Got the data from the server:");
      data = data.data;
      console.log(data);
      // return data;
      getSpecificLangObj(data, language);
    }
  });

}

function getSpecificLangObj(array, lang){
  var langObj = "";
  for (var i=0;i<array.length;i++){
    if (array[i].name == lang){
      langObj = array[i];
    }
  }
  // return langObj;
  getDataFromWikipedia(langObj);
}

function getDataFromWikipedia(langObj){
  var name = langObj.name;
  var wikipedia = "";
  var wiki_url = "";
  var problematicNames = ["c++","go","swift","java","python"];
  var lowerCaseName = name.toLowerCase();

  if (lowerCaseName == "javascript"){
    url = "https://en.wikipedia.org/w/api.php?action=opensearch&format=json&search=javascript";
  }

  else if (lowerCaseName == "c#"){
    url = "https://en.wikipedia.org/w/api.php?action=opensearch&format=json&search=c sharp (programming language)";
  }

  else if (lowerCaseName == "css"){
    url = "https://en.wikipedia.org/w/api.php?action=opensearch&format=json&search=Cascading Style Sheets";
  }

  else if (problematicNames.indexOf(lowerCaseName) > -1) {
    url = "https://en.wikipedia.org/w/api.php?action=opensearch&format=json&search=" + name + "%20(programming%20language)";
  }

  else {
    url = "https://en.wikipedia.org/w/api.php?action=opensearch&format=json&search="+name;
  }

  console.log('Getting data from Wikipedia using the following url:');
  console.log(url);

  $.ajax({
    async: false,
    url: url,
    type: 'GET',
    dataType: 'jsonp',
    error: function(err){
      console.log("Could not get data from Wikipedia :(");
      console.log(err);
    },
    success: function(data){
      console.log("using the following search term(s):");
      console.log(data[1][0]);


      if (data[1][0].includes("C Sharp") === true) {
        wikipedia = data[2][0];
        wiki_url = data[3][0];
      }

      else {
        wikipedia = data[2];
        wikipedia = wikipedia[0];
        wiki_url = data[3];
        wiki_url = wiki_url[0];
      }


      // getting title for activity
      var repoTitle = "";
      var repoTitleColor = "";
      console.log("repos_percent: "+ langObj.repos_percent);
      if (langObj.repos_percent > 10){
        repoTitle = "VERY ACTIVE!";
        repoTitleColor = "highlight_green";
      }
      else {
        repoTitle = "NOT VERY ACTIVE :(";
        repoTitleColor = "highlight_red";
      }
      console.log("repoTitle: " + repoTitle);

      // getting title for community
      var questionsTitle = "";
      var questionsTitleColor = "";
      console.log("questions_percent: "+ langObj.questions_percent);
      if (langObj.questions_percent > 10){
        questionsTitle = "BIG COMMUNITY!";
        questionsTitleColor = "highlight_green";
      }
      else {
        questionsTitle = "SMALL COMMUNITY :(";
        questionsTitleColor = "highlight_red";
      }
      console.log("questionsTitle: " + questionsTitle);

      // creating content for activity
      var repoContent = "Since yesterday, <b>" + langObj.repos_percent + "% of all new repositories</b> on GitHub were written in " + langObj.name+".";

      // creating content for community
      var questionsContent = "Since yesterday, <b>" + langObj.questions_percent + "% of all questions handled</b> on Stackoverflow were related to " + langObj.name+".";


      var a = '<div class="big_language_box">';
      // var b = '<div class="close"><span>CLOSE</span></div>';
      var b = '';
      // var c = '<div class="highlight_header">' + name + '</div></br>';
      var c = '';
      var d = '<div class="highlight_body">';
      var e = '<div class="text"><span class="language_info big_wiki">' + wikipedia + '<br>-- <a href="' + wiki_url + '" class="big_wiki_link" target="_blank">Wikipedia</a></span></div>';
      var f = '<div class="highlight_code_title ' + repoTitleColor + '">' +repoTitle+'</div>';
      var g = '<div class="highlight_code_content">'+repoContent+'</div>';
      var h = '<div class="highlight_community_title ' + questionsTitleColor + '">'+questionsTitle+'</div>';
      var ij = '<div class="highlight_community_content">'+questionsContent+'</div>';
      var k = '<div class="highlight_learn_title">START LEARNING TODAY</div>';
      var l = '<div class="youtube" id="player"></div>';
      var m = '</div>'; // closing highlight_body
      // var no = '</div>'; // closig highlight
      var no = ''; // closig highlight
      // </div>

      cover = a + b + c + d + e + f + g + h + ij + k + l + m + no;

      // EVENT LISTENER TO A CLICK ON THE BACKGROUND OF LANGUAGE_BOX
      $(".container").prepend(cover);
      // addBooks(name);


    }
  });
}

function getBooksFromAmazon(){

}

function addDataToPage(){

}

function addBooks(lang) {
  var query = 'amzn_assoc_default_search_phrase = "' + lang + 'programming";';
  var script = '<script type="text/javascript">amzn_assoc_placement = "adunit0";amzn_assoc_search_bar = "false";amzn_assoc_tracking_id = "bestlanguag0a-20";amzn_assoc_search_bar_position = "top";amzn_assoc_ad_mode = "search";amzn_assoc_ad_type = "smart";amzn_assoc_marketplace = "amazon";amzn_assoc_region = "US";amzn_assoc_title = "Books from Amazon.com";' + query + 'amzn_assoc_default_category = "All";amzn_assoc_linkid = "3580d4690a8e1fb82f5569a299dce4ab";</script><script src="//z-na.amazon-adsystem.com/widgets/onejs?MarketPlace=US"></script>';
  $(".youtube").append(script);
}

// function oldYouTube(){
//   // CALLING YOUTUBE API
//   if (name.toLowerCase() == "c#") {
//     name = "c+sharp";
//   }
//   youTubeUrl = 'https://www.googleapis.com/youtube/v3/search?part=snippet&order=viewCount&q=' + name + '+programming+tutorial&type=video&videoDefinition=high&key=AIzaSyCMD5hNscjNSoDwTZlftWw_BacsKrdOWtQ';
//
//   console.log("YouTube URL: "+youTubeUrl);
//   $.ajax({
//     url: youTubeUrl,
//     type:'GET',
//     dataType:'jsonp',
//     error: function(err){
//       console.log("Could not get video from YouTube :(");
//       console.log(err);
//     },
//     success: function(data){
//       console.log(data);
//       console.log("videoId:");
//       var videoID = data.items[0].id.videoId;
//       console.log(videoID);
//
//       var youTubeFrame = '<iframe width="300" height="170" src="https://www.youtube.com/embed/' + videoID + '"frameborder="0" allowfullscreen></iframe>';
//       $(".youtube").append(youTubeFrame);
//
//     },
//
//   });
//
//   $(".close").click(function(){
//     $(".highlight").remove();
//   });
// }

// =============
// logic begins
// =============
console.log("we're on " + language);
var dataArray = getData();
// var dataObj = getSpecificLangObj(dataArray, language);
