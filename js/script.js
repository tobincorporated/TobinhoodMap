var initCats = [{
    clickCount: 0,
    name: 'Tabby',
    imgSrc: 'img/kitty.jpg'
},
{
    clickCount: 0,
    name: 'Deeble',
    imgSrc: 'img/kitty2.jpg'
}];

var Cat = function(data){
    this.clickCount = ko.observable(data.clickCount);
    this.name = ko.observable(data.name);
    this.imgSrc= ko.observable(data.imgSrc);
    this.fullName = ko.computed(
        function(){return this.name() + " The Cat";}, this);
};


var ViewModel = function(){
    var self = this;

    this.catList = ko.observableArray([]);
    initCats.forEach(function(catItem){
        self.catList.push( new Cat(catItem));
    })
    this.currentCat = ko.observable(this.catList()[0]);
    this.incrementCount = function() {
        self.currentCat().clickCount(self.currentCat().clickCount() + 1);
    };
    this.setCurrentCat = function(clickedCat){
        self.currentCat(clickedCat);
        // alert("hi there");
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
