var projectStyle = [
    {
        featureType: "administrative",
        elementType: "labels",
        stylers: [
            { visibility: "off" }
        ]
    },
    {
        featureType: "poi",
        elementType: "labels",
        stylers: [
            { visibility: "off" }
        ]
    },
    {
        featureType: "water",
        elementType: "labels",
        stylers: [
            { visibility: "off" }
        ]
    },
    {
        featureType: 'transit',
        elementType: "labels",
        stylers: [
            { visibility: "off" }
        ]
    },
    {
        featureType: 'road',
        elementType: "labels.icon",
        stylers: [
            { visibility: "off" }
        ]
    }
];

var map;
var infowindow;
var bounds;

$(document).ready(function() {
    // Session will expire at 1 hour
    setTimeout(function() {
        alert("Session Expired!!");
        window.location.replace('../index.html');
    }, 3600000);
    // listProjects();
});

function listProjects(){
    // var url = 'https://1ri6rn6wgh.execute-api.ap-southeast-1.amazonaws.com/prod/Projects/get-projects';
    var url = "https://" + id + ".execute-api.ap-southeast-1.amazonaws.com/" + stage + "/Projects/get-projects";

    var userPool = new AWSCognito.CognitoIdentityServiceProvider.CognitoUserPool(poolData);
    var cognitoUser = userPool.getCurrentUser();
    if (cognitoUser != null) {
        cognitoUser.getSession(function(err, session) {
            if (err) {
                console.dir(err);
                return;
            }
            
            var username = sessionStorage.username
            // console.log("Username: " + username);
            var idToken = getIdToken(session);
            // console.log("ID Token: " + idToken);

            // cognitoUser.getUserAttributes(function(err, result) {
            //     if (err) {
            //         alert(err);
            //         return;
            //     }
            //     console.log(result);
            //     for (i = 0; i < result.length; i++) {
            //         console.log('attribute ' + result[i].getName() + ' has value ' + result[i].getValue());
            //     }
            // });
            
            $.ajax({
                type: 'POST',
                url: url,
                crossDomain: true,
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': getIdToken(session)
                },
                url: url,
                data: JSON.stringify({
                    table_name: 'users_projects',
                    filter_attr_key: 'user_id',
                    search_item: username, 
                    projection_expression: 'project_name, display, project_type, coordinates, time_zone',
                    limit : "50",
                    scan_forward : "false"
                }),
                dataType: 'json',
                contentType: 'application/json',
                success: function(data)
                {
                    console.dir(data)
                    json = JSON.parse(data);
                    console.dir(json);
                    projects_list = json.projects_list;
                    sessionStorage.setItem("user_roles", json.user_roles);
                    // sessionStorage.setItem("timezone", json.user_roles);
                    if (Object.keys(projects_list).length < 1){
                        //prompt user to contact administrator
                        alert("You do not have any projects. Please contact your system administrator.");
                    }else{
                        var mapOptions = {
                            mapTypeId: 'projectStyle'
                        };
                        map = new google.maps.Map(document.getElementById("googleMap"), mapOptions);
                        map.mapTypes.set('projectStyle', new google.maps.StyledMapType(projectStyle, { name: 'Projects' }));
    
                        bounds = new google.maps.LatLngBounds();
                        infowindow = new google.maps.InfoWindow();    
    
                        var tr;
                        // Add Cold Storage locations
                        // addColdStorageLocation(map, infowindow, bounds);
                        // addWaterLocation(map, infowindow, bounds);
                        
                        for (var i = 0; i < Object.keys(projects_list).length; i++) {
                            tr = $('<tr/>');
                            if(projects_list[i].display != "None"){
                                console.log("storeCurrentProject");
                                tr.append("<td><a onclick='storeCurrentProject(\""+projects_list[i].pname+"\")' href='devices.html?pname=" + projects_list[i].pname + "'> " + projects_list[i].display + "</a></td>");
                            } else {
                                tr.append("<td><a onclick='storeCurrentProject(\""+projects_list[i].pname+"\")' href='devices.html?pname=" + projects_list[i].pname + "'> " + projects_list[i].pname + "</a></td>");
                            }
                            tr.append("<td>" + projects_list[i].latitude + "</td>");
                            tr.append("<td>" + projects_list[i].longitude + "</td>");
                            $('#projectslist').append(tr);
    
                            image = {
                                // url: '../dist/images/netafresh_logo.png',
                                url: '../dist/images/ihydro_icon.png',
                                scaledSize: new google.maps.Size(32, 32)
                            };
    
                            var marker = new google.maps.Marker({
                                position: new google.maps.LatLng(projects_list[i].latitude, projects_list[i].longitude),
                                map: map,
                                icon: image
                            });

                            //extend the bounds to include each marker's position
                            bounds.extend(marker.position);
    
                            google.maps.event.addListener(marker, 'click', (function(marker, i) {
                            return function() {
                                if(projects_list[i].display != "None"){
                                    storeCurrentProject(projects_list[i].pname);
                                    storeCurrentTimeZone(projects_list[i].time_zone);
                                    infowindow.setContent("<a href='devices.html?pname=" + projects_list[i].pname + "'> " + projects_list[i].display + "</a>");
                                } else {
                                    storeCurrentProject(projects_list[i].pname);
                                    storeCurrentTimeZone(projects_list[i].time_zone);
                                    infowindow.setContent("<a href='devices.html?pname=" + projects_list[i].pname + "'> " + projects_list[i].pname + "</a>");
                                }

                                localStorage.setItem("project_type", projects_list[i].type);
                             
                                
                                infowindow.open(map, marker);
                            }
                            })(marker, i));
                        }
                        //now fit the map to the newly inclusive bounds
                        map.fitBounds(bounds);
                    }
                }
            });
        });
    } else {
        alert("Please login!!");
        window.location.replace('../index.html');
    }
}

