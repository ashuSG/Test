var g1;
var bar;
var fluid_meter;
var oldInfo = null;

// Function to initialize and check required data
function initializeDashboard() {
  const currentProject = localStorage.getItem("current_project");
  const currentDevice = localStorage.getItem("current_device");

  // Check if both values are present
  if (!currentProject || !currentDevice) {
      alert("Device or Project data is missing. Please go back to the Projects page and select a device.");
      window.location.replace('locations.html'); // Redirect back to the project selection
      return;
  }
}

// Run the initialization function when the page loads
$(document).ready(function() {
  initializeDashboard();
});

function statusPoller() {
  getStatus();
  poller = setTimeout(statusPoller, 5000);
}

function clock() {
  $('#clock').html(moment().format('dddd - DD MMM YYYY - H:mm:ss'));
  setTimeout(clock, 1000);
}

function fluidMeter() {
  fluid_meter = new FluidMeter();
  fluid_meter.init({
    targetContainer: document.getElementById("fluid-meter"),
    fillPercentage: 0,
    options: 
    {
      fontSize: "40px",
      fontFamily: "Arial",
      fontFillStyle: "white",
      drawShadow: false,
      drawText: true,
      drawPercentageSign: false,
      drawBubbles: true,
      size: 230,
      borderWidth: 25,
      backgroundColor: "#e2e2e2",
      foregroundColor: "#fafafa",
      foregroundFluidLayer: {
        fillStyle: "#51c7e9",
        fontFamily: "Amazon Ember",
        angularSpeed: 100,
        maxAmplitude: 12,
        frequency: 30,
        horizontalSpeed: -150
      },
      backgroundFluidLayer: 
      {
        fillStyle: "#F8AF26",
        angularSpeed: 100,
        maxAmplitude: 9,
        frequency: 30,
        horizontalSpeed: 150
      }
    }
  });
  
  // percentage = 55;
  // fluid_meter.setPercentage(percentage);
}

function addSoilMoistureIcon(tr, valve, setting) {
  
  if(typeof valve.smsActive === "string"){
    if (valve.hasOwnProperty('smsActive') && valve.hasOwnProperty('smsValue') && !valve.smsActive.startsWith('0')) {
      tr.append(`<td onclick='openSetting(${valve.id})'>Station: ${valve.id}<br>Location: ${valve.location}<br><img class='zone' src='images/pot.png' style='cursor:pointer'></img><br>${valve.smsValue} %<br></td>`);
    } else {
      addValveIcon(tr, valve, setting)
    }
  } else {
    if (valve.smsActive) {
      tr.append(`<td onclick='openSetting(${valve.id})'>Station: ${valve.id}<br>Location: ${valve.location}<br><img class='zone' src='images/pot.png' style='cursor:pointer'></img><br>${valve.smsValue} %<br></td>`);
    } else {
      addValveIcon(tr, valve, setting)
    }
  }
}

function addValveIcon(tr, valve, setting) {
  img = "images/zone.png";
  if(setting["relayType"] === "relay" || setting["relayType"] === "relay-water") {
    if ((typeof valve["status"] === "boolean" && valve["status"]) || valve["status"] === "True" || valve["status"] === "true") {
      img = "images/zone-on.gif";
    } else {
      img = "images/zone.png";
    }
  } else if(setting["relayType"] === "relay-light") {
    if ((typeof valve["status"] === "boolean" && valve["status"]) || valve["status"] === "True" || valve["status"] === "true") {
      img = "images/zone-light-on.png";
    }  else {
      img = "images/zone-light-off.png";
    }
  }
  
  tr.append(`<td onclick='openSetting(${valve.id})'>Station: ${valve.id}<br>Location: ${valve.location}<br><img class='zone' src='${img}' style='cursor:pointer'></img></td>`);
}

