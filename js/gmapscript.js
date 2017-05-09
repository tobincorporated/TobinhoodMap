/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */



/*
 *  Google Maps API functions
 */

// Variables used in the Googlle Maps API functions
var map;
var markers = [];
var largeInfowindow;
var smallInfowindow;
var windowTitle = '';
var windowText = '';


// Initialize Google Map
function initMap() {

    map = new google.maps.Map(document.getElementById('map'), {
        center: {lat: 34.144408, lng: -118.117983},
        zoom: 14,
        maxZoom: 16,
        mapTypeControl: false
    });

    largeInfowindow = new google.maps.InfoWindow();
    smallInfowindow = new google.maps.InfoWindow();

    for (var i = 0; i < locations.length; i++) {
        var position = locations[i].position;
        var title = locations[i].title;
        var marker = new google.maps.Marker({
            position: position,
            title: title,
            animation: google.maps.Animation.DROP,
            id: i
        });
        markers.push(marker);
        marker.addListener('click', function () {
            AJAXInfoWindow(this);
        });

        marker.addListener('mouseover', function () {
            populateSmallInfoWindow(this);
        });
    }
    showListings();
}

// When option is chosen from list, calls this function
function populateInfoWindowByIndex(index) {
    AJAXInfoWindow(markers[index]);
}

// Make AJAX call, then display location info on map
function AJAXInfoWindow(marker) {
    smallInfowindow.close();
    marker.setAnimation(google.maps.Animation.BOUNCE);

    var markerID = marker.id;
    var currentlocation = locations[markerID];
    var fsVenue = currentlocation.fsVenue;
    var fsPre = 'https://api.foursquare.com/v2/venues/';
    var fsID = '?client_id=F15PVAJ44Q5ASG1J2INQDCET4TX5HIDUXHFXV3DGVWXBEFBE';
    var fsSecret = '&client_secret=XX2K40GOPRYEORWWYGAPW2END33ZDJCVN1GBLCH5W4MA3JP5';
    var fsVer = '&v=20170309';
    var foursquareUrl = fsPre + fsVenue + fsID + fsSecret + fsVer;

    $.ajax({
        url: foursquareUrl,
        dataType: 'json',
        data: {
            async: true
        },        
        complete: function () {
            populateLargeInfoWindow(marker);
        }
    }).done(function (data) {
        var venue = data.response.venue.name;
        var formattedPhone = data.response.venue.contact.formattedPhone;
        var status = data.response.venue.hours.status;
        windowText = '<h2>' + venue + '</h2>';
        windowText += '<p>' + status + '</p>';
        windowText += '<p>Contact: ' + formattedPhone + '</p>';
    }).fail(function (error) {
        windowText = 'Oops! touble connecting to FourSquare API. Please try later.';
    });
}

// Display Location info on map
function populateLargeInfoWindow(marker) {
    setTimeout(function () {
        marker.setAnimation(null);
    }, 700);

    largeInfowindow.setContent(windowText);

    if (largeInfowindow.marker !== marker) {
        largeInfowindow.marker = marker;
        largeInfowindow.open(map, marker);
        largeInfowindow.addListener('closeclick', function () {
            largeInfowindow.marker = null;
        });
    }
}

// Displays mini-location window on map for help selecting locations
function populateSmallInfoWindow(marker) {

    if (smallInfowindow.marker !== marker) {
        smallInfowindow.marker = marker;
        smallInfowindow.setContent('<p>' + marker.title + '</p>');
        smallInfowindow.open(map, marker);
        smallInfowindow.addListener('mouseout', function () {
            smallInfowindow.close();
        });
    }
}

// Filters out markers based on Filter
function filterMarkers(markerIDs) {
    for (var i = 0; i < markers.length; i++) {
        markers[i].setMap(null);
    }
    var bounds = new google.maps.LatLngBounds();
    for (var i = 0; i < markerIDs.length; i++) {
        console.log('markerID: ' + markerIDs[i]);
        markerID = markerIDs[i];
        markers[markerID].setMap(map);
        bounds.extend(markers[markerID].position);
    }
    map.fitBounds(bounds);
}

// Displays markers on map
function showListings() {
    var bounds = new google.maps.LatLngBounds();
    for (var i = 0; i < markers.length; i++) {
        markers[i].setMap(map);
        bounds.extend(markers[i].position);
    }
    map.fitBounds(bounds);
}

function mapError() {
    $('#map').append('<h1>Sorry, there was an error loading the map</h1>');
}
