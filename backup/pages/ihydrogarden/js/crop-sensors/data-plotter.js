function queryWUsageChart(startDate, endDate, mode) {
    // Send request to IOT api gateway
    var urlStr = "https://" + id + ".execute-api.ap-southeast-1.amazonaws.com/" + stage + "/Iot/get-wusage-by-mode";
    var userPool = new AWSCognito.CognitoIdentityServiceProvider.CognitoUserPool(poolData);
    var cognitoUser = userPool.getCurrentUser();
  
    if (cognitoUser != null) {
      cognitoUser.getSession(function(err, session) {
        if (err) {
          console.dir(err);
          return;
        } else {
          $.ajax({
            type: "POST",
            url: urlStr,
            crossDomain: true,
            headers: {
              'Content-Type': 'application/json',
              'Authorization': session.getIdToken().getJwtToken()
            },
            data: JSON.stringify({
              project_name: localStorage.getItem("current_project"),
              device_name: localStorage.getItem("current_device"),
              start: startDate,
              end: endDate,
              mode: mode
            }),
            dataType: 'json',
            contentType: 'application/json',
            success: function(data)
            {
              console.log("QueryWUsageChart data return:", data);
              readWUsageChart(mode);
            }
          })
          .fail(function(){
            console.log("QueryWUsageChart failed");
          });
        }
      });
    } else {
      alert("Please login!!");
      window.location.replace('../index.html');
    }
}
  
function readWUsageChart(mode) {
  // Read data from S3
  urlBase = "https://ihydrogarden.s3-ap-southeast-1.amazonaws.com/pages/ihydrogarden/";
  urlStr = urlBase + "res/" + localStorage.getItem("current_project") + "_out.csv";
  
  var userPool = new AWSCognito.CognitoIdentityServiceProvider.CognitoUserPool(poolData);
  var cognitoUser = userPool.getCurrentUser();

  if (cognitoUser != null) {
    cognitoUser.getSession(function(err, session) {
      if (err) {
        console.dir(err);
        return;
      } else {
        $.ajax({
          type: "GET",
          url: urlStr,
          cache: false,
          success: function(data) {
            console.log("Read data");
            console.dir(data);
            plotWUsageByMode(data, mode);
          }
        })
        .fail(function(data) {
          console.log("Nothing found");
          console.log(data);
        });
      }
    });
  } else {
    alert("Please login!!");
    window.location.replace('../index.html');
  }
}

function queryIndivChart(checkedZoneNames, checkedIndSNames, checkedDirectSNames, startDate, endDate) {
  var urlStr = "https://" + id + ".execute-api.ap-southeast-1.amazonaws.com/" + stage + "/Iot/get-historical-data";
  var userPool = new AWSCognito.CognitoIdentityServiceProvider.CognitoUserPool(poolData);
  var cognitoUser = userPool.getCurrentUser();

  if (cognitoUser != null) {
    cognitoUser.getSession(function(err, session) {
      if (err) {
        console.dir(err);
        return;
      } else {
        $.ajax({
          type: "POST",
          url: urlStr,
          crossDomain: true,
          headers: {
            'Content-Type': 'application/json',
            'Authorization': session.getIdToken().getJwtToken()
          },
          data: JSON.stringify({
            project_name: localStorage.getItem("current_project"),
            zone_names: checkedZoneNames,
            indirect_sensor_names: checkedIndSNames,
            direct_sensor_names: checkedDirectSNames,
            start : startDate,
            end : endDate
          }),
          dataType: 'json',
          contentType: 'application/json',
          success: function(data) {
            console.log("QueryIndivChart data return:", data);
            readIndivChart();
          }
        })
        .fail(function(){
          console.log("QueryIndivChart failed");
        });
      }
    });
  } else {
    alert("Please login!!");
    window.location.replace('../index.html');
  }
}

function readIndivChart(){
    urlBase = "https://ihydrogarden.s3-ap-southeast-1.amazonaws.com/pages/ihydrogarden/";
    urlStr = urlBase + "res/" + localStorage.getItem("current_project") + "_out.csv";
    
    var userPool = new AWSCognito.CognitoIdentityServiceProvider.CognitoUserPool(poolData);
    var cognitoUser = userPool.getCurrentUser();

    if (cognitoUser != null) {
      cognitoUser.getSession(function(err, session) {
        if (err) {
          console.dir(err);
          return;
        } else {
          $.ajax({
            type: "GET",
            url: urlStr,
            cache: false,
            success: function(data)
            {
              console.log("Read data");
              console.dir(data);
              plotIndivSensorData(data, "Average Flow (litre/hr)");
            }
          })
          .fail(function(data){
            console.log("Nothing found");
            console.log(data);
            // $("#graphdiv2").hide();
            // $("#no-data-msg").show();
          });
        }
      });
    } else {
      alert("Please login!!");
      window.location.replace('../index.html');
    }
}

/**
 * Plots individual sensor data readings
 * @param {*} data 
 * @param {*} ylbl 
 */