function addZoneStatus(tr, valve, settings) {
  if(typeof valve.smsActive === "string"){
    if (valve.hasOwnProperty('smsActive') && valve.hasOwnProperty('smsValue') && !valve.smsActive.startsWith('0')) {
      displaySoilMoistureStatus(tr, valve, settings)
    } else {
      displayNextIrrigationStatus(tr, valve, settings)
    }
  } else {
    if(valve.smsActive) {
      displaySoilMoistureStatus(tr, valve, settings)
    } else {
      displayNextIrrigationStatus(tr, valve, settings)
    }    
  }
}

function displayNextIrrigationStatus(tr, valve, settings) {
  // settings does not contain master index
  // var html = `<td> Next Irrigation: ${valve.nextIrr}<br>`
    // var html = `<td> Last Flow Rate: ${settings['lastFlow']} L/H<br>`
    //        + `Expected Flow Rate: ${settings['expFlow']} L/H<br>`
    //        + `<button class='btn btn-warning' type='button' onclick='openSetting(${valve.id})'>Change Settings</button></td>`;
    var html = `<td> Expected Flow Rate: ${settings['expFlow']} L/H<br>`
           + `<button class='btn btn-warning' type='button' onclick='openSetting(${valve.id})'>Change Settings</button></td>`;
  tr.append(html);
}

function displaySoilMoistureStatus(tr, valve, settings) {
  // settings does not contain master index
  var html = `<td> Desired Soil Moisture: ${valve.smsDesiredValue} %<br>`
          //  + `Last Flow Rate: ${settings['lastFlow']} L/H<br>`
           + `Expected Flow Rate: ${settings['expFlow']} L/H<br>`
           + `<button class='btn btn-warning' type='button' onclick='openSetting(${valve.id})'>Change Settings</button></td>`;
  tr.append(html);
}
function displayActiveZoneSoilMoisture( valve, i){
  if (valve[i].status == true && i > 0){
    
    $("#active-zones").append(`<div>Station: ${valve[i].id} (${valve[i].location})</div>`);
  
    $("#current-soil-moisture").append(`<div> ${valve[i].id} (${valve[i].location})...${valve[i].soilMoisture} %</div>`);
    }
}

