function renderProjects(projects_list){
    for (var i = 0; i < Object.keys(projects_list).length; i++) {

        projectsHtml = '<div class="col-sm-4" style="background-color:white;">' +
                        '<div class="eventDisplay">' +
                            '<div class="thumb">' +
                                '<br>' +
                                '<img src="../ihydrogarden/images/Plantlocation.png" style="border-radius: 0%; width:35%;">' +
                                '<h3>' + displayProjectAliasName(projects_list[i]) + '</h3><br>' +
                                
                                '<div class="submit-button-div">' +
                                
                                    '<button type="button" class="select" onclick="onClickSelectProject(\'' + projects_list[i].pname + '\')">Select</button>&nbsp;' +
                                    '<button type="button" class="set_default">Set Default</button>' +
                            '</div>' +
                        '</div>' +
                    '</div>' +
                '</div>'
                
                $("#locations").append(projectsHtml);
        

        
    }
}


function getStatus() {
    var url = apiBaseUrl + "/Status/get-status";
    var userPool = new AWSCognito.CognitoIdentityServiceProvider.CognitoUserPool(poolData);
    var cognitoUser = userPool.getCurrentUser();
    var info = null;
  
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
          project_name: localStorage.getItem("current_project"),
          device_name: localStorage.getItem("current_device")
        }),
        dataType: 'json',
        contentType: 'application/json',
        success: function (data) {
          try {
            info = JSON.parse(data);
  
            // console.dir(data);
  
            if (_.isEqual(info, oldInfo))
              return;
            
            valve = info.zones;
            meter = info.meter;
            settings = info.settings;
            var trHtml;
            var content = $();
  
            $("#connection").html(`<span class="label ${meter.connection? `label-info` : `label-danger`  }">${meter.connection ? `Online` :  `Offline`}</span>`);
  
            oldInfo = info
          } catch (e) {
            if (e instanceof SyntaxError) {
              console.log(data);
            } else {
              console.log("Generic error: " + e);
            }
  
          }
        },
        statusCode: {
          504: function() {
            window.location.replace('../../index.html');
          }
        }
      });
    });
  }

  

function renderDevices(devices_list){
    var divicesCardHtml = $();
    
    var status = "Offline";

    // Run get-status to get the status of each device
    
    
    for (var i = 0; i < Object.keys(devices_list).length; i++) {
        // status = getDeviceStatus(devices_list[i].dname);
          devicesHtml = '<div class="col-sm-4" style="background-color:white;">' +
                        '<div class="eventDisplay">' +
                            '<div class="thumb">' +
                                '<br>' +
                                '<img src="../ihydrogarden/images/Controller.png" style="border-radius: 0%; width:35%;">' +
                                // '<h3>' + 'Device Name: ' + 'Main Controller'+ '<br>' +'Device ID: ' + devices_list[i].dname +'</h3>' +
                                '<h3 title="Device Name">' + 'Main Controller'+ '</h3>' +
                                '<h3 title="Device ID">' + devices_list[i].dname + '</h3>' +
                                '<div class="submit-button-div">' +
                                    '<button type="button" class="select" onclick="onClickSelectDevice(\'' + devices_list[i].dname + '\')">Select</button>&nbsp;' +
                                    '<button type="button" class="set_default">Set Default</button>' +
                                    '</div>' +
                                '</div>' +
                            '</div>' + 
                        '</div>'
                        

        $("#attention").hide();
        divicesCardHtml = divicesCardHtml.add(devicesHtml);
    }
    $("#devices").html(divicesCardHtml);

    $("#attention").hide();
    return true;
}

