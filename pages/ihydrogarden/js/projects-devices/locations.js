$(function() {
    console.log("Loading projects ...");
    listProjects();
});

// $(function () {
//     $("#header-stuff").load("header-tp.html");
//     $("#nav-tp").load("nav-tp.html");
//     statusPoller();
//     clock();
//     fluidMeter();
//     console.log("READY");
//     // Session will expire in 1 hour
//     setTimeout(function () {
//       alert("Session Expired!!");
//       window.location.replace('../../index.html');
//     }, 3600000);
//   });

async function listProjects() {
    // Show loader when the API call starts
    $("#loader").show();
    $("#locations").hide();  // Hide the locations container until data is ready

    const cachedProjects = sessionStorage.getItem("projects_list");
    if (cachedProjects) {
        renderProjects(JSON.parse(cachedProjects));
        
        // Hide the loader since cached data is available
        $("#loader").hide();
        $("#locations").show();  // Show the locations container
        return Promise.resolve();  // Data is already cached, no need for API call
    }

    const url = `https://${id}.execute-api.ap-southeast-1.amazonaws.com/${stage}/Projects/get-projects`;
    const userPool = new AWSCognito.CognitoIdentityServiceProvider.CognitoUserPool(poolData);
    const cognitoUser = userPool.getCurrentUser();
    const username = sessionStorage.getItem("username");

    if (cognitoUser && username) {
        return new Promise((resolve, reject) => {
            cognitoUser.getSession(async function (err, session) {
                if (err) {
                    console.error("Session error:", err);
                    $("#loader").hide();  // Hide loader if session error occurs
                    alert("Session expired, please log in again.");
                    window.location.replace('../../index.html');
                    return reject(err);
                }

                try {
                    const response = await $.ajax({
                        type: 'POST',
                        url: url,
                        headers: { 
                            'Content-Type': 'application/json',
                            'Authorization': getIdToken(session)
                        },
                        data: JSON.stringify({
                            table_name: 'users_projects',
                            filter_attr_key: 'user_id',
                            search_item: username, 
                            projection_expression: 'project_name, display, project_type, coordinates, time_zone',
                            limit: "50",
                            scan_forward: "false"
                        }),
                        dataType: 'json',
                    });

                    const json = JSON.parse(response);
                    const projects_list = json.projects_list;
                    sessionStorage.setItem("projects_list", JSON.stringify(projects_list));  // Cache data
                    renderProjects(projects_list);
                    
                    // Hide the loader and show locations after successful data load
                    $("#loader").hide();
                    $("#locations").show();
                    resolve(projects_list);
                } catch (error) {
                    console.error("Error loading projects:", error);
                    
                    // Hide the loader if there's an error
                    $("#loader").hide();
                    alert("Failed to load projects. Please try again later.");
                    reject(error);
                }
            });
        });
    } else {
        alert("Please log in!");
        window.location.replace('../../index.html');
        $("#loader").hide();  // Hide the loader if user is not logged in
        return Promise.reject("User not logged in");
    }
}


// function devicePoller() {
//     // reset the sensors rendering
//     $("#sensors").html("");
//     listDevices();
//     poller = setTimeout(devicePoller, 300000);
// }

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

// function listSensors(LastEvaluatedKey){
//     var url = "https://" + id + ".execute-api.ap-southeast-1.amazonaws.com/" + stage + "/Devices/get-sensors";
    
//     var userPool = new AWSCognito.CognitoIdentityServiceProvider.CognitoUserPool(poolData);
//     var cognitoUser = userPool.getCurrentUser();
//     console.log("list sensors ...");

//     var request_data = JSON.stringify({
//         "project-name": localStorage.getItem("current_project")
//     });

//     if(LastEvaluatedKey != null){
//         request_data = JSON.stringify({
//             "project-name": localStorage.getItem("current_project"),
//             "last-eval-key": LastEvaluatedKey
//         });
//     }