function getStatus() {
  var url = apiBaseUrl + "/Status/get-status";
  var userPool = new AWSCognito.CognitoIdentityServiceProvider.CognitoUserPool(poolData);
  var cognitoUser = userPool.getCurrentUser();
  var info = null;

  if (cognitoUser == null) {
    alert("Session expired, please log in again.");
    window.location.replace('../../index.html');
  }

  cognitoUser.getSession(function (err, session) {
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
      success: function (data) {
        try {
          info = JSON.parse(data);

          // console.dir(data);

          if (_.isEqual(info, oldInfo))
            return;
          
          valve = info.zones;
          meter = info.meter;
          settings = info.settings;
          var trHtml;
          var content = $();

          $("#connection").html(`<span class="label ${meter.connection? `label-info` : `label-danger`}">${meter.connection ? `Online` :  `Offline`}</span>`);
          $("#active-zones").html(
            `<br><br><br>
            <div>Active zone(s):</div>`
          );
          $("#current-soil-moisture").html(
            `<br><br><br>
           <div>Current Soil Moisture:</div>`);
          if (valve != "NA") {
            if (valve.length <= 2) {
              $('#mainDash').hide();
              $('#meter-message').hide();
              $('#water-usage').hide();
            }

            for (var i = 0; i < valve.length; i++) {
              trHtml = $('<tr/>');
              
              // console.log(valve[i].status);
              displayActiveZoneSoilMoisture(valve, i);

              if (valve[i].id === 0) {
                // img = "images/zone.png";
                // if ((typeof valve[i].status === 'boolean' && valve[i].status) || valve[i].status === 'true' || valve[i].status === 'True') {
                //   img = "images/zone-on.gif";
                //   trHtml.append(`<td><div class='wrapper'>Master Valve<br><img class='zone' src='${img}'></img></div></td>`)
                //   console.log("Add MASTER");
                // } 
                // console.log("At "  + valve[i].id + " Not Doing Anything");
                if (valve.length > 2) {
                  img = "images/zone.png";
                  if ((typeof valve[i].status === 'boolean' && valve[i].status) || valve[i].status === 'true' || valve[i].status === 'True') {
                    img = "images/zone-on.gif";
                  } 
                  trHtml.append(`<td><div class='wrapper'>Master Valve<br><img class='zone' src='${img}'></img></div></td>`)
                }
              } else if (valve[i].hasOwnProperty('smsActive') && valve[i].hasOwnProperty('smsValue')) {
                addSoilMoistureIcon(trHtml, valve[i], settings[i-1]);
              } else {
                addValveIcon(trHtml, valve[i], settings[i-1]);
              }

              if (valve[i].id === 0) {
                // Skip master valve
                if (valve.length > 2) {
                  trHtml.append("<td>N/A</td>");
                }
                
              } else if (valve.length <= 2) {
                trHtml.append("<td> No Sensor Detected <br></td>"); 
              } else {
                addZoneStatus(trHtml, valve[i], settings[i - 1]);
                
              }

              // Check if the type of valve.status is boolean
              if (valve[i].id !== 0 || valve.length > 2) {
                btnClass = `btn btn-success`;
                onClickFn = `switchValve(${valve[i].id}, 1)`;
                btnContent = `Turn On`;

                if ((typeof valve[i].status === 'boolean' && valve[i].status) || (valve[i].status === 'true') || (valve[i].status === 'True')) {
                  btnClass = `btn btn-danger`;
                  onClickFn = `switchValve(${valve[i].id}, 0)`;
                  btnContent = `Turn Off`;  
                } 

                trHtml.append(`<td id=zoneSwitch${valve[i].id}><button class='${btnClass}' id='zone-btn-${valve[i].id}' data-loading-text='<i class=\"fa fa-circle-o-notch fa-spin\"></i> Loading...' onclick='${onClickFn}' type='button'>${btnContent}</button></td>`);
              }
              content = content.add(trHtml);
            }
            $('#valveslist').html(content);
          }

          if (meter.flowRate == "NA")
            meter.flowRate = "No sensor";

          if (!meter.highBound)
            meter.highBound = "No sensor";
          
          let sf = 1.5
          percentage = meter.flowRate/((meter.highBound-meter.lowBound) * sf) * 100
          fluid_meter.setPercentage(percentage);
          // $('#project-name-div').text("Project Name: " + localStorage.getItem("current_project"));
          $('#device-name-div').text("System: " + localStorage.getItem("current_device"));
          $('#flow-rate').text("Total Flow Rate: " + meter.flowRate + " L/H");
          // g1.refresh(meter.flowRate, meter.highBound);

          meterMsgClass = meter.message == "Normal" ? `label label-info` : `label label-danger`;
          meterMsgContent = meter.message == "NA" ? `No Sensor` : meter.message;
          $("#meter-message").html(`<span class="${meterMsgClass}">${meterMsgContent}</span>`);

          meterWUsageContent = meter.waterUsage == "NA" ? `No Sensor` : `${meter.waterUsage} &#8467;`;
          $("#water-usage").html(`<h4><i>Total Water Usage: ${meterWUsageContent}</i></h4>`);

          if (meter.humidity == "NA") {
            $("#Humidity").hide();
          } else {
            $("#Humidity").css("display", "inline-block");
            $("#humidity_value").html('<span>' + meter.humidity + '</span>');
          }

          if (meter.temperature == "NA") {
            $("#Temperature").hide();
          } else {
            $("#Temperature").css("display", "inline-block");
            $("#temperature_value").html('<span>' + meter.temperature + '</span>');
          }
          oldInfo = info
        } catch (e) {
          if (e instanceof SyntaxError) {
            console.log(data);
          } else {
            console.log("Generic error: " + e);
          }

        }
      },
      statusCode: {
        504: function() {
          window.location.replace('../../index.html');
        }
      }
    });
  });
}

function switchOnValve(zone) {
  $('#switch-on-modal').modal('show');

  title = zone === 0 ? `Master Valve` : `Zone ${zone}`;
  $('#switch-on-modal').find('.modal-title').html(title);
  $('#status-on-modal').find('.modal-title').val(zone);
}

