var locations = [
    {
        title: 'Caltech',
        position: {lat: 34.139137, lng: -118.125432},
        fsVenue: '4af9ae79f964a5204d1322e3',
        tags: 'school, college, education'},
    {
        title: 'Comics Factory',
        position: {lat: 34.145754, lng: -118.123625},
        fsVenue: '4b314068f964a520400325e3',
        tags: 'comics, games, manga'},
    {
        title: 'Lucky Baldwin',
        position: {lat: 34.145803, lng: -118.113960},
        fsVenue: '4d51e88d7ee1a35d31af9434',
        tags: 'bar, pub, restaurant, food'},
    {
        title: 'PCC',
        position: {lat: 34.145382, lng: -118.118237},
        fsVenue: '4511eb8cf964a5209a391fe3',
        tags: 'school, college, education'},
    {
        title: 'Academy Theater',
        position: {lat: 34.146130, lng: -118.129841},
        fsVenue: '4a5eaabcf964a52006bf1fe3',
        tags: 'movies, theatre, cinema'}
];


var map;
var markers = [];
var largeInfowindow;
var smallInfowindow;
var windowTitle='';
var windowText='';

var Loc = function (data) {
    this.title = ko.observable(data.title);
    this.position = ko.observable(data.position);
    this.fsVenue = ko.observable(data.fsVenue);
    this.tags = ko.observable(data.tags);
    this.markerID = ko.observable(data.markerID);
    this.fullName = ko.computed(
            function () {
                return this.title() + " The Loc";
            }, this);
};


var ViewModel = function () {
    var self = this;
    this.locList = ko.observableArray([]);

    var markerID=0;
    locations.forEach(function (locItem) {
        locItem['markerID'] = markerID;
        self.locList.push(new Loc(locItem));
        markerID++;
    });


    this.currentLoc = ko.observable(this.locList()[0]);

    this.setCurrentLoc = function (clickedLoc) {
        self.currentLoc(clickedLoc);
        populateInfoWindowByIndex(clickedLoc.markerID());
        console.log('set current loc call');
    };
    
    this.highlightLoc = function (selectedLoc) {
//        console.log("highlight");
//        console.log(selectedLoc.title());
    };
    
    this.filterLocs = function (formElement) {
        var filterWord = $('#street').val().toLowerCase();
        var loctext = '';
        var markerIDs = [];
        console.log('Filter submitted');
        console.log(filterWord);
        self.locList.removeAll();
        locations.forEach(function (locItem) {
            loctext = (locItem.title + locItem.tags).toLowerCase();
            console.log('Filter checking: ' +octext);
            if (loctext.includes(filterWord)) {
                self.locList.push(new Loc(locItem));
                markerIDs.push(locItem.markerID);
            };
        });
        filterMarkers(markerIDs);

    };


};



ko.applyBindings(new ViewModel());

// GMaps

function initMap() {
    // Constructor creates a new map - only center and zoom are required.
    map = new google.maps.Map(document.getElementById('map'), {
        center: {lat: 34.144408, lng: -118.117983},
        zoom: 14,
        mapTypeControl: false
    });

    largeInfowindow = new google.maps.InfoWindow();
    smallInfowindow = new google.maps.InfoWindow();

    // The following group uses the location array to create an array of markers on initialize.
    for (var i = 0; i < locations.length; i++) {
        // Get the position from the location array.
        var position = locations[i].position;
        var title = locations[i].title;
        // Create a marker per location, and put into markers array.
        var marker = new google.maps.Marker({
            position: position,
            title: title,
            animation: google.maps.Animation.DROP,
            id: i
        });
        // Push the marker to our array of markers.
        markers.push(marker);
        // Create an onclick event to open an infowindow at each marker.
        marker.addListener('click', function () {
            AJAXInfoWindow(this);
        });

        marker.addListener('mouseover', function () {
            populateSmallInfoWindow(this);
        });

    }
    showListings();
}

// This function populates the infowindow when the marker is clicked. We'll only allow
// one infowindow which will open at the marker that is clicked, and populate based
// on that markers position.
function populateInfoWindowByIndex(index){
    console.log("index: " +index);
    console.log('marker object: '+ markers[index]);
    AJAXInfoWindow(markers[index]);
}
function AJAXInfoWindow(marker) {
    // Check to make sure the infowindow is not already opened on this marker.
    smallInfowindow.close();
    marker.setAnimation(google.maps.Animation.BOUNCE);
    //AJAX Call
    
    
    var markerID = marker.id;
    console.log("markerID: " + markerID);
    var currentlocation = locations[markerID];
    console.log("currentlocation: "+ currentlocation);
    var fsVenue = currentlocation.fsVenue;
    console.log("fsVenue: " + fsVenue);
    var fsPre = 'https://api.foursquare.com/v2/venues/';
    // var fsVenue = '4d51e88d7ee1a35d31af9434';
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
            console.log("ajax success");
            var venue = data.response.venue.name;
            console.log(venue);
            
            var formattedPhone = data.response.venue.contact.formattedPhone;
            console.log(formattedPhone);
            var description = data.response.venue.description;
            console.log(description);
            // var status = data.response.venue.hours.status;
            // console.log(status);
            windowTitle =  venue;
            windowText = description;
            populateLargeInfoWindow(marker);

        },

        error: function (jqXHR, textStatus, errorThrown) {
            windowText = 'Oops! touble connecting to FourSquare API. Please try later.';
            console.log('getJSON request failed! ' + textStatus);
            infowindow.setContent(windowText);
            infowindow.open(map, marker);
            populateLargeInfoWindow(marker);
        }
    });
}

