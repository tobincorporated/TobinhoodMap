
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


    /**
     * @description Call populateInfoWindowbyIndex to open infoWindow 
     * @param {ko.observable} clickedLoc - clicked Location from list
     */
    this.setCurrentLoc = function (clickedLoc) {
        populateInfoWindowByIndex(clickedLoc.markerID());
    };

    /**
     * @description Tells map to highlight marker on the map
     * @param {ko.observable} selectedLoc - Location highlighted in list
     */
    this.highlightLoc = function (selectedLoc) {
        var selectedMarker = markers[selectedLoc.markerID()];
        populateSmallInfoWindow(selectedMarker);
    };

    /**
     * @description Filters list items
     */
    this.ko2mapFilter = function () {
        var markerIDs = [];
        self.filteredLocs().forEach(function (locItem) {
            markerIDs.push(locItem.markerID());
        });
        filterMarkers(markerIDs);
    };


    //KO filter variable
    this.filter = ko.observable('');

    // List of filtered locations as ko observable
    this.filteredLocs = ko.computed(function () {
        var filter = self.filter().toLowerCase();
        if (!filter) {
            return this.locList();
        } else {
            return ko.utils.arrayFilter(this.locList(), function (loc) {
                return loc.filterText().toLowerCase().indexOf(filter) !== -1;
            });
        }
    }, this);
    this.filteredLocs.subscribe(function () {
        self.ko2mapFilter();
    });
};

ko.applyBindings(new ViewModel());
