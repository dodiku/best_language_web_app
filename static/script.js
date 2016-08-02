// ********************************************************
// *****  in case where stackoverflow blocks me...    *****
// *****  stackOverFlowSuck = 0 means that api works  *****
// ********************************************************
// var stackOverFlowSuck = 0;
// var stackOverBlock = [];
//
// if (stackOverFlowSuck === 1) {
//     for (i = 0; i < 10; i++){
//       stackOverBlock[i] = Math.random() * 100 + 1;
//
//     }
//     console.log("stackOverBlock activated!");
//     console.log(stackOverBlock);
// }

// THIS FUCTION RETURNS YESTERDAY'S DATE ACCORDING TO GITHUB'S AND STACKOVERFLOW'S API FORMAT
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

// THIS FUNCTION RETURNS AN ARRAY OR OBJECTS. EACH OBJECT INCLUDES LANGUAGE NAME AND % OF NEW REPOSITORIES
function getGitHubData(){

  var counterArray = [];
  console.dir(counterArray);

  // CREATING THE URL FOR THE GITHUB API CALL
  var time = yesterday;
  var url = "https://api.github.com/search/repositories?q=+created:>"+time+"&per_page=1000&sort=stars";
  console.log("GitHub API url: " + url);

  $.ajax({
    async: false,
    url: url,
    type: 'GET',
    dataType: 'json',
    error: function(err){
      console.log("Could not get data from GitHub :(");
      console.log(err);
    },
    success: function(data){

      var repositories = data.items;
      console.log("We got some data... :)");
      console.dir(data);

      // COUNTING NUMBER OF NEW GITHUB REPOSITORIES PER LANGUAGE
      for (var i = 0; i < repositories.length; i++){

        var language = repositories[i].language;
        var exists = 0;

        if (language === null){
          continue;
        }

        for (var n = 0; n < counterArray.length; n++) {
          if (counterArray[n].name == language) {
            counterArray[n].repos++;
            exists = 1;
            break;
          }
        }

        if(exists === 0) {
          counterArray.push({
            name: language,
            repos: 1
          });
        }

        if (counterArray.length == 10) {
          break;
        }
      }


      // SORTING COUNTERARRAY ACCORDING TO NUMBER OF NEW REPOSITORIES
      function compareForSort(a,b){
        if (a.repos == b.repos)
          return 0;
        if (a.repos > b.repos)
          return -1;
        else
          return 1;
      }

      counterArray = counterArray.sort(compareForSort);


      // ADDING PERCENT PROPERTY TO EACH LANGUAGE OBJECT ON THE ARRAY
      var sumRepositories = 0;
      for (i = 0; i < counterArray.length; i++){
        sumRepositories = sumRepositories + counterArray[i].repos;
      }

      for (i = 0; i < counterArray.length; i++){
        counterArray[i].repos_percent = Math.round(counterArray[i].repos / sumRepositories * 100);
      }
      // console.log(counterArray);
    },
  });
  console.log("Here's the data from GitHub:");
  console.dir(counterArray);
  return counterArray;
}

// THIS FUCNTION RETURNS THE NUMBER OF NEW QUESTIONS ON STACKOVERFLOW FOR A SINGLE LANGUAGE
function getNumberOfQuestions(lang) {

  var questions = 0;

  // CREATING THE URL FOR THE GITHUB API CALL
  var time = yesterday;
  var url = "https://api.stackexchange.com/2.2/questions/?filter=total&fromdate="+time+"&site=stackoverflow&tagged="+lang;
  console.log("StackOverflow API url: " + url);

  $.ajax({
    async: false,
    url: url,
    type: 'GET',
    dataType: 'json',
    error: function(err){
      console.log("Could not get data from Stackoverflow :(");
      console.log(err);
      questions = Math.random() * 100 + 1;
      console.log("*** Generating random number for " + lang + ": " + questions + " ***");
    },
    success: function(data){
      // console.log("console.log: " + data.total);
      questions = data.total;
    }
  });

  return questions;


}