function renderSensors(sensors_list){
    console.log("renderSensors:");
    console.log(sensors_list);
    var sensorCardHtml = $();



    if(sensor_list["payload"] != null)
    {
        for(var i=0; i < sensors_list["payload"].length; i++){
            sensorsHtml = '<div class="col-sm-4" style="background-color:white;">' +
                                '<div class="eventDisplay">' +
                                    '<div class="thumb">' +
                                        '<br>' +
            
                                        '<div class="card shadow mb-4">'+
                                            '<div class="card-header py-3">' +
                                                '<h6 class="m-0 font-weight-bold text-primary">' + sensors_list["payload"][i]["id"] + '</h6>' +
                                            '</div>' +
                                            '<div class="card-body">' +
                                                '<div class="chart-area">' +
                                                    '<canvas id="myAreaChart' + sensors_list["payload"][i]["id"] +  '" width="360px" height="150px"></canvas>' +
                                                '</div>' +
                                                '<hr>' +
                                            '</div>' +
                                        '</div>' +
                                        '<h3 title="location">' + sensors_list["payload"][i]["location"] + '</h3>' +
    
                                        '<br><br>' +
                                    '</div>' +
                                '</div>' +
                            '</div>'
            sensorCardHtml = sensorCardHtml.add(sensorsHtml);
        }
    
        localStorage.setItem("last_evaluated_key", sensor_list["LastEvaluatedKey"])

    }
    // else {
    //     $("#loadMoreSensorsButton").hide(); 
    //     $("#sensors").hide()
    //     $("#sensor_title").hide()
    //     console.log("renderSensors full")
    // }
    
    // If #sensors contains child elements, append
    // else replace
    if($("#sensors div canvas").length > 0){
        console.log("Appending to existing element");
        $("#sensors").append(sensorCardHtml);
    } else {
        console.log("Replacing to existing element");
        $("#sensors").html(sensorCardHtml);
    }

    

    x_tmp_data = {
        "x": [
            "08/29/2023 15:03:37",
            "08/29/2023 15:08:37",
            "08/29/2023 15:13:37",
            "08/29/2023 15:18:37",
            "08/29/2023 15:23:37",
            "08/29/2023 15:28:37",
            "08/29/2023 15:33:37",
            "08/29/2023 15:38:37",
            "08/29/2023 15:43:37",
            "08/29/2023 15:48:37",
            "08/29/2023 15:53:37",
            "08/29/2023 15:58:36",
            "08/29/2023 16:03:36",
            "08/29/2023 16:08:37",
            "08/29/2023 16:13:37",
            "08/29/2023 16:18:36",
            "08/29/2023 16:23:37",
            "08/29/2023 16:28:37",
            "08/29/2023 16:33:37",
            "08/29/2023 16:38:37",
            "08/29/2023 16:43:37",
            "08/29/2023 16:48:37",
            "08/29/2023 16:53:37",
            "08/29/2023 16:58:36",
            "08/29/2023 17:03:36",
            "08/29/2023 17:08:36",
            "08/29/2023 17:13:36",
            "08/29/2023 17:18:36",
            "08/29/2023 17:23:36"
        ],
        "y": [0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0
        ]
    }
    x_tmp_data["x"] = createTimeInHourly();
    // for(var i=0; i < sensors_list["payload"].length; i++){
    //     // drawLineChart(sensors_list["payload"][i]["x"], sensors_list["payload"][i]["y"], sensors_list["payload"][i]["id"]);
    //     drawLineChart(x_tmp_data["x"], x_tmp_data["y"], sensors_list["payload"][i]["id"]);
    //     // drawLineChart_v1(x_tmp_data["x"], x_tmp_data["y"], sensors_list["payload"][i]["id"]);
    // }

    if(sensor_list["payload"] != null){
        for(var i=0; i < sensors_list["payload"].length; i++) {
            if(sensors_list["payload"][i]["x"].length > 0){
                drawLineChart(sensors_list["payload"][i]["x"], sensors_list["payload"][i]["y"], sensors_list["payload"][i]["id"]);
            } else {
                
                drawLineChart(x_tmp_data["x"], x_tmp_data["y"], sensors_list["payload"][i]["id"], "error");
            }
            
        }
    }
    return true;

}

