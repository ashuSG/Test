// console.log("SAVE...");
// isMaxie = $('#maxie-schedule-div').is(":visible");
// console.log(isMaxie);

$("#saveChanges").click(function() {
  var isMaxie = $('#maxie-schedule-div').is(":visible");
  // console.log(isMaxie);
  var day_of_week = [];
  var startHours = [];
  var startMinutes = [];
  var durationHours = [];
  var durationMinutes = [];
  var zones = [];
  var zonesPause = [];
  var year = 0;
  // Boundary based on https://apscheduler.readthedocs.io/en/latest/modules/triggers/cron.html#module-apscheduler.triggers.cron
  var month = 1; // (1 - 12)
  var day = 1; // (1 - 31)

  // Populate day of week irigation
  $("input:checkbox.day").each(function() {
    if(this.checked) day_of_week.push(parseInt($(this).val()));
  });

  // Populate start times
  $("#schedulingStartTime").find(".date").each(function() {
    var date = $("#"+this.id).data("DateTimePicker").date();
    if(date != null) {
      startHours.push(date.hour());
      startMinutes.push(date.minute());
    }
  });

  // Populate durations and zones
  var count = 1;
  $("#schedulingDuration").find(".date-duration").each(function() {
    // if(this.checked) day_of_week.push(parseInt($(this).val()));
    // console.log("id = " + this.id);
    // console.log("name = " + this.name);
    // console.log(this);
    // console.log("date >>>");
    var date = $("#"+this.id).data("DateTimePicker").date();    
    // console.log(date);
    // console.log(this.id);
    var timeStr = $("#"+this.id).find("input").val();
    // console.log(timeStr);
    // console.log(typeof(timeStr));
    // console.log(!(timeStr === ""));
    // if(date != null) {
    if(!(timeStr === "")) {
      durationHours.push(date.hour());
      durationMinutes.push(date.minute());
      
      zones.push(this.attributes["name"].value);
      zonesPause.push(false);
    } else {

      zonesPause.push(true);
    }
  });

  var today = new Date();
  day = today.getDate();
  // In Javascript January is 0! Also to adjust value to fit in boundary
  month = today.getMonth() + 1; 
  year = today.getFullYear();
  
  var Dow = JSON.stringify(day_of_week);
  console.log("Dow type = "+ typeof(Dow));
  console.log(startHours);
  console.log(startMinutes);
  console.log(durationHours);
  console.log(durationMinutes);
  console.log(zones);
  console.log(zonesPause);
  console.log(day_of_week);

  // var url = "https://1ri6rn6wgh.execute-api.ap-southeast-1.amazonaws.com/prod/Schedule/set-schedule";
  console.log("id = " + id);
  var url = "https://" + id + ".execute-api.ap-southeast-1.amazonaws.com/" + stage + "/Schedule/set-schedule";
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
          "project_name" : localStorage.getItem("current_project"),
          "device_name" : localStorage.getItem("current_device"),
          "year": year,
          "month": month,
          "day": day,
          "day_of_week" : JSON.stringify(day_of_week),
          "startHours" : JSON.stringify(startHours),
          "startMinutes": JSON.stringify(startMinutes),
          "durationHours": JSON.stringify(durationHours),
          "durationMinutes": JSON.stringify(durationMinutes),
          "zones": JSON.stringify(zones),
          "zonesPause": JSON.stringify(zonesPause)
        }),
        dataType: 'json',
        contentType: 'application/json',
        success: function(data)
        {
          // Schedule saved and published to device
          console.log("published to device");
          // console.log(data)
          console.dir(data)
          // console.dir($.parseJSON(data));
        }
      });
    });
  }

  // Disable the editing
  disableEditing();

  // Resume the refresh
  isAlive = true;
  startSchedulePoller(2000);
});

$(".zone-schedule-icon > .fa").click(function() {
  isZonePause = $(this).attr("isPause")
  // If zone schedule pause is true (fa-play is displayed), set the value to false and icon to stop
  if(isZonePause.startsWith("true")) {
    $(this).attr("isPause", "false");
    $(this).removeClass("fa fa-play");
    $(this).addClass("fa fa-stop");
  } else {
    $(this).attr("isPause", "true");
    $(this).removeClass("fa fa-stop");
    $(this).addClass("fa fa-play");
  }
});

// Edit schedule
$("#edit-schedule").click(function() {
  $(".checkbox-inline.disabled").each(function() {
    console.log("edit checkbox-inline");
    $(this).removeClass("disabled");
    $(this).children().removeAttr("disabled");
  });

  $("#maxie-schedule-div .input-group.date").each(function() {
    console.log("edit input-group.date");
    $(this).removeClass("disabled");
    $(this).children().removeAttr("disabled");
    $(this).children().removeClass("disabled");
  });

  $(".input-group.date-duration").each(function() {
    console.log("edit input-group.date-duration")
    $(this).removeClass("disabled");
    $(this).children().removeAttr("disabled");
    $(this).children().removeClass("disabled");
  });

  $("#undo-schedule").css('display', 'inline-block')
  $("#edit-schedule").css('display', 'none')
  isAlive = false;
});

