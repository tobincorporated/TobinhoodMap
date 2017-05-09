// Initial Locations List
var locations = [
    {
        title: 'Pizza Rev',
        position: {lat: 34.150412, lng: -118.079213},
        fsVenue: '53604ff1498e5c913e130565',
        tags: 'food, pizza'},
    {
        title: 'Wingstop',
        position: {lat: 34.146219, lng: -118.115185},
        fsVenue: '56e39518498e3a6d0749bcf8',
        tags: 'food, chicken wings'},
    {
        title: 'Lucky Baldwin',
        position: {lat: 34.145803, lng: -118.113960},
        fsVenue: '4d51e88d7ee1a35d31af9434',
        tags: 'bar, pub, restaurant, food, british'},
    {
        title: 'Tea Spots',
        position: {lat: 34.146369, lng: -118.120681},
        fsVenue: '4b4cba46f964a5201fbc26e3',
        tags: 'food, tea'},
    {
        title: 'Sushi Stop',
        position: {lat: 34.145703, lng: -118.149191},
        fsVenue: '523660ca11d2994db9610366',
        tags: 'food, sushi, japanese'}
];


/*
 * Knockout VMMV code
 */

// Defining a Knockout Location object
var Loc = function (data) {
    this.title = ko.observable(data.title);
    this.tags = ko.observable(data.tags);
    this.markerID = ko.observable(data.markerID);
    this.filterText = ko.computed(
            function () {
                return this.title() + this.tags();
            }, this);
};


var ViewModel = function () {
    var self = this;
    this.locList = ko.observableArray([]);
    
    // Marker ID helps link KO Loc object to GMaps API markers
    var markerID = 0;
    locations.forEach(function (locItem) {
        locItem['markerID'] = markerID;
        self.locList.push(new Loc(locItem));
        markerID++;
    });



    // Display selected location on map
    this.setCurrentLoc = function (clickedLoc) {
        populateInfoWindowByIndex(clickedLoc.markerID());
    };

    // Function called during mouseover event on location list
    this.highlightLoc = function (selectedLoc) {
        var selectedMarker = markers[selectedLoc.markerID()];
        populateSmallInfoWindow(selectedMarker);
    };


    
        // Function called when clicking 'Filter' button
    this.ko2mapFilter = function () {
        var markerIDs = [];
        self.filteredLocs().forEach(function (locItem) {
                markerIDs.push(locItem.markerID());
        });
        filterMarkers(markerIDs);
    };
    
    
    //KO filter
    this.filter = ko.observable('');
    this.filteredLocs = ko.computed(function() {
        var filter = this.filter().toLowerCase();
        if (!filter) {
              return this.locList();
          } else {
              return ko.utils.arrayFilter(this.locList(), function (loc) {
                  return loc.filterText().toLowerCase().indexOf(filter) !== -1;
              });
          };
    }, this);
     this.filteredLocs.subscribe(function () {
        self.ko2mapFilter();                
  });
    
    
    
    
};

ko.applyBindings(new ViewModel());

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

        success: function (data) {
            var venue = data.response.venue.name;
            var formattedPhone = data.response.venue.contact.formattedPhone;
            var status = data.response.venue.hours.status;
            windowText = '<h2>' + venue + '</h2>';
            windowText += '<p>' + status + '</p>';
            windowText += '<p>Contact: ' + formattedPhone + '</p>';
        },

        error: function (jqXHR, textStatus, errorThrown) {
            windowText = 'Oops! touble connecting to FourSquare API. Please try later.';
            infowindow.setContent(windowText);
        },
        
        complete: function (jqXHR, status) {
            populateLargeInfoWindow(marker);
        }
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
        console.log('markerID: '+markerIDs[i]);
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

function mapError(){
    $('#map').append('<h1>Sorry, there was an error loading the map</h1>');
}