function switchValve(valveId, onOff) {
  clearTimeout(poller);
  poller = setTimeout(statusPoller, 5000);
  var url = apiBaseUrl + "/Status/switch-valve";
  var userPool = new AWSCognito.CognitoIdentityServiceProvider.CognitoUserPool(poolData);
  var cognitoUser = userPool.getCurrentUser();

  if (cognitoUser == null)
    return;

  cognitoUser.getSession(function (err, session) {
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
        device_name: localStorage.getItem("current_device"),
        valve_id: "" + valveId,
        onOff: "" + onOff
      }),
      dataType: 'json',
      contentType: 'application/json',
      success: function (data) {
        $("#zone-btn-" + valveId).button('loading');
      }
    });
  });
}

function setSettings() {
  if (!setSettingsValidate())
    return;

  // Retrieve configured Soil Moisture settings by the user
  useSMS = $('#settings-useSMS').val();

  sensorName = $('#settings-sensorName').val();
  moistureLevel = $('#settings-moistureLevel').val();

  control_type = $("#settings-control").val();
  zone = $('#status-modal').find('.modal-title').val();
  is_alert_user = $('#settings-error').val();
  expFlow = $('#settings-expflow').val();
  expTolHigh = $('#settings-exptolhigh').val();
  expTolLow = $('#settings-exptollow').val();

  var url = apiBaseUrl + "/Settings/set-valve-settings"
  var userPool = new AWSCognito.CognitoIdentityServiceProvider.CognitoUserPool(poolData);
  var cognitoUser = userPool.getCurrentUser();

  if (cognitoUser == null) 
    return;

  cognitoUser.getSession(function (err, session) {
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
        device_name: localStorage.getItem("current_device"),
        sms_active: useSMS,
        sms_name: sensorName,
        sms_lowSetPoint: moistureLevel,
        zone: "" + zone,
        control_type: control_type,
        is_alert_user: "" + is_alert_user,
        expected_flow: "" + expFlow,
        expTolhigh: "" + expTolHigh,
        expTolLow: "" + expTolLow,
        totalZones: "6" // TODO: make totalZones input dynamic
      }),
      dataType: 'json',
      contentType: 'application/json',
      success: function (data) {
        $('#status-modal').modal('hide');
      }
    });
  });
  
}

function setSettingsValidate() {
  var zeroToHundredPatt = /^[0-9][0-9]?$|^100$/
  var expFlowPatt = /^[0-9]{1,4}?$|^10000$/

  var isSoilMoistureEnabled = $('#settings-useSMS').val();

  var moistureLevel = $('#settings-moistureLevel').val();
  var expFlow = $('#settings-expflow').val();
  var expTolHigh = $('#settings-exptolhigh').val();
  var expTolLow = $('#settings-exptollow').val();

  if (isSoilMoistureEnabled.startsWith('1')) {
    if (!zeroToHundredPatt.test(moistureLevel)) {
      $('#schedule-error-message').html("Please enter a moisture level between 0 to 100%.");
      $('#schedule-error').show();
      return false;
    }
  }

  if (!expFlowPatt.test(expFlow)) {
    $('#schedule-error-message').html("Please enter an expected flow rate between 0 to 10000 L/H.");
    $('#schedule-error').show();
    return false;
  }

  if (!zeroToHundredPatt.test(expTolLow)) {
    $('#schedule-error-message').html("Please enter a lower tolerance between 0 to 100%.");
    $('#schedule-error').show();
    return false;
  }

  if (!zeroToHundredPatt.test(expTolHigh)) {
    $('#schedule-error-message').html("Please enter a higher tolerance between 0 to 100%.");
    $('#schedule-error').show();
    return false;
  }

  return true;
}