function populateLargeInfoWindow(marker){
    setTimeout(function () {
        marker.setAnimation(null);
    }, 750);
    
    console.log('text type: '+ typeof windowText);
    console.log('Window Text:' + windowText);
    largeInfowindow.setContent(windowText);
    
    if (largeInfowindow.marker !== marker) {
        console.log("reset window");
        largeInfowindow.marker = marker;
        windowText = 'hello';
//        console.log('Window Text:' + windowText);
//        largeInfowindow.setContent('<p>'+windowText+'</p>');
        largeInfowindow.open(map, marker);
        // Make sure the marker property is cleared if the infowindow is closed.
        largeInfowindow.addListener('closeclick', function () {
            largeInfowindow.marker = null;
        });
    }
}

function populateSmallInfoWindow(marker) {
    // Check to make sure the infowindow is not already opened on this marker.
    marker.setAnimation(google.maps.Animation.BOUNCE);
    setTimeout(function () {
        marker.setAnimation(null);
    }, 750);
    if (smallInfowindow.marker !== marker) {
        smallInfowindow.marker = marker;
        smallInfowindow.setContent('<p>' + marker.title + '</p>');
        smallInfowindow.open(map, marker);
        // Make sure the marker property is cleared if the infowindow is closed.
        smallInfowindow.addListener('mouseout', function () {
            smallInfowindow.close();
        });
    }
}



// This function will loop through the markers array and display them all.

function filterMarkers(markerIDs){
    console.log('filterMarkers function');
    console.log('markerIDs: ' + markerIDs);
    // Extend the boundaries of the map for each marker and display the marker
    for (var i = 0; i < markers.length; i++) {
        markers[i].setMap(null);
    }
    var bounds = new google.maps.LatLngBounds();
    // Extend the boundaries of the map for each marker and display the marker
    for (var i = 0; i < markerIDs.length; i++) {
        markerID = markerIDs[i];
        markers[markerID].setMap(map);
        bounds.extend(markers[markerID].position);
    }
    map.fitBounds(bounds);
}

function showListings() {
    var bounds = new google.maps.LatLngBounds();
    // Extend the boundaries of the map for each marker and display the marker
    for (var i = 0; i < markers.length; i++) {
        markers[i].setMap(map);
        bounds.extend(markers[i].position);
    }
    map.fitBounds(bounds);
}


// Foursquare
$('#show-listings').click(function () {
    var fsPre = 'https://api.foursquare.com/v2/venues/';
    var fsVenue = '4d51e88d7ee1a35d31af9434';
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
            console.log('AJAX returns: ')
            console.log(venue);
            var formattedPhone = data.response.venue.contact.formattedPhone;
            console.log(formattedPhone);
            var description = data.response.venue.description;
            console.log(description);
            var status = data.response.venue.hours.status;
            console.log(status);

        },

        error: function (jqXHR, textStatus, errorThrown) {
            var infoContent = '<h3>Oops! Something seems to be wrong. Please try later.';
            console.log('getJSON request failed! ' + textStatus);
            infowindow.setContent(infoContent);
            infowindow.open(map, marker);
        }
    });
});

























// Weather Attempt
var weatherUrl = 'http://api.openweathermap.org/data/2.5/weather?zip=91107,us&appid=15cc9da0b27b48d6b6fa81f700733c89&units=imperial';
console.log('ajax call');
$.getJSON(weatherUrl, function (data) {
    temp = data.main.temp;
    console.log(temp + 'F');
}).error(function (e) {
    console.log('no weather');
});










//----------------------------------------------------------

//APIS



//
//
//
// $('#form-container').submit(loadData);
//
//

// clear out old data before new request
function loadData() {
    $wikiElem.text("");
    $nytElem.text("");

    var streetStr = $('#street').val();
    var cityStr = $('#city').val();
    var address = streetStr + ', ' + cityStr;

    $greeting.text('So, you want to live at ' + address + '?');

// load streetview
    var streetviewUrl = 'http://maps.googleapis.com/maps/api/streetview?size=600x400&location=' + address + '';
    $body.append('<img class="bgimg" src="' + streetviewUrl + '">');




// load nytimes
// obviously, replace all the "X"s with your own API key
    var nytimesUrl = 'http://api.nytimes.com/svc/search/v2/articlesearch.json?q=' + cityStr + '&sort=newest&api-key=XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX';
    $.getJSON(nytimesUrl, function (data) {

        $nytHeaderElem.text('New York Times Articles About ' + cityStr);

        articles = data.response.docs;
        for (var i = 0; i < articles.length; i++) {
            var article = articles[i];
            $nytElem.append('<li class="article">' +
                    '<a href="' + article.web_url + '">' + article.headline.main + '</a>' +
                    '<p>' + article.snippet + '</p>' +
                    '</li>');
        }
        ;

    }).error(function (e) {
        $nytHeaderElem.text('New York Times Articles Could Not Be Loaded');
    });



// load wikipedia data
    var wikiUrl = 'http://en.wikipedia.org/w/api.php?action=opensearch&search=' + cityStr + '&format=json&callback=wikiCallback';
    var wikiRequestTimeout = setTimeout(function () {
        $wikiElem.text("failed to get wikipedia resources");
    }, 8000);

    $.ajax({
        url: wikiUrl,
        dataType: "jsonp",
        jsonp: "callback",
        success: function (response) {
            var articleList = response[1];

            for (var i = 0; i < articleList.length; i++) {
                articleStr = articleList[i];
                var url = 'http://en.wikipedia.org/wiki/' + articleStr;
                $wikiElem.append('<li><a href="' + url + '">' + articleStr + '</a></li>');
            }
            ;

            clearTimeout(wikiRequestTimeout);
        }
    });

    return false;
}
;

//---------------------------------------------------------
