var map;
var markers = []
// initializing maps
var globalVal;
function initMap() {
    var location = { lat: 27.854624, lng: 27.210935 };
    map = new google.maps.Map(document.getElementById("map"), {
        zoom: 2,
        center: location
        //mapTypeId: 'satellite'
    });
    map.setOptions({ minZoom: 2});
    map.setMapTypeId('satellite');

};
// defining positive markers
function addPositiveMarker(data) {
    var lng = data.latitude;
    var lat = data.longitude;
    var location1 = {lat, lng};
    var msg = data.text;

    var positiveMarker = new google.maps.Marker({
        position: location1,

        map: map,
        title: msg,
        icon: 'http://maps.google.com/mapfiles/ms/icons/green-dot.png',
        label: "+"

    });
    markers.push(positiveMarker);
};
// defining negative markers
function addNegativeMarker(data) {
    var lng = data.latitude;
    var lat = data.longitude;
    var location2 = {lat, lng};
    var msg = data.text;
    var negativeMarker = new google.maps.Marker({
        position: location2,

        map: map,
        title: msg,
        icon: 'http://maps.google.com/mapfiles/ms/icons/red-dot.png',
        label: "-"

    });
    markers.push(negativeMarker)
};
// defining neutral markers
function addNeutralMarker(data) {
    var lng = data.latitude;
    var lat = data.longitude;
    var location3 = {lat, lng};
    var msg = data.text;

    var neutralMarker = new google.maps.Marker({
        position: location3,

        map: map,
        title: msg,
        icon: 'http://maps.google.com/mapfiles/ms/icons/yellow-dot.png',
        label: "o"

    });
    markers.push(neutralMarker);
};

function httpGetAsync(theUrl, callback) {
    var xmlHttp = new XMLHttpRequest();
    xmlHttp.onreadystatechange = function () {
        if (xmlHttp.readyState == 4 && xmlHttp.status == 200)
            callback(xmlHttp.responseText);
    }
    xmlHttp.open("GET", theUrl, true); // true for asynchronous
    xmlHttp.send(null);
}


function decideSentiment(data){           // Deciding sentiment value on basis of score
    console.log("Sentiment Analysis:")
    if (data.score < 0.5){
        console.log("Negative")
        addNegativeMarker(data);  // add a negative marker to map if score <0.5
    }
    else if (data.score > 0.5){
        console.log("Positive")
        addPositiveMarker(data);   // add a positive marker to map if score >0.5
    }
    else if (data.score == 0.5){     // add a positive marker to map if score =0.5
        console.log("Neutral")
        addNeutralMarker(data);
    }

}

function loopOverTweetData(data, tweets_count){  // looping over receied tweets and find their sentiment value
    console.log("here");
    for (i=0; i<tweets_count; i++){
        decideSentiment(data[i]._source);
    }
    console.log("No. of markers:", markers.length);
}

// loading tweets with it's index from elastic search
function loadDataFromES(value) {
    console.log("Value",value)
    query = {
        "size":50,
        "query": {
            "match": {
                "topic": value
            }
        }
    }
    $.ajax({
        url: 'https://search-kafkaes-tos2gmefkq5u525sf7chyqucla.us-east-2.es.amazonaws.com/tweets/_search',
        method:"POST",
        data:JSON.stringify(query),
        dataType: 'text',
        success: function (data) {
            data = JSON.parse(data)
            console.log("data", data)
            tweets_count = data.hits.total;
            loopOverTweetData(data.hits.hits, tweets_count);
        }
    }).done(function (data) {
        //console.log(data["hits"]["hits"])
        }).fail(function (data) {
            console.log("In failure", data)
        });
        deleteMarkers()

}

setInterval(callThis, (10000));
function callThis(){
    setInterval(loadDataFromES(globalVal),10000);
    httpGetAsync("API-GATEWAY-FOR-ES");
}
// remove current markers upon new selection
function deleteMarkers(){
    for(var i=0; i < markers.length; i++)
    {
        markers[i].setMap(null);
    }
    markers = [];
}
// Selecting a new keyword that calls the sns which intern initiates the SQS
function selectItem(value) {
    if (value == null || value == "") {
        alert("Please select a keyword to search for tweets");
    }
    else {
        // open pop up window on web page when adding new tweets.
        window.confirm("Notification: New Tweets are adding for topic:" + value.toUpperCase());
        globalVal=value;
        deleteMarkers()
        httpGetAsync("API-GATEWAY-FOR-ES");
        console.log(value.toUpperCase())
    }
};