function openSetting(zone) {
  $('#status-modal').modal('show');
  
  title = zone === 0 ? "Master Valve" : `Zone ${zone}`;
  $('#status-modal').find('.modal-title').html(title);
  $('#status-modal').find('.modal-title').val(zone);

  var url = apiBaseUrl + "/Settings/get-valve-settings";
  var userPool = new AWSCognito.CognitoIdentityServiceProvider.CognitoUserPool(poolData);
  var cognitoUser = userPool.getCurrentUser();

  if (cognitoUser == null)
    return;

  cognitoUser.getSession(function (err, session) {
    if (err) {
      console.dir(err);
      return;
    }
    // zone is from 0 to X
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
        device_name: localStorage.getItem("current_device"),
        zone: zone
      }),
      dataType: 'json',
      contentType: 'application/json',
      success: function (data) {
        json = JSON.parse(data);
        html = '';

        if (!json['soilMoistSettings']['isPlcSMSVersion'].startsWith('NA')) {
          //Soil Moisture Sensor drop down
          html += `<div class="row">`
                + `<div class="form-group col-sm-6">`
                + `<label>Soil Moisture Sensor: </label>`
                + `<div class="input-group">`
                + `<select id="settings-useSMS" class="form-control" onchange="displaySMSSettingsComponents()">`;

          var isSMSDisable = json['soilMoistSettings']['active'].startsWith('0');
          var subscribed_topic = json['soilMoistSettings']["subscribed"];

          html += `<option value="1" `
          if (!isSMSDisable) { html += `selected`; }
          
          html += `>`
                + `Enabled</option>`
                + `<option value="0"`
          
                if (isSMSDisable | json['soilMoistSettings']['active'].startsWith("NA")) { html += 'selected'; }

          html += `>`
                + `Disabled</option>`
                + `</select>`
                + `</div></div>`
                + `</div>`;
        
          html += renderSoilMoistureSettings(json, isSMSDisable);
        } else {
          //Soil Moisture Sensor drop down
          html += `<div class="row">`
                + `<div class="form-group col-sm-6">`
                + `<label>Soil Moisture Sensor: </label>`
                + `<div class="input-group">`
                + `<select id="settings-useSMS" class="form-control" onchange="displaySMSSettingsComponents()">`;
          
          // var isSMSDisable = json['soilMoistSettings']['active'].startsWith('0');
          let isSMSDisable = json['soilMoistSettings']['active'] ;

          // isSMSDisableValue = isSMSDisable ? `1` : `0`;
          // isSMSDisableValue = isSMSDisable == "true" ? `1` : `0`;
          // isSMSDisableDisplayValue = isSMSDisable == "true" ? `Enabled` : `Disabled`;
          // issmsDisableSelectValue = isSMSDisable ? ` selected` : ``;
          // html += `<option value="${isSMSDisableValue}" + ${issmsDisableSelectValue}>${isSMSDisableDisplayValue}</option>`;
          // html += `<option value="${isSMSDisableValue}" + ${issmsDisableSelectValue}>${isSMSDisableDisplayValue}</option>`;

          html += `<option value="true" ${isSMSDisable ? `selected` : ``}>Enabled</option>`
                + `<option value="false" ${!isSMSDisable ? `selected` : ``}>Disabled</option>`
          html += `</select>`
                + `</div></div>`
                + `</div>`;
        
          html += renderSoilMoistureSettings(json, isSMSDisable);
        }

        //alert
        html += `<div class="row">`
              + `<div class="form-group col-sm-6">`
              + `<label>Error Alert: </label>`
              + `<div class="input-group">`
              + `<select id="settings-error" class="form-control">`;

        // var isAlertTrue = ((json['error'] == 'true') || (json['error'] == 'True'));
        var isAlertTrue = json['error'];

        html += `<option value="true" ${isAlertTrue ? `selected` : ``}>Enabled</option>`
              + `<option value="false" ${!isAlertTrue ? `selected` : ``}>Disabled</option>`
              + `</select></div></div></div>`;

        //light
        let isRelayLight = (json['relayType'] == 'relay-light');
        html += `<div class="row">`
              + `<div class="form-group col-sm-6">`
              + `<label>Control Type: </label>`
              + `<div class="input-group">`
              + `<select id="settings-control" class="form-control" onchange="displayWaterSettingsComponents()">`; 
        
        html += `<option value="relay-light" ${isRelayLight ? `selected` : ``}>Light</option>`
              + `<option value="relay-water" ${!isRelayLight ? `selected` : ``}>Water</option>`
              + `</select></div></div></div>`;
        
        html += renderWaterSettings(json, isRelayLight);
        
        html += `<div id="schedule-error" class="alert alert-danger">`
              + `<strong>Error:</strong><div id="schedule-error-message"></div>`
              + `</div>`;

        $('#status-modal').find('#modal-body').html(html);
        $('#schedule-error').hide();
      }
    });
  });
}

