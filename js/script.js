
var ViewModel = function(){
    this.clickCount = ko.observable(0);
    this.name = ko.observable('Tabby');
    this.imgSrc= ko.observable('img/kitty.jpg');
    this.imgAttribution = ko.observable('someURL');
    this.fullName = ko.computed(
        function(){return this.name() + " The Cat";}, this);
    this.incrementCount=function() {
        this.clickCount(this.clickCount() + 1);
    };
};

// alert('JS run');

ko.applyBindings(new ViewModel());

//
//
// function loadData() {
//
//     var $body = $('body');
//     var $wikiElem = $('#wikipedia-links');
//     var $nytHeaderElem = $('#nytimes-header');
//     var $nytElem = $('#nytimes-articles');
//     var $greeting = $('#greeting');
//
//     // clear out old data before new request
//     $wikiElem.text("");
//     $nytElem.text("");
//
//     // load streetview
//
//     // YOUR CODE GOES HERE!
//
//     return false;
// }
//
// $('#form-container').submit(loadData);
