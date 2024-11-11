// TODO: Need to improve on poller
function startSchedulePoller(pollRate) {
    // (function worker() {
    //     getSchedule();
    //     console.log("Refresh page at " + MaxiePollRate);
    //     setTimeout(worker, MaxiePollRate);             
    // })();
    // refresh()
    getSchedule();
    // console.log("Refresh page at " + MaxiePollRate);
    // setTimeout(worker, MaxiePollRate);
}

function refresh() {
    // var isAlive = $("#edit-schedule").css("display") == "inline-block";
    if(isAlive) {
        getSchedule();
        console.log("Refresh page at " + 5000);
        // location.reload();
        timer = setTimeout(refresh, 5000);
    } else {
        // console.log("is Alive = " + isAlive);
        clearTimeout(timer);
    }
}

var weekday = new Array(7);
weekday[1] = "Monday";
weekday[2] = "Tuesday";
weekday[3] = "Wednesday";
weekday[4] = "Thursday";
weekday[5] = "Friday";
weekday[6] = "Saturday";
weekday[7] = "Sunday";
MaxiePollRate = 5000;
var isAlive = true
var timer

$(document).ready(function() {
    startSchedulePoller(10000);

    // Session will expire at 1 hour
    setTimeout(function() {
        alert("Session Expired!!");
        window.location.replace('../../index.html');
    }, 3600000);
});