function renderSoilMoistureSettings(json, isSMSControl) {
  let result = "";
  let displayNone="";

  if(!isSMSControl) {
    displayNone = `style="display: none"`;
  }

  //Sensor Name
  result += `<div class="row soil-moisture-settings" ` + displayNone + `>`
  + `<div class="form-group col-sm-6">`
  + `<label>Sensor Name: </label>`
  + `<div class="input-group">`;
  console.dir(json);
  var sensorList = json['soilMoistSettings']['sensorList'];
  if (sensorList.length > 0) {
    result += '<select id="settings-sensorName" class="form-control">'; //TODO: make size consistent with other fields
  let subscribed = json['soilMoistSettings']['subscribed']

  if(subscribed.indexOf("/") >= 0) {
    subscribed = json['soilMoistSettings']['subscribed'].split("/")[1];
  }
  
  for (var i = 0; i < sensorList.length; i++) {
    sensorSelectValue = subscribed.startsWith("SMSensor-"+sensorList[i]) ? ` selected` : ``;
    result += `<option value="${sensorList[i]}" ${sensorSelectValue}>${sensorList[i]}</option>`;
  }
  result += '</select>';
  } else {
    result += `<div><font color="red">Please define some soil moisture sensors</font></div>`;
  }

  result += `</div></div>`;

  //Desired moisture Level 
  result += `<div class="form-group col-sm-6">`
    + `<label>Desired Moisture Content:</label>`
    + `<div class="input-group">`
    + `<input id="settings-moistureLevel" type="text" class="form-control" value="` + json['soilMoistSettings']['lowSetpoint'] + `">`
    + `<span class="input-group-addon">%</span>`
    + `</div></div>`
    + `</div>`;

  return result;
}

function renderWaterSettings(json, isRelayLight){
  let result = "";
  let displayNone="";
  if(isRelayLight) {
    displayNone = `style="display: none"`;
  }

  //TODO: display soil moisture low setpoint in dashboard
  // if(!isRelayLight) {
    //Last flow rate
    result += `<div class="row water-settings" ` + displayNone +`>`
    + `<div class="form-group col-sm-6">`
    + `<label>Last Flow Rate: </label>`
    + `<div class="input-group">`
    + `<input id="settings-lastflow" type="text" class="form-control" value="` + json['lastFlow'] + `" disabled>`
    + `<span class="input-group-addon">L/H</span>`
    + `</div></div>`;

    //expected flow rate
    result += `<div class="form-group col-sm-6">`
    + `<label>Expected Flow Rate</label>`
    + `<div class="input-group">`
    + `<input id="settings-expflow" type="text" class="form-control" value="` + json['expFlow'] + `">`
    + `<span class="input-group-addon">L/H</span>`
    + `</div></div>`
    + `</div>`;

    //expected tolerance (high)
    result += `<div class="row water-settings" ` + displayNone +`>`
    + `<div class="form-group col-sm-6">`
    + `<label>Expected Tolerance (High): </label>`
    + `<div class="input-group">`
    + `<input id="settings-exptolhigh" type="text" class="form-control" value="` + json['expTolHigh'] + `">`
    + `<span class="input-group-addon">%</span>`
    + `</div></div>`;

    //expected tolerance (low)
    result += `<div class="form-group col-sm-6">`
    + `<label>Expected Tolerance (Low): </label>`
    + `<div class="input-group">`
    + `<input id="settings-exptollow" type="text" class="form-control" value="` + json['expTolLow'] + `">`
    + `<span class="input-group-addon">%</span>`
    + `</div></div>`
    + `</div>`;
  // }
  return result;
}