// THIS FUNCTION RECEIVES AN ARRAY OF OBJECTS AND RETURNS THE ARRAY WITH EXTRA PROPERTIES BASES ON STACKOVERFLOW'S DATA
function getStackOverflowData(array) {


  for (var i = 0; i < array.length; i++){
    // if (stackOverFlowSuck === 0) {
    //   array[i].questions = getNumberOfQuestions(array[i].name);
    // }
    // else {
    //   array[i].questions = stackOverBlock[i];
    // }
    array[i].questions = getNumberOfQuestions(array[i].name);

  }
  var sumQuestions = 0;
  for ( i = 0; i < array.length; i++){
    sumQuestions = sumQuestions + array[i].questions;
  }

  // console.log(sumQuestions);

  for (i = 0; i < array.length; i++){
    array[i].questions_percent = Math.round(array[i].questions / sumQuestions * 100);
  }
  // console.log(array);

  return array;

}

// THIS FUNCTION GETS AN ARRAY FULL OF DATA AND APPENDS LANGUAGE BOXES (DIV) THAT CONTAINS THE DATA
function addDataToPage(array){

  for (var i = 0; i < array.length; i++){
    var languageBox = "<div class="+"language_box"+">";
    languageBox = languageBox + '<span class="language_name">'+array[i].name+'</span></br>';
    languageBox = languageBox + '<span class="percent">'+array[i].repos_percent+'%</span></br>';
    languageBox = languageBox + '<span class="language_info">of new repositories on GitHub</span></br>';
    languageBox = languageBox + '<span class="percent">'+array[i].questions_percent+'%</span></br>';
    languageBox = languageBox + '<span class="language_info">of new questions on Stackoverflow</span></br>';
    $("#container").append(languageBox);
  }

}

