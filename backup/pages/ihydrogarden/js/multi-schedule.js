var weekday = new Array(7);
weekday[1] = "Monday";
weekday[2] = "Tuesday";
weekday[3] = "Wednesday";
weekday[4] = "Thursday";
weekday[5] = "Friday";
weekday[6] = "Saturday";
weekday[7] = "Sunday";
MaxiePollRate = 3000;
MaxieLoadingScreenTimeout = 4000;
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

$(document).ready(function() {
  // Display loading screen
  setTimeout(function() {
    $("body").toggleClass("loaded");
  }, MaxieLoadingScreenTimeout);
  startSchedulePoller();

  // Session will expire at 1 hour
  setTimeout(function() {
    alert("Session Expired!!");
    window.location.replace('../../index.html');
  }, 3600000);
});

function startSchedulePoller(pollRate) {
  getScheduleListData();
}

// **********************************************************************************************************************

$("#edit-schedule-name").click(function() {
  $("#schedule-details-modal").modal("show");
});

$("#new-schedule-name").keypress(function() {
  maxCharacters = 20;
  if(this.value.length > maxCharacters) {
    return false;
  }
  $("#remainingC").html("Remaining characters : " +(maxCharacters - this.value.length) + "/" + maxCharacters);
});

$("#schedule-1-btn").click(function() {
  // Load schedule 1 data
  console.log("load schedule 1 data");
  changeScheduleTab();
});

$("#schedule-2-btn").click(function() {
  // Load schedule 2 data
  console.log("load schedule 2 data");
  changeScheduleTab();
});

$("#schedule-3-btn").click(function() {
  // Load schedule 3 data
  console.log("load schedule 3 data");
  changeScheduleTab();
});