function displayWaterSettingsComponents() {
  let isControlLight = $("#settings-control").val();

  if(isControlLight === "light") {
    $(".water-settings").hide();
  } else if(isControlLight === "water") {
    $(".water-settings").show();
  }
}

function displaySMSSettingsComponents() {
  let isControlSMS = $("#settings-useSMS").val();

  if(isControlSMS == 0) {
    $(".soil-moisture-settings").hide();
  } else if(isControlSMS == 1) {
    $(".soil-moisture-settings").show();
  }
}

function openMap() {
  $('#map-modal').modal('show');
}

function setConfig() {
  $('#configuration-modal').modal('show');
  if (!setConfigValidate())
    return

  active = $('#configuration-modal').find('#active').val();
  group = $('#configuration-modal').find('#group').val();
  lowSetpoint = $('#configuration-modal').find('#low-setpoint').val();

  var url = "https://xst0w6o6q2.execute-api.ap-southeast-1.amazonaws.com/dev/Settings/set-soil-moisture-settings";
  var userPool = new AWSCognito.CognitoIdentityServiceProvider.CognitoUserPool(poolData);

  var cognitoUser = userPool.getCurrentUser();

  if (cognitoUser == null) 
    return

  cognitoUser.getSession(function (err, session) {
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
        device_name: localStorage.getItem("current_device"),
        zone: "0",
        active: active,
        group: group,
        lowSetpoint: lowSetpoint
      }),
      dataType: 'json',
      contentType: 'application/json',
      success: function (data) {
        $('#configuration-modal').modal('hide');
      }
    });
  });
}

function setConfigValidate() {
  intPatt = /^[0-9][0-9]?$|^100$/

  group = $('#configuration-modal').find('#group').val();
  lowSetpoint = $('#configuration-modal').find('#low-setpoint').val();
  highSetpoint = $('#configuration-modal').find('#high-setpoint').val();

  errorBox = $('#configuration-modal').find('#error')
  errorMessage = $('#configuration-modal').find('#error-message')

  if (lowSetpoint >= highSetpoint) {
    errorMessage.html("Please enter a low setpoint that is lower than the high setpoint.");
    errorBox.show();
    return false;
  }

  if (!intPatt.test(lowSetpoint)) {
    errorMessage.html("Please enter a low setpoint between 0 - 100%.");
    errorBox.show();
    return false;
  }

  if (!intPatt.test(highSetpoint)) {
    errorMessage.html("Please enter a high setpoint between 0 - 100%.");
    errorBox.show();
    return false;
  }

  if (!intPatt.test(group)) {
    errorMessage.html("Please enter a group between 0 - 100.");
    errorBox.show();
    return false;
  }

  return true;
}

$(function () {
  $("#header-stuff").load("header-tp.html");
  $("#nav-tp").load("nav-tp.html");
  statusPoller();
  clock();
  fluidMeter();
  console.log("READY");
  // Session will expire in 1 hour
  setTimeout(function () {
    alert("Session Expired!!");
    window.location.replace('../../index.html');
  }, 3600000);
});

$(window).on("load", function () {
  g1 = new JustGage({
    id: "g1",
    value: 0,
    title: "Water Meter",
    label: "L/H"
  });
  // bar = new ProgressBar.Line(sms, {
  //   strokeWidth: 4,
  //   easing: 'easeInOut',
  //   duration: 1400,
  //   color: '#FFEA82',
  //   trailColor: '#eee',
  //   trailWidth: 1,
  //   svgStyle: {width: '100%', height: '100%'},
  //   text: {
  //     style: {
  //       // Text color.
  //       // Default: same as stroke color (options.color)
  //       color: '#999',
  //       padding: '10px',
  //       margin: 0,
  //       transform: null
  //     },
  //     autoStyleContainer: false
  //   },
  //   from: {color: '#ED6A5A'},
  //   to: {color: '#AFEEEE'},
  //   step: (state, bar) => {
  //     bar.setText(Math.round(bar.value() * 100) + ' %');
  //     bar.path.setAttribute('stroke', state.color);
  //   }
  // });

});
