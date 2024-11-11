var weekday = ["", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
MaxiePollRate = 3000;
MaxieLoadingScreenTimeout = 4000;
var rowId = 0;
var isAlive = true;
var timer;
var valveList = "";
var valveScheduleSavedCount = 0;
var totalValvesMax = 0;
var isEditable = false;
var isMaxie = false;
var oldData = null;
var oldScheduleTabSelected = "";


// TODO: get default settings from stored settings in the cloud based on user
var defaultDuration = 2
var defaultDate = new Date(1989, 12, 16, 0, defaultDuration)

$(function() {
  isEditable = false;
  disableEditing();

  // Display loading screen
  setTimeout(function() {
    $("body").toggleClass("loaded");
  }, MaxieLoadingScreenTimeout);
  startSchedulePoller();

  // Session will expire in 1 hour
  setTimeout(function() {
    alert("Session Expired!!");
    window.location.replace('../../index.html');
  }, 3600000);
});

function startSchedulePoller(pollRate) {
  getScheduleListData();
}

// EVENT LISTENERS ****************************************************************************************************

$("#edit-schedule-name").on("click", function() {
  $("#schedule-details-modal").modal("show");
});

$("#new-schedule-name").on("keypress", function() {
  maxCharacters = 20;
  if(this.value.length > maxCharacters) {
    return false;
  }
  $("#remainingC").html("Remaining characters : " +(maxCharacters - this.value.length) + "/" + maxCharacters);
});

for (let i = 1; i <= 3; i++) {
  $("#schedule-" + i + "-btn").on("click", function() {
    changeScheduleTab();
  });  
}

/**
 * Event handler for adding new valves
 */
$("#add-valve-button").on("click", function() {
  valveCount = $("#irrigation-valve-panel > .valve").length;
  row = valveCount + 1;
  rowId++;
  console.log("rowId: " + rowId);
  if(valveCount < totalValvesMax) {
    console.log("add row = " + rowId);
    addIrrigationRow(rowId, valveList, defaultDate, false);

    // isBtnHidden = $("#edit-schedule-btn").is(":visible");
    // console.log(isBtnHidden)
    // If edit button is not hidden
    // if(not isBtnHidden){
    //   enableEditing();
    // }
    
    // Register the event handler for delete row button
    registerRemoveIrrigationRowEvent();

    // Register the event handler for pause start row button
    // registerPausePlayButtonRowEvent();
  } else {
    // hide the add valve button
    hideAddValveButton();
  }
});

// Edit schedule
$("#edit-schedule").on("click", function() {
  isEditable = true;
  enableEditing();
});

// Undo edit schedule
$("#undo-schedule").on("click", function() {
  isEditable = false;
  disableEditing();
  $("body").toggleClass("loaded");
  
  // Remove all valve irrigation rows
  removeAllIrrigationRows();

  // loading screen
  setTimeout(function() {
    $("body").toggleClass("loaded");
  }, MaxieLoadingScreenTimeout);

  // Continue to retrieve data
  getScheduleListData();
});

// Save user-configured schedule
$("#save-schedule").on("click", function () {  
  isEditable = false;
  // Check overlapping days

  // Check start times
  if (!validStartTimes()) {
    alert("Please order unique start times from earliest to latest");
    return;
  }

  // Check zone numbers
  if (!validZoneSelection()) {
    alert("Irrigation duration cannot have duplicate zones");
    return;
  }

  // Check irrigation duration
  if (!validIrrigationDuration()) {
    alert("Total irrigation duration conflicts with start times!");
    return;
  }

  // Convert into json object
  data = {
    "project_name":localStorage.getItem("current_project"),
    "device_name":localStorage.getItem("current_device"),
    "item": "schedule-program",
    "item-id": 0,
    "value": getScheduleId().toString(),
    "payload": {
      "name": getScheduleName(),
      "id": getScheduleId(),
      "active_days": getScheduleActiveDays(),
      "timings": getScheduleTimings(),
      "valve_durations": getIrrigationDurations()
    }
  };

  console.log("Creating schedule:");
  console.dir(data);
  console.log(JSON.stringify(data))

  // Publish to cloud, remove rows and get the updated data
  saveSchedule(JSON.stringify(data));

  // // Remove all valve irrigation rows
  // removeAllIrrigationRows();

  toggleLoadingScreen(MaxieLoadingScreenTimeout);
  // clearTimeout(timer);
  // getScheduleListData();
  // toggleLoadingScreen(5000);
  // disableEditing(); 
});

// Remove user configured schedule
$("#remove-schedule").on("click", function() {
  isEditable = false;

  data = {
    "project_name": localStorage.getItem("current_project"),
    "device_name": localStorage.getItem("current_device"),
    "item": "schedule-program",
    "item-id": 0,
    "value": getScheduleId().toString(),
    "payload": {
      "name": getScheduleName(),
      "id": getScheduleId(),
      "active_days": [],
      "timings": [],
      "valve_durations": []
    }
  };

  console.log("Clearing data");
  console.dir(data);

  // Publish to cloud
  saveSchedule(JSON.stringify(data));

  removeAllIrrigationRows();

  toggleLoadingScreen(MaxieLoadingScreenTimeout);
});

// RENDERING AND MODALS ***********************************************************************************************

$(".date").datetimepicker({
    format: "HH:mm"
});

function setScheduleName() {
  newName = $("#new-schedule-name").val();
  $("#schedule-name").html(newName);
  $("#schedule-1-btn").html(newName);
  $("#schedule-details-modal").modal("hide");
}

function enableEditing() {
  // Enable edit for schedule name
  $("#edit-schedule-name").toggleClass("enabled disabled");
  
  $("#edit-schedule-name").css("display", "inline-block");

  // Enable irrigation day editing
  $(".checkbox-inline").each(function() {
    $(this).toggleClass("enabled disabled");
  });

  $(".day-of-week").removeAttr("disabled");

  // Enable start time editing
  $("#program-schedule-div .input-group.start-time").each(function() {
    $(this).toggleClass("enabled disabled");
    
    $(this).children().toggleClass("enabled disabled");
    
    $(this).children().removeAttr("disabled");
  });

  // Enable zone editing
  $(".row-irrigation > div > button").removeAttr("disabled"); // enable remove buttons
  $(".row-irrigation > div > div > div > select").removeAttr("disabled"); // enable dropdowns
  $(".row-irrigation > div > div > div > div > span > button").removeAttr("disabled"); // enable pause buttons
  console.log("enable pause button")
  $(".row-irrigation > div > div > div > div > span > button").attr("enabled", "true"); // enable pause buttons
  

  $(".input-group.valve-duration").each(function() {
    $(this).children().removeAttr("disabled");
    $(this).children().toggleClass("enabled disabled");
  });

  $(".input-group.valve-duration").toggleClass("enabled disabled");

  // Enable add zone button
  $("#add-valve-button").removeAttr("disabled");

  $("#undo-schedule").css('display', 'inline-block');
  $("#remove-schedule").css('display', 'inline-block');
  $("#save-schedule").css('display', 'inline-block');
  $("#edit-schedule").css('display', 'none');


  valveCount = $("#irrigation-valve-panel > .valve").length;

  if(valveCount < valveScheduleSavedCount) {
    displayAddValveButton();
  }

  clearTimeout(timer);
  isAlive = false;
}

function disableEditing() {
  // Disable schedule name editing
  $("#edit-schedule-name").toggleClass("enabled disabled");
  $("#edit-schedule-name").css("display", "none");

  // Disable irrigation day editing
  $(".checkbox-inline").each(function() {
    $(this).toggleClass("enabled disabled");
  });

  $(".day-of-week").attr("disabled", "true");

  // Disable start time editing
  $("#program-schedule-div .input-group.start-time").each(function () {
    $(this).toggleClass("enabled disabled");
    $(this).children().toggleClass("enabled disabled");
    $(this).children().attr("disabled", "true");
  });

  // Disable zone editing
  $(".row-irrigation > div > div > div > select").attr("disabled", "true") // disable dropdowns
  $(".row-irrigation > div > div > div > div > span > button").attr("disabled", "true") // disable pause buttons
  $(".row-irrigation > div > button").attr("disabled", "true") // disable remove buttons

  $(".input-group.valve-duration").each(function() {
    $(this).children().attr("disabled", "true");
    $(this).children().toggleClass("enabled disabled");
  });

  // Disable add zone button
  $("#add-valve-button").attr("disabled", "true");

  $("#edit-schedule").css("display", "inline-block");
  $("#undo-schedule").css("display", "none");
  $("#remove-schedule").css("display", "none");
  $("#save-schedule").css("display", "none");
  isAlive = true;
}

function getScheduleListData(pollRate) {
  try {
    var url = apiBaseUrl + "/Schedule/get-schedule";
    var poolData = {
        UserPoolId: localStorage.getItem("upId"),
        ClientId: localStorage.getItem("clientId")
    };
    var userPool = new AWSCognito.CognitoIdentityServiceProvider.CognitoUserPool(poolData);
    var cognitoUser = userPool.getCurrentUser();
    var scheduleTabSelected = 1;
    
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
            "project_name": localStorage.getItem("current_project"),
            "device_name": localStorage.getItem("current_device")
        }),
        dataType: 'json',
        contentType: 'application/json',
        success: function (rawdata) {
          if(isAlive) {
            data = JSON.parse(rawdata);
            
            scheduleList = data["scheduleLists"];
            isMaxie = data["maxie"];
            totalValvesMax = data["total_valves"];

            scheduleTabSelected = $(".active > button").val();
            valveList = createValveDropDownListContent(totalValvesMax);

            // Change schedule format here
            if ((!_.isEqual(data, oldData)) || (scheduleTabSelected !== oldScheduleTabSelected)) {
              console.log("Update UI");
              console.dir(data);
              if (isMaxie) {
                loadTabTitles(scheduleList);
                loadScheduleTitle(scheduleList[scheduleTabSelected]["name"]);
                removeStartTimes();
                selectedSchedule = scheduleList[scheduleTabSelected];
                if (selectedSchedule["active_days"].length > 0) {
                  loadIrrigationDays(selectedSchedule["active_days"]);
                  loadStartTimes(selectedSchedule["timings"]);
                  removeAllIrrigationRows();
                  
                  loadIrrigationRow(selectedSchedule["valve_durations"], data["dosing_program"], totalValvesMax);

                  toggleAddValveButton();
                } else {
                  console.log("Schedule not defined")
                  $(".day-of-week").prop("checked", false);
                  removeAllIrrigationRows();
                  displayAddValveButton();
                }

              }
              oldData = data;
              oldScheduleTabSelected = scheduleTabSelected;
            
              renderCalender();
            }
          }
        },
        complete: function() {
          // isMaxie = false;
          // console.log("isMaxie = " + isMaxie);
          // Schedule the next request when the current one is completed
          if(isAlive && isMaxie) {
            if(pollRate) {
              // console.log("pollRate = " + pollRate);
              timer = setTimeout(getScheduleListData, pollRate);
            } else {
              // console.log("MaxiePollRate = " + MaxiePollRate);
              timer = setTimeout(getScheduleListData, MaxiePollRate);
            }
          } else if(!isAlive && isMaxie) {
              clearTimeout(timer);
          }
        }
      });
    });

  } catch(err) {
    window.location.replace('../../index.html');
  }
}