$("#add-valve-button").click(function() {
  valveCount = $("#irrigation-valve-panel > .valve").length;
  row = valveCount + 1;
  if(valveCount < totalValvesMax) {
    // console.log("add-valve-button");
    // console.log(valveList);
    console.log("add row = " + row);
    addIrrigationRow(row, valveList, defaultDate, false);

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
$("#edit-schedule").click(function() {
  isEditable = true;
  enableEditing();
});

// Undo edit schedule
$("#undo-schedule").click(function() {
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

// Save user configured schedule
$("#save-schedule").click(function () {  
  var schdName = "";
  var scheduleList = [];
  
  var startHours = [];
  var startMinutes = [];
  var startDoWs = [];
  
  var startMinute = [];
  var start = {"hour":startHours, "minute":startMinutes};

  var scheduleId = getScheduleId();

  isEditable = false;

  // Get schedule's name
  schdName = getScheduleName();

  // Get schedule's irrigation days
  startDoWs = getDayOfWeek();
  console.log("startDoWs = " + startDoWs);

  // Get schedule start times
  start = getStartTimes(startDoWs);

  // Get valves irrigation duration, dosing, and is pause
  scheduleList = getIrrigationSchedules(start);
  
  // Convert into json object
  data = JSON.stringify({
    "project_name":localStorage.getItem("current_project"),
    "device_name":localStorage.getItem("current_device"),
    "scheduleId":scheduleId,
    "name":schdName,
    "schedules":scheduleList
  });

  console.log(data);

  // Publish to cloud, remove rows and get the updated data
  saveSchedule(data);

  // // Remove all valve irrigation rows
  // removeAllIrrigationRows();

  toggleLoadingScreen(MaxieLoadingScreenTimeout);
  // clearTimeout(timer);
  
  // getScheduleListData();
  // toggleLoadingScreen(5000);
  // disableEditing(); 

});

// Remove user configured schedule
$("#remove-schedule").click(function() {
  isEditable = false;
  var scheduleList = [];

  var scheduleId = getScheduleId();
  // Get schedule's name
  var schdName = getScheduleName();

  // Convert into json object
  data = JSON.stringify({
    "project_name":localStorage.getItem("current_project"),
    "device_name":localStorage.getItem("current_device"),
    "scheduleId":scheduleId,
    "name":schdName,
    "schedules":scheduleList
  });

  console.log(data);

  // Publish to cloud
  saveSchedule(data);

  // Remove all valve irrigation rows
  removeAllIrrigationRows();

  toggleLoadingScreen(MaxieLoadingScreenTimeout);
});
// **********************************************************************************************************************

function getScheduleName() {
  var schdName = $("#schedule-name").text();
  return schdName;
}

function getScheduleId() {
  return parseInt($("li.active > button.iht-btn-tab").attr("value")) + 1;
}

function getDayOfWeek() {
  var day_of_week = [];
  $("input:checkbox.day-of-week").each(function() {
    if(this.checked) day_of_week.push(parseInt($(this).val()));
  });

  return day_of_week;
}

function getStartTimes(startDoWs) {
  var startHours = [];
  var startMinutes = [];
  var startMonth = "";
  var startYear = "";
  var startDay = "";
  var start = {"hour":startHours, "minute":startMinutes};
  var result;

  var today = new Date();
  startDay = today.getDate();
  // In Javascript January is 0! Also to adjust value to fit in boundary
  startMonth = today.getMonth() + 1; 
  startYear = today.getFullYear();

  // Populate start times
  $("#schedulingStartTime").find(".date").each(function() {
    var date = $("#"+this.id).data("DateTimePicker").date();
    
    var startTimesInput = $("#" + this.id + " > input:text").val()

    if(startTimesInput.indexOf(":") !== -1){
      startHours.push(date.hour());
      startMinutes.push(date.minute());
    } else{
      $("#" + this.id).datetimepicker({
        format: "HH:mm",
        useCurrent: false
      });
    }
    
  });
  result = {"hour":startHours, "minute":startMinutes, "day_of_week":startDoWs, "month":startMonth, "year":startYear, "day":startDay};
  return result
}

function getIrrigationSchedules(start) {
  var schd = {};
  var zone = "";
  var durationHour = [];
  var durationMinute = [];
  var duration = {
    "hour":durationHour,
    "minute":durationMinute
  };
  var interval = false;
  var pause = [];

  var result = [];

  $(".row-irrigation.valve").each(function() {
    durationHour = [];
    durationMinute = [];
    $(this).find(".valve-duration").each(function() {
      var date = $("#"+this.id).data("DateTimePicker").date();
      durationHour.push(date.hour());
      durationMinute.push(date.minute());
    });

    duration = {
      "hour":durationHour,
      "minute":durationMinute
    };
    
    $(this).find(".valve-dropdown").each(function() {
      zone = $("#" + this.id + " option:selected").text();
      if(zone.startsWith("None")) {
        zone = "-1"
      }
    });

    $(this).find(".iht-btn-square").each(function() {
      // console.log($(this));
      isPauseStr = $(this).attr("is-pause");
      if(isPauseStr.startsWith("true")) {
        pause.push(true);
      } else {
        pause.push(false);
      }
    });

    //TODO: need to implement pausing individual start times
    pause = [false, false, false, false]
    schd = {"zone":parseInt(zone), "start":start, "duration":duration, "interval":interval, "pause":pause}
    result.push(schd);
    pause = []; // clear the array
  });
  return result;
}

function saveSchedule(scheduleData) {
  // var url = "https://xst0w6o6q2.execute-api.ap-southeast-1.amazonaws.com/dev/Schedule/set-schedule";
  var url = "https://" + id + ".execute-api.ap-southeast-1.amazonaws.com/" + stage + "/Schedule/set-schedule";
  var poolData = {
    UserPoolId: localStorage.getItem("upId"),
    ClientId: localStorage.getItem("clientId")
  };
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
        data: scheduleData,
        dataType: 'json',
        contentType: 'application/json',
        success: function(data)
        {
          // Schedule saved and published to device
          console.log("published to device");
          console.dir(data);
          
        },
        complete: function(data)
        {
          getScheduleListData(2000);
          
          disableEditing(); 
        }
      });
    });
  } else {
    // alert("Please login!!");
    window.location.replace('../../index.html');
  }

}

// **********************************************************************************************************************

function setScheduleName() {
  newName = $("#new-schedule-name").val();
  $("#schedule-name").html(newName);
  $("#schedule-1-btn").html(newName);
  $("#schedule-details-modal").modal("hide");
}