function addWaterLocation(mapArea, info, boundary){
   

    var loc = [{latitude: 1.408895, longitude: 103.897656, name: "PWC31"}, 
               {latitude: 1.412877, longitude: 103.899892, name: "PWC32"},
               {latitude: 1.411823, longitude: 103.897323, name: "PWC33"}, 
               {latitude: 1.411710, longitude: 103.897741, name: "PWC34"}, 
               {latitude: 1.402565, longitude: 103.895853, name: "PWC35"},
               {latitude: 1.402301, longitude: 103.891036, name: "PWC36"},
               {latitude: 1.401593, longitude: 103.894008, name: "PWC40"},
               {latitude: 1.402150, longitude: 103.917363, name: "PEC36"},
               {latitude: 1.401944, longitude: 103.914398, name: "PEC38"},
               {latitude: 1.405055, longitude: 103.912928, name: "PEC39"},
               {latitude: 1.405436, longitude: 103.909114, name: "PEC40"},
               {latitude: 1.406449, longitude: 103.911211, name: "PEC41"},
               {latitude: 1.352669, longitude: 103.851137, name: "SkyVue"},
               {latitude: 1.309801, longitude: 103.717200, name: "Jurong"},
               {latitude: 1.352669, longitude: 103.851137, name: "SkyVue"},
               {latitude: 1.371653, longitude: 103.946076, name: "CoCo Palm"},
               {latitude: 1.352669, longitude: 103.851137, name: "SkyVue"},
               {latitude: 1.303308, longitude: 103.777656, name: "United World College"},
               {latitude: 1.305893, longitude: 103.822080, name: "Interpol"},
               {latitude: 1.345144, longitude: 103.790458, name: "Institution of Engineers"},
               {latitude: 1.277187, longitude: 103.620261, name: "JTC ChemicalHub"},
               {latitude: 1.306774, longitude: 103.788453, name: "Star Vista"},
               {latitude: 1.312534, longitude: 103.853899, name: "Connexion"},
               {latitude: 1.340608, longitude: 103.949354, name: "Changi General Hospital"},
               {latitude: 1.326008, longitude: 103.801435, name: "Hwa Chong Institution"},
               {latitude: 1.345144, longitude: 103.790458, name: "Institution of Engineers"},
               {latitude: 1.329891, longitude: 103.890123, name: "Micron Singapore"},
               {latitude: 1.345144, longitude: 103.790458, name: "Institution of Engineers"},
               {latitude: 1.380711, longitude: 103.871043, name: "Luxus Hill"}];

    for (var i = 0; i < loc.length; i++){
        // console.log(i + "  " + loc[i].latitude);
        // var name = loc[i].name;
        // console.log("name = " + name);
        // var image = {
        //     // url: '../dist/images/netafresh_logo.png',
        //     url: '../dist/images/projects.png',
        //     scaledSize: new google.maps.Size(32, 32)
        // };

        // var marker = new google.maps.Marker({
        //     position: new google.maps.LatLng(loc[i].latitude, loc[i].longitude),
        //     map: map,
        //     icon: image
        // });
    
        // //extend the bounds to include each marker's position
        // // bounds.extend(marker.position);
        // google.maps.event.addListener(marker, 'click', function() {
        //     infowindow.setContent(name);
        //     infowindow.open(map, this);
        // });
        createWaterMarker(loc[i])
    }
    
}

function addColdStorageLocation(mapArea, info, boundary){
    var singapore = new google.maps.LatLng(1.358857, 103.812772);
    var service = new google.maps.places.PlacesService(mapArea);
    console.log("adding new locations")
    var request = {
        location: singapore,
        radius: '200000', //200km
        keyword: 'Cold Storage',
        name: 'Cold Storage',
        type: ['Supermarket']
    };

    service.nearbySearch(request, function(results, status, pagination){
        if (status !== google.maps.places.PlacesServiceStatus.OK) return;
        createMarker(results);

        while(pagination.hasNextPage){
            createMarker(pagination.nextPage());
        }
        
    });
}

