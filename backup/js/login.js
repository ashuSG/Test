// $('#login').click(function() {
//     console.log("LOGIN LOgin");
//     var url = 'https://7o8uauljbc.execute-api.ap-southeast-1.amazonaws.com/dev/login-user';
    
//     $('#login').attr('disabled','disabled');
//     $.ajax({
//         type: "POST",
//         url: url,
//         crossDomain: true,
//         headers: { 
//             'Content-Type': 'application/json'
//         },
//         data: JSON.stringify({
//             user_id: $("#username").val(),
//             password: $("#password").val()
//         }),
//         dataType: 'json',
//         contentType: 'application/json',
//         success: function(data)
//         {
//             info = data; // data is already in json format
            
//             // Stores the user_id to sessionStorage
//             localStorage.setItem('current_user', $("#username").val());
//             localStorage.setItem($("#username").val(), info.sid);

//             if ( info.login == 1 ) {
//                 //window.sessionStorage.token = info['msg'];
//                 window.location.replace('pages/projects.html');
//             }
//             else {
//                 alert(info);
//                 $('#login').removeAttr('disabled');
//             }
//         }
//     });

// });

// $(function() {
//     $("form").keypress(function (e) {
//         if ((e.which && e.which == 13) || (e.keyCode && e.keyCode == 13)) {
//             $('#login').click();
//             return false;
//         } else {
//             return true;
//         }
//     });
// });