//     if (cognitoUser != null) {
//         cognitoUser.getSession(function(err, session) {
//             if (err) {
//                console.dir(err);
//                 return;
//             } else {
//                 $.ajax({
//                     type: "POST",
//                     url: url,
//                     crossDomain: true,
//                     headers: { 
//                         'Content-Type': 'application/json',
//                         'Authorization': getIdToken(session)
//                     },
//                     data: request_data,
//                     dataType: 'json',
//                     contentType: 'application/json',
//                     success: function(data)
//                     {
//                         try{
//                             sensor_list = data;
//                             // sensor_list = JSON.parse(data);
//                             // console.dir(sensor_list);
//                             if (Object.keys(sensor_list).length < 1){
//                                 //prompt user to contact administrator
//                                 alert("You do not have any devices. Please contact your system administrator.");
//                             } else {
//                                 // renderDevices(sensor_list);
//                                 // renderSensors(sensor_list);
//                                 // $("#devices").promise().done(renderSensors(devices_list));
//                             }
//                         } catch(err) {
//                             console.log(err);
//                         }
                        
//                     },
//                     statusCode: {
//                         504: function() {
//                             window.location.replace('../../index.html');
//                         }
//                     }
//                 }).done(function() {
//                     console.log("list sensors ... DONE");
//                     renderSensors(sensor_list);
//                     if(sensor_list["LastEvaluatedKey"] != ""){
//                         // renderLoadMoreButton();
//                         $("#loadMoreSensorsButton").show();

//                         // Save last evaluated key
//                         localStorage.setItem("last_evaluated_key", sensor_list["LastEvaluatedKey"])
//                     } else {
//                         $("#loadMoreSensorsButton").hide();
//                     }
                    
//                 });
//             }
//         });
//     } else {
//         alert("Please login!!");
//         window.location.replace('../../index.html');
//     }
// }

// function onClickLoadMoreSensor() {
//     var lastEvalKey = localStorage.getItem("last_evaluated_key");
//     console.log("lastEvalKey = " + lastEvalKey);
//     listSensors(lastEvalKey);

//     $('#sensors').slideUp( 300 ).delay( 800 ).fadeIn( 400 );
// }

// function getDevices(project_name) {
//     var url = "https://" + id + ".execute-api.ap-southeast-1.amazonaws.com/" + stage + "/Devices/get-devices";
    
//     var userPool = new AWSCognito.CognitoIdentityServiceProvider.CognitoUserPool(poolData);
//     var cognitoUser = userPool.getCurrentUser();

//     if (cognitoUser != null) {
//         cognitoUser.getSession(function(err, session) {
//             if (err) {
//                console.dir(err);
//                 return;
//             } else {
//                 $.ajax({
//                     type: "POST",
//                     url: url,
//                     crossDomain: true,
//                     headers: { 
//                         'Content-Type': 'application/json',
//                         'Authorization': getIdToken(session)
//                     },
//                     data: JSON.stringify({
//                         table_name: 'projects_devices',
//                         filter_attr_key: 'project_name',
//                         search_item: project_name,
//                         projection_expression: 'device_name, coordinates',
//                         limit : "10",
//                         scan_forward : "false"
//                     }),
//                     dataType: 'json',
//                     contentType: 'application/json',
//                     success: function(data)
//                     {
//                         try{
//                             devices_list = JSON.parse(data);
//                             console.log("Get Devices");
//                             console.dir(data);
//                             if (Object.keys(devices_list).length < 1){
//                                 //prompt user to contact administrator
//                                 return {};
//                             } else {
//                                 return devices_list;
//                             }
//                         } catch(err) {
//                             console.log(err)
//                         }
                        
//                     }
//                     // statusCode: {
//                     //     504: function() {
//                     //         window.location.replace('../../index.html');
//                     //     }
//                     // }
//                 });
//             }
//         });
//     } else {
//         alert("Please login!!");
//         window.location.replace('../../index.html');
//     }
// }


// function displayProjectAliasName(project){
//     result = ""
//     aliasName = project.display;
//     if(aliasName != "None"){
//         result = project.display;
//     } else {
//         result = project.pname;
//     }
//     return result;
// }