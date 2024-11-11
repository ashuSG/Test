$(document).ready(function () {

  var userPool = new AWSCognito.CognitoIdentityServiceProvider.CognitoUserPool(poolData);
  var cognitoUser = userPool.getCurrentUser();

  if (cognitoUser != null) {
    cognitoUser.getSession(function(err, session) {
      if (err) {
        console.dir(err);
        return;
      } else {
        $.ajax({
          type: "POST",
          url: apiBaseUrl + "/Quicksight/get-emb-url",
          crossDomain: true,
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': session.getIdToken().getJwtToken()
          },
          data: JSON.stringify({
            project_name: localStorage.getItem("current_project"),
            type: "climate",
            time_zone: 0
          }),
          dataType: 'json',
          contentType: 'application/json',
          success: function(data)
          {
            console.log("query data return:");
            jsonBody = JSON.parse(data.body);
            console.dir(jsonBody);
            try{
              embedDashboard(jsonBody.EmbedUrl);
            } catch (err) {
              console.log("No Configured for this project");
            }

            if(jsonBody.hasOwnProperty("powerBi")){
              displayPowerBI(jsonBody["powerBi"]);
              console.log("test");
            }
            
            // plotData(data, "Average Flow (m3/hr)");
          }
        })
        .fail(function(){
          console.log("Query Failed");
        });
      }
    });
  }
});

//Embed the generated url into the div identified to hold the dashboard.
function embedDashboard(embedUrl) {
    var containerDiv = document.getElementById("dashboardContainer");
    // console.dir(embedUrl)
    var params = {
            url: embedUrl,
            container: containerDiv,
            width:"100%",
            height:"1000px"
    };
    var dashboard = QuickSightEmbedding.embedDashboard(params);
}

function displayPowerBI(url){
  console.log("Display");
  $("#powerBi-link").show();
  localStorage.setItem("powerbi_url", url);
  // $("#powerBi-iframe").attr("src", url);
  // $("#powerBi-iframe").show();
}