function plotIndivSensorData(data, ylbl){
  csvArray = parse(data)
  traces = processIndivTraces(csvArray)
  
  Plotly.newPlot(document.getElementById("graphdiv2"), traces, 
    {title: ylbl})
  
}

/**
 * Plots water usage report by mode (daily or monthly)
 * @param {*} data 
 * @param {*} mode 
 */
function plotWUsageByMode(data, mode) {
  periods = { D: ["Daily", "day"], W: ["Weekly", "week"], M: ["Monthly", "month"], Y: ["Yearly", "year"] };
  period = periods[mode];

  tickformats = { D: "%d/%m/%y", W: "%d/%m/%y", M: "%b %y" , Y: "%Y" };
  tformat = tickformats[mode]

  csvArray = parse(data);
  trace1 = processTotalByMode(csvArray);
  setTraceParams(trace1, {title: "test", type: "bar", xaxis: "x1", yaxis: "y1", showlegend: false});

  trace2 = processZoneByMode(csvArray);
  setTraceParams(trace2, {type: "bar", xaxis: "x2", yaxis: "y2", showlegend: false});

  trace3 = processZoneProportion(csvArray);
  setTraceParams(trace3, {type: "bar", xaxis: "x3", yaxis: "y3", name: "WUsage", showlegend: false});
  
  trace4 = processZoneByMode(csvArray);
  setTraceParams(trace4, {xaxis: "x4", yaxis: "y4", showlegend: false});

  var data = [...trace1, ...trace2, ...trace3, ...trace4];

  console.log("Adding all traces:", data);

  var layout = {
    title: `${period[0]} water usage report`,
    grid: {rows: 2, columns: 2, pattern: "independent"},
    barmode: "stack",
    xaxis: {
      title: { text:`Total water usage by ${period[1]}`, font: { size: 16 } },
      tickformat: tformat,
      autotick: false
    },
    yaxis: { title: { text:"Litres" } },
    xaxis2: {
      title: { text:`Total water usage by ${period[1]}, stacked by zone`, font: { size: 16 } },
      tickformat: tformat,
      autotick: false
    },
    yaxis2: { title: { text:"Litres" } },
    xaxis3: {
      title: { text:"Total water usage by zone", font: { size: 16 } },
      tickformat: tformat,
      autotick: false
    },
    yaxis3: { title: { text:"Litres" } },
    xaxis4: {
      title: { text:`Individual zone water usage by ${period[1]}`, font: { size: 16 } },
      tickformat: tformat,
      autotick: false
    },
    yaxis4: { title: { text:"Litres" } },
  };
  
  Plotly.newPlot(document.getElementById("graphdiv2"), data, layout);
}

/**
 * Subplot for total water consumption across time period
 * @param {*} data 
 * @returns plot trace
 */
function processTotalByMode(data) {
  var traces = [];
  var x = [];
  var y = [];
  
  for (var row = 1; row < data.length; row++) {
    x.push(data[row][0]);
    var temp = 0;
    for (var col = 1; col < data[0].length; col++) {
      temp += parseInt(data[row][col]);
    }
    y.push(temp);
  }

  traces.push({ x: x, y: y, name: "Total WUsage" });
  return traces;
}

/**
 * Subplot for water consumption of different zones across time period
 * @param {*} data 
 * @returns plot trace
 */
function processZoneByMode(data) {
  var traces = [];
  var x = [];
  
  for (var row = 1; row < data.length; row++) {
    x.push(data[row][0]);
  }

  for (var col = 1; col < data[0].length; col++) {
    var y = [];
    for (var row = 1; row < data.length; row++) {
      y.push(data[row][col]);
    }
    traces.push({ x: x, y: y, name:data[0][col] });
  }
  
  return traces;
}

/**
 * Subplot for water consumption of different zones
 * @param {*} data 
 * @returns plot trace
 */
function processZoneProportion(data) {
  var traces = [];
  var x = [];
  var y = [];
  
  for (var col = 1; col < data[0].length; col++) {
    x.push(data[0][col]);
    var temp = 0;
    for (var row = 1; row < data.length; row++) {
      temp += parseInt(data[row][col]);
    }
    y.push(temp);
  }

  traces.push({ x: x, y: y });
  return traces;
}

/**
 * Applies each of the attributes in params to each element of a trace
 * @param {*} trace 
 * @param {*} params 
 */
function setTraceParams(trace, params={})  {
  for (const element of trace) {
    for (const key in params) {
      element[key] = params[key];
    }
  }
}

/**
 * Processes individual traces
 * @param {*} data 
 * @returns plot trace
 */
function processIndivTraces(data) {
  var traces = [];
  var x =[];
  
  for (var row = 1; row < data.length; row++) {
    x.push(data[row][0]);
  }

  for (var col = 1; col < data[0].length; col++) {
    var y = [];
    for (var row = 1; row < data.length; row++) {
      y.push(data[row][col]);
    }
    traces.push({ x: x, y: y, name: data[0][col] })
  }
  
  return traces;
}