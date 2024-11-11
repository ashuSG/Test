function startNavPoller(pollRate){
    getDeviceSetting();

    hideNavElements();

    (function worker() {
        getActiveAlertsNav();
        setTimeout(worker, pollRate);
    })();
}

function hideNavElements(){
    project_type = localStorage.getItem("project_type")


    if(project_type === "minnie"){
        $("#crop-sensors-nav-page").hide()
        $("#climate-sensors-nav-page").hide()
        $("#alerts-nav-page").hide()
    } else {
        let roles = sessionStorage.getItem("user_roles");
        console.log(roles);
        console.log(typeof roles)
        if(roles.match("Cognito_Admin")) {
            $("#crop-sensors-nav-page").show();
            $("#climate-sensors-nav-page").show();
            $("#schedule-page").show();
        }

        else if(roles.match("Cognito_Data_Analyst")) {
            $("#crop-sensors-nav-page").show();
            $("#climate-sensors-nav-page").show();
            $("#schedule-page").hide();
        }

        else if(roles.match("Cognito_Irrigation")) {
            $("#crop-sensors-nav-page").hide();
            $("#climate-sensors-nav-page").hide();
            $("#schedule-page").show();
        }


        $("#alerts-nav-page").show();
    }
    
}

function getActiveAlertsNav(dname){
    var poolData = {
        UserPoolId : localStorage.getItem("upId"),
        ClientId : localStorage.getItem("clientId")
    };

    var url = "https://" + id + ".execute-api.ap-southeast-1.amazonaws.com/" + stage + "/Alarms/get-active-alerts";
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
                    // TODO: authorization header to include user token.
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
                    // console.dir(data);
                    alertList = JSON.parse(data);

                    var li;

                    if (alertList.length <= 0){
                        $('#alert-count').html('');
                    }
                    else{
                        $('#alert-count').html('<span class="alert-count">' + alertList.length + '</span>');
                    }

                    var content = $();
                    for (var i = 0; i < Math.min(alertList.length, 3); i++) {
                        li = $('<li>');
                        li.append('<a href="#">');
                        li.append('<div>');
                        li.append('<strong style="padding-left:8px">' + alertList[i].alert_desc + '</strong>');
                        li.append('<em style="padding-left:10px">' + alertList[i].alert_datetime + '</em>');
                        li.append('</span>');
                        li.append('</div>');
                        li.append('</a>');
                        li.append('</li>');
                        li.append('<li class="divider"></li>');
                        content = content.add(li);
                    }
                    $('#alert-messages').html(content);
                }
            });
        });
    }
    
}

function getDeviceSetting(){
    var poolData = {
        UserPoolId : localStorage.getItem("upId"),
        ClientId : localStorage.getItem("clientId")
    };

    var url = "https://" + id + ".execute-api.ap-southeast-1.amazonaws.com/" + stage + "/Status/get-status";
    var userPool = new AWSCognito.CognitoIdentityServiceProvider.CognitoUserPool(poolData);
    var cognitoUser = userPool.getCurrentUser();
    var info = null;

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
                    // console.log(data)
                    // console.log()
                    try{
                        info = JSON.parse(data);
                        console.dir(info);

                        
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
}