function loadIrrigationDays(irrigationDays) {
  $(".day-of-week").prop("checked", false);
  for (day of irrigationDays) {
    $("#day-of-week-" + day).prop("checked", true);
  }
}

function loadTabTitles(scheduleList){
  for(var i = 0; i<scheduleList.length; i++){
    title = scheduleList[i]["name"]
    $("#schedule-" + (i+1) + "-btn").html(title.length > 0 ? title : "untitled");
  }
}

function loadScheduleTitle(scheduleName) {
  $("#schedule-name").html(scheduleName);
}

function loadStartTimes(timings) {
  for (let i = 0; i < timings.length; i++) {
    timeStr = timings[i]["start_hr"] + ":" + timings[i]["start_min"];
    $("#datetimepicker"+(i+1)).data("DateTimePicker").date(timeStr);
  }

  for (let i = timings.length; i < 4; i++) {
    $("#datetimepicker"+(i+1)).data("DateTimePicker").clear();
  }
}

function loadIrrigationRow(valveDurations, dosingProgram, totalValvescount) {
  // Load number of zones in this schedule
  valveScheduleSavedCount = valveDurations.length;
  valveListHtmlStr = createValveDropDownListContent(totalValvescount);
  
  // Loop
  for(var i = 0; i < valveScheduleSavedCount; i++) {
    assignedValve = valveDurations[i]["zone"]
    durationHour = valveDurations[i]["hour"];
    durationMinute = valveDurations[i]["minute"];
    isPauseList = valveDurations[i]["pause"];
    
    createIrrigationDurationContentDiv(i+1, assignedValve, valveListHtmlStr, new Date(1989,12,16, durationHour, durationMinute), isPauseList);
  }

  // Register the event handler for delete row button
  registerRemoveIrrigationRowEvent();
  rowId = valveCount
  // Register the event handler for pause start row button
  // registerPausePlayButtonRowEvent();
}