function createTimeInHourly() {
    var result = []
    let current_date = new Date();
    let current_hour = current_date.getHours();
    console.log(current_hour);
    current_date.setHours(0,0,0,0);

    for(var idx=1; idx<=current_hour; idx++){
        let start_of_today = (current_date.getMonth() + 1).toString().padStart(2, '0') + '/' +
        current_date.getDate().toString().padStart(2, '0') + '/' +
        current_date.getFullYear() + ' ' +
        (current_date.getHours() + idx).toString().padStart(2, '0') + ':' +
        current_date.getMinutes().toString().padStart(2, '0') + ':' +
        current_date.getSeconds().toString().padStart(2, '0');
        result.push(start_of_today);
    }
    
    console.log(result);

    return result
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
                        $('#attention').hide()
                    }
                    else{
                        $('#attention').show()
                    }   
                }
            });
        });
    }
    
}


function renderLoadMoreButton(){
    $("#loadMoreSensorsButton").show();
}



function displayProjectAliasName(project){
    result = ""
    aliasName = project.display;
    if(aliasName != "None"){
        result = project.display;
    } else {
        result = project.pname;
    }
    return result;
}

function onClickSelectProject(project_name) {
    localStorage.setItem("current_project", project_name);
    window.location.replace('devices.html');
}

function onClickSelectDevice(device_name) {
    localStorage.setItem("current_device", device_name);
    window.location.replace('dashboard.html');
}

function getIdToken(session) {
    return session.getIdToken().getJwtToken();
}

// Set new default font family and font color to mimic Bootstrap's default styling
// Chart.defaults.global.defaultFontFamily = 'Nunito', '-apple-system,system-ui,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Arial,sans-serif';
// Chart.defaults.global.defaultFontColor = '#858796';

function number_format(number, decimals, dec_point, thousands_sep) {
  // *     example: number_format(1234.56, 2, ',', ' ');
  // *     return: '1 234,56'
  number = (number + '').replace(',', '').replace(' ', '');
  var n = !isFinite(+number) ? 0 : +number,
    prec = !isFinite(+decimals) ? 0 : Math.abs(decimals),
    sep = (typeof thousands_sep === 'undefined') ? ',' : thousands_sep,
    dec = (typeof dec_point === 'undefined') ? '.' : dec_point,
    s = '',
    toFixedFix = function(n, prec) {
      var k = Math.pow(10, prec);
      return '' + Math.round(n * k) / k;
    };
  // Fix for IE parseFloat(0.55).toFixed(0) = 0;
  s = (prec ? toFixedFix(n, prec) : '' + Math.round(n)).split('.');
  if (s[0].length > 3) {
    s[0] = s[0].replace(/\B(?=(?:\d{3})+(?!\d))/g, sep);
  }
  if ((s[1] || '').length < prec) {
    s[1] = s[1] || '';
    s[1] += new Array(prec - s[1].length + 1).join('0');
  }
  return s.join(dec);
}

function drawLineChart_v1(x_list, y_list, index){
    // This function requires Chart.js v3.3.0++
    // TODO: This function does not have the check on empty array and proper handling as drawLineChart()
    var chart_id = 'myAreaChart' + index;

    const zoomOptions = {
        limits: {
          y: {min: 0, max: 200, minRange: 50}
        },
        pan: {
          enabled: true,
          mode: 'xy',
        },
        zoom: {
          wheel: {
            enabled: false,
          },
          pinch: {
            enabled: false
          },
          mode: 'xy',
        }
    };

    const borderPlugin = {
        id: 'chartAreaBorder',
        beforeDraw(chart, args, options) {
          const {ctx, chartArea: {left, top, width, height}} = chart;
          if (chart.options.plugins.zoom.zoom.wheel.enabled) {
            ctx.save();
            ctx.strokeStyle = 'red';
            ctx.lineWidth = 1;
            ctx.strokeRect(left, top, width, height);
            ctx.restore();
          }
        }
    };

    var data = {
        labels: x_list,
        datasets: [{
            label: "Soil Moisture",
            lineTension: 0.3,
            backgroundColor: "rgba(78, 115, 223, 0.05)",
            borderColor: "rgba(78, 115, 223, 1)",
            pointRadius: 0,
            pointBackgroundColor: "rgba(78, 115, 223, 1)",
            pointBorderColor: "rgba(78, 115, 223, 1)",
            pointHoverRadius: 3,
            pointHoverBackgroundColor: "rgba(130, 184, 67, 1)",
            pointHoverBorderColor: "rgba(130, 184, 67, 1)",
            pointHitRadius: 10,
            pointBorderWidth: 2,
            data: y_list,
        }],
    };

    const config = {
        type: 'line',
        data: data,
        options: {
          scales: {y: {stacked: true, min: 0}},
          plugins: {
            legend: {
                display: false
            },
            zoom: zoomOptions,
            title: {
              display: false,
              position: 'bottom'
            }
          },
          onClick(e) {
            const chart = e.chart;
            chart.options.plugins.zoom.zoom.wheel.enabled = !chart.options.plugins.zoom.zoom.wheel.enabled;
            chart.options.plugins.zoom.zoom.pinch.enabled = !chart.options.plugins.zoom.zoom.pinch.enabled;
            chart.update();
          }
        },
        plugins: [borderPlugin]
    };

    var ctx = $('#' +chart_id);
    // var myLineChart = new Chart(ctx, data);
    var myLineChart = new Chart(ctx, config);
    myLineChart.update();
}

