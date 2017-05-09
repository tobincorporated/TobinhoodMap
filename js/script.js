
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
    self.locList = ko.observableArray([]);

    // Marker ID helps link KO Loc object to GMaps API markers
    locations.forEach(function (locItem, index) {
        locItem['markerID'] = index;
        self.locList.push(new Loc(locItem));
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
    this.filteredLocs = ko.computed(function () {
        var filter = self.filter().toLowerCase();
        if (!filter) {
            return this.locList();
        } else {
            return ko.utils.arrayFilter(this.locList(), function (loc) {
                return loc.filterText().toLowerCase().indexOf(filter) !== -1;
            });
        }
        ;
    }, this);
    this.filteredLocs.subscribe(function () {
        self.ko2mapFilter();
    });
};

ko.applyBindings(new ViewModel());