function removeStartTimes() {
  for (var i = 1; i <= 4; i++) {
    $("#datetimepicker" + i).data("DateTimePicker").clear();
  }
}

function toggleLoadingScreen(loadingTime) {
  $("body").toggleClass("loaded");

  // Display loading screen
  setTimeout(function() {
    $("body").toggleClass("loaded");
  }, loadingTime);
}

function createIrrigationDurationContentDiv(row, assignedValve, valveListHtmlStr, storedValveDuration, isPauseList){
  valveCount = $("#irrigation-valve-panel > .valve").length;
  // console.log("valveCount = " + valveCount + "valveScheduleSavedCount = " + valveScheduleSavedCount +  "add row + " +row);
  // console.log();
  if(valveCount < valveScheduleSavedCount) {
    addIrrigationRow(row, valveListHtmlStr, storedValveDuration, true);

    // load zone selected for this row
    $("#valveDropdown-"+row).val(""+assignedValve);

    // TODO: load selected dosing program for this row

  } 
  // else {
  //   // console.log(" Update valveCount = " + valveCount);
  //   // console.log(" Update valveScheduleSavedCount = " + valveScheduleSavedCount);
  //   // console.log("assignedValve = " + assignedValve);

  //   // Update Irrigation Content Div
  //   console.log("storedValveDuration = " + storedValveDuration);
  //   updateIrrigationRow(row, assignedValve, storedValveDuration, isPauseList);
    
  // }
}

