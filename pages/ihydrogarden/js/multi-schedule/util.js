// UTILITY FUNCTIONS **************************************************************************************************

/**
 * Checks the sequence of start times entered by the user to make sure that they are arranged from earliest to latest
 * 
 * @returns boolean 
 */
function validStartTimes() {
  startTimes = getStartTimeList();
  for (let i = 1; i < startTimes.length; i++) {
    if (startTimes[i] <= startTimes[i - 1]) {
      return false;
    }
  }
  return true;
}

/**
 * Checks whether there are any duplicate zone numbers specified in the irrigation duration field
 * 
 * @returns boolean
 */
function validZoneSelection() {
  zones = {}
  isValid = true;
  $(".row-irrigation.valve").each(function() {
    $(this).find(".valve-dropdown").each(function() {
      zoneId = parseInt($("#" + this.id + " option:selected").text());
      if (zoneId != NaN) {
        if (zones[zoneId]) {
          isValid = false;
        }
        zones[zoneId] = true;
      }
    });
  });

  return isValid;
}

/**
 * Checks whether valve irrigation conflicts with start times. If the irrigation duration is longer than the time elapsed
 * between any 2 successive start times, there is a conflict.
 * 
 * @returns boolean 
 */
function validIrrigationDuration(settings) {
  totalTime = getTotalIrrigationTime(settings);
  startTimes = getStartTimeList()

  for (let i = 1; i < startTimes.length; i++) {
    timeDiff = startTimes[i] - startTimes[i - 1];
    if (totalTime > timeDiff) {
      return false;
    }
  }
  return true;
}

/**
 * Parses all 4 start time input fields. Valid inputs are pushed into an array. Time format is converted to minutes 
 * (e.g. 09:30 is 9 * 60 + 30 = 570)
 * 
 * @returns an array of start times 
 */
function getStartTimeList() {
  startTimes = [];
  for (let i = 1; i <= 4; i++) {
    if ($("#start-time-" + i).val() != "") {
      date = $("#datetimepicker" + i).data("DateTimePicker").date();
      startTimes.push(date.hour() * 60 + date.minute());
    }
  }
  return startTimes;
}

/**
 * Returns the total irrigation duration by adding the time durations across all valid valves
 */
function getTotalIrrigationTime(settings) {
  valveCount = $("#irrigation-valve-panel > .valve").length;
  total = 0;
  let valveElementList = document.getElementsByClassName("valve-duration");

  for (let i = 0; i < valveElementList.length; i++) {
    if ($("#valveDropdown-" + i).val() != "0") {
      let durationId = valveElementList[i].id;
      tmp = durationId.split("-");
      tmp_id = tmp[1];
      let selected_zone = "zone_" + $("#valveDropdown-" + tmp_id).val();

      relay_type = settings[selected_zone]["type"]
      if(relay_type === "relay-light") {
        date = $("#" + durationId).data("DateTimePicker").date();
        total = date.hour() * 60 + date.minute();
      } else{
        date = $("#" + durationId).data("DateTimePicker").date();
        total += date.hour() * 60 + date.minute();
      }
      
    }
  }
  return total;
}

/**
 * Takes in 2 int values representing hours and minutes and coverts them into a string in "HH:MM" format
 */
function parseToTimeStr(hr, min) {
  hrStr = hr < 10 ? "0" + hr : hr.toString();
  minStr = min < 10 ? "0" + min : min.toString();
  return `${hrStr}:${minStr}`
}

function getScheduleName() {
  return $("#schedule-name").text();
}

function getScheduleId() {
  return parseInt($("li.active > button.iht-btn-tab").attr("value")) + 1;
}

function getScheduleActiveDays() {
  var daysOfWeek = [];
  // $("input:checkbox.day-of-week").each(function () {
  $("input:checkbox.text-nicelabel").each(function () {
    if (this.checked) daysOfWeek.push(parseInt($(this).val()));
  });

  return daysOfWeek;
}

function getScheduleTimings(settings) {
  var timings = [];

  irrigationTime = getTotalIrrigationTime(settings);
  $("#schedulingStartTime").find(".date").each(function () {
    var startTimesInput = $("#" + this.id + " > input:text").val();
    
    //TODO: Remove these
    if (localStorage.getItem("current_project") == "VFS" || localStorage.getItem("current_project") == "mqttdemo") {
      delayByMin = 1
    } else {
      delayByMin = 0
    }
    

    if (startTimesInput.indexOf(":") !== -1) {
      var date = $("#" + this.id).data("DateTimePicker").date();
      startHr = date.hour();
      startMin = date.minute();
      endTime = startHr * 60 + startMin + irrigationTime;
      endHr = parseInt(endTime / 60);
      endMin = parseInt(endTime % 60);
      
      timings.push({
        "start_hr": startHr,
        "start_min": startMin,
        "delay_by_min": delayByMin, // add a delay (minutes 1 to 59) to start minute
        "end_hr": endHr,
        "end_min": endMin
      })
    }
  });

  return timings;
}

function getIrrigationDurations() {
  var zone = "";
  var interval = false;

  var result = [];

  $(".row-irrigation.valve").each(function () {
    zoneSetting = {};
    rowValid = true;

    $(this).find(".valve-dropdown").each(function () {
      zone = $("#" + this.id + " option:selected").text();
      if (zone.startsWith("None")) {
        zone = "-1";
        rowValid = false
      }
      zoneSetting["zone"] = parseInt(zone);
    });

    $(this).find(".valve-duration").each(function () {
      var date = $("#" + this.id).data("DateTimePicker").date();
      zoneSetting["hour"] = date.hour();
      zoneSetting["minute"] = date.minute();
    });

    $(this).find(".valve-delay-duration").each(function () {
      var date = $("#" + this.id).data("DateTimePicker").date();
      zoneSetting["delay_by_min"] = date.minute();
    });

    // $(this).find(".iht-btn-square").each(function () {
    //   isPauseStr = $(this).attr("is-pause");

    //   zoneSetting["pause"] = isPauseStr.startsWith("true")
    // });

    //TODO: need to implement pausing individual start times
    zoneSetting["pause"] = false;
    zoneSetting["interval"] = false;

    if (rowValid) {
      result.push(zoneSetting);
    }
  });
  return result;
}

function saveSchedule(scheduleData) {
  var url = "https://" + id + ".execute-api.ap-southeast-1.amazonaws.com/" + stage + "/Schedule/set-schedule";
  var poolData = {
    UserPoolId: localStorage.getItem("upId"),
    ClientId: localStorage.getItem("clientId")
  };
  var userPool = new AWSCognito.CognitoIdentityServiceProvider.CognitoUserPool(poolData);
  var cognitoUser = userPool.getCurrentUser();

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
      data: scheduleData,
      dataType: 'json',
      contentType: 'application/json',
      success: function (data) {
        // Schedule saved and published to device
        console.log("published to device");
        // console.dir(JSON.parse(data));

      },
      complete: function (data) {
        getScheduleListData(2000);
        disableEditing();
      }
    });
  });

}