function enableEditing() {
  // if(isEditable){
    // Enable edit for schedule name
    // $("#edit-schedule-name").toggleClass("disabled");
    $("#edit-schedule-name.disabled").toggleClass("enabled");
    $("#edit-schedule-name.disabled").toggleClass("disabled");
    $("#edit-schedule-name").css("display", "inline-block");

    // console.log("enable editing");
    // Enable edit for irrigation days
    $(".checkbox-inline.disabled").each(function() {
      $(this).toggleClass("enabled");
      // $(this).children().removeAttr("disabled");
      $(this).toggleClass("disabled");  
    });

    $(".day-of-week").removeAttr("disabled");

    // Enable edit for irrigation start times
    $("#program-schedule-div .input-group.start-time.disabled").each(function() {
      $(this).children().toggleClass("disabled");
      $(this).toggleClass("disabled");
      $(this).toggleClass("enabled");
      $(this).children().removeAttr("disabled");
    });

    // Enable edit for irrigation rows
    $(".row-irrigation > div > button").removeAttr("disabled"); // enable remove buttons
    $(".row-irrigation > div > div > div > select").removeAttr("disabled"); // enable dropdowns
    $(".row-irrigation > div > div > div > div > span > button").removeAttr("disabled"); // enable pause buttons
    console.log("enable pause button")
    $(".row-irrigation > div > div > div > div > span > button").attr("enabled", "true"); // enable pause buttons
    

    $(".input-group.valve-duration.disabled").each(function() {
      $(this).children().removeAttr("disabled");
      $(this).children().toggleClass("enabled");
      $(this).children().toggleClass("disabled");
    });

    $(".input-group.valve-duration.disabled").toggleClass("enabled");
    $(".input-group.valve-duration.disabled").toggleClass("disabled");

    // Enable add zone button
    $("#add-valve-button").removeAttr("disabled");

    $("#undo-schedule").css('display', 'inline-block');
    $("#remove-schedule").css('display', 'inline-block');
    $("#save-schedule").css('display', 'inline-block');
    $("#edit-schedule").css('display', 'none');
  // }

  valveCount = $("#irrigation-valve-panel > .valve").length;

  if(valveCount < valveScheduleSavedCount) {
    displayAddValveButton();
  }

  clearTimeout(timer);
  isAlive = false;
}

function disableEditing() {
  
  // Disable edit for schedule name
  $("#edit-schedule-name.enabled").toggleClass("disabled");
  $("#edit-schedule-name.enabled").toggleClass("enabled");
  $("#edit-schedule-name").css("display", "none");

  // Disable edit for irrigation days
  $(".checkbox-inline.enabled").each(function() {
    // $(this).children().attr("disabled");
    $(this).toggleClass("disabled");
    $(this).toggleClass("enabled");    
  });

  $(".day-of-week").attr("disabled", "true");

  // Disable edit for irrigation start times
  $("#program-schedule-div .input-group.start-time.enabled").each(function() {
    $(this).toggleClass("disabled");
    $(this).toggleClass("enabled");
    $(this).children().attr("disabled", "true");
    $(this).children().toggleClass("disabled");
  });

  // Disable edit for irrigation rows
  $(".row-irrigation > div > div > div > select").attr("disabled", "true") // disable dropdowns
  console.log("disable disable pause buttons!!!!");
  $(".row-irrigation > div > div > div > div > span > button").attr("disabled", "true") // disable pause buttons
  $(".row-irrigation > div > button").attr("disabled", "true") // disable remove buttons

  $(".input-group.valve-duration.enabled").each(function() {
    $(this).children().attr("disabled", "true");
    $(this).children().toggleClass("disabled");
    $(this).children().toggleClass("enabled");
  });

  // Disable add zone button
  $("#add-valve-button").attr("disabled", "true");

  $("#edit-schedule").css("display", "inline-block");
  $("#undo-schedule").css("display", "none");
  $("#remove-schedule").css("display", "none");
  $("#save-schedule").css("display", "none");
  isAlive = true;
}

$(function () {
  $(".date").datetimepicker({
      format: "HH:mm"
  });

  $(".date-duration").datetimepicker({
      format: "HH:mm",
      defaultDate: defaultDate,
      useCurrent: false
  });
  // $(".date-duration > input:text").val("");
});

