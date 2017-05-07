var locations = [
    {imgSrc: 'img/kitty.jpg', 
        title: 'Caltech', 
        location: {lat: 34.139137, lng: -118.125432}, 
        tags: 'kitten1', 
        clickCount: 0
    },
    {imgSrc: 'img/kitty.jpg', 
        title: 'Comics Factory', 
        location: {lat: 34.145754, lng: -118.123625}, 
        tags: 'kitten1', 
        clickCount: 0},
    {imgSrc: 'img/kitty.jpg', 
        title: 'Lucky Baldwin', 
        location: {lat: 34.145803, lng: -118.113960}, 
        tags: 'kitten1', 
        clickCount: 0},
    {imgSrc: 'img/kitty.jpg', 
        title: 'PCC', 
        location: {lat: 34.145382, lng: -118.118237}, 
        tags: 'kitten1', 
        clickCount: 0},
    {imgSrc: 'img/kitty.jpg', 
        title: 'Academy Theater', 
        location: {lat: 34.146130, lng: -118.129841}, 
        tags: 'kitten1', 
        clickCount: 0},
];





var Loc = function (data) {
    this.clickCount = ko.observable(data.clickCount);
    this.name = ko.observable(data.title);
    this.imgSrc = ko.observable(data.imgSrc);
    this.fullName = ko.computed(
            function () {
                return this.name() + " The Loc";
            }, this);
};


var ViewModel = function () {
    var self = this;
    this.locList = ko.observableArray([]);

    locations.forEach(function (locItem) {
        self.locList.push(new Loc(locItem));
    });


    this.currentLoc = ko.observable(this.locList()[0]);
    this.incrementCount = function () {
        self.currentLoc().clickCount(self.currentLoc().clickCount() + 1);
    };
    this.setCurrentLoc = function (clickedLoc) {
        self.currentLoc(clickedLoc);

    };

    this.doSomething = function (formElement) {
        var filterWord = $('#street').val().toLowerCase();
        var loctext = '';
        console.log('submitted');
        console.log(filterWord);
        self.locList.removeAll();
        locations.forEach(function (locItem) {
            loctext = (locItem.title + locItem.tags).toLowerCase();
            console.log(loctext);
            if (loctext.includes(filterWord)) {
                self.locList.push(new Loc(locItem));
            }
            ;
        });


    };




};



ko.applyBindings(new ViewModel());


// Weather Attempt
var weatherUrl ='http://api.openweathermap.org/data/2.5/weather?zip=91107,us&appid=15cc9da0b27b48d6b6fa81f700733c89&units=imperial';
console.log('ajax call');
$.getJSON(weatherUrl, function (data) {
            temp = data.main.temp;
            console.log(temp+'F');
        }).error(function (e) {
        console.log('no weather')
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
// GMaps

var map;

// Create a new blank array for all the listing markers.
var markers = [];

function initMap() {
    // Constructor creates a new map - only center and zoom are required.
    map = new google.maps.Map(document.getElementById('map'), {
        center: {lat: 34.144408, lng: -118.117983},
        zoom: 14,
        mapTypeControl: false
    });

    // These are the real estate listings that will be shown to the user.
    // Normally we'd have these in a database instead.


    var largeInfowindow = new google.maps.InfoWindow();

    // The following group uses the location array to create an array of markers on initialize.
    for (var i = 0; i < locations.length; i++) {
        // Get the position from the location array.
        var position = locations[i].location;
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
            populateInfoWindow(this, largeInfowindow);
        });
    }
    showListings();
}

// This function populates the infowindow when the marker is clicked. We'll only allow
// one infowindow which will open at the marker that is clicked, and populate based
// on that markers position.
function populateInfoWindow(marker, infowindow) {
    // Check to make sure the infowindow is not already opened on this marker.
    if (infowindow.marker != marker) {
        infowindow.marker = marker;
        infowindow.setContent('<div>' + marker.title + '</div>');
        infowindow.open(map, marker);
        // Make sure the marker property is cleared if the infowindow is closed.
        infowindow.addListener('closeclick', function () {
            infowindow.marker = null;
        });
    }
}

// This function will loop through the markers array and display them all.
function showListings() {
    var bounds = new google.maps.LatLngBounds();
    // Extend the boundaries of the map for each marker and display the marker
    for (var i = 0; i < markers.length; i++) {
        markers[i].setMap(map);
        bounds.extend(markers[i].position);
    }
    map.fitBounds(bounds);
}
