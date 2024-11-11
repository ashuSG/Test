$('#login').click(function() {
    console.log("LOGIN");
    loginInProgress(true); 

    var authenticationData = {
        Username: $("#username").val(),
        Password:  $("#password").val()
    };

    // AWS = new AWSCognito(); // AWSCognito is AWS
    AWSCognito.config.region = "ap-southeast-1";

    cognitoidentity = new AWSCognito.CognitoIdentity({apiVersion: '2014-06-30'});


    var authenticationDetails = new AWSCognito.CognitoIdentityServiceProvider.AuthenticationDetails(authenticationData);
    var userPool = new AWSCognito.CognitoIdentityServiceProvider.CognitoUserPool(poolData);
    // console.log("UserPool: ");
    // console.dir(userPool)

    localStorage.setItem("upId", poolData.UserPoolId);
    localStorage.setItem("clientId", poolData.ClientId);
    
    var userData = {
        Username: $("#username").val(),
        Pool: userPool
    };
    sessionStorage.setItem("username", userData.Username);

    // console.log("authentication details:");
    // console.dir(authenticationDetails);

    var cognitoUser = new AWSCognito.CognitoIdentityServiceProvider.CognitoUser(userData);
    console.log("cognito user:");
    console.dir(cognitoUser);

    cognitoUser.authenticateUser(authenticationDetails, {
        onSuccess: function(result) {
            
//****************************
            
            cognitoUser.getSession(function(err, session) {
                if (err) {
                    alert(err);
                    return;
                }

                cognitoUser.getUserAttributes(function(err, data){
                    if (err) console.log(err, err.stack); // an error occurred
                    else { // successful response
                        sessionStorage.setItem("email", data[2].Value);
                    }
                });

                // Get Id
                var idenParams = {
                    IdentityPoolId: "ap-southeast-1:fdd07ee0-7d99-4b9b-bf73-ee92d57c3307",
                    AccountId: "494367507588",
                    Logins:{ // use access token provided by UserPool
                        "cognito-idp.ap-southeast-1.amazonaws.com/ap-southeast-1_YZVueVmKp": session.getIdToken().getJwtToken()
                    }
                }

                cognitoidentity.getId(idenParams, function(err, data) {
                    if (err) console.log(err, err.stack); // an error occurred
                    else {
                        // console.log("getId:")
                        // console.dir(data); // successful response
                        // console.log(data.IdentityId)
                        // console.log(session.getIdToken().getJwtToken())
                        // console.log("Success!!!!");

                        var credParams = {
                            IdentityId: data.IdentityId,
                            Logins: {
                                "cognito-idp.ap-southeast-1.amazonaws.com/ap-southeast-1_YZVueVmKp": session.getIdToken().getJwtToken()
                            }
                        }

                        cognitoidentity.getCredentialsForIdentity(credParams, function(err, data) {
                            if (err) console.log(err, err.stack); // an error occurred
                            else { // successful response
                                window.location.replace('pages/projects.html');
                                // console.log("getCredentialsForIdentity:");
                                // console.dir(data["Credentials"]);

                                // // Create s3 object
                                // console.log("create S3 object");
                                // var cred = new AWS.Credentials(data["Credentials"]["AccessKeyId"], data["Credentials"]["SecretKey"], data["Credentials"]["SessionToken"]);
                                // var s3 = new AWS.S3({
                                //     apiVersion: "2006-06-01",
                                //     region: "ap-southeast-1",
                                //     credentials: cred
                                // });
                                // var params = {
                                //     Bucket: "ihydrogarden",
                                //     Key: "js/projects.js"
                                // }
                                
                                // s3.getObject(params, function(err, data) {
                                //     if (err) console.log(err, err.stack);
                                // });

                                // params["Key"] = "pages/devices.html"
                                // s3.getObject(params, function(err, data) {
                                //     if (err) console.log(err, err.stack);
                                // });

                                // params["Key"] = "pages/projects.html"
                                // s3.getObject(params, function(err, data) {
                                //     if (err) console.log(err, err.stack);
                                //     else {
                                //         // console.log("get S3 object");
                                //         // console.dir(data);
                                //         // let objDataStr = data.Body.toString("utf-8");
                                //         // // console.log("String:");
                                //         // // console.log(objDataStr);
                                //         // sessionStorage.setItem("projects.html", objDataStr);

                                //         // // let htmlProjects = document.implementation.createHTMLDocument("./pages/projects.html");
                                //         // tmp = sessionStorage.getItem("projects.html");
                                //         // // console.dir(htmlProjects);
                                //         // console.dir(tmp);


                                //         // localStorage.setItem("username", $("#username").val());
                                //         window.location.replace('pages/projects.html');

                                //     }
                                // });
                            }
                          });


                    }
                });
                
            });

//****************************

            // if ($("#username").val()) {
            //     localStorage.setItem("username", $("#username").val());
            //     window.location.replace('pages/projects.html');
            // }
            
        },

        onFailure: function(err) {
            // TODO: implement password reset 
            loginInProgress(false); 

            eMessage = err.message;
            //console.log(eMessage);
            if (eMessage.includes("Password does not conform to policy:")){
                console.log("inside password does not conform to policy");
                $('#newPassword').val("");
                $('#newPassword').css({ "border": '#FF0000 1px solid'});
                //display error message in new password window
                html = '';
                $('#new-password-modal').find('#modal-error-zone').html(html);

                html += '</div>';
                html += '<div id="password-error" class="alert alert-danger">';
                html += '<strong>'+err.message+'</strong>';
                html += '</div>';
                $('#new-password-modal').find('#modal-error-zone').html(html);
                $('#new-password-modal').modal('show');                

            } else if (eMessage.includes("User does not exist.")){
                console.log("inside User does not exist.");
                //display error message in login page. 
                html = '</div>';
                html += '<div id="password-error" class="alert alert-danger">';
                html += '<strong> Incorrect username or password </strong>';
                html += '</div>';
                $('#login-page').find('#modal-error-zone').html(html);
            } else {
                console.log("inside else statement");
                //display error message in login page
                html = '</div>';
                html += '<div id="password-error" class="alert alert-danger">';
                html += '<strong>'+err.message+'</strong>';
                html += '</div>';
                $('#login-page').find('#modal-error-zone').html(html);
            }

            console.log(err);
        },
        // mfaRequired: function(codeDeliveryDetails) {
        //     // MFA is required to complete user authentication.
        //     // Get the code from user and call
        //     cognitoUser.sendMFACode(mfaCode, this);
        // },

        newPasswordRequired: function(userAttributes, requiredAttributes) {
            
            loginInProgress(false); 

            // User was signed up by an admin and must provide new 
            // password and required attributes, if any, to complete 
            // authentication.

            // userAttributes: object, which is the user's current profile. It will list all attributes that are associated with the user. 
            // Required attributes according to schema, which don’t have any values yet, will have blank values.
            // requiredAttributes: list of attributes that must be set by the user along with new password to complete the sign-in.
            
            $('#new-password-modal').modal('show');
            $('#new-password-modal').find('.modal-title').html("Please set a new password...");
            
            // the api doesn't accept this field back
            delete userAttributes.email_verified;
        
            self = this;

            // Get these details and call 
            // newPassword: password that user has given
            // attributesList: object with key as attribute name and value that the user has given.
            $('#setNewPassword').click(function() {
                newPassword = $("#newPassword").val();
                cognitoUser.completeNewPasswordChallenge(newPassword, userAttributes, self);  
            });     
        }
    });
});