function getScheduleListData(pollRate) {
  try {
    var url = "https://" + id + ".execute-api.ap-southeast-1.amazonaws.com/" + stage + "/Schedule/get-schedule";
    var poolData = {
        UserPoolId: localStorage.getItem("upId"),
        ClientId: localStorage.getItem("clientId")
    };
    var userPool = new AWSCognito.CognitoIdentityServiceProvider.CognitoUserPool(poolData);
    var cognitoUser = userPool.getCurrentUser();
    var scheduleTabSelected = 1;
    // var retrievedData
    // console.log(cognitoUser)
    if (cognitoUser != null) {
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
              
              isMaxie = data["maxie"];
              scheduleTabSelected = $(".active > button").val();
              totalValvesMax = data["total_valves"];
              valveList = createValveDropDownListContent(totalValvesMax);
              if((!_.isEqual(data, oldData)) || (scheduleTabSelected !== oldScheduleTabSelected)) {
                console.log("Update UI");
                console.dir(data);
                if(isMaxie) {
                  // Load tab title
                  loadTabTitle(data["scheduleLists"]);
  
                  // Load schedule title
                  loadScheduleTitle(data["scheduleLists"][scheduleTabSelected]["name"]);
  
                  // Remove all start time
                  removeStartTimes();
  
                  if(data["scheduleLists"][scheduleTabSelected]["schedules"].length > 0) {
                    // Load irrigation days
                    loadIrrigationDays(data["scheduleLists"][scheduleTabSelected]["schedules"][0]["start"]["day_of_week"]);
                    
                    // Load start times
                    loadStartTimes(data["scheduleLists"][scheduleTabSelected]["schedules"][0]["start"]);
  
                    // // Remove all irrigation rows
                    removeAllIrrigationRows();
                    
                    // Load irrigation rows
                    loadIrrigationRow(data["scheduleLists"][scheduleTabSelected]["schedules"], data["dosing_program"], totalValvesMax);
  
                    toggleAddValveButton();
                  } else {
                    console.log("Schedule not defined")
  
                    // Uncheck all irrigation days
                    $(".day-of-week").prop("checked", false);
  
                    // Remove all irrigation rows
                    removeAllIrrigationRows();
  
                    displayAddValveButton();
                  }
  
                  oldData = data
                }
                oldData = data;
                oldScheduleTabSelected = scheduleTabSelected;
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
            } else {
              document.location.href = "schedule-ori.html";
            }
          }
        });
      });
    } else {
      alert("Please login!!");
      window.location.replace('../../index.html');
    }
  } catch(err) {
    window.location.replace('../../index.html');
  }
}

function loadIrrigationDays(irrigationDays) {
  // clearPreviousSetting();
  $(".day-of-week").prop("checked", false);
  for (var index in irrigationDays) {
    day = irrigationDays[index];
    $("#day-of-week-" + day).prop("checked", true);
  }
}

function loadTabTitle(scheduleList){
  for(var i=1; i<=scheduleList.length; i++){
    $("#schedule-" + i + "-btn").html(scheduleList[i-1]["name"]);
  }
}

function loadScheduleTitle(scheduleName) {
  $("#schedule-name").html(scheduleName);
}

function loadStartTimes(data) {
  var startHour = data["hour"]; // Get from zone 1
  var startMinute = data["minute"];

  for (var i = 1; i <= 4; i++) {
    // createStartTimes(j, i, newRow);
    var storedDate = "Invalid Date";
    // console.log("startHour.length = " + startHour.length);
    if(startHour.length >= i) {
      storedDate = new Date(1989, 12, 16, startHour[i - 1], startMinute[i - 1]);
    }
    
    if(storedDate == "Invalid Date") {
      $("#datetimepicker"+i).datetimepicker({
        format: "HH:mm",
        useCurrent: false
      });

      var date = $("#datetimepicker"+i).data("DateTimePicker").date();
    } else {
      $("#datetimepicker"+i).datetimepicker({
        format: "HH:mm",
        defaultDate: defaultDate,
        useCurrent: false
      });
      $("#datetimepicker"+i).data("DateTimePicker").date(storedDate);
    }
  }
}

