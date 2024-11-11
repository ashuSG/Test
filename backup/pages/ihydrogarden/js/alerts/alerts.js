$(document).ready(function () {
  startAlertsPoller(10000)
});

var active_alerts_table;

function startAlertsPoller(pollRate) {
  (function worker() {
    displayTableAlertsActive();
    displayTableAlertsLog();
    // getActiveAlerts();
    // getAlertsLog();
    // setTimeout(worker, pollRate);
  })();
}

$('#table_alerts_active tbody').on('click', 'button', function () {
  var data = active_alerts_table.row($(this).parents('tr')).data();
  alert(data["alert_desc"] + "  " + $(this).parents('tr').find("input").val());

  // Get tag, alert_time, and remark
  tag = data["tag"];
  alert_time = data["alert_time"]
  remark = $(this).parents('tr').find("input").val();

  let ack_time = Math.round(Date.now() / 1000);
  let uname = localStorage.getItem("username")

  // publish to acknowledgeAlert
  acknowledgeAlert(tag, alert_time, ack_time, uname, remark)
});

function displayTableAlertsActive() {
  getActiveAlerts();

}

function populateAlertsActiveTable(active_alerts_list) {
  active_alerts_table = $('#table_alerts_active').DataTable({
    data: active_alerts_list,
    columns: [
      { data: "alert_datetime" },
      { data: "case_id" },
      { data: "proj_id" },
      { data: "device_id" },
      { data: "zone_id" },
      { data: "alert_desc" },
      { data: "priority" },
      { data: "state_desc" }
    ],
    columnDefs: [
      {
        orderable: false,
        targets: [8, 9]
      },
      {
        targets: [8],
        data: null,
        defaultContent: "<input class='form-control form-control-sm' type='text'>"
      },
      {
        targets: [9],
        data: null,
        defaultContent: "<button class='btn btn-primary'>Clear</button>"
      }
    ]
  });

}
function displayTableAlertsLog() {
  getAlertsLog();
}

function getActiveAlerts() {
  var poolData = {
    UserPoolId: localStorage.getItem("upId"),
    ClientId: localStorage.getItem("clientId")
  };
  var url = apiBaseUrl + "/Alarms/get-active-alerts";
  var userPool = new AWSCognito.CognitoIdentityServiceProvider.CognitoUserPool(poolData);
  var cognitoUser = userPool.getCurrentUser();

  if (cognitoUser == null) 
    return;

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
    }).done(function (data) {
      activeAlertsList = $.parseJSON(data);
      populateAlertsActiveTable(activeAlertsList);
    });
  });
}

function getAlertsLog() {
  var poolData = {
    UserPoolId: localStorage.getItem("upId"),
    ClientId: localStorage.getItem("clientId")
  };

  // TODO: change get-active-alerts to get-logged-alerts
  var url = apiBaseUrl + "/Alarms/get-logged-alerts";
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
      data: JSON.stringify({
        project_name: localStorage.getItem("current_project"),
        device_name: localStorage.getItem("current_device")
      }),
      dataType: 'json',
      contentType: 'application/json',
      success: function (data) {
        historicalAlertsList = $.parseJSON(data);
        $('#table_alerts_log').DataTable({
          data: historicalAlertsList,
          columns: [
            { data: "alert_datetime" },
            { data: "case_id" },
            { data: "proj_id" },
            { data: "device_id" },
            { data: "zone_id" },
            { data: "alert_id" },
            { data: "alert_desc" },
            { data: "priority" },
            { data: "state_desc" },
            { data: "resolution_msg" },
            { data: "ack_datetime" },
            { data: "ack_by" },
          ],
          columnDefs: [{
            targets: [4],
            visible: false,
            searchable: false
          },
          {
            targets: [7],
            orderData: [4]
          }
          ]
        });
      }
    });
  });
}

function getformatedTime(mSec, options) {
  var formattedTime = "";

  var date = new Date(mSec * 1000);
  formattedTime = date.toLocaleTimeString("en-us", options);

  return formattedTime;
}

function acknowledgeAlert(tag, alert_time, ack_time, ack_by, remark) {
  var poolData = {
    UserPoolId: localStorage.getItem("upId"),
    ClientId: localStorage.getItem("clientId")
  };

  var url = apiBaseUrl + "/Alarms/acknowledge-alerts";
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
      data: JSON.stringify({
        tag: tag,
        alert_time: alert_time,
        ack_time: ack_time,
        ack_by: ack_by,
        remark: remark
      }),
      dataType: 'json',
      contentType: 'application/json',
      success: function (data) {
        location.reload();
      }
    });
  });
}