// THIS FUCTION GETS AN ARRAY OF DATA AND ADDS A GRAPHICAL REPORESENTATION OF THE DATA TO THE PAGE
function drawData (dataArray){

  // cleaning the container
  $("#container").html("");

    // creating scales
    // getting repos values
    var maxReposPercent = dataArray[0].repos_percent;
    console.log("maxReposPercent: "+maxReposPercent);
    var minReposPercent = dataArray[dataArray.length-1].repos_percent;
    console.log("minReposPercent: "+minReposPercent);

    // getting questions values
    var maxQuestionsPercent = 0;
    var minQuestionsPercent = 100;

    for (var i = 0; i < dataArray.length; i++) {
      if (dataArray[i].questions_percent > maxQuestionsPercent){
        maxQuestionsPercent = dataArray[i].questions_percent;
      }
      else if (dataArray[i].questions_percent < minQuestionsPercent) {
        minQuestionsPercent = dataArray[i].questions_percent;
      }
    }
    console.log("maxQuestionsPercent: "+maxQuestionsPercent);
    console.log("minQuestionsPercent: "+minQuestionsPercent);

    // creating scale for the circle radiuses
    var rScale = d3.scaleSqrt()
                    .domain([minReposPercent, maxReposPercent])
                    .range([60, 200]);

    // creating scale for the border size
    var bScale = d3.scaleSqrt()
                    .domain([minQuestionsPercent, maxQuestionsPercent])
                    .range([minQuestionsPercent, 120]);


    // var xScale = d3.scaleLinear()
    //                 .domain([minQuestionsPercent, maxQuestionsPercent])
    //                 .range([0, width]);
    //
    //
    // var yScale = d3.scaleLinear()
    //                 .domain([maxReposPercent, minReposPercent])
    //                 .range([0, height]);

    // var colorScale = d3.scaleLinear()
    // .domain([0, 30])
    // .range(["#279AF1", "#F24236"]);

    // creating array of objects for the circles inner and outer colors

    var circleYPosition = 0;
    var textYPosition = 0;
    var qLinePosition1 = 0;
    var qLinePosition2 = 0;
    var rLinePosition1 = 0;
    var rLinePosition2 = 0;
    var repoTextPosition = 0;
    var questionTextPosition = 0;
    var previousColor = "";

    var colorArray = [
      {"inner": "#0091ff", "outer": "#94cdf9"},
      {"inner": "#00FF5E", "outer": "#7DF8CC"},
      {"inner": "#EB50FF", "outer": "#E4B9FF"},
      {"inner": "#FF5300", "outer": "#FFCBB2"},
      {"inner": "#FEDB00", "outer": "#F5F749"},
      {"inner": "#AFAFAF", "outer": "#DEDEDE"},
      {"inner": "#FF0000", "outer": "#FF7C7C"},
      {"inner": "#A800FE", "outer": "#D78AFF"},
      {"inner": "#52BF6B", "outer": "#A4FDB8"},
      {"inner": "#00FEDB", "outer": "#8AFBFF"},
      ];


    // var colorArray = [
    // "rgb(39, 154, 241)",
    // "#80FFE8",
    // "#97D2FB",
    // "#7DD181",
    // "#F24236",
    // "#EF7B45",
    // "#F5F749",
    // "#B084CC",
    // "#5A0B4D",
    // "#FF5D73"
    // ];


    // console.log("testing x scale with value '20'. result: "+xScale(20));
    // console.log("testing y scale with value '20'. result: "+ yScale(20));
    // console.log("testing color with value '20'. result: "+ colorScale(20));

    // var xAxis = d3.svg.axis()
    //               .scale(xScale)
    //               .orient("bottom");


    // svg dimensions
    var width = 1000;
    // calculating height
    var height = 0;
    for (i=0; i < 10; i++){
      height = height + rScale(dataArray[i].repos_percent) * 2 + bScale(dataArray[i].questions_percent) * 2 + bScale(dataArray[i].questions_percent) * 2 + 30;
    }
    // var height = 3000;


    // creating the svg 'area'
    var svg = d3.select("#container")
                .append("svg")
                .attr("width", width)
                .attr("height", height)
                ;



    // creating circles
    console.log("this is the dataArray: ");
    console.log(dataArray);
    svg.selectAll("circle")
                     .data(dataArray)
                     .enter()
                     .append("circle")
                     .attr("class", "circle")
                     .style("fill", function(d, i){
                       color = colorArray[i].inner;
                       return color;
                     })
                     .attr("r", function(d){
                       var radius = rScale(d.repos_percent);
                       var border = bScale(d.questions_percent);
                       radius = radius + border;
                       return radius;
                     })
                     .style("opacity", 0.5)
                     .attr("stroke", function(d, i){
                       color = colorArray[i].outer;
                       return color;
                     })
                     .attr("stroke-width", function(d){
                       var border = bScale(d.questions_percent);
                       return border;
                     })
                    //  .style("stroke-opacity", 0.5)
                     .attr("cx", function(d, i) {
                      //  console.log("x questions_percent for "+d.name+" :"+d.questions_percent);
                      //  var x = 0;
                      //  if (stackOverFlowSuck === 0) {
                      //    x = d.questions_percent;
                      //  }
                      //  else {
                      //    x = stackOverBlock[i];
                      //  }
                      //  x = xScale(x);
                      // console.log("x scale for "+d.name+" :"+x);
                      // return x;
                      return width/2;
                     })
                     .attr("cy", function(d) {
                      //  console.log("y repos_percent for "+d.name+" :"+d.repos_percent);
                      //  var y = d.repos_percent;
                      //  y = yScale(y);
                      //  console.log("y scale for "+d.name+" :"+y);
                      //  return y;
                      var border = bScale(d.questions_percent);
                      var radius = rScale(d.repos_percent);
                      radius = radius + border;
                      // var bigRadius = radius + border ;
                      // var bigDiameter = bigRadius * 2 ;

                      var circleCenter = circleYPosition + radius + border + 30 ;
                      circleYPosition = circleYPosition + radius + border + 30 + radius + border ;

                      return circleCenter;
                     })
                     .on("mouseover", function(){
                       d3.select(this).style("cursor", "pointer");
                      //  svg.selectAll("text.click")
                      //                  .data([])
                      //                  .enter()
                      //                  .append("text")
                      //                  .attr("class", "click")
                      //                  .text("Click for more info")
                      //                  .attr("x", function() {
                      //                    var x = $(this).attr("cx");
                      //                    return x;
                      //                  })
                      //                  .attr("y", function() {
                      //                    var y = $(this).attr("cy") + 40;
                      //                    return y;
                      //                  });
                                     })
                     .on("mouseout", function(){
                      //  d3.select(this).style("fill", previousColor);
                              })
                      .on("click", function(d, i){
                        // .on("click", function(d){d3.select("text").text(d.label);})
                        // console.log(d3.select("text").text());
                        // console.log(d);
                        // var text = d3.select(this).text();
                        // console.log("text: " + text);
                        // console.log("this.text: " + $(this).text());
                        // console.log("de this.text: " + d3.select(this).text());
                        // console.log("this: " + $(this));
                        // console.log("d3 this: " + d3.select(this));
                        console.log(d.name);
                        console.log("got a click on: " + d.name);
                        var name = d.name;

                        var wikipedia = "";
                        var wiki_url = "";
                        var problematicNames = ["c++","go","swift","java","python","scala","ruby","haskell","erlang","elm","perl","bash","r"];
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

                            // else if (data[1][1].includes("programming") === true) {
                            //   wikipedia = data[2];
                            //   wikipedia = wikipedia[1];
                            //   wiki_url = data[3];
                            //   wiki_url = wiki_url[1];
                            // }

                            else {
                              wikipedia = data[2];
                              wikipedia = wikipedia[0];
                              wiki_url = data[3];
                              wiki_url = wiki_url[0];
                            }


                            // getting title for activity
                            var repoTitle = "";
                            var repoTitleColor = "";
                            console.log("i: " + i);
                            console.log("repos_percent: "+ dataArray[i].repos_percent);
                            if (dataArray[i].repos_percent > 10){
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
                            console.log("i: " + i);
                            console.log("questions_percent: "+ dataArray[i].questions_percent);
                            if (dataArray[i].questions_percent > 10){
                              questionsTitle = "BIG COMMUNITY!";
                              questionsTitleColor = "highlight_green";
                            }
                            else {
                              questionsTitle = "SMALL COMMUNITY :(";
                              questionsTitleColor = "highlight_red";
                            }
                            console.log("questionsTitle: " + questionsTitle);

                            // creating content for activity
                            var repoContent = "Since yesterday, <b>" + dataArray[i].repos_percent + "% of all new repositories</b> on GitHub were written in " + dataArray[i].name+".";

                            // creating content for community
                            var questionsContent = "Since yesterday, <b>" + dataArray[i].questions_percent + "% of all questions handled</b> on Stackoverflow were related to " + dataArray[i].name+".";


                            var a = '<div class="highlight"><div class="big_language_box">';
                            var b = '<div class="close"><span>CLOSE</span></div>';
                            var c = '<div class="highlight_header">' + name + '</div></br>';
                            var d = '<div class="highlight_body">';
                            var e = '<div class="text"><span class="language_info big_wiki">' + wikipedia + '<br>-- <a href="' + wiki_url + '" class="big_wiki_link" target="_blank">Wikipedia</a></span></div>';
                            var f = '<div class="highlight_code_title ' + repoTitleColor + '">' +repoTitle+'</div>';
                            var g = '<div class="highlight_code_content">'+repoContent+'</div>';
                            var h = '<div class="highlight_community_title ' + questionsTitleColor + '">'+questionsTitle+'</div>';
                            var ij = '<div class="highlight_community_content">'+questionsContent+'</div>';
                            var k = '<div class="highlight_learn_title">START LEARNING TODAY</div>';
                            var l = '<div class="youtube" id="player"></div>';
                            var m = '</div>'; // closing highlight_body
                            var no = '</div>'; // closig highlight
                            // </div>

                            cover = a + b + c + d + e + f + g + h + ij + k + l + m + no;

                            // EVENT LISTENER TO A CLICK ON THE BACKGROUND OF LANGUAGE_BOX
                            $("body").prepend(cover);

                            // CALLING YOUTUBE API
                            if (name.toLowerCase() == "c#") {
                              name = "c+sharp";
                            }
                            youTubeUrl = 'https://www.googleapis.com/youtube/v3/search?part=snippet&order=viewCount&q=' + name + '+programming+tutorial&type=video&videoDefinition=high&key=AIzaSyCMD5hNscjNSoDwTZlftWw_BacsKrdOWtQ';

                            console.log("YouTube URL: "+youTubeUrl);
                            $.ajax({
                              url: youTubeUrl,
                              type:'GET',
                              dataType:'jsonp',
                              error: function(err){
                                console.log("Could not get video from YouTube :(");
                                console.log(err);
                              },
                              success: function(data){
                                console.log(data);
                                console.log("videoId:");
                                var videoID = data.items[0].id.videoId;
                                console.log(videoID);

                                var youTubeFrame = '<iframe width="300" height="170" src="https://www.youtube.com/embed/' + videoID + '"frameborder="0" allowfullscreen></iframe>';
                                $(".youtube").append(youTubeFrame);

                              },

                            });

                            $(".close").click(function(){
                              $(".highlight").remove();
                            });


                          }
                        });


                      })

                    ;

    // adding texts
    svg.selectAll("text")
                    .data(dataArray)
                    .enter()
                    .append("text")
                    .text(function(d) {
                      var name = d.name;
                      var q = d.questions_percent;
                      var r = d.repos_percent;
                      // var label = d.name +" // " + (r+q)/2 + " (" + r + "%" + " + " + q + "%" + ")";
                      var label = d.name;
                      return label;
                    })
                    .attr("x", function(d, i) {
                    //   x = 0;
                    //   if (stackOverFlowSuck === 0) {
                    //     x = d.questions_percent;
                    //   }
                    //   else {
                    //     x = stackOverBlock[i];
                    //   }
                    //   x = xScale(x);
                     //
                    //  console.log("x text label position (scaled) for "+d.name+" :"+x);
                    //  return x;
                    return width/2;
                    })
                    .attr("y", function(d) {
                      // var y = d.repos_percent;
                      // y = yScale(y);
                      // console.log("y text label position (scaled) for "+d.name+" :"+y);
                      // return y;
                      var radius = rScale(d.repos_percent);
                      var border = bScale(d.questions_percent);
                      radius = radius + border;

                      var textCenter = radius + border + textYPosition + 30;

                      textYPosition = textCenter + radius + border;
                      return textCenter;
                    })
                    .on("mouseover", function(){
                      // d3.select(this).attr("fill", "blue");
                      d3.select(this).style("cursor", "pointer");
                    })
                    .on("mouseout", function(){
                      // d3.select(this).attr("fill", "yellow");
                    })
                    .on("click", function(d, i){
                      // .on("click", function(d){d3.select("text").text(d.label);})
                      // console.log(d3.select("text").text());
                      // console.log(d);
                      // var text = d3.select(this).text();
                      // console.log("text: " + text);
                      // console.log("this.text: " + $(this).text());
                      // console.log("de this.text: " + d3.select(this).text());
                      // console.log("this: " + $(this));
                      // console.log("d3 this: " + d3.select(this));
                      console.log(d.name);
                      console.log("got a click on: " + d.name);
                      var name = d.name;

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

                          // else if (data[1][1].includes("programming") === true) {
                          //   wikipedia = data[2];
                          //   wikipedia = wikipedia[1];
                          //   wiki_url = data[3];
                          //   wiki_url = wiki_url[1];
                          // }

                          else {
                            wikipedia = data[2];
                            wikipedia = wikipedia[0];
                            wiki_url = data[3];
                            wiki_url = wiki_url[0];
                          }


                          // getting title for activity
                          var repoTitle = "";
                          var repoTitleColor = "";
                          console.log("i: " + i);
                          console.log("repos_percent: "+ dataArray[i].repos_percent);
                          if (dataArray[i].repos_percent > 10){
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
                          console.log("i: " + i);
                          console.log("questions_percent: "+ dataArray[i].questions_percent);
                          if (dataArray[i].questions_percent > 10){
                            questionsTitle = "BIG COMMUNITY!";
                            questionsTitleColor = "highlight_green";
                          }
                          else {
                            questionsTitle = "SMALL COMMUNITY :(";
                            questionsTitleColor = "highlight_red";
                          }
                          console.log("questionsTitle: " + questionsTitle);

                          // creating content for activity
                          var repoContent = "Since yesterday, <b>" + dataArray[i].repos_percent + "% of all new repositories</b> on GitHub were written in " + dataArray[i].name+".";

                          // creating content for community
                          var questionsContent = "Since yesterday, <b>" + dataArray[i].questions_percent + "% of all questions handled</b> on Stackoverflow were related to " + dataArray[i].name+".";


                          var a = '<div class="highlight"><div class="big_language_box">';
                          var b = '<div class="close"><span>CLOSE</span></div>';
                          var c = '<div class="highlight_header">' + name + '</div></br>';
                          var d = '<div class="highlight_body">';
                          var e = '<div class="text"><span class="language_info big_wiki">' + wikipedia + '<br>-- <a href="' + wiki_url + '" class="big_wiki_link" target="_blank">Wikipedia</a></span></div>';
                          var f = '<div class="highlight_code_title ' + repoTitleColor + '">' +repoTitle+'</div>';
                          var g = '<div class="highlight_code_content">'+repoContent+'</div>';
                          var h = '<div class="highlight_community_title ' + questionsTitleColor + '">'+questionsTitle+'</div>';
                          var ij = '<div class="highlight_community_content">'+questionsContent+'</div>';
                          var k = '<div class="highlight_learn_title">START LEARNING TODAY</div>';
                          var l = '<div class="youtube" id="player"></div>';
                          var m = '</div>'; // closing highlight_body
                          var no = '</div>'; // closig highlight
                          // </div>

                          cover = a + b + c + d + e + f + g + h + ij + k + l + m + no;

                          // EVENT LISTENER TO A CLICK ON THE BACKGROUND OF LANGUAGE_BOX
                          $("body").prepend(cover);

                          // CALLING YOUTUBE API
                          if (name.toLowerCase() == "c#") {
                            name = "c+sharp";
                          }
                          youTubeUrl = 'https://www.googleapis.com/youtube/v3/search?part=snippet&order=viewCount&q=' + name + '+programming+tutorial&type=video&videoDefinition=high&key=AIzaSyCMD5hNscjNSoDwTZlftWw_BacsKrdOWtQ';

                          console.log("YouTube URL: "+youTubeUrl);
                          $.ajax({
                            url: youTubeUrl,
                            type:'GET',
                            dataType:'jsonp',
                            error: function(err){
                              console.log("Could not get video from YouTube :(");
                              console.log(err);
                            },
                            success: function(data){
                              console.log(data);
                              console.log("videoId:");
                              var videoID = data.items[0].id.videoId;
                              console.log(videoID);

                              var youTubeFrame = '<iframe width="300" height="170" src="https://www.youtube.com/embed/' + videoID + '"frameborder="0" allowfullscreen></iframe>';
                              $(".youtube").append(youTubeFrame);

                            },

                          });

                          $(".close").click(function(){
                            $(".highlight").remove();
                          });


                        }
                      });


                    })
                    .style("text-anchor", "middle")
                    // .attr("fill", "red")
                    ;

  //draw lines
   svg.selectAll("line.repos")
                     .data(dataArray)
                     .enter()
                    .append("line")
                    .attr("class", "repos")
                    .attr("x1", function(d) {
                    return width/2;
                    })
                    .attr("y1", function(d){
                      var border = bScale(d.questions_percent);
                      var radius = rScale(d.repos_percent);
                      radius = radius + border;

                      var circleCenter = qLinePosition1 + radius + border + 30 ;
                      qLinePosition1 = qLinePosition1 + radius + border + 30 + radius + border ;

                      return circleCenter - 40 ;
                    })
                    .attr("x2", function(d) {
                    return width/2 + 400;
                    })
                    .attr("y2", function(d){
                      var border = bScale(d.questions_percent);
                      var radius = rScale(d.repos_percent);
                      radius = radius + border;

                      var circleCenter = qLinePosition2 + radius + border + 30 ;
                      qLinePosition2 = qLinePosition2 + radius + border + 30 + radius + border ;

                      return circleCenter - 40 ;
                    })
                    .attr("stroke-width", 2)
                    .attr("stroke", "#444")
                    .style("stroke-opacity", 0.1)
                    ;

    svg.selectAll("line.questions")
                      .data(dataArray)
                      .enter()
                     .append("line")
                     .attr("class", "questions")
                     .attr("x1", function(d) {
                     return width/2;
                     })
                     .attr("y1", function(d){
                       var border = bScale(d.questions_percent);
                       var radius = rScale(d.repos_percent);
                       radius = radius + border;

                       var circleCenter = rLinePosition1 + radius + border + 30 ;
                       rLinePosition1 = rLinePosition1 + radius + border + 30 + radius + border ;

                       return circleCenter - radius ;
                     })
                     .attr("x2", function(d) {
                     return width/2 + 400;
                     })
                     .attr("y2", function(d){
                       var border = bScale(d.questions_percent);
                       var radius = rScale(d.repos_percent);
                       radius = radius + border;

                       var circleCenter = rLinePosition2 + radius + border + 30 ;
                       rLinePosition2 = rLinePosition2 + radius + border + 30 + radius + border ;

                       return circleCenter - radius ;
                     })
                     .attr("stroke-width", 2)
                     .attr("stroke", "#444")
                     .style("stroke-opacity", 0.1)
                     ;

      svg.selectAll("text.repos")
                      .data(dataArray)
                      .enter()
                      .append("text")
                      .attr("class", "repos")
                      .text(function(d, i){
                        var percent = d.repos_percent;
                        var text = "";
                        if (i < 2){
                          var name = d.name;
                          text = percent + "% of yesterday's code was written in "+d.name;
                        }
                        else {
                          text = percent + "% of yesterday's code";
                        }
                        return text;
                      })
                      // .attr("x", width/2+400)
                      .attr("x", 900)
                      .attr("y", function(d){
                        var border = bScale(d.questions_percent);
                        var radius = rScale(d.repos_percent);
                        radius = radius + border;

                        var circleCenter = repoTextPosition + radius + border + 30 ;
                        repoTextPosition = repoTextPosition + radius + border + 30 + radius + border ;

                        return circleCenter - 48 ;
                      })
                      .style("text-anchor", "end")
                      .style("opacity", 0.4)
                      // .attr("fill", "red")
                      // .style("transform", "rotate(90deg)")
                      ;

      svg.selectAll("text.questions")
                      .data(dataArray)
                      .enter()
                      .append("text")
                      .attr("class", "questions")
                      .text(function(d, i){
                        var text = "";
                        var percent = d.questions_percent;
                        if (i < 2) {
                            var name = d.name;
                            text = percent + "% of the support given yesterday dealt with "+d.name;
                        }
                        else {
                            text = percent + "% of yesterday's support";
                        }
                        return text;
                      })
                      // .attr("x", width/2+400)
                      .attr("x", 900)
                      .attr("y", function(d){
                        var border = bScale(d.questions_percent);
                        var radius = rScale(d.repos_percent);
                        radius = radius + border;

                        var circleCenter = questionTextPosition + radius + border + 30 ;
                        questionTextPosition = questionTextPosition + radius + border + 30 + radius + border ;

                        return circleCenter - radius - 10 ;
                      })
                      .style("text-anchor", "end")
                      .style("opacity", 0.4)
                      // .attr("fill", "red")
                      // .style("transform", "rotate(90deg)")
                      ;

} //end of drawData



