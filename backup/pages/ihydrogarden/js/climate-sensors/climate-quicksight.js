$(document).ready(function () {
  var awsData = {
    dashboardId: 'edf1cf35-22f2-4c86-b5cf-cee4e6c4dc78',
    dashboardRegion: 'ap-southeast-1',
    apiGatewayUrl:'https://'+id+'.execute-api.ap-southeast-1.amazonaws.com/' + stage + '/Quicksight/get-embed-url',
    debug: false
  }

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
            time_zone: 0
          }),
          dataType: 'json',
          contentType: 'application/json',
          success: function(data)
          {
            console.log("query data return:");
            jsonBody = JSON.parse(data.body);
            console.dir(jsonBody);
            embedDashboard(jsonBody.EmbedUrl);
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
    console.dir(embedUrl)
    var params = {
            url: embedUrl,
            container: containerDiv,
            width:"100%",
            height:"1000px"
    };
    var dashboard = QuickSightEmbedding.embedDashboard(params);
}