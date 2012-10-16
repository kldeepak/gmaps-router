var directionDisplay,
	directionsService = new google.maps.DirectionsService(),
	map,
	geocoder,
	gl_start, 		// starting point
	gl_end,	  		// end point
	gl_waypts,	 	// waypoints
	err_msg	= 'The server returned an error: ',
	totalDistance = 0,
	tariff = getTarrif();

function initialize() {
	geocoder = new google.maps.Geocoder();
	directionsDisplay = new google.maps.DirectionsRenderer();
	
	var map_center = new google.maps.LatLng(55.452083, 37.37030348); // center of the map (Moscow, Russia)
	
	var myOptions = {
		zoom: 6,
		mapTypeId: google.maps.MapTypeId.ROADMAP,
		center: map_center
	}
	
	map = new google.maps.Map(document.getElementById("map-canvas"), myOptions);
	directionsDisplay.setMap(map);
}

function calcRoute() {
	gl_start = null;
	gl_end = null;
	gl_waypts = [];
	
	// get start point
	var start = document.getElementById("start").value;
	
	geocoder.geocode({'address': start}, function(results, status) {
		if (status == google.maps.GeocoderStatus.OK) {
			gl_start = results[0].geometry.location;
			map.setCenter(results[0].geometry.location);
			var marker = new google.maps.Marker({
				map: map,
				position: results[0].geometry.location
			});
			checkArgs();
		} else {
			alert(err_msg + status);
		}
	});
	
	// get end point
	var end = document.getElementById("end").value;
	
	geocoder.geocode({'address': end}, function(results, status) {
		if (status == google.maps.GeocoderStatus.OK) {
			gl_end = results[0].geometry.location;
			var marker = new google.maps.Marker({
				map: map,
				position: results[0].geometry.location
			});
			checkArgs();
		} else {
			alert(err_msg + status);
		}
	});
	
	// get waypoints
	waypts = document.getElementById("waypts").value;
	
	// if they are, then divide the string into an array, separating elements with a semicolon and shove in json
	if (waypts) {
		waypts = waypts.split(';')
		for (var i = 0; i < waypts.length; i++) {
				gl_waypts.push({
					location:waypts[i],
					stopover:true
				});
			
		}
	}
}

function checkArgs() {
	if (gl_start == null || gl_end == null) {
		return;
	}
	
	// form a request 
	var request = {
		origin: gl_start,
		destination: gl_end,
		waypoints: gl_waypts,
		optimizeWaypoints: true,
		travelMode: google.maps.DirectionsTravelMode.DRIVING
	};
	
	directionsService.route(request, function(response, status) {
		if (status == google.maps.DirectionsStatus.OK) {
			directionsDisplay.setDirections(response);
			var route = response.routes[0];
			var summaryPanel = document.getElementById("directions-panel");
			summaryPanel.innerHTML = "";
			totalDistance = 0;
			
			// for each route, display summary information
			for (var i = 0; i < route.legs.length; i++) {
				var routeSegment = i + 1;
				summaryPanel.innerHTML += "<b>Point " + routeSegment + "</b><br />";
				summaryPanel.innerHTML += route.legs[i].start_address + " &rarr; ";
				summaryPanel.innerHTML += route.legs[i].end_address + "<br>";
				summaryPanel.innerHTML += route.legs[i].duration.text + '<br>'
				summaryPanel.innerHTML += route.legs[i].distance.text + "<br><hr><br>";
				totalDistance += route.legs[i].distance.value.toPrecision(3) / 1000;
				
			}
			
			summaryPanel.innerHTML += 'Total distance: ' + totalDistance + ' km<br>';
		}
	});
}