function loadIrrigationRow(valveIrrigationData, dosingProgram, totalValvescount) {
  // Load number of zones in this schedule
  valveScheduleSavedCount = valveIrrigationData.length;
  valveListHtmlStr = createValveDropDownListContent(totalValvescount);
  
  // Loop
  for(var i = 1; i <= valveScheduleSavedCount; i++) {
    assignedValve = valveIrrigationData[i-1]["zone"]
    durationHour = valveIrrigationData[i-1]["duration"]["hour"][0];
    durationMinute = valveIrrigationData[i-1]["duration"]["minute"][0];
    isPauseList = valveIrrigationData[i-1]["pause"]
    // console.log("create row >>> " + i);
    createIrrigationDurationContentDiv(i, assignedValve, valveListHtmlStr, new Date(1989,12,16, durationHour, durationMinute), isPauseList);
    
    // $("#valveDropdown-"+i).val(""+assignedValve);
    
    // dosing = dosingProgram["zone_"+i];

    // $("#valveDropdown-"+i).val(""+assignedValve);
  }

  // Register the event handler for delete row button
  registerRemoveIrrigationRowEvent();

  // Register the event handler for pause start row button
  // registerPausePlayButtonRowEvent();
}

function removeStartTimes() {
  for (var i = 1; i <= 4; i++) {
    $("#datetimepicker"+i).data("DateTimePicker").date(new Date(1989, 12, 16, 0, 0));
    $("#datetimepicker"+i + " > input:text").val("")
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
  disableEditing();
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
  $(this).toggleClass("btn-play");
  $(this).toggleClass("btn-pause");
  $(this).toggleClass("btn-success");
  $(this).toggleClass("btn-warning");

  // change icon to play
  $(this).children().toggleClass("glyphicon-pause");
  $(this).children().toggleClass("glyphicon-play");

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
    $("#st" + stNumber + "-"+row).children().toggleClass("glyphicon-pause");
    $("#st" + stNumber + "-"+row).children().toggleClass("glyphicon-play");

    // change isPause attribute to true
    $("#st" + stNumber + "-"+row).attr("is-pause", "true");
  } else if(!isPause && hasPauseIcon) {
    // Change to pause button
    $("#st" + stNumber + "-"+row).children().toggleClass("glyphicon-pause");
    $("#st" + stNumber + "-"+row).children().toggleClass("glyphicon-play");

    // change isPause attribute to true
    $("#st" + stNumber + "-"+row).attr("is-pause", "false");
  }
}

function registerPausePlayButtonRowEvent() {
  console.log("register pause play button");
  $(".btn-pause").click(function() {
    console.log("pause!!");
    // Change to btn-play
    // $(this).toggleClass("btn-play");
    // $(this).toggleClass("btn-pause");
    $(this).toggleClass("btn-success");
    $(this).toggleClass("btn-warning");
  
    // change icon to play
    $(this).children().toggleClass("glyphicon-pause");
    $(this).children().toggleClass("glyphicon-play");
  
    // change isPause attribute to true
    if($(this).attr("is-pause").startsWith("false")) {
      $(this).attr("is-pause", "true");
    } else {
      $(this).attr("is-pause", "false");
    }
    
  });
  
  // $(".btn-play").click(function() {
  //   console.log("play!!");
  //   // Change to btn-pause
  //   $(this).toggleClass("btn-play");
  //   $(this).toggleClass("btn-pause");
  //   $(this).toggleClass("btn-success");
  //   $(this).toggleClass("btn-warning");
  
  //   // change icon to pause
  //   $(this).children().toggleClass("glyphicon-pause");
  //   $(this).children().toggleClass("glyphicon-play");
  
  //   // change isPause attribute to false
  //   $(this).attr("is-pause", "false");
  // });
}

function removeAllIrrigationRows() {
  // console.log("removeAllIrrigationRows");
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
              '<input type="text" class="form-control" placeholder="HH:mm" style="white-space: pre" ' + disabledClass + '>' +
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
  $("#duration-"+row).datetimepicker({
    format: "HH:mm",
    defaultDate: new Date(1989, 12, 16, 0, defaultDuration),
    useCurrent: false
  });
  $("#duration-"+row).data("DateTimePicker").date(valveDuration);
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
  if(valveCount < (totalValvesMax-1)) {
    displayAddValveButton();    
  } else {
    hideAddValveButton();
  }
}

function displayAddValveButton() {
  $("#add-valve-button").css("display", "inline-block");
}

function hideAddValveButton() {
  $("#add-valve-button").css("display", "none");
}