function createValveDropDownListContent(totalValveCount) {
  var valveList = "<option value='0'>None</option>";
  
  for(var i=1; i < totalValveCount; i++) {
    valveList += "<option value=" + i + ">" + i + "</option>";
  }
  return valveList;
}

function changeScheduleTab() {
  clearTimeout(timer);
  if (isEditable) {
    disableEditing();
  }
  removeAllIrrigationRows();

  toggleLoadingScreen(MaxieLoadingScreenTimeout);
  getScheduleListData();
}

function registerRemoveIrrigationRowEvent() {
  $(".row-irrigation.valve").on("click", ".iht-btn-row-remover", function() {
    $(this).parent().parent().remove();
    toggleAddValveButton();
  });
}

function togglePause() {
  console.log("togglepause!!");
  // Change to btn-play
  $(this).toggleClass("btn-play btn-pause btn-success btn-warning");

  // change icon to play
  $(this).children().toggleClass("glyphicon-pause glyphicon-play");

  // change isPause attribute to true
  $(this).attr("is-pause", "true");
}

function updatePauseStartTimesButton(row, stNumber, isPause) {
  hasPauseIcon = $("#st" + stNumber + "-"+row).children().hasClass("glyphicon-pause");

  // If pausing the valve at the row is true and has a pause icon, change it to play icon
  if(isPause && hasPauseIcon) {
    // console.log("isPause = " + isPause);
    // console.log("hasPauseIcon = " + hasPauseIcon);
    // Change to Play button
    $("#st" + stNumber + "-"+row).children().toggleClass("glyphicon-pause glyphicon-play");
    
    // change isPause attribute to true
    $("#st" + stNumber + "-"+row).attr("is-pause", "true");
  } else if(!isPause && hasPauseIcon) {
    // Change to pause button
    $("#st" + stNumber + "-"+row).children().toggleClass("glyphicon-pause glyphicon-play");
    
    // change isPause attribute to true
    $("#st" + stNumber + "-"+row).attr("is-pause", "false");
  }
}