function displayUserAttributes(){
    var cognitoUser = getCurrentUser();
    
    if (cognitoUser != null) {
        cognitoUser.getSession(function(err, session) {
            if (err) {
                alert(err);
                return;
            }
            console.log('session validity: ' + session.isValid());
            console.log(session.getIdToken().getJwtToken());
                
            // NOTE: getSession must be called to authenticate user before calling getUserAttributes
            cognitoUser.getUserAttributes(function(err, attributes) {
                if (err) {
                    console.log(err);
                } else {
                    // console.dir(attributes);
                    
                    // html = html = '<div class="form-group" align="left">';
                    for (i = 0; i < attributes.length; i++) {
                        //console.log('attribute ' + attributes[i].getName() + ' has value ' + attributes[i].getValue());
                        attributeName = attributes[i].getName();
                        if (attributeName == "email"){
                            $('#email').val(attributes[i].getValue());
                        } else if (attributeName == "custom:Project") {
                            $('#project').val(attributes[i].getValue());
                        }
                    //     html += '<div class="input-group">';
                    //     html += '<label>'+ attributeName + '</label>';
                    //     html += '<input class="form-control" id="'+ attributeName+ '" placeholder="' + attributeName + '" name="' + attributeName +'" type="text" />';
                    //     html += '</div>';
                    }
                    // html += '</div>';
                    // $('#user-attributes').html(html);
                }
            });
        });
    }
}

function setUserAttributes(){
    var cognitoUser = getCurrentUser();
    
    // var attributeList = [];
    // var attribute = {
    //     Name : 'custom:Project',
    //     Value : 'mqttdemo'
    // };
    // var attribute = new AWS.CognitoIdentityServiceProvider.CognitoUserAttribute(attribute);
    // attributeList.push(attribute);

    // cognitoUser.updateAttributes(attributeList, function(err, result) {
    //     if (err) {
    //         alert(err);
    //         return;
    //     }
    //     console.log('call result: ' + result);
    // });
}

function resetPassword(){
    console.log("Reset Password...");
}

function checkAdmin(jwtToken){
        console.log('Check Admin Role...');
        // var url = 'https://7o8uauljbc.execute-api.ap-southeast-1.amazonaws.com/dev/validate-session';
    
//     $.ajax({
//         type: "POST",
//         url: url,
//         crossDomain: true,
//         headers: { 
//             'Content-Type': 'application/json'
//         },
//         data: JSON.stringify({
            //    token: jwtToken
//             search_item: localStorage.getItem("current_user"),
//             sid: localStorage.getItem(localStorage.getItem("current_user"))
//         }),
//         dataType: 'json',
//         contentType: 'application/json',
//         success: function(data)
//         {
//             isLogged = (data == 1);
//             if (!isLogged)
//                 window.location.replace('../index.html');
//         }
//     });
        
        // var sessionIdInfo = new jwt_decode(jwtToken);
        // console.log(sessionIdInfo);
        // console.log(sessionIdInfo['cognito:groups']);
}

function signOut(){
    var cognitoUser = getCurrentUser();
    cognitoUser.signOut();
    localStorage.removeItem("username");
    localStorage.removeItem("clientId");
    localStorage.removeItem("upId");
    var currentUser = localStorage.current_user;
    console.log(currentUser);
    localStorage.removeItem("current_user");
    localStorage.removeItem("project_type");
    localStorage.removeItem(currentUser);
    localStorage.removeItem("current_project");
    localStorage.removeItem("current_device");
    localStorage.clear()
}

//enable or disable button during the logging process
function loginInProgress(login_in_progress){
    
    if (login_in_progress){
        $('#login').val("Logging In...");
    } else {
        $('#login').val("Login"); 
    }
    disableLoginButton(login_in_progress);
}

function disableLoginButton (boolean){
    $('#login').prop('disabled', boolean);
}

function getCurrentUser(){
    var userPool = new AWSCognito.CognitoIdentityServiceProvider.CognitoUserPool(poolData);
    var cognitoUser = userPool.getCurrentUser();
    return cognitoUser;
}

$(function() {
    // localStorage.clear()
    $("form").keypress(function (e) {
        if ((e.which && e.which == 13) || (e.keyCode && e.keyCode == 13)) {
            if ($('#new-password-modal').is(':visible')){
                $('#setNewPassword').click();
            } else {
                $('#login').click();
            }
            return false;
        } else {
            return true;
        }
    });
});