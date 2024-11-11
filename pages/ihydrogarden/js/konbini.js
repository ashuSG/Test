// s3 CORS
// https://stackoverflow.com/questions/11315872/allow-ajax-gets-from-amazon-s3-access-control-allow-origin
// https://docs.aws.amazon.com/AmazonS3/latest/API/API_GetObject.html
var MaxieLoadingScreenTimeout = 4000;
var isAlive = true;
var clickedDataNames = [];
var startDate;
var endDate;

$(document).ready(function() {
  $("#no-data-msg").hide();
  // getDevices();
  // getZones();

  // createDirectECSensorNamesContentDiv(localStorage.getItem("current_project"), localStorage.getItem("current_device"), 0);
  // createDirectPHSensorNamesContentDiv(localStorage.getItem("current_project"), localStorage.getItem("current_device"), 0);
  // createDirectAverageFlowContentDiv(localStorage.getItem("current_project"), localStorage.getItem("current_device"), 0);

  // Display loading screen
  setTimeout(function() {
    $("body").toggleClass("loaded");
  }, MaxieLoadingScreenTimeout);
  // startChartPoller(1800);

  // Session will expire at 1 hour
  setTimeout(function() {
    alert("Session Expired!!");
    window.location.replace('../../index.html');
  }, 3600000);
});
  

// Instantiate the date time picker
$(function () {
  $(".date").datetimepicker({
      // format: "mm/dd/yyyy"
      // format: "LT"
  });
});

$("#open-1-btn").click(function() {
  console.log("test")
  openLocker(1);
});

$("#open-2-btn").click(function() {
  openLocker(2);
});

$("#open-3-btn").click(function() {
  openLocker(3);
});

$("#open-4-btn").click(function() {
  openLocker(4);
});

$("#open-5-btn").click(function() {
  openLocker(5);
});

$("#open-6-btn").click(function() {
  openLocker(6);
});

$("#open-7-btn").click(function() {
  openLocker(7);
});

$("#open-8-btn").click(function() {
  openLocker(8);
});


function openLocker(lockerNumber){
  console.log("open locker " + lockerNumber);
  var urlStr = "https://" + id + ".execute-api.ap-southeast-1.amazonaws.com/" + stage + "/Commands/set-konbini-action";
  console.log("id " + id);
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
          url: urlStr,
          crossDomain: true,
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': session.getIdToken().getJwtToken()
          },
          data: JSON.stringify({
            project_name: "VFS",
            device_name: "cp",
            lockerNumber: lockerNumber,
            commandAction: 1
          }),
          dataType: 'json',
          contentType: 'application/json',
          success: function(data)
          {
            console.log("query data return:");
            console.log(data)
            // plotData(data, "Average Flow (m3/hr)");
          }
        })
        .fail(function(){
          console.log("Query Failed");
          // $("#graphdiv2").hide();
          // $("#no-data-msg").show();
        });
      }
    });
  } else {
    alert("Please login!!");
    window.location.replace('../index.html');
  }
}

function queryChart(checkedZoneNames, checkedIndSNames, checkedDirectSNames, startDate, endDate) {
  var urlStr = "https://" + id + ".execute-api.ap-southeast-1.amazonaws.com/" + stage + "/Iot/get-historical-data";
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
          url: urlStr,
          crossDomain: true,
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': session.getIdToken().getJwtToken()
          },
          data: JSON.stringify({
            project_name: localStorage.getItem("current_project"),
            zone_names: checkedZoneNames,
            indirect_sensor_names: checkedIndSNames,
            direct_sensor_names: checkedDirectSNames,
            start : startDate,
            end : endDate
          }),
          dataType: 'json',
          contentType: 'application/json',
          success: function(data)
          {
            console.log("query data return:");
            console.log(data)
            // plotData(data, "Average Flow (m3/hr)");
          }
        })
        .fail(function(){
          console.log("Query Failed");
          // $("#graphdiv2").hide();
          // $("#no-data-msg").show();
        });
      }
    });
  } else {
    alert("Please login!!");
    window.location.replace('../index.html');
  }
}