////////////////////////////////////////////
//            APP LOGIC START             //
////////////////////////////////////////////

var yesterday = timeForApi();
var allData = [];
allData = getGitHubData();
allData = getStackOverflowData(allData);
console.log("this is the data to be appended:");
console.dir(allData);
drawData(allData);
// addDataToPage(allData);


// svg.append("g")
//     .call(xAxis);


////////////////////////////////////////////
//            APP LOGIC END               //
////////////////////////////////////////////

//
// // EVENT LISTENER TO A CLICK ON LANGUAGE_BOX
// $(".circle").click(function(){
//   console.log(this);
//   console.log("got a click on: " + $(this).text());
//   var name = $(this).children('.language_name').text();
//
//   var wikipedia = "";
//   var wiki_url = "";
//   var problematicNames = ["c++","go","swift","java"];
//   var lowerCaseName = name.toLowerCase();
//
//   if (lowerCaseName == "javascript"){
//     url = "https://en.wikipedia.org/w/api.php?action=opensearch&format=json&search=javascript";
//   }
//
//   else if (lowerCaseName == "c#"){
//     url = "https://en.wikipedia.org/w/api.php?action=opensearch&format=json&search=c sharp (programming language)";
//   }
//
//   else if (problematicNames.indexOf(lowerCaseName) > -1) {
//     url = "https://en.wikipedia.org/w/api.php?action=opensearch&format=json&search=" + name + "%20(programming%20language)";
//   }
//
//   else {
//     url = "https://en.wikipedia.org/w/api.php?action=opensearch&format=json&search="+name;
//   }
//
//   console.log('Getting data from Wikipedia using the following url:');
//   console.log(url);
//
//   $.ajax({
//     async: false,
//     url: url,
//     type: 'GET',
//     dataType: 'jsonp',
//     error: function(err){
//       console.log("Could not get data from Wikipedia :(");
//       console.log(err);
//     },
//     success: function(data){
//       console.log("using the following search term(s):");
//       console.log(data[1][0]);
//
//
//       if (data[1][0].includes("C Sharp") === true) {
//         wikipedia = data[2][0];
//         wiki_url = data[3][0];
//       }
//
//       else if (data[1][1].includes("programming") === true) {
//         wikipedia = data[2];
//         wikipedia = wikipedia[1];
//         wiki_url = data[3];
//         wiki_url = wiki_url[1];
//       }
//
//       else {
//         wikipedia = data[2];
//         wikipedia = wikipedia[0];
//         wiki_url = data[3];
//         wiki_url = wiki_url[0];
//       }
//
//       var a = '<div class="highlight"><div class="big_language_box">';
//       var b = '<div class="highlight_header"><span class="percent big_title">' + name + '</span></br>';
//       var c = '<span class="close">X</span></div>';
//       var d = '<div class="highlight_body"><div class="text"><span class="language_info big_wiki">' + wikipedia + '</br><br>-- <a href="' + wiki_url + '" class="big_wiki_link" target="_blank">Wikipedia</a></div></span><div class="youtube" id="player"></div></div></div></div>';
//
//       cover = a + b + c + d;
//
//       // EVENT LISTENER TO A CLICK ON THE BACKGROUND OF LANGUAGE_BOX
//       $("body").prepend(cover);
//
//       // CALLING YOUTUBE API
//       if (name.toLowerCase() == "c#") {
//         name = "c+sharp";
//       }
//       youTubeUrl = 'https://www.googleapis.com/youtube/v3/search?part=snippet&order=viewCount&q=' + name + '+programming+tutorial&type=video&videoDefinition=high&key=AIzaSyCMD5hNscjNSoDwTZlftWw_BacsKrdOWtQ';
//
//       console.log("YouTube URL: "+youTubeUrl);
//       $.ajax({
//         url: youTubeUrl,
//         type:'GET',
//         dataType:'jsonp',
//         error: function(err){
//           console.log("Could not get video from YouTube :(");
//           console.log(err);
//         },
//         success: function(data){
//           console.log(data);
//           console.log("videoId:");
//           var videoID = data.items[0].id.videoId;
//           console.log(videoID);
//
//           var youTubeFrame = '<iframe width="300" height="170" src="https://www.youtube.com/embed/' + videoID + '"frameborder="0" allowfullscreen></iframe>';
//           $(".youtube").append(youTubeFrame);
//
//         },
//
//       });
//
//       $(".close").click(function(){
//         $(".highlight").remove();
//       });
//
//
//     }
//   });
//
//
//
// });
