var g1;
var bar;
var oldInfo = null;

function statusPoller() {
  getStatus();
  poller = setTimeout(statusPoller, 5000);
}

function clock() {
  $('#clock').html(moment().format('dddd - DD MMM YYYY - H:mm:ss'));
  setTimeout(clock, 1000);
}

function addSoilMoistureIcon(tr, valve) {
  if (valve.hasOwnProperty('smsActive') && valve.hasOwnProperty('smsValue') && !valve.smsActive.startsWith('0')) {
    tr.append(`<td onclick='openSetting(${valve.id})'>Zone ${valve.id}<br><img class='zone' src='images/pot.png' style='cursor:pointer'></img><br>${valve.smsValue} %<br></td>`);
  } else {
    addValveIcon(tr, valve)
  }
}

function addValveIcon(tr, valve) {
  img = "images/zone.png";
  if ((typeof valve["status"] === "boolean" && valve["status"]) || valve["status"] === "True" || valve["status"] === "true") {
    img = "images/zone-on.png";
  } 
  
  tr.append(`<td onclick='openSetting(${valve.id})'>Zone ${valve.id}<br><img class='zone' src='${img}' style='cursor:pointer'></img></td>`);
}

function addZoneStatus(tr, valve, settings) {
  if (valve.hasOwnProperty('smsActive') && valve.hasOwnProperty('smsValue') && !valve.smsActive.startsWith('0')) {
    displaySoilMoistureStatus(tr, valve, settings)
  } else {
    displayNextIrrigationStatus(tr, valve, settings)
  }
}

function displayNextIrrigationStatus(tr, valve, settings) {
  // settings does not contain master index
  var html = `<td> Next Irrigation: ${valve.nextIrr}<br>`
           + `Last Flow Rate: ${settings['lastFlow']} L/H<br>`
           + `Expected Flow Rate: ${settings['expFlow']} L/H<br>`
           + `<button class='btn btn-warning' type='button' onclick='openSetting(${valve.id})'>Change Settings</button></td>`;
  tr.append(html);
}

