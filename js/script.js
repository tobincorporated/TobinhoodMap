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
    });
    this.currentCat = ko.observable(this.catList()[0]);
    this.incrementCount = function() {
        self.currentCat().clickCount(self.currentCat().clickCount() + 1);
    };
    this.setCurrentCat = function(clickedCat){
        self.currentCat(clickedCat);
        // alert("hi there");
    };

    this.doSomething = function(formElement) {
            // ... now do something
            console.log('submitted');
            console.log( $('#street').val());
        };




};



// alert('JS run');

ko.applyBindings(new ViewModel());










//
//
//
// $('#form-container').submit(loadData);
//
//

// clear out old data before new request
function loadData(){
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
$.getJSON(nytimesUrl, function(data){

    $nytHeaderElem.text('New York Times Articles About ' + cityStr);

    articles = data.response.docs;
    for (var i = 0; i < articles.length; i++) {
        var article = articles[i];
        $nytElem.append('<li class="article">'+
            '<a href="'+article.web_url+'">'+article.headline.main+'</a>'+
            '<p>' + article.snippet + '</p>'+
        '</li>');
    };

}).error(function(e){
    $nytHeaderElem.text('New York Times Articles Could Not Be Loaded');
});



// load wikipedia data
var wikiUrl = 'http://en.wikipedia.org/w/api.php?action=opensearch&search=' + cityStr + '&format=json&callback=wikiCallback';
var wikiRequestTimeout = setTimeout(function(){
    $wikiElem.text("failed to get wikipedia resources");
}, 8000);

$.ajax({
    url: wikiUrl,
    dataType: "jsonp",
    jsonp: "callback",
    success: function( response ) {
        var articleList = response[1];

        for (var i = 0; i < articleList.length; i++) {
            articleStr = articleList[i];
            var url = 'http://en.wikipedia.org/wiki/' + articleStr;
            $wikiElem.append('<li><a href="' + url + '">' + articleStr + '</a></li>');
        };

        clearTimeout(wikiRequestTimeout);
    }
});

return false;
};