function callback(results, status){
    if (status === google.maps.places.PlacesServiceStatus.OK) {
        for (var i = 0; i < results.length; i++) {
          createMarker(results[i]);
        }
    }

}

function createMarker(places){
    // console.dir(places);
    if(places == 'undefined'){
        return;
    }
    for (var i=0; i < places.length; i++) {
        var place = places[i]
        // var placeLocation = place.geometry.location;
        var bounds = new google.maps.LatLngBounds();
        var imageiHydroGarden = {
            url: '../dist/images/cs_icon.png',
            scaledSize: new google.maps.Size(32, 32)
        };
        var marker = new google.maps.Marker({
            position: place.geometry.location,
            map: map,
            icon: imageiHydroGarden
        });

        google.maps.event.addListener(marker, 'click', function() {
            infowindow.setContent(place.name);
            infowindow.open(map, this);
        });
    }   
}

function createWaterMarker(place){
    // console.dir("place = " + place);
    // var placeLocation = place.geometry.location;
    var imageiHydroGarden = {
        url: '../dist/images/waterglobe_icon.png',
        scaledSize: new google.maps.Size(32, 32)
    };
    var marker = new google.maps.Marker({
        position: new google.maps.LatLng(place.latitude, place.longitude),
        map: map,
        icon: imageiHydroGarden
    });

    google.maps.event.addListener(marker, 'click', function() {
        infowindow.setContent(place.name);
        infowindow.open(map, this);
    });
}

function getIdToken(session){
    return session.getIdToken().getJwtToken();    
}

function storeCurrentProject(pname){
    localStorage.setItem("current_project", pname);
}

function storeCurrentTimeZone(time_zone){
    localStorage.setItem("time_zone", time_zone);
}

function storeCurrentDevice(dname){
    localStorage.setItem("current_device", dname);
}

function listDevices(){
	var pname = getParameterByName('pname');
    // var url = 'https://1ri6rn6wgh.execute-api.ap-southeast-1.amazonaws.com/prod/Devices/get-devices';
    var url = "https://" + id + ".execute-api.ap-southeast-1.amazonaws.com/" + stage + "/Devices/get-devices";
    
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
                        json = JSON.parse(data);
                        console.log("DynamoDB result: " + json);
                        console.log("Object.keys(json).length: " + Object.keys(json).length);

                        if (Object.keys(json).length < 1){
                            //prompt user to contact administrator
                            alert("You do not have any devices. Please contact your system administrator.");
                        } else {

                            var mapOptions = {
                            mapTypeId: 'projectStyle'
                            };
                            map = new google.maps.Map(document.getElementById("googleMap"), mapOptions);
                            map.mapTypes.set('projectStyle', new google.maps.StyledMapType(projectStyle, { name: 'Devices' }));

                            bounds = new google.maps.LatLngBounds();
                            infowindow = new google.maps.InfoWindow();   
                            var tr;
                            for (var i = 0; i < json.length; i++) {
                                tr = $('<tr/>');
                                tr.append("<td><a onclick='storeCurrentDevice(\""+json[i].dname+"\")' href='../pages/ihydrogarden/dashboard.html?dname=" + json[i].dname + "&type=ihydrogarden'> " + json[i].dname + "</a></td>");
                                tr.append("<td>" + json[i].latitude + "</td>");
                                tr.append("<td>" + json[i].longitude + "</td>");
                                $('#deviceslist').append(tr);

                                image = {
                                    // url: '../dist/images/ihydrogarden.png',
                                    url: '../dist/images/netafresh_logo.png',
                                    scaledSize: new google.maps.Size(32, 32)
                                };

                                var marker = new google.maps.Marker({
                                    position: new google.maps.LatLng(json[i].latitude, json[i].longitude),
                                    map: map,
                                    icon: image
                                });

                                //extend the bounds to include each marker's position
                                bounds.extend(marker.position);

                                google.maps.event.addListener(marker, 'click', (function(marker, i) {
                                return function() {
                                    storeCurrentDevice(json[i].dname)
                                    infowindow.setContent("<a href='../pages/ihydrogarden/dashboard.html?dname=" + json[i].dname + "&type=ihydrogarden'> " + json[i].dname + "</a>");
                                    infowindow.open(map, marker);
                                }
                                })(marker, i));
                            }
                            //now fit the map to the newly inclusive bounds
                            map.fitBounds(bounds);
                        }
                    }
                });
            }
        });
    } else {
        alert("Please login!!");
        window.location.replace('../index.html');
    }
}