function registerPausePlayButtonRowEvent() {
  console.log("register pause play button");
  $(".btn-pause").on("click", function() {
    console.log("pause!!");
    // Change to btn-play
    // $(this).toggleClass("btn-play");
    // $(this).toggleClass("btn-pause");
    $(this).toggleClass("btn-success btn-warning");
      
    // change icon to play
    $(this).children().toggleClass("glyphicon-pause glyphicon-play");
      
    // change isPause attribute to true
    if($(this).attr("is-pause").startsWith("false")) {
      $(this).attr("is-pause", "true");
    } else {
      $(this).attr("is-pause", "false");
    }
    
  });
}
// $(".btn-play").on("click", function() {
//   console.log("play!!");
//   // Change to btn-pause
//   $(this).toggleClass("btn-play btn-pause btn-success btn-warning");

//   // change icon to pause
//   $(this).children().toggleClass("glyphicon-pause glyphicon-play");

//   // change isPause attribute to false
//   $(this).attr("is-pause", "false");
// });


function removeAllIrrigationRows() {
  $("#irrigation-valve-panel").children().remove();
}

function addIrrigationRow(row, valveList, valveDuration, isDisabled){
  valveCount = $("#irrigation-valve-panel > .valve").length;
  disabledClass = "enabled"
  if(isDisabled){
    disabledClass = "disabled"
  }
  valveHtml = 
  '<div class="row row-irrigation valve" value="' + row + '">' + 
    '<div class="col-xs-11 col-sm-11 col-sm-offset-0 col-md-12 col-md-offset-0 col-lg-10 col-lg-offset-1 row-text-align">' +
    '</div>' +
    '<div class="col-xs-10 col-xs-offset-0 col-sm-10 col-sm-offset-0 col-md-9 col-md-offset-1 col-lg-9 col-lg-offset-1">' +
      '<div class="row">' +
        '<div class="col-xs-10 col-xs-offset-2 col-sm-4 col-sm-offset-1 col-md-3 col-md-offset-0 col-lg-3 col-lg-offset-1 row-text-align" style="display:flex;flex-direction:row">' +
          '<span class="col-xs-10 col-xs-offset-0 col-sm-4 col-sm-offset-0 col-md-8 col-md-offset-0 col-lg-4 col-lg-offset-0 row-text-align">' +
            'Valve:' +
          '</span>' +
          '<select class="col-xs-10 col-xs-offset-0 col-sm-4 col-sm-offset-1 col-md-8 col-md-offset-0 col-lg-4 col-lg-offset-0 form-control valve-dropdown" id="valveDropdown-' + row + '" ' + disabledClass + '>' +
            valveList +
          '</select>' +
        '</div>' +
        '<div class="col-xs-10 col-xs-offset-2 col-sm-6 col-sm-offset-1 col-md-5 col-md-offset-2 col-lg-4 col-lg-offset-2 row-text-align" style="display:flex;flex-direction:row">' +
          '<span class="col-xs-6 col-xs-offset-0 col-sm-5 col-sm-offset-1 col-md-3 col-md-offset-0 col-lg-4 col-lg-offset-0 row-text-align">' +
            'Duration:' +
          '</span>' +
          '<div class="col-xs-7 col-xs-offset-0 col-sm-6 col-sm-offset-0 col-md-10 col-md-offset-1 col-lg-10 col-lg-offset-0" style="padding:0px">' +
            '<div class="input-group valve-duration ' + disabledClass + '" id="duration-' + row + '" name>' +
              '<input type="text" class="form-control ' + disabledClass + '" id="duration-input-' + row + '" placeholder="HH:mm" style="white-space: pre" ' + disabledClass + '>' +
              '<span class="input-group-addon ' + disabledClass + '">' +
                '<span class="glyphicon glyphicon-time"></span>' +
              '</span>' +
            '</div>' +
          '</div>' +
        '</div>' +
        // '<div class="col-xs-10 col-xs-offset-2 col-sm-6 col-sm-offset-3 col-md-4 col-md-offset-0 col-lg-4 col-lg-offset-0 row-text-align" style="display:flex;flex-direction:row">' +
        //   '<span class="col-xs-10 col-xs-offset-0 col-sm-6 col-sm-offset-0 col-md-8 col-md-offset-0 col-lg-4 col-lg-offset-0 row-text-align">' +
        //     'Dosing:' +
        //   '</span>' +
        //   '<select class="form-control" id="dosing-' + row + '" ' + disabledClass + '>' +
        //     '<option value="NA">None</option>' +
        //     '<option value="program_1">Program 1</option>' +
        //   '</select>' +
        // '</div>' +
        // '<div class="col-xs-11 col-xs-offset-0 col-sm-11 col-sm-offset-1 col-md-10 col-md-offset-1 col-lg-offset-1 row-text-align col-lg-10">' +
        //   '<div class="row">' +
        //     '<div class="col-xs-2 col-xs-offset-3 col-sm-1 col-sm-offset-0 col-md-1 col-lg-offset-0 row-text-align"> ' +
        //       '<span class="row-text-align" style="margin-right:0px">' +
        //         'T1:' +
        //       '</span>' +
        //     '</div> ' +
        //     '<span class="col-xs-2 col-xs-offset-0 col-sm-2 col-sm-offset-0 col-md-2">' +
        //       '<button type="button" class="btn btn-warning iht-btn-square btn-pause" ' + disabledClass + ' is-pause="false" id="st1-' + row + '"> ' +
        //         '<span class="glyphicon glyphicon-pause"></span> ' +
        //       '</button>' +
        //     '</span> ' +
        //     '<div class="col-xs-2 col-xs-offset-1 col-sm-1 col-sm-offset-0 col-md-1 row-text-align">' +
        //       '<span class="row-text-align">' +
        //         'T2:' +
        //       '</span>' +
        //     '</div> ' +
        //     '<span class="col-xs-2 col-xs-offset-0 col-sm-2 col-sm-offset-0 col-md-2">' +
        //       '<button type="button" class="btn btn-warning iht-btn-square btn-pause" ' + disabledClass + ' is-pause="false" id="st2-' + row + '">' +
        //         '<span class="glyphicon glyphicon-pause"></span> ' +
        //       '</button>' +
        //     '</span> ' +
        //     '<div class="col-xs-2 col-xs-offset-3 col-sm-1 col-sm-offset-0 col-md-1 row-text-align"> ' +
        //       '<span class="row-text-align">' +
        //         'T3:' +
        //       '</span>' +
        //     '</div>' +
        //     '<span class="col-xs-2 col-xs-offset-0 col-sm-2 col-sm-offset-0 col-md-2">' +
        //       '<button type="button" class="btn btn-warning iht-btn-square btn-pause" ' + disabledClass + ' is-pause="false" id="st3-' + row + '"> ' +
        //         '<span class="glyphicon glyphicon-pause"></span>' +
        //       '</button>' +
        //     '</span>' +
        //     '<div class="col-xs-2 col-xs-offset-1 col-sm-1 col-sm-offset-0 col-md-1 row-text-align" >' +
        //       '<span class="row-text-align">' +
        //         'T4:' +
        //       '</span>' +
        //     '</div>' +
        //     '<span class="col-xs-2 col-xs-offset-0 col-sm-2 col-sm-offset-0 col-md-2">' +
        //       '<button type="button" class="btn btn-warning iht-btn-square btn-pause" ' + disabledClass + ' is-pause="false" id="st4-' + row + '"> ' +
        //         '<span class="glyphicon glyphicon-pause"></span>' +
        //       '</button>' +
        //     '</span>' +
        //   '</div>' +
        // '</div>' +
      '</div>' +
    '</div>' +
    '<div class="col-xs-8 col-xs-offset-2 col-sm-2 col-sm-offset-0 col-lg-pull-0 row-text-align col-lg-offset-0">' +
      '<button type="button" class="btn btn-danger iht-btn-row-remover" ' + disabledClass + '>' +
        '<i class="glyphicon glyphicon-remove"></i>' +
      '</button>' +
    '</div>' +
    '<div class="col-xs-10 col-xs-offset-1 col-sm-10 col-sm-offset-1 col-md-10 col-md-offset-1 col-lg-10 col-lg-offset-1 row-text-align irrigation-row-divider">' +
    '</div>' +
  '</div>'
  // console.log("valveCount = " + valveCount + " valveScheduleSavedCount = " + valveScheduleSavedCount);

  // displayAddValveButton();
  
  $("#irrigation-valve-panel").append(valveHtml);
  toggleAddValveButton();
  
  $("#duration-" + row).datetimepicker({
    format: "HH:mm",
    defaultDate: new Date(1989, 12, 16, 0, defaultDuration),
    useCurrent: false
  });

  $("#duration-" + row).data("DateTimePicker").date(valveDuration);
}