function disableEditing() {
  $(".checkbox-inline").each(function() {
    console.log("disable edit checkbox-inline")
    $(this).attr("disabled", true);
    $(this).addClass("disabled");
    $(this).children().attr("disabled", true);
  });

  $(".input-group.date").each(function() {
    console.log("disable edit input-group.date")
    $(this).attr("disabled", true);
    $(this).addClass("disabled");
    $(this).children().attr("disabled", true);
    $(this).children().addClass("disabled");
  });

  $(".input-group.date-duration").each(function() {
    console.log("disable edit input-group.date-duration")
    $(this).attr("disabled", true);
    $(this).addClass("disabled");
    $(this).children().attr("disabled", true);
    $(this).children().addClass("disabled");
  });

  $("#edit-schedule").css('display', 'inline-block')
  $("#undo-schedule").css('display', 'none')
}

function createDurationContentDiv(json){  
  var jsonSize = Object.keys(json).length;
  console.log("jsonSize = " + jsonSize);
  var displayedZoneCount = $('.zone-dur').length
  if(displayedZoneCount == 0){
    var j = 0;
    var newRow = $(
      '<div class="row">'+
      '</div>'
    );
    for(var zoneNumber = 1; zoneNumber < (jsonSize - 1); zoneNumber++) {
      var zoneName = "zone_" + zoneNumber;
      var numColumn = $('#schedulingDuration > div:last-child').children().length;
      // console.log("numColumn = " + numColumn + " zoneName = " + zoneName + " displayedZoneCount = " + displayedZoneCount);
      createZone(j, zoneNumber, newRow);
      
      var schedule = json[zoneName]["schedule"];
      // console.dir(schedule)
      
      // For now, each start times are using the same durationz
      durationHour = schedule["duration"]["hour"][0];
      durationMinute = schedule["duration"]["minute"][0];
      var storedDate = new Date(1989, 12, 16, durationHour, durationMinute);
      // console.log("storedDate = "+storedDate);
      // console.log($("#duration"+zoneNumber));
      // console.log(schedule["pause"] + "at " + zoneNumber);
      // console.log(typeof schedule["pause"] + "   " + schedule["pause"]);
      $("#duration"+zoneNumber).datetimepicker({
        format: "HH:mm",
        defaultDate: new Date(1989, 12, 16, 0, 0),
        useCurrent: false
      });

      if(schedule["pause"]){
        // console.log("set pause at zone " + zoneNumber )
        $("#duration"+zoneNumber + " > input:text").val("");
      } else {
          // console.log($("storedDate = "+storedDate));
          // console.log("set date = " + storedDate + " at zone = " + zoneNumber);
          // console.log($("#duration"+zoneNumber));
          $("#duration"+zoneNumber).data("DateTimePicker").date(storedDate);
      }
      // console.log($("#duration"+zoneNumber));
    }
  } else{
    // update
    console.log("UPDATE!!!!")
    for(var zoneNumber = 1; zoneNumber < (jsonSize - 1); zoneNumber++) {
      var zoneName = "zone_" + zoneNumber;
      // var numColumn = $('#schedulingDuration > div:last-child').children().length;
      // console.log("numColumn = " + numColumn + " zoneName = " + zoneName + " displayedZoneCount = " + displayedZoneCount);

      var schedule = json[zoneName]["schedule"];
      console.dir(schedule)
      
      // For now, each start times are using the same durationz
      durationHour = schedule["duration"]["hour"][0];
      durationMinute = schedule["duration"]["minute"][0];
      var storedDate = new Date(1989, 12, 16, durationHour, durationMinute);
      // console.log("storedDate = "+storedDate);
      // console.log($("#duration"+zoneNumber));
      // console.log(schedule["pause"] + "at " + zoneNumber);
      // console.log(typeof schedule["pause"] + "   " + schedule["pause"]);
      // $("#duration"+zoneNumber).datetimepicker({
      //   format: "HH:mm",
      //   defaultDate: new Date(1989, 12, 16, 0, 0),
      //   useCurrent: false
      // });

      if(schedule["pause"]){
        // console.log("set pause at zone " + zoneNumber )
        $("#duration"+zoneNumber + " > input:text").val("");
      } else {
          // console.log($("storedDate = "+storedDate));
          // console.log("set date = " + storedDate + " at zone = " + zoneNumber);
          // console.log($("#duration"+zoneNumber));
          $("#duration"+zoneNumber).data("DateTimePicker").date(storedDate);
      }
      // console.log($("#duration"+zoneNumber));
    }
  }
}

function createZone(j, zoneNumber, newRow) {
  if(j < 3) {
    var col = $(
      '<div class="col-xs-6 col-sm-4">'+
        '<label class="pull-left zone-name zone-dur" style="padding-left:16px">'+
            'Zone ' + zoneNumber + ':'+
        '</label>'+
        '<div class="form-group zone-schedule-input">'+
            '<div class="input-group date-duration disabled" id="duration' + zoneNumber + '" name="zone_' + zoneNumber + '" style="width:120px">'+
                '<input type="text" class="form-control" placeholder="HH:mm" disabled="true"/>'+
                '<span class="input-group-addon disabled">'+
                    '<span class="glyphicon glyphicon-time"></span>'+
                '</span>'+
            '</div>'+
        '</div>'+
      '</div>'
    );
    newRow.append(col);
    j++;
  } else {
    j = 0;
    newRow = $(
      '<div class="row">'+
      '</div>'
    );
  }
  $('#schedulingDuration').append(newRow);
}