function getSchedule() {
    try{
        var url = "https://" + id + ".execute-api.ap-southeast-1.amazonaws.com/" + stage + "/Schedule/get-schedule";
        var poolData = {
            UserPoolId: localStorage.getItem("upId"),
            ClientId: localStorage.getItem("clientId")
        };
        var userPool = new AWSCognito.CognitoIdentityServiceProvider.CognitoUserPool(poolData);
        var cognitoUser = userPool.getCurrentUser();

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
                    success: function (data) {
                        if(isAlive) {
                            json = $.parseJSON(data);

                            var div;
                            var content = $();
                            if (json.maxie) {
                                console.dir(json);
                                MaxiePollRate = 5000 // 10 seconds

                                $('#maxie-schedule-div').css('display', 'block');
                                // Populate irrigation days (these are shared across all zones)
                                var irrigationDays = json["zone_0"]["schedule"]["start"]["day_of_week"];
                                for (var index in irrigationDays) {
                                    day = irrigationDays[index];
                                    $("#day-of-week-" + day).prop("checked", true);
                                }

                                // Populate start times (these are shared across all zones)
                                createStartTimesContentDiv(json);
                                

                                // Populate duration for each zones
                                createDurationContentDiv(json);
                            } else {
                                for (var day in json) {
                                    if (!day.startsWith("maxie")) {
                                        var scheduleList = json[day];
                                        div = $('<div class="panel panel-schedule row schedule-row">');
                                        div.append("<h4 class='col-xs-12 day-heading'>" + weekday[day] + " Start Times</h4>");
                                        for (var x = 0; x < scheduleList.length; x++) {
                                            if (scheduleList[x].hour !== "0")
                                                div.append("<div class='col-xs-3 schedule-col'><div onclick='openSchedule(\"" + scheduleList[x].day + "\",\"" + scheduleList[x].slot + "\")' class='schedule-square'><div class='content'><img class='valve' src='images/clock-set.png'></img></br>" + scheduleList[x].hour + ":" + scheduleList[x].min + "</div><button type='button' class='btn btn-default btn-sm schedule-btn'><span class='glyphicon glyphicon-wrench' aria-hidden='true'></span></button></div>");
                                            else
                                                div.append("<div class='col-xs-3 schedule-col'><div onclick='openSchedule(\"" + scheduleList[x].day + "\",\"" + scheduleList[x].slot + "\")' class='schedule-square'><div class='content'><img class='valve' src='images/clock-unset.png'></img></br> + </div><button type='button' class='btn btn-default btn-sm schedule-btn'><span class='glyphicon glyphicon-wrench' aria-hidden='true'></span></button></div>");
                                        }
                                        div.append('</div>');
                                        content = content.add(div);
                                    }
                                }
                                $('#schedule-div').html(content);
                                $('#schedule-div').show();
                            }
                        }
                    },
                    complete: function() {
                        // Schedule the next request when the current one is completed
                        // console.log("getSchedule completed!!!")
                        // refresh()
                        if(isAlive) {
                            timer = setTimeout(getSchedule, 5000);
                        } else {
                            // console.log("is Alive = " + isAlive + " clearing >> " + timer);
                            clearTimeout(timer);
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

function createStartTimesContentDiv(json){
    var startHour = json["zone_0"]["schedule"]["start"]["hour"]; // Get from zone 1
    var startMinute = json["zone_0"]["schedule"]["start"]["minute"];
    var j = 0;
    var newRow = $(
      '<div class="row">'+
      '</div>'
    );
    var displayedStartTime = $('.start-time').length
    // console.log(" displayedStartTime = " + displayedStartTime);
    if(displayedStartTime == 0){
        // TODO:Apply The following commented code with a button that allows users to add more start times
        // for (var i = 1; i <= startHour.length; i++) {
        //     // $("#datetimepicker" + i).data("DateTimePicker").date(new Date(1989, 12, 16, startHour[i - 1], startMinute[i - 1]));
            
        //     createStartTimes(j, i, newRow);
        //     var storedDate = new Date(1989, 12, 16, startHour[i - 1], startMinute[i - 1]);
        //     $("#datetimepicker"+i).datetimepicker({
        //         format: "HH:mm",
        //         defaultDate: new Date(1989, 12, 16, 0, 0),
        //         useCurrent: false
        //     });

        //     $("#datetimepicker"+i).data("DateTimePicker").date(storedDate);
        // }
        for (var i = 1; i <= 4; i++) {
            // $("#datetimepicker" + i).data("DateTimePicker").date(new Date(1989, 12, 16, startHour[i - 1], startMinute[i - 1]));
            
            createStartTimes(j, i, newRow);
            var storedDate = new Date(1989, 12, 16, startHour[i - 1], startMinute[i - 1]);
            if(storedDate == "Invalid Date") {
                console.log("Invalid Date...");
                $("#datetimepicker"+i).datetimepicker({
                    format: "HH:mm",
                    useCurrent: false
                });

            } else {
                $("#datetimepicker"+i).datetimepicker({
                    format: "HH:mm",
                    defaultDate: new Date(1989, 12, 16, 0, 0),
                    useCurrent: false
                });
            }
            // $("#datetimepicker"+i).datetimepicker({
            //     format: "HH:mm",
            //     defaultDate: new Date(1989, 12, 16, 0, 0),
            //     useCurrent: false
            // });

            $("#datetimepicker"+i).data("DateTimePicker").date(storedDate);
        }
    } else {
        console.log("Update!!!");
        for (var i = 1; i <= startHour.length; i++) {
            // $("#datetimepicker" + i).data("DateTimePicker").date(new Date(1989, 12, 16, startHour[i - 1], startMinute[i - 1]));
            
            var storedDate = new Date(1989, 12, 16, startHour[i - 1], startMinute[i - 1]);
            if(storedDate == "Invalid Date") {
                console.log("Invalid Date...");
                $("#datetimepicker"+i).datetimepicker({
                    format: "HH:mm",
                    useCurrent: false
                });

            } else {
                $("#datetimepicker"+i).datetimepicker({
                    format: "HH:mm",
                    defaultDate: new Date(1989, 12, 16, 0, 0),
                    useCurrent: false
                });
            }
            
            $("#datetimepicker"+i).data("DateTimePicker").date(storedDate);
        }
    }
}

function createStartTimes(j, zoneNumber, newRow){
    if(j < 4) {
        var startTimes = $(
        '<div class="col-xs-8 col-sm-2">'+
            '<div class="form-group">'+
                '<div class="input-group date disabled start-time" id="datetimepicker' + zoneNumber + '">'+
                    '<input type="text" class="form-control" placeholder="HH:mm" id="start_time_' + zoneNumber + '" value="" disabled="true"/>'+
                    '<span class="input-group-addon disabled">'+
                        '<span class="glyphicon glyphicon-time"></span>'+
                    '</span>'+
                '</div>'+
            '</div>'+
        '</div>'
        );
        newRow.append(startTimes);
        j++;
    } else {
        j = 0;
        newRow = $(
            '<div class="row">'+
            '</div>'
        );
    }
    $('#schedulingStartTime').append(newRow);    
}
function openSchedule(day, col) {
    $('#schedule-modal').modal('show');
    $('#schedule-modal').find('.modal-title').html(weekday[day]);
    $('#schedule-modal').find('.modal-title').val(day.toString() + col.toString());

    // var url = 'https://1ri6rn6wgh.execute-api.ap-southeast-1.amazonaws.com/prod/Schedule/get-schedule-slot';
    var url = "https://" + id + ".execute-api.ap-southeast-1.amazonaws.com/" + stage + "/Schedule/get-schedule-slot";
    var userPool = new AWSCognito.CognitoIdentityServiceProvider.CognitoUserPool(poolData);
    var cognitoUser = userPool.getCurrentUser();

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
                    "device_name": localStorage.getItem("current_device"),
                    "day": day,
                    "slot": col
                }),
                dataType: 'json',
                contentType: 'application/json',
                success: function (data) {
                    json = $.parseJSON(data);

                    if (typeof json['hour'] == 'undefined') {
                        hour = "00";
                        min = "00";
                    }
                    else {
                        hour = json['hour'];
                        min = json['min'];
                    }

                    $('#schedule-modal').find('#schedule-slot-time').val(hour + ":" + min);

                    html = '<div id="zoneTime">';

                    totalZones = parseInt(json['totalZones']);

                    for (var i = 1; i <= totalZones; i++) {
                        leftTime = json["zone" + i];

                        if (typeof leftTime == 'undefined') leftTime = 0;

                        html += '<div class="form-group col-xs-6">';
                        html += '<label>Zone ' + i + ': </label>';
                        html += '<div class="input-group">';
                        html += '<input type="text" class="form-control" value="' + leftTime + '">';
                        html += '<span class="input-group-addon">mins</span>';
                        html += '</div></div>';
                    }
                    html += '</div>';
                    html += '<div id="schedule-error" class="alert alert-danger">'
                    html += '<strong>Error:</strong><div id="schedule-error-message">This alert box could indicate a dangerous or potentially negative action.</div>'
                    html += '</div>'
                    $('#schedule-modal').find('#modal-body-zone').html(html);
                    $('#schedule-error').hide();
                }
            });
        });
    }
}

function setSchedule(){
    if (!setScheduleValidate())
        return;

    day = parseInt($('#schedule-modal').find('.modal-title').val().charAt(0));
    col = $('#schedule-modal').find('.modal-title').val().substring(1, 4);
    // time = $('#schedule-modal').find('#schedule-slot-time').val().toString();
    // console.log(time);
    // stTime = convertTo24Hour(time);

    stTime = $('#schedule-modal').find('#schedule-slot-time').val().toString();
    console.log("stTime = " + stTime);
    zoneTime = [];
    $('#zoneTime input').each(function () {
        zoneTime.push(this.value);
    });

    var url = "https://1ri6rn6wgh.execute-api.ap-southeast-1.amazonaws.com/prod/Schedule/set-schedule-slot";
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
                    "day_of_week" : ""+day,
                    "slot" : ""+col,
                    "st_time": ""+stTime,
                    "zone_time": ""+JSON.stringify(zoneTime)
                }),
                dataType: 'json',
                contentType: 'application/json',
                success: function(data)
                {
                    // console.log(localStorage.getItem("current_project"));
                    // console.log(localStorage.getItem("current_device"));
                    // console.log(day);
                    // console.log(col);
                    // console.log(stTime);
                    // console.log(JSON.stringify(zoneTime));
                    // console.log(data);
                    if (data == ""){
                        $('#schedule-modal').modal('hide');
                        location.reload();
                    }
                    else{
                        $('#schedule-error-message').html(data);
                        $('#schedule-error').show();
                    }
                }
            });
        });
    }
}

function resetSchedule() {
    if (!setScheduleValidate())
        return;

    day = parseInt($('#schedule-modal').find('.modal-title').val().charAt(0));
    // col = parseInt($('#schedule-modal').find('.modal-title').val().charAt(1));
    col = $('#schedule-modal').find('.modal-title').val().substring(1, 4);
    stTime = $('#schedule-modal').find('#schedule-slot-time').val().toString();
    zoneTime = [];
    $('#zoneTime input').each(function () {
        zoneTime.push(0);
    });
    var url = "https://1ri6rn6wgh.execute-api.ap-southeast-1.amazonaws.com/prod/Schedule/set-schedule-slot";
    var userPool = new AWSCognito.CognitoIdentityServiceProvider.CognitoUserPool(poolData);
    var cognitoUser = userPool.getCurrentUser();

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
                    "device_name": localStorage.getItem("current_device"),
                    "day": "" + day,
                    "slot": "" + col,
                    // "st_time": "00:00",
                    "st_time": "reset",
                    "zone_time": JSON.stringify(zoneTime)
                }),
                dataType: 'json',
                contentType: 'application/json',
                success: function (data) {
                    // console.dir(data);
                    if ((data == "") || (data == "schedule reset")) {
                        $('#schedule-modal').modal('hide');
                        location.reload();
                    }
                    else {
                        // if (data == "schedule reset")
                        //     $('#schedule-modal').modal('hide');
                        $('#schedule-error-message').html(data);
                        $('#schedule-error').show();
                    }
                }
            });
        });
    }
}

function setScheduleValidate() {
    // Valid from 00:00 to 23:59
    timePatt = /^(?:2[0-3]|[01][0-9]):[0-5][0-9]$/;

    // Valid from 0 to 99
    zonePatt = /^(?:[0-9][0-9]|[0-9])$/;
    zoneValidate = true;

    stTime = $('#schedule-modal').find('#schedule-slot-time').val().toString();
    // if (stTime.match(/.+\s([AaPp][Mm])/)) {
    //     return true;
    // }
    // console.log(stTime)

    if (!timePatt.test(stTime)) {
        $('#schedule-error-message').html("Please enter a time in the format of HH:MM.");
        $('#schedule-error').show();
        return false;
    }

    $('#zoneTime input').each(function () {
        if (!zonePatt.test(this.value)) {
            $('#schedule-error-message').html("Please ensure the zone irrigation times are within 0-99 minutes.");
            $('#schedule-error').show();
            zoneValidate = false;
        }
    });

    if (!zoneValidate)
        return false;

    return true;
}

function convertTo24Hour(time) {
    result = "";
    var hours = Number(time.match(/^(\d+)/)[1]);
    var minutes = Number(time.match(/:(\d+)/)[1]);
    var AMPM = time.match(/\s(.*)$/)[1];
    if (AMPM == "PM" && hours < 12) hours = hours + 12;
    if (AMPM == "AM" && hours == 12) hours = hours - 12;
    var sHours = "0" + hours.toString();
    var sMinutes = "0" + minutes.toString();

    result = sHours.slice(-2) + ":" + sMinutes.slice(-2);
    return result;
}