// function updateIrrigationRow(row, assignedValve, valveDuration, isPauseList){
//   console.log("row = " + row);
//   console.log($("#duration-"+row));
//   console.log("assignedValve = " + assignedValve);
//   // Update selected valve
//   $("#valveDropdown-"+row).val(""+assignedValve);

//   // Update duration
//   $("#duration-"+row).datetimepicker({
//     format: "HH:mm",
//     defaultDate: new Date(1989, 12, 16, 0, 0),
//     useCurrent: false
//   });
  
//   $("#duration-"+row).data("DateTimePicker").date(valveDuration);

//   // TODO: Update selected dosing program

//   // Update st1, st2, st3, st4
//   updatePauseStartTimesButton(row, 1, isPauseList[0]);
//   updatePauseStartTimesButton(row, 2, isPauseList[1]);
//   updatePauseStartTimesButton(row, 3, isPauseList[2]);
//   updatePauseStartTimesButton(row, 4, isPauseList[3]);
//   // console.log(isPauseList);
//   // if() {

//   // }
  
//   // $("#st2-"+row)
//   // $("#st3-"+row)
//   // $("#st4-"+row)
// }

function toggleAddValveButton() {
  valveCount = $("#irrigation-valve-panel > .valve").length;
  valveCount < totalValvesMax - 1 ? displayAddValveButton() : hideAddValveButton();  
}

