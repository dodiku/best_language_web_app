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
      // drawData(data);
      addDataToPage(data);
    }
  });

}

// THIS FUNCTION GETS AN ARRAY FULL OF DATA AND APPENDS LANGUAGE BOXES (DIV) THAT CONTAINS THE DATA
function addDataToPage(array){

  // cleaning the container
  $("#container").html("");

  // creating scales
  // getting repos values

  var hottest = 0;
  var hotLang = "";
  var coldest = 10000;
  var colLang = "";

  for (var i = 0 ; i < array.length ; i++){
    if (hottest < (array[i].repos_percent) * (array[i].questions_percent)){
      hottest = (array[i].repos_percent * array[i].questions_percent);
      hotLang = array[i].name;
    }
    else if (coldest > (array[i].repos_percent * array[i].questions_percent)) {
      coldest = (array[i].repos_percent * array[i].questions_percent);
      colLang = array[i].name;
    }
  }

  console.log("hottest is - " + hotLang + " - " + hottest);
  console.log("coldest is - " + colLang + " - " + coldest);

  var colorScale = d3.scaleLinear()
                  .domain([coldest, hottest])
                  // .range(["rgba(199,227,249,0.5)", "rgba(255,0,0,0.5)"]);
                  // .range(["#ffffff","#28C2FF"]);
                  // .range(["#ffffff","#5ED1FF"]);
                  // .range(["#ffffff","#FFF07C"]);
                  .range(["#ffffff","#FCFFAC"]);

  var emojiScale = d3.scaleLinear()
                  .domain([coldest, hottest])
                  // .range(["rgba(199,227,249,0.5)", "rgba(255,0,0,0.5)"]);
                  // .range(["#ffffff","#28C2FF"]);
                  // .range(["#ffffff","#5ED1FF"]);
                  .range([0,3]);



                  // .range(["white","gray","black"]);
// </i>

  for (i = 0; i < array.length; i++){

    if (array[i].repos_percent === 0){
      continue;
    }

    var emojis = emojiScale((array[i].repos_percent * array[i].questions_percent));
    emojis = Math.round(emojis);
    console.log("number of emojis: " + emojis);

    var emojToAppend = " ";

    if (emojis === 0) {
      emojToAppend = '<div style="width:14px;height:14px;display:inline-block"></div>';
    }

    for (var n=0;n<emojis;n++){
        emojToAppend = emojToAppend + '<i class="em em-fire"></i>';
    }
    console.log("emojis to append: " + emojToAppend);

    var backColor = colorScale((array[i].repos_percent * array[i].questions_percent));
    // var languageBox = "<a style='color:#222;display:inline-block;' href='/" + array[i].name + "'><div style='background-color:'"+backColor+";'class="+"language_box"+">";
    // var languageBox = "<div class="+"language_box"+">";
    var languageBox = '<a class="a_box" style="color:#222;display:inline-block;" href="/' + array[i].name + '"><div style="background-color:'  + backColor + ';" class=language_box>';
    languageBox = languageBox + '<span class="language_name">'+array[i].name+'</span></br>';
    languageBox = languageBox + '<span class="percent">'+array[i].repos_percent+'%</span></br>';
    languageBox = languageBox + '<span class="language_info">of new repositories on GitHub</span></br>';
    languageBox = languageBox + '<span class="percent">'+array[i].questions_percent+'%</span></br>';
    languageBox = languageBox + '<span class="language_info">of new questions on StackOverflow</span></br>';
    languageBox = languageBox + emojToAppend + '</div></a>';
    $("#container").append(languageBox);
  }

}

// THIS FUCTION RECEIVES AN ARRAY OF DATA AND ADDS A GRAPHICAL REPORESENTATION OF THE DATA TO THE PAGE
function drawData (dataArray){

  console.log("printing from drawData:");
  console.log(dataArray);

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

                      //  if (i % 2 === 0){
                      //    var border = bScale(d.questions_percent);
                      //    return border;
                      //  }
                      //  else{
                      //    return 0;
                      //  }

                     })
                     .attr("cx", function(d, i) {
                      return width/2;
                     })
                     .attr("cy", function(d, i) {
                      var border = bScale(d.questions_percent);
                      var radius = rScale(d.repos_percent);
                      radius = radius + border;

                      var circleCenter = circleYPosition + radius + border + 30 ;
                      circleYPosition = circleYPosition + radius + border + 30 + radius + border ;

                      return circleCenter;
                     })
                     .on("mouseover", function(){
                       d3.select(this).style("cursor", "pointer");
                                     })
                     .on("mouseout", function(){
                      //  d3.select(this).style("fill", previousColor);
                              })
                      .on("click", function(d, i){
                        console.log(d.name);
                        console.log("got a click on: " + d.name);
                        var name = d.name;

                        var wikipedia = "";
                        var wiki_url = "";
                        var problematicNames = ["c++","go","swift","java","python","scala","ruby","haskell","erlang","elm","perl","bash","r","c"];
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
                          url = "https://en.wikipedia.org/w/api.php?action=opensearch&format=json&search=" + name + "_(programming_language)";
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
                                for (var i=0;i<3;i++){
                                  console.log("videoId:");
                                  var videoID = data.items[i].id.videoId;
                                  console.log(videoID);
                                  var youTubeFrame = '<iframe style="margin-right:10px;" width="300" height="170" src="https://www.youtube.com/embed/' + videoID + '"frameborder="0" allowfullscreen></iframe>';
                                  $(".youtube").append(youTubeFrame);
                                }

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
                    return width/2;
                    })
                    .attr("y", function(d) {
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
                      console.log(d.name);
                      console.log("got a click on: " + d.name);
                      var name = d.name;

                      var wikipedia = "";
                      var wiki_url = "";
                      var problematicNames = ["c++","go","swift","java","python","scala","ruby","haskell","erlang","elm","perl","bash","r","c"];
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
                      ;

} //end of drawData



////////////////////////////////////////////
//            APP LOGIC START             //
////////////////////////////////////////////

// var allData = [];
// allData = getGitHubData();
// allData = getStackOverflowData(allData);
// allData = getData();
// console.log("this is the data to be appended:");
// console.log(allData);
// drawData(allData);
// addDataToPage(allData);

getData();



////////////////////////////////////////////
//            APP LOGIC END               //
////////////////////////////////////////////

// // EVENT LISTENER TO A CLICK ON LANGUAGE_BOX
// $(".circle").click(function(){
//
// });
//
// $(".close").click(function(){
//   $(".highlight").remove();
// });