function displaySoilMoistureStatus(tr, valve, settings) {
  // settings does not contain master index
  var html = `<td> Desired Soil Moisture: ${valve.smsDesiredValue} %<br>`
           + `Last Flow Rate: ${settings['lastFlow']} L/H<br>`
           + `Expected Flow Rate: ${settings['expFlow']} L/H<br>`
           + `<button class='btn btn-warning' type='button' onclick='openSetting(${valve.id})'>Change Settings</button></td>`;
  tr.append(html);
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

          if (_.isEqual(info, oldInfo))
            return;
          
          // console.dir(info);
          valve = info.zones;
          meter = info.meter;
          settings = info.settings;
          var trHtml;
          var content = $();

          $("#connection").html(`<span class="label ${meter.connection? `label-info` : `label-danger`}">${meter.connection ? `Online` :  `Offline`}</span>`);
          
          if (valve != "NA") {
            if (valve.length <= 2) {
              $('#mainDash').hide();
              $('#meter-message').hide();
              $('#water-usage').hide();
            }

            for (var i = 0; i < valve.length; i++) {
              trHtml = $('<tr/>');

              if (valve[i].id === 0) {
                // img = "images/zone.png";
                // if ((typeof valve[i].status === 'boolean' && valve[i].status) || valve[i].status === 'true' || valve[i].status === 'True') {
                //   img = "images/zone-on.png";
                //   trHtml.append(`<td><div class='wrapper'>Master Valve<br><img class='zone' src='${img}'></img></div></td>`)
                //   console.log("Add MASTER");
                // } 
                // console.log("At "  + valve[i].id + " Not Doing Anything");
                if (valve.length > 2) {
                  img = "images/zone.png";
                  if ((typeof valve[i].status === 'boolean' && valve[i].status) || valve[i].status === 'true' || valve[i].status === 'True') {
                    img = "images/zone-on.png";
                  } 
                  trHtml.append(`<td><div class='wrapper'>Master Valve<br><img class='zone' src='${img}'></img></div></td>`)
                }
              } else if (valve[i].hasOwnProperty('smsActive') && valve[i].hasOwnProperty('smsValue')) {
                addSoilMoistureIcon(trHtml, valve[i]);
              } else {
                addValveIcon(trHtml, valve[i]);
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

          g1.refresh(meter.flowRate, meter.highBound);

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

  zone = $('#status-modal').find('.modal-title').val();
  is_alert_user = $('#settings-error').val();
  expFlow = $('#settings-expflow').val();
  expTolHigh = $('#settings-exptolhigh').val();
  expTolLow = $('#settings-exptollow').val();
  console.log(is_alert_user)

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
        console.log("Get Valve Setting")
        console.dir(json);
        
        html = '';

        if (json['soilMoistSettings']['isPlcSMSVersion']) {
          //Soil Moisture Sensor drop down
          html += `<div class="row">`
                + `<div class="form-group col-sm-6">`
                + `<label>Soil Moisture Sensor: </label>`
                + `<div class="input-group">`
                + `<select id="settings-useSMS" class="form-control">`;

          var isSMSDisable = json['soilMoistSettings']['active'].startsWith('0');

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

          //Sensor Name
          html += `<div class="row">`
                + `<div class="form-group col-sm-6">`
                + `<label>Sensor Name: </label>`
                + `<div class="input-group">`;

          var sensorList = json['soilMoistSettings']['sensorList'];
          if (sensorList.length > 0) {
            html += '<select id="settings-sensorName" class="form-control">'; //TODO: make size consistent with other fields
            var subscribed = json['soilMoistSettings']['subscribed'];

            for (var i = 0; i < sensorList.length; i++) {
              sensorSelectValue = subscribed.startsWith(sensorList[i]) ? ` selected` : ``;
              html += `<option value="${sensorList[i] + sensorSelectValue}">${sensorList[i]}</option>`;
            }
            html += '</select>';
          } else {
            html += `<div><font color="red">Please define some soil moisture sensors</font></div>`;
          }

          html += `</div></div>`;

          //Desired moisture Level 
          html += `<div class="form-group col-sm-6">`
                + `<label>Desired Moisture Content:</label>`
                + `<div class="input-group">`
                + `<input id="settings-moistureLevel" type="text" class="form-control" value="` + json['soilMoistSettings']['lowSetpoint'] + `">`
                + `<span class="input-group-addon">%</span>`
                + `</div></div>`
                + `</div>`;
        }

        //alert
        html += `<div class="row">`
              + `<div class="form-group col-sm-6">`
              + `<label>Error Alert: </label>`
              + `<div class="input-group">`
              + `<select id="settings-error" class="form-control">`;

        var isAlertTrue = ((json['error'] == 'true') || (json['error'] == 'True'));

        html += `<option value="true" ${isAlertTrue ? `selected` : ``}>Enabled</option>`
              + `<option value="false" ${!isAlertTrue ? `selected` : ``}>Disabled</option>`
              + `</select></div></div></div>`;
        
        //Last flow rate
        html += `<div class="row">`
              + `<div class="form-group col-sm-6">`
              + `<label>Last Flow Rate: </label>`
              + `<div class="input-group">`
              + `<input id="settings-lastflow" type="text" class="form-control" value="` + json['lastFlow'] + `" disabled>`
              + `<span class="input-group-addon">L/H</span>`
              + `</div></div>`;

        //expected flow rate
        html += `<div class="form-group col-sm-6">`
              + `<label>Expected Flow Rate</label>`
              + `<div class="input-group">`
              + `<input id="settings-expflow" type="text" class="form-control" value="` + json['expFlow'] + `">`
              + `<span class="input-group-addon">L/H</span>`
              + `</div></div>`
              + `</div>`;

        //expected tolerance (high)
        html += `<div class="row">`
              + `<div class="form-group col-sm-6">`
              + `<label>Expected Tolerance (High): </label>`
              + `<div class="input-group">`
              + `<input id="settings-exptolhigh" type="text" class="form-control" value="` + json['expTolHigh'] + `">`
              + `<span class="input-group-addon">%</span>`
              + `</div></div>`;

        //expected tolerance (low)
        html += `<div class="form-group col-sm-6">`
              + `<label>Expected Tolerance (Low): </label>`
              + `<div class="input-group">`
              + `<input id="settings-exptollow" type="text" class="form-control" value="` + json['expTolLow'] + `">`
              + `<span class="input-group-addon">%</span>`
              + `</div></div>`
              + `</div>`;

        html += `<div id="schedule-error" class="alert alert-danger">`
              + `<strong>Error:</strong><div id="schedule-error-message"></div>`
              + `</div>`;

        $('#status-modal').find('#modal-body').html(html);
        $('#schedule-error').hide();
      }
    });
  });
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

// TODO - Check for invalid inputs
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