function readChart(){
    // urlBase = "https://ihydrogarden.s3-ap-southeast-1.amazonaws.com/pages/ihydrogarden/";
    // urlStr = urlBase + "res/" + localStorage.getItem("current_project") + "_out.csv";
    // urlStr = "res/hdb_out.csv";
    urlStr = "res/" + localStorage.getItem("current_project") + "_out.csv";

    var userPool = new AWSCognito.CognitoIdentityServiceProvider.CognitoUserPool(poolData);
    var cognitoUser = userPool.getCurrentUser();
    

    if (cognitoUser != null) {
      cognitoUser.getSession(function(err, session) {
        if (err) {
          console.dir(err);
          return;
        } else {
          console.log(session.getIdToken().getJwtToken());
          $.ajax({
            type: "GET",
            url: urlStr,
            // crossDomain: true,
            // headers: {
            //   "contentType": 'text/csv',
            //   "Authorization": session.getIdToken().getJwtToken()
            // },
            success: function(data)
            {
              console.log("Read data");
              // console.log(data);
              plotData(data, "Average Flow (m3/hr)");
            }
          })
          .fail(function(data){
            console.log("Nothing found??");
            
            console.log(data);
            // $("#graphdiv2").hide();
            // $("#no-data-msg").show();
          });
        }
      });
    } else {
      alert("Please login!!");
      window.location.replace('../index.html');
    }
}

// function chart_WUsage(){
//     console.log("Read data");
//     $.ajax({
//         type: "GET",
//         url: "res/mqttdemo_Edision1_WUsage_0.csv",
//         dataType: "text",
//         success: function(data) {
//             plotData(data, "Soil Moisture (%)");
//         }
//     })
//     .fail(function(){
//         $("#graphdiv2").hide();
//         $("#no-data-msg").show();
//     });
// }

function plotData(data, ylbl){
  console.dir(data);
  g3 = new Dygraph(document.getElementById("graphdiv2"), data, {
      legend: "always",
      ylabel: ylbl,
      y2label: "Soil Moisture (%)",
      showRangeSelector: true,
      rangeSelectorPlotStrokeColor: "#378200",
      rangeSelectorPlotFillColor: "#6BFF00",
      // strokeBorderWidth: 0.5,
      // strokeBorderColor: "#FF4D00",
      colors: ["#00A6DB", "#FF4D00", "#6BFF00"],
      rollPeriod: 2,
      // per-series options
      series: {
        DO : {
          connectSeparatedPoints: true,
          stepPlot: true,
          // axis: "y2"
        },
        SMSValue : {
          connectSeparatedPoints: true,
          color: "#75b11d",
          strokeWidth: 3,
          axis : "y2"
        }
      }
  });
}

// *************************************************************************************************
function getDevices() {
  // get a list of devices under a project

  var url = "https://" + id + ".execute-api.ap-southeast-1.amazonaws.com/" + stage + "/Devices/get-devices";
  
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
          url: url,
          crossDomain: true,
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': session.getIdToken().getJwtToken()
          },
          data: JSON.stringify({
            table_name: 'projects_devices',
            filter_attr_key: 'project_name',
            search_item: localStorage.getItem("current_project"),
            projection_expression: 'device_name, coordinates',
            limit : "100",
            scan_forward : "True"
          }),
          dataType: 'json',
          contentType: 'application/json',
          success: function(data)
          {
            json = JSON.parse(data);
            if (Object.keys(json).length < 1){
              //prompt user to contact administrator
              alert("You do not have any devices. Please contact your system administrator.");
            } else {

              console.log("getDevices result: ");
              console.dir(json)
               
              let isSMSPopulated = populateSMSensorDevices(json);
              // Expand these code for future use ******************************************
              // isIndSFound = populateLuxSensorDevices(json)
              // isIndSFound = populateLuxSensorDevices(json)
              // ***************************************************************************

              if(isSMSPopulated){
                $("#no-indirect-found-msg").hide();
              }
              console.log("Object.keys(json).length: " + Object.keys(json).length);

            }
          }
        });
      }
    });
  } else {
    alert("Please login!!");
    window.location.replace('../index.html');
  }

  return ""
}

