var g1,bar,oldInfo=null;function worker(){getStatus(),poller=setTimeout(worker,5e3)}function clock(){$("#clock").html(moment().format("dddd - DD MMM YYYY - H:mm:ss")),setTimeout(clock,1e3)}function addSoilMoistureIcon(e,t){t.hasOwnProperty("smsActive")&&t.hasOwnProperty("smsValue")?t.smsActive.startsWith("0")?addValveIcon(e,t):e.append("<td onclick='openStatus("+t.id+")'>Zone "+t.id+"<br><img class='zone' src='images/pot.png' style='cursor:pointer'></img><br>"+t.smsValue+" %<br></td>"):addValveIcon(e,t)}function addValveIcon(e,t){"boolean"==typeof t.status?t.status?e.append("<td onclick='openStatus("+t.id+")'>Zone "+t.id+"<br><img class='zone' src='images/zone-on.png' style='cursor:pointer'></img></td>"):e.append("<td onclick='openStatus("+t.id+")'>Zone "+t.id+"<br><img class='zone' src='images/zone.png' style='cursor:pointer'></img></td>"):"true"===t.status||"True"===t.status?e.append("<td onclick='openStatus("+t.id+")'>Zone "+t.id+"<br><img class='zone' src='images/zone-on.png' style='cursor:pointer'></img></td>"):e.append("<td onclick='openStatus("+t.id+")'>Zone "+t.id+"<br><img class='zone' src='images/zone.png' style='cursor:pointer'></img></td>")}function addZoneStatus(e,t,o){t.hasOwnProperty("smsActive")&&t.hasOwnProperty("smsValue")?t.smsActive.startsWith("0")?displayNextIrrigationStatus(e,t,o):displaySoilMoistureStatus(e,t,o):displayNextIrrigationStatus(e,t,o)}function displayNextIrrigationStatus(e,t,o){var s="<td> Next Irrigation: "+t.nextIrr+"<br>";s+="Last Flow Rate: "+o.lastFlow+" L/H<br>",s+="Expected Flow Rate: "+o.expFlow+" L/H<br>",s+="<button class='btn btn-warning' type='button' onclick='openStatus("+t.id+")'>Change Settings</button></td>",e.append(s)}function displaySoilMoistureStatus(e,t,o){html="<td> Desired Soil Moisture: "+t.smsDesiredValue+" %<br>",html+="Last Flow Rate: "+o.lastFlow+" L/H<br>",html+="Expected Flow Rate: "+o.expFlow+" L/H<br>",html+="<button class='btn btn-warning' type='button' onclick='openStatus("+t.id+")'>Change Settings</button></td>",e.append(html)}function getStatus(){var o="https://"+id+".execute-api.ap-southeast-1.amazonaws.com/"+stage+"/Status/get-status",e=new AWSCognito.CognitoIdentityServiceProvider.CognitoUserPool(poolData).getCurrentUser(),a=null;null!=e?e.getSession(function(e,t){e?console.dir(e):$.ajax({type:"POST",url:o,crossDomain:!0,headers:{"Content-Type":"application/json",Authorization:t.getIdToken().getJwtToken()},data:JSON.stringify({project_name:localStorage.getItem("current_project"),device_name:localStorage.getItem("current_device")}),dataType:"json",contentType:"application/json",success:function(t){try{if(a=JSON.parse(t),!_.isEqual(a,oldInfo)){var e;console.log(t),console.dir(a),valve=a.zones,meter=a.meter,settings=a.settings;var o=$();if(meter.connection?$("#connection").html('<span class="label label-info">Online</span>'):$("#connection").html('<span class="label label-danger">Offline</span>'),"NA"!=valve){for(var s=0;s<valve.length;s++){if(e=$("<tr/>"),0===valve[s].id?2<valve.length&&("boolean"==typeof valve[s].status?valve[s].status?e.append("<td><div class='wrapper'>Master Valve<br><img class='zone' src='images/zone-on.png'></img></div></td>"):e.append("<td><div class='wrapper'>Master Valve<br><img class='zone' src='images/zone.png'></img></div></td>"):"true"===valve[s].status||"True"===valve[s].status?e.append("<td><div class='wrapper'>Master Valve<br><img class='zone' src='images/zone-on.png'></img></div></td>"):e.append("<td><div class='wrapper'>Master Valve<br><img class='zone' src='images/zone.png'></img></div></td>")):valve[s].hasOwnProperty("smsActive")&&valve[s].hasOwnProperty("smsValue")?addSoilMoistureIcon(e,valve[s]):addValveIcon(e,valve[s]),0===valve[s].id)2<valve.length&&e.append("<td>N/A</td>");else if(valve.length<=2){console.log("hide");e.append("<td> No Sensor Detected <br></td>")}else addZoneStatus(e,valve[s],settings[s-1]);valve.length<=2&&($("#mainDash").hide(),$("#meter-message").hide(),$("#water-usage").hide()),"boolean"==typeof valve[s].status?0===valve[s].id&&valve.length<=2||(valve[s].status?e.append("<td id=zoneSwitch"+valve[s].id+"><button class='btn btn-danger' id='zone-btn-"+valve[s].id+"' data-loading-text='<i class=\"fa fa-circle-o-notch fa-spin\"></i> Loading...' onclick='switchValve("+valve[s].id+", 0)' type='button'>Turn Off</button></td>"):e.append("<td id=zoneSwitch"+valve[s].id+"><button class='btn btn-success' id='zone-btn-"+valve[s].id+"' data-loading-text='<i class=\"fa fa-circle-o-notch fa-spin\"></i> Loading...' onclick='switchValve("+valve[s].id+", 1)' type='button'>Turn On</button></td>")):0===valve[s].id&&valve.length<=2||("true"===valve[s].status||"True"===valve[s].status?e.append("<td id=zoneSwitch"+valve[s].id+"><button class='btn btn-danger' id='zone-btn-"+valve[s].id+"' data-loading-text='<i class=\"fa fa-circle-o-notch fa-spin\"></i> Loading...' onclick='switchValve("+valve[s].id+", 0)' type='button'>Turn Off</button></td>"):e.append("<td id=zoneSwitch"+valve[s].id+"><button class='btn btn-success' id='zone-btn-"+valve[s].id+"' data-loading-text='<i class=\"fa fa-circle-o-notch fa-spin\"></i> Loading...' onclick='switchValve("+valve[s].id+", 1)' type='button'>Turn On</button></td>")),o=o.add(e)}$("#valveslist").html(o)}"NA"==meter.flowRate&&(meter.flowRate="No sensor"),meter.highBound||(meter.highBound="No sensor"),g1.refresh(meter.flowRate,meter.highBound),"Normal"==meter.message?$("#meter-message").html('<span class="label label-info">'+meter.message+"</span>"):"NA"==meter.message?$("#meter-message").html('<span class="label label-danger">No Sensor</span>'):$("#meter-message").html('<span class="label label-danger">'+meter.message+"</span>"),"NA"==meter.waterUsage?(meter.waterUsage="",$("#water-usage").html("<h4><i>Total Water Usage: No Sensor </i></h4>")):$("#water-usage").html("<h4><i>Total Water Usage: "+meter.waterUsage+" &#8467;</i></h4>"),"NA"==meter.humidity?$("#Humidity").hide():($("#Humidity").css("display","inline-block"),$("#humidity_value").html("<span>"+meter.humidity+"</span>")),"NA"==meter.temperature?$("#Temperature").hide():($("#Temperature").css("display","inline-block"),$("#temperature_value").html("<span>"+meter.temperature+"</span>")),oldInfo=a}}catch(e){e instanceof SyntaxError?console.log(t):console.log("Generic error: "+e)}}})}):(alert("Please login!!"),window.location.replace("../../index.html"))}function switchOnValve(e){$("#switch-on-modal").modal("show"),title=0===e?"Master Valve":"Zone "+e,$("#switch-on-modal").find(".modal-title").html(title),$("#status-on-modal").find(".modal-title").val(e)}function switchValve(o,s){clearTimeout(poller),poller=setTimeout(worker,5e3);var a="https://"+id+".execute-api.ap-southeast-1.amazonaws.com/"+stage+"/Status/switch-valve",e=new AWSCognito.CognitoIdentityServiceProvider.CognitoUserPool(poolData).getCurrentUser();null!=e&&e.getSession(function(e,t){e?console.dir(e):$.ajax({type:"POST",url:a,crossDomain:!0,headers:{"Content-Type":"application/json",Authorization:t.getIdToken().getJwtToken()},data:JSON.stringify({project_name:localStorage.getItem("current_project"),device_name:localStorage.getItem("current_device"),valve_id:""+o,onOff:""+s}),dataType:"json",contentType:"application/json",success:function(e){$("#zone-btn-"+o).button("loading")}})})}function setSettings(){if(setSettingsValidate()){useSMS=$("#settings-useSMS").val(),sensorName=$("#settings-sensorName").val(),moistureLevel=$("#settings-moistureLevel").val(),zone=$("#status-modal").find(".modal-title").val(),error=$("#settings-error").val(),expFlow=$("#settings-expflow").val(),expTolHigh=$("#settings-exptolhigh").val(),expTolLow=$("#settings-exptollow").val();var o="https://"+id+".execute-api.ap-southeast-1.amazonaws.com/"+stage+"/Settings/set-valve-settings",e=new AWSCognito.CognitoIdentityServiceProvider.CognitoUserPool(poolData).getCurrentUser();null!=e&&e.getSession(function(e,t){e?console.dir(e):$.ajax({type:"POST",url:o,crossDomain:!0,headers:{"Content-Type":"application/json",Authorization:t.getIdToken().getJwtToken()},data:JSON.stringify({project_name:localStorage.getItem("current_project"),device_name:localStorage.getItem("current_device"),sms_active:useSMS,sms_name:sensorName,sms_lowSetPoint:moistureLevel,zone:""+zone,error:""+error,expected_flow:""+expFlow,expTolhigh:""+expTolHigh,expTolLow:""+expTolLow,totalZones:"6"}),dataType:"json",contentType:"application/json",success:function(e){$("#status-modal").modal("hide")}})})}}function setSettingsValidate(){var e=/^[0-9][0-9]?$|^100$/,t=$("#settings-useSMS").val(),o=$("#settings-moistureLevel").val(),s=$("#settings-expflow").val(),a=$("#settings-exptolhigh").val(),l=$("#settings-exptollow").val();return t.startsWith("1")&&!e.test(o)?($("#schedule-error-message").html("Please enter a moisture level between 0 to 100%."),$("#schedule-error").show(),!1):/^[0-9]{1,4}?$|^10000$/.test(s)?e.test(l)?!!e.test(a)||($("#schedule-error-message").html("Please enter a higher tolerance between 0 to 100%."),$("#schedule-error").show(),!1):($("#schedule-error-message").html("Please enter a lower tolerance between 0 to 100%."),$("#schedule-error").show(),!1):($("#schedule-error-message").html("Please enter an expected flow rate between 0 to 10000 L/H."),$("#schedule-error").show(),!1)}function openStatus(e){$("#status-modal").modal("show"),title=0===e?"Master Valve":"Zone "+e,$("#status-modal").find(".modal-title").html(title),$("#status-modal").find(".modal-title").val(e);var o="https://"+id+".execute-api.ap-southeast-1.amazonaws.com/"+stage+"/Settings/get-valve-settings",t=new AWSCognito.CognitoIdentityServiceProvider.CognitoUserPool(poolData).getCurrentUser(),s=e-1;null!=t&&t.getSession(function(e,t){e?console.dir(e):$.ajax({type:"POST",url:o,crossDomain:!0,headers:{"Content-Type":"application/json",Authorization:t.getIdToken().getJwtToken()},data:JSON.stringify({project_name:localStorage.getItem("current_project"),device_name:localStorage.getItem("current_device"),zone:s}),dataType:"json",contentType:"application/json",success:function(e){if(json=$.parseJSON(e),html="",json.soilMoistSettings.isPlcSMSVersion){html+='<div class="row">',html+='<div class="form-group col-sm-6">',html+="<label>Soil Moisture Sensor: </label>",html+='<div class="input-group">',html+='<select id="settings-useSMS" class="form-control">';var t=json.soilMoistSettings.active.startsWith("0");html+='<option value="1" ',t||(html+="selected"),html+=">",html+="Enabled</option>",html+='<option value="0" ',t|json.soilMoistSettings.active.startsWith("NA")&&(html+="selected"),html+=">",html+="Disabled</option>",html+="</select>",html+="</div></div>",html+="</div>",html+='<div class="row">',html+='<div class="form-group col-sm-6">',html+="<label>Sensor Name: </label>",html+='<div class="input-group">';var o=json.soilMoistSettings.sensorList;if(0<o.length){html+='<select id="settings-sensorName" class="form-control">';for(var s=json.soilMoistSettings.subscribed,a=0;a<o.length;a++)s.startsWith(o[a])?html+='<option value="'+o[a]+'" selected>':html+='<option value="'+o[a]+'">',html+=o[a]+"</option>";html+="</select>"}else html+='<div><font color="red">Please define some soil moisture sensors</font></div>';html+="</div></div>",html+='<div class="form-group col-sm-6">',html+="<label>Desired Moisture Content:</label>",html+='<div class="input-group">',html+='<input id="settings-moistureLevel" type="text" class="form-control" value="'+json.soilMoistSettings.lowSetpoint+'">',html+='<span class="input-group-addon">%</span>',html+="</div></div>",html+="</div>"}html+='<div class="row">',html+='<div class="form-group col-sm-6">',html+="<label>Error Alert: </label>",html+='<div class="input-group">',html+='<select id="settings-error" class="form-control">';var l="true"==json.error||"True"==json.error;html+='<option value="true" ',l&&(html+="selected"),html+=">",html+="Enabled</option>",html+='<option value="false" ',l||(html+="selected"),html+=">",html+="Disabled</option>",html+="</select>",html+="</div></div>",html+="</div>",html+='<div class="row">',html+='<div class="form-group col-sm-6">',html+="<label>Last Flow Rate: </label>",html+='<div class="input-group">',html+='<input id="settings-lastflow" type="text" class="form-control" value="'+json.lastFlow+'" disabled>',html+='<span class="input-group-addon">L/H</span>',html+="</div></div>",html+='<div class="form-group col-sm-6">',html+="<label>Expected Flow Rate</label>",html+='<div class="input-group">',html+='<input id="settings-expflow" type="text" class="form-control" value="'+json.expFlow+'">',html+='<span class="input-group-addon">L/H</span>',html+="</div></div>",html+="</div>",html+='<div class="row">',html+='<div class="form-group col-sm-6">',html+="<label>Expected Tolerance (High): </label>",html+='<div class="input-group">',html+='<input id="settings-exptolhigh" type="text" class="form-control" value="'+json.expTolHigh+'">',html+='<span class="input-group-addon">%</span>',html+="</div></div>",html+='<div class="form-group col-sm-6">',html+="<label>Expected Tolerance (Low): </label>",html+='<div class="input-group">',html+='<input id="settings-exptollow" type="text" class="form-control" value="'+json.expTolLow+'">',html+='<span class="input-group-addon">%</span>',html+="</div></div>",html+="</div>",html+='<div id="schedule-error" class="alert alert-danger">',html+='<strong>Error:</strong><div id="schedule-error-message"></div>',html+="</div>",$("#status-modal").find("#modal-body").html(html),$("#schedule-error").hide()}})})}function openMap(){$("#map-modal").modal("show")}function setConfig(){if($("#configuration-modal").modal("show"),setConfigValidate()){active=$("#configuration-modal").find("#active").val(),group=$("#configuration-modal").find("#group").val(),lowSetpoint=$("#configuration-modal").find("#low-setpoint").val();var e=new AWSCognito.CognitoIdentityServiceProvider.CognitoUserPool(poolData).getCurrentUser();null!=e&&e.getSession(function(e,t){e?console.dir(e):$.ajax({type:"POST",url:"https://xst0w6o6q2.execute-api.ap-southeast-1.amazonaws.com/dev/Settings/set-soil-moisture-settings",crossDomain:!0,headers:{"Content-Type":"application/json",Authorization:t.getIdToken().getJwtToken()},data:JSON.stringify({project_name:localStorage.getItem("current_project"),device_name:localStorage.getItem("current_device"),zone:"0",active:active,group:group,lowSetpoint:lowSetpoint}),dataType:"json",contentType:"application/json",success:function(e){$("#configuration-modal").modal("hide")}})})}}function setConfigValidate(){return intPatt=/^[0-9][0-9]?$|^100$/,group=$("#configuration-modal").find("#group").val(),lowSetpoint=$("#configuration-modal").find("#low-setpoint").val(),highSetpoint=$("#configuration-modal").find("#high-setpoint").val(),errorBox=$("#configuration-modal").find("#error"),errorMessage=$("#configuration-modal").find("#error-message"),lowSetpoint>=highSetpoint?(errorMessage.html("Please enter a low setpoint that is lower high setpoint."),errorBox.show(),!1):intPatt.test(lowSetpoint)?intPatt.test(highSetpoint)?!!intPatt.test(group)||(errorMessage.html("Please enter a group between 0 - 100."),errorBox.show(),!1):(errorMessage.html("Please enter a high setpoint between 0 - 100%."),errorBox.show(),!1):(errorMessage.html("Please enter a low setpoint between 0 - 100%."),errorBox.show(),!1)}$(document).ready(function(){$("#header-stuff").load("header-tp.html"),$("#nav-tp").load("nav-tp.html"),worker(),clock(),console.log("READY"),setTimeout(function(){alert("Session Expired!!"),window.location.replace("../../index.html")},36e5)}),$(window).bind("load",function(){g1=new JustGage({id:"g1",value:0,title:"Water Meter",label:"L/H"})});