function displayAddValveButton() {
  $("#add-valve-button").css("display", "inline-block");
}

function hideAddValveButton() {
  $("#add-valve-button").css("display", "none");
}

function renderCalender() {
  events = processScheduleEvents(oldData["scheduleLists"]);

  var calendarEl = document.getElementById('schedule-calendar');
  var calendar = new FullCalendar.Calendar(calendarEl, {
  initialView: 'timeGridWeek',
  initialDate: new Date().toISOString(),
  headerToolbar: {
    left: 'prev,next today',
    center: 'title',
    right: 'dayGridMonth,timeGridWeek,timeGridDay'
  },
  events: events
});
calendar.render();
}

/**
 * Processes schedule information in `oldData` so that it can be read and rendered by FullCalendar
 */
function processScheduleEvents(scheduleList) {
  console.log("In processScheduleEvents, received schedule list:", scheduleList);

  events = [];
  colors = ["#07a9de", "#82b843", "#f7ae2b"]

  for (let i = 0; i < 3; i++) {
    schedule = scheduleList[i];
    timings = schedule["timings"];
    for (let j = 0; j < timings.length; j++) {
      timing = timings[j];
      events.push({
        groupId: (i+1).toString(),
        title: schedule["name"],
        daysOfWeek: schedule["active_days"].map(x => (x + 1)%7),
        startRecur: schedule["last_updated"],
        startTime: parseToTimeStr(timing["start_hr"], timing["start_min"]),
        endTime: parseToTimeStr(timing["end_hr"], timing["end_min"]),
        color: colors[i]
      })
    }
  }
  return events;
}