function drawLineChart(x_list, y_list, index, error="None"){
    var chart_id = 'myAreaChart' + index;

    var ctx = $('#' +chart_id);

    let grid_line_blue = 'rgb(234, 236, 244)';
    let line_color = 'rgba(78, 115, 223, 1)';
    let display_x_axis = true;

    if(error!="None") {
        line_color = 'rgba(223, 78, 78, 1)';
        display_x_axis = false;
    }

    var myLineChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: x_list,
            datasets: [{
                label: "Soil Moisture",
                lineTension: 0.3,
                backgroundColor: "rgba(78, 115, 223, 0.05)",
                borderColor: line_color,
                pointRadius: 0,
                pointBackgroundColor: "rgba(78, 115, 223, 1)",
                pointBorderColor: "rgba(78, 115, 223, 1)",
                pointHoverRadius: 3,
                pointHoverBackgroundColor: "rgba(130, 184, 67, 1)",
                pointHoverBorderColor: "rgba(130, 184, 67, 1)",
                pointHitRadius: 10,
                pointBorderWidth: 2,
                data: y_list,
            }],
        },
        options: {
            maintainAspectRatio: false,
            responsive: false,
            layout: {
                padding: {
                    left: 10,
                    right: 25,
                    top: 25,
                    bottom: 0
                }
            },
            scales: {
                xAxes: [{
                    time: {
                    unit: 'date'
                    },
                    gridLines: {
                        display: false,
                        drawBorder: false
                    },
                    ticks: {
                        maxTicksLimit: 5,
                        display: display_x_axis
                    }
                }],
                yAxes: [{
                    ticks: {
                        maxTicksLimit: 5,
                        padding: 10,
                        // Formatting for y axis
                        callback: function(value, index, values) {
                            let result = number_format(value);
                            if(error != "None") {
                                result = "Device is unreachable"
                            }
                            return result
                        }
                    },
                    gridLines: {
                        color: "rgb(234, 236, 244)",
                        zeroLineColor: "rgb(234, 236, 244)",
                        drawBorder: false,
                        borderDash: [2],
                        zeroLineBorderDash: [2]
                    }
                }],
            },
            legend: {
                display: false
            },
            tooltips: {
                backgroundColor: "rgb(255,255,255)",
                bodyFontColor: "#858796",
                titleMarginBottom: 10,
                titleFontColor: '#6e707e',
                titleFontSize: 14,
                borderColor: '#dddfeb',
                borderWidth: 1,
                xPadding: 15,
                yPadding: 15,
                displayColors: false,
                intersect: false,
                mode: 'index',
                caretPadding: 10,
                callbacks: {
                    label: function(tooltipItem, chart) {
                    var datasetLabel = chart.datasets[tooltipItem.datasetIndex].label || '';
                    result = datasetLabel + ': ' + number_format(tooltipItem.yLabel) + '%';
                    if(error!="None") {
                        result = "No Data Received";
                    }
                    return result;
                    }
                }
            }
        }
    });

    myLineChart.update();
}

