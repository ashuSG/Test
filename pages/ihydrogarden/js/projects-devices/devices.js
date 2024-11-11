$(function() {
    console.log("Loading contollers and sensors ...");
    devicePoller();
});

function devicePoller() {
    // reset the sensors rendering
    $("#sensors").html("");
    listDevices();
    poller = setTimeout(devicePoller, 300000);
}

function listDevices(){
    var url = "https://" + id + ".execute-api.ap-southeast-1.amazonaws.com/" + stage + "/Devices/get-devices";
    
    var userPool = new AWSCognito.CognitoIdentityServiceProvider.CognitoUserPool(poolData);
    var cognitoUser = userPool.getCurrentUser();
    console.log("get devices ...");

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
                        'Authorization': getIdToken(session)
                    },
                    data: JSON.stringify({
                        table_name: 'projects_devices',
                        filter_attr_key: 'project_name',
                        search_item: localStorage.getItem("current_project"),
                        projection_expression: 'device_name, coordinates',
                        limit : "10",
                        scan_forward : "false"
                    }),
                    dataType: 'json',
                    contentType: 'application/json',
                    success: function(data)
                    {
                        try{
                            devices_list = JSON.parse(data);
                            if (Object.keys(devices_list).length < 1){
                                //prompt user to contact administrator
                                alert("You do not have any devices. Please contact your system administrator.");
                            } else {
                                renderDevices(devices_list);
                            }
                        } catch(err) {
                            console.log(err);
                        }
                        
                    },
                    statusCode: {
                        504: function() {
                            window.location.replace('../../index.html');
                        }
                    }
                }).done(function() {
                    console.log("DONE!!!");
                    listSensors();
                });
            }
        });
    } else {
        alert("Please login!!");
        window.location.replace('../../index.html');
    }
}

function listSensors(LastEvaluatedKey){
    var url = "https://" + id + ".execute-api.ap-southeast-1.amazonaws.com/" + stage + "/Devices/get-sensors";
    
    var userPool = new AWSCognito.CognitoIdentityServiceProvider.CognitoUserPool(poolData);
    var cognitoUser = userPool.getCurrentUser();
    console.log("list sensors ...");

    var request_data = JSON.stringify({
        "project-name": localStorage.getItem("current_project")
    });

    if(LastEvaluatedKey != null){
        request_data = JSON.stringify({
            "project-name": localStorage.getItem("current_project"),
            "last-eval-key": LastEvaluatedKey
        });
    }

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
                        'Authorization': getIdToken(session)
                    },
                    data: request_data,
                    dataType: 'json',
                    contentType: 'application/json',
                    success: function(data)
                    {
                        try{
                            sensor_list = data;
                            // sensor_list = JSON.parse(data);
                            // console.dir(sensor_list);
                            if (Object.keys(sensor_list).length < 1){
                                //prompt user to contact administrator
                                alert("You do not have any devices. Please contact your system administrator.");
                            } else {
                                // renderDevices(sensor_list);
                                // renderSensors(sensor_list);
                                // $("#devices").promise().done(renderSensors(devices_list));
                            }
                        } catch(err) {
                            console.log(err);
                        }
                        
                    },
                    statusCode: {
                        504: function() {
                            window.location.replace('../../index.html');
                        }
                    }
                }).done(function() {
                    console.log("list sensors ... DONE");
                    renderSensors(sensor_list);
                    if(sensor_list["LastEvaluatedKey"] != ""){
                        // renderLoadMoreButton();
                        $("#loadMoreSensorsButton").show();

                        // Save last evaluated key
                        localStorage.setItem("last_evaluated_key", sensor_list["LastEvaluatedKey"])
                    } else {
                        $("#loadMoreSensorsButton").hide();
                    }
                    
                });
            }
        });
    } else {
        alert("Please login!!");
        window.location.replace('../../index.html');
    }
}

function onClickLoadMoreSensor() {
    var lastEvalKey = localStorage.getItem("last_evaluated_key");
    console.log("lastEvalKey = " + lastEvalKey);
    listSensors(lastEvalKey);

    $('#sensors').slideUp( 300 ).delay( 800 ).fadeIn( 400 );
}