function populateSMSensorDevices(list) {
  let result = false
  // get soil moisture sensor devices from devices list
  if(list.length > 0){
    for (let index = 0; index < list.length; index++){
      if(list[index]["dname"].startsWith("SMS")){
        createSMSensorNamesContentDiv(localStorage.getItem("current_project"), list[index]["dname"], index);
        result = true
      }
    }
  }
  return result
}

function createSMSensorNamesContentDiv(projectName, deviceName, deviceNumber){
  tagName = projectName + "/" + deviceName + "/SMSValue/0";
  tagNameDisp = projectName.charAt(0).toUpperCase() + projectName.substr(1).toLowerCase() + "/" + deviceName;

  let divHtml = '<div class="form-check">'+
  '<input type="checkbox" class="form-check-input chart-names" id="indS-' + deviceNumber + 
  '" value="' + tagName + '"/>' +
  '<label class="form-check-label" for="indS-' + deviceNumber + 
  '"> ' + tagNameDisp +
  '</div>';

  $("#indirect-sen-names-list").append(divHtml);
}

function createDirectECSensorNamesContentDiv(projectName, deviceName, zoneNumber){
  tagName = projectName + "/" + deviceName + "/EcValue/" + zoneNumber;
  tagNameDisp = projectName.charAt(0).toUpperCase() + projectName.substr(1).toLowerCase() + "/" + deviceName + "/EC/" + zoneNumber;

  let divHtml = '<div class="form-check">' +
  '<input type="checkbox" class="form-check-input chart-names" ' +
  'id="dSEC-' + zoneNumber + '" value="' + tagName + '">' +
  '<label class="form-check-label" for="dSEC-' + zoneNumber + '" >' + tagNameDisp +
  '</div>';

  $("#direct-sensor-names-list").append(divHtml);
}

function createDirectPHSensorNamesContentDiv(projectName, deviceName, zoneNumber){
  tagName = projectName + "/" + deviceName + "/PhValue/" + zoneNumber;
  tagNameDisp = projectName.charAt(0).toUpperCase() + projectName.substr(1).toLowerCase() + "/" + deviceName + "/PH/" + zoneNumber;

  let divHtml = '<div class="form-check">' +
  '<input type="checkbox" class="form-check-input chart-names" ' +
  'id="dSPH-' + zoneNumber + '" value="' + tagName + '">' +
  '<label class="form-check-label" for="dSPH-' + zoneNumber + '" >' + tagNameDisp +
  '</div>';

  $("#direct-sensor-names-list").append(divHtml);
}

function createDirectAverageFlowContentDiv(projectName, deviceName, zoneNumber){
  tagName = projectName + "/" + deviceName + "/AVGFlow/" + zoneNumber;
  tagNameDisp = projectName.charAt(0).toUpperCase() + projectName.substr(1).toLowerCase() + "/" + deviceName + "/Average-Flow/" + zoneNumber;

  let divHtml = '<div class="form-check">' +
  '<input type="checkbox" class="form-check-input chart-names" ' +
  'id="dSAVGF-' + zoneNumber + '" value="' + tagName + '">' +
  '<label class="form-check-label" for="dSAVGF-' + zoneNumber + '" >' + tagNameDisp +
  '</div>';

  $("#direct-sensor-names-list").append(divHtml);
}

function createZoneNamesContentDiv(projectName, deviceName, zoneNumber) {
  tagName = projectName + "/" + deviceName + "/DO/" + zoneNumber;
  tagNameDisp = projectName.charAt(0).toUpperCase() + projectName.substr(1).toLowerCase() + "/" + deviceName + "/Zone/" + zoneNumber;

  let zoneNameHtml = '<div class="form-check">'+
  '<input type="checkbox" class="form-check-input chart-names" id="DO-' + zoneNumber + 
  '" value="' + tagName + '"/>' +
  '<label class="form-check-label" for="DO-' + zoneNumber + 
  '"> ' + tagNameDisp +
  '</div>';
  $("#zone-names-list").append(zoneNameHtml);
}

function getZones() {
  // get list of zones from ZoneConfigUpdate

  var url = "https://" + id + ".execute-api.ap-southeast-1.amazonaws.com/" + stage + "/Status/get-status";
  var userPool = new AWSCognito.CognitoIdentityServiceProvider.CognitoUserPool(poolData);
  var cognitoUser = userPool.getCurrentUser();

  if (cognitoUser != null) {
    cognitoUser.getSession(function(err, session) {
      if (err) {
        console.dir(err);
        return;
      }
      $.ajax({
        type: "POST",
        url: url,
        crossDomain: true,
        headers: { 
            'Content-Type': 'application/json',
            'Authorization': session.getIdToken().getJwtToken()
        },
        data: JSON.stringify({
            project_name: localStorage.getItem("current_project"),
            device_name: localStorage.getItem("current_device")
        }),
        dataType: 'json',
        contentType: 'application/json',
        success: function(data)
        {
          try{
            var info = JSON.parse(data);
            if (info.hasOwnProperty("zones")) {
              $("#no-zone-found-msg").hide();
              // console.info(info["zones"][0])
              for (let index = 1; index < info["zones"].length; index++){
                createZoneNamesContentDiv(localStorage.getItem("current_project"), localStorage.getItem("current_device"), index);
              }
            }
          } catch(e) {
            if(e instanceof SyntaxError){
              console.log(data);
              
            } else {
              console.log("Generic error: " + e);
            }
          }
        }
      });
    });
  } else {
    alert("Please login!!");
    window.location.replace('../../index.html');
  }
  return ""
}

function getCheckedValues(elemId){
  resultList = []
  $("#" + elemId + " input:checked").each(function() {
    resultList.push($(this).attr("value"));
  });
  return resultList
}
// *************************************************************************************************
// function getChartData(pollRate) {
//   try {
//     var url = "https://" + id + ".execute-api.ap-southeast-1.amazonaws.com/" + stage + "/IoT/get-historical-data";
//     var poolData = {
//         UserPoolId: localStorage.getItem("upId"),
//         ClientId: localStorage.getItem("clientId")
//     };
//     var userPool = new AWSCognito.CognitoIdentityServiceProvider.CognitoUserPool(poolData);
//     var cognitoUser = userPool.getCurrentUser();

//     if (cognitoUser != null) {
//       cognitoUser.getSession(function (err, session) {
//         if (err) {
//           console.dir(err);
//           return;
//         }
//         $.ajax({
//           type: "POST",
//           url: url,
//           crossDomain: true,
//           headers: {
//               'Content-Type': 'application/json',
//               'Authorization': session.getIdToken().getJwtToken()
//           },
//           data: JSON.stringify({
//               "project_name": localStorage.getItem("current_project"),
//               "device_name": localStorage.getItem("current_device"),
//               "item": localStorage.getItem("current_device"),
//               "item_id": localStorage.getItem("current_device")
//           }),
//           dataType: 'json',
//           contentType: 'application/json',
//           success: function (rawdata) {
//             if(isAlive) {
//               // data is saved to the bucket
//               console.log(rawdata);
              
//             }
//           },
//           complete: function() {
//             if(isAlive && isMaxie) {
//               if(pollRate) {
//                 // console.log("pollRate = " + pollRate);
//                 timer = setTimeout(getChartData, pollRate);
//               } else {
//                 // console.log("MaxiePollRate = " + MaxiePollRate);
//                 timer = setTimeout(getChartData, MaxiePollRate);
//               }
//             } else if(!isAlive && isMaxie) {
//                 clearTimeout(timer);
//             } else {
//               document.location.href = "crop-sensors.html";
//             }
//           }
//         });
//       });
//     } else {
//       alert("Please login!!");
//       window.location.replace('../../index.html');
//     }
//   } catch(err) {
//     window.location.replace('../../index.html');
//   }
// }