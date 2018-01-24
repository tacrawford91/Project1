// Initialize Firebase
var config = {
  apiKey: "AIzaSyBMPRyBKIBX_3MQAF0oFP8tUlOw0nU0Yn4",
  authDomain: "project1-d2ee8.firebaseapp.com",
  databaseURL: "https://project1-d2ee8.firebaseio.com",
  projectId: "project1-d2ee8",
  storageBucket: "project1-d2ee8.appspot.com",
  messagingSenderId: "544845178446"
};
firebase.initializeApp(config);

//set db varible 
var database = firebase.database();
//set up query1url
var userCity;
var userDate;
var endDate;
var userBudget = 100;


var tmAPIKey = "azBYRomG6It2EA4V0vjcXjBjD9vYNY1b"
//wUcrA6tbANpAMWxRSlf4FNsKsWLbgzhG - TROY api KEY
//azBYRomG6It2EA4V0vjcXjBjD9vYNY1b - Shawn api KEY

var queryOneURL = `https://app.ticketmaster.com/discovery/v2/events.json?city=${userCity}&startDateTime=${userDate}&endDateTime=${endDate}&size=20&apikey=${tmAPIKey}`

var counter = 0;
var latitude;
var longitude;
var searchNumber = 0;
var eventIDArray = [];
var eventPriceArray = [];
var eventPriceObjectArray = [];
var noPriceObjectArray = [];
var eventPriceCounter = 0;
var htmladded = false 
var x;

database.ref().set("");

//===================================================================
//===================================================================

//GEO LOCATION CODE BELOW // Grabbing User's Location 

//===================================================================
//===================================================================

var userLatLon;

getLocation()
function getLocation() {
  if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(showPosition, showError);
  } else {
    //browswer does not support location 
      x = document.getElementById("location");
      x.innerHTML = "Geolocation is not supported by this browser.";
  }
}

function showError(error) {
console.log('error', error)
var x = document.getElementById("location");
switch(error.code) {
    case error.PERMISSION_DENIED:
    //Show user denied location assistance.
        x.innerHTML = "User denied the request for Geolocation."
        break;
    case error.POSITION_UNAVAILABLE:
        x.innerHTML = "Location information is unavailable."
        break;
    case error.TIMEOUT:
        x.innerHTML = "The request to get user location timed out."
        break;
    case error.UNKNOWN_ERROR:
        x.innerHTML = "An unknown error occurred."
        break;
}
}

function showPosition(position) {
// var x = document.getElementById("location");
// x.innerHTML = "Latitude: " + position.coords.latitude + 
// "<br>Longitude: " + position.coords.longitude; 
userLatLon = position.coords.latitude + "," + position.coords.longitude;
console.log("THE USER LOCATION IS " + userLatLon);
}

//Hide loading animation
$(".loadingRow").hide();
//Listen for search
$(".searchBtn").on("click", function() {
console.log("I WAS CLICKED") 
database.ref(`search`).off("child_added")
searchNumber = 0;
eventIDArray = [];
eventPriceArray = [];
eventPriceObjectArray = [];
noPriceObjectArray = [];
eventPriceCounter = 0;
htmladded = false 
database.ref().set("");
event.preventDefault();

//Grabbing User Input
var userDateInput = $("#date").val();
userDate = userDateInput + "T17:00:00Z";
endDate = userDateInput + "T23:59:59Z";
userBudget = Number($("#budget").val())
//Show Loading Animation
$(".loadingRow").show();
//empty previous results
$(".results-div").html("");

$.ajax({     
type:"GET",
url:`https://app.ticketmaster.com/discovery/v2/events.json?latlong=${userLatLon}&radius=50&unit=miles&size=50&startDateTime=${userDate}&endDateTime=${endDate}&apikey=${tmAPIKey}`,
async:true,
dataType: "json",

}).done(function(response1){
  // Add data to firebase -
  for (var i = 0; i < response1._embedded.events.length; i++) {
    searchNumber++
     //event ID
    var eventID = response1._embedded.events[i].id
    eventIDArray.push(eventID);
    //event name
    var eventName = response1._embedded.events[i].name;
    //event date
    var eventDate = response1._embedded.events[i].dates.start.dateTime;
    var eventDate = moment(eventDate).format("MMMM Do, YYYY");
    //event time
    var eventTime = response1._embedded.events[i].dates.start.localTime;
    var eventTime = moment(eventTime, "HH:mm:ss").format("hh:mm A");
    //event distance
    var eventDistance = response1._embedded.events[i].distance
    // event image
    var eventImage = response1._embedded.events[i].images[6].url;
    //Name of the venue
    var venueName = response1._embedded.events[i]._embedded.venues[0].name;
    //Coordinates: location returns an object with longitude and latitude properties
    var eventCoordinates = response1._embedded.events[i]._embedded.venues[0].location;
    //event longituge
    var eventLongitude = response1._embedded.events[i]._embedded.venues[0].location.longitude;
    //event longituge
    var eventLatitude = response1._embedded.events[i]._embedded.venues[0].location.latitude;
    //address of event
    var eventAddress = response1._embedded.events[i]._embedded.venues[0].address.line1;
    //city
    var eventCity = response1._embedded.events[i]._embedded.venues[0].city.name;
    //state
    var eventState = response1._embedded.events[i]._embedded.venues[0].state.name;
    //Postal Code
    var eventZip = response1._embedded.events[i]._embedded.venues[0].postalCode;

    var eventLocation = {
      venue: venueName,
      coordinates: eventCoordinates,
      address: eventAddress,
      city: eventCity,
      state: eventState,
      zip: eventZip
    };
    database.ref(`search/${eventID}`).set({
      name: eventName,
      eventDate: eventDate,
      eventID: eventID,
      eventImage: eventImage,
      eventLocation: eventLocation,
      eventLongitude: eventLongitude,
      eventLatitude: eventLatitude,
      venueName: venueName,
      eventTime: eventTime,
      eventDistance: eventDistance
    })
  }
})
database.ref(`search`).on("child_added", function(snapshot) {
  //console.log('child')
  if (snapshot.val() == null) {
    return;
  }
  var eventIDSearch = snapshot.val().eventID;
  //console.log(eventIDSearch)
  var queryTwoURL = `https://app.ticketmaster.com/commerce/v2/events/${eventIDSearch}/offers.json?apikey=${tmAPIKey}`
    $.ajax({
      url: queryTwoURL,
      method: "GET"
    }) .done(function(response2){
      //grab good responses and update db price, push into priced array and sort.
      database.ref(`search/${eventIDSearch}`).update({price:Number(response2.prices.data[0].attributes.value)})


      eventPriceObjectArray.push({
        eventName: snapshot.val().name,
        eventDate: snapshot.val().eventDate,
        price: Number(response2.prices.data[0].attributes.value),
        eventImage: snapshot.val().eventImage,
        venueName: snapshot.val().venueName,
        eventCoordinates: snapshot.val().eventCoordinates,
        eventTime: snapshot.val().eventTime,
        eventLongitude: snapshot.val().eventLongitude,
        eventLatitude: snapshot.val().eventLatitude,
        eventAddress: snapshot.val().eventAddress,
        eventDistance: snapshot.val().eventDistance
      
      })
      eventPriceCounter++
      eventPriceObjectArray.sort(function(a,b) {
        return a.price-b.price
      })
    })
.fail(function(){
  database.ref(`search/${eventIDSearch}`).update({price: "No price!"})
  
  noPriceObjectArray.push({
    eventName: snapshot.val().name,
    eventDate: snapshot.val().eventDate,
    eventImage: snapshot.val().eventImage,
    venueName: snapshot.val().venueName,
    eventCoordinates: snapshot.val().eventCoordinates,
    eventTime: snapshot.val().eventTime,
    eventLongitude: snapshot.val().eventLongitude,
    eventLatitude: snapshot.val().eventLatitude,
    eventAddress: snapshot.val().eventAddress,
    eventDistance: snapshot.val().eventDistance
  })
})
})
$(document).ajaxStop(function() {
// if  (eventPriceObjectArray.length + noPriceObjectArray.length === eventIDArray.length && htmladded === false) {
  //Hide loading animation 
  $(".loadingRow").hide();

  //create html
  eventPriceObjectArray.forEach(function(element){
    if (element.price < userBudget) {
    //Build Html element
    //contain col
    var containingDiv = $("<div>").addClass("col-xs-12 col-sm-12 col-md-12 col-lg-12");
    //accordion
    var accordion = $("<div>").addClass("panel-group result-item").attr("data-toggle", `collapse`).attr("data-target", `.map${counter.toString()}`).attr("id",`accordion`);
    //panel panel-default
    var panelDiv = $("<div>").addClass("panel panel-default");
    //panel-heading
    var panelHeadingDiv = $("<div>").addClass("panel-heading");
    //panel-title
    var aTag = $("<a>").addClass("panel-title").attr("data-toggle", "collapse").attr("data-parent", "#accordion").attr("href", `.collapse${counter.toString()}`).attr("data-counter", `${counter.toString()}`)
    //row result-item
    var rowDiv = $("<div>").addClass("row result-item");

    //create image section
    var imgDiv = $("<div>").addClass("col-xs-2 col-sm-2 col-md-2 col-lg-2 img-div").append($("<img>").attr("src",element.eventImage).addClass("event-image"));

    //event detais div
    var detailsDiv = $("<div>").addClass("col-xs-6 col-sm-6 col-md-6 col-lg-6 details-div");
    var date_h3 = $("<h3>").html(element.eventDate).addClass("event-date");
    var name_h1= $("<h1>").html(element.eventName).addClass("event-name");
    var time_h3 = $('<h3>').html(element.eventTime).addClass("event-time");   
    detailsDiv.append(date_h3,name_h1,time_h3);

    //pricing and location div
    var pricingDiv = $("<div>").addClass("col-xs-4 col-sm-4 col-md-4 col-lg-4 pricing-div");
    var start_h3 = $("<h3>").html("Starting as low as").addClass("start-as");
    var dollar_h1 = $("<h1>").html("$").addClass("dollar");
    var price_h1 = $("<h1>").html(element.price).addClass("event-price");
    var venue_h4 = $("<h4>").html(element.venueName).addClass("event-location");
    var distance_h4 = $("<h4>").html(`${element.eventDistance} miles away`).addClass("event-distance");
    var click_h4=$("<h4>").html("Click Event for Map Details").addClass("event-click");
    pricingDiv.append(start_h3,dollar_h1,price_h1,venue_h4,distance_h4,click_h4);
    
    //create iFrame
    var iFrame = $("<i>").addClass("fa fa-chevron-down fa-spacing");
    
    // create map stuff
    var map_div = $("<div>")
      .attr("id",`map${counter.toString()}`)
      .addClass(`panel-collapse collapse collapse${counter.toString()}`);
      
    //inside of map div goes
    var panelBody = $("<div>").attr("class", "panel-body");

    var googlemap_div = $("<div>")
      .attr("id", `google-map${counter.toString()}`)
      .attr("class",`gmap marker${counter.toString()}`)
      .attr("data-latitude", element.eventLatitude)
      .attr("data-longitude", element.eventLongitude);

    panelBody.append(googlemap_div);
    map_div.append(panelBody);
    
    // APPEND imgDiv, detailsDiv, pricingDiv INTO row(result-item)
    rowDiv.append(imgDiv,detailsDiv,pricingDiv);

    // APPEND result-item to aTag
    aTag.append(rowDiv);

    // APPEND to panelHeadingDiv
    panelHeadingDiv.append(aTag);

    // APPEND to panelDiv
    panelDiv.append(panelHeadingDiv,iFrame,map_div);

    // PanelDiv to accordion
    accordion.append(panelDiv);
    //accordion to continaingDiv
    containingDiv.append(accordion);
    // //add row to html containter
    $(".results-div").append(containingDiv);

    // Add +1
    counter++
    

    // Google Maps
    latitude = element.eventLatitude;
    longitude = element.eventLongitude;
    
    console.log(latitude, longitude);
  }
  htmladded = true
  })
  //else {
  //  console.log("NOOOOO HTMLLLLLL") //show loading, finding the best eventss

  // }  
})
});
console.log(counter)
//===================================================================
 // GOOGLE MAP ITERATION
//===================================================================

function initialize_map(id = 0) {
  var container = document.getElementById(`google-map${id.toString()}`)
  console.log('container', container, `google-map${id.toString()}`, id)
  if (!container) return

  var myLatlng = new google.maps.LatLng(latitude,longitude);
  var mapOptions = {
    zoom: 14,
    scrollwheel: false,
    disableDefaultUI: true,
    center: myLatlng
  };
  
  var map = new google.maps.Map(container, mapOptions);
  var contentString = '';
  // var infowindow = new google.maps.InfoWindow({
  //   content: '<div class="map-content"><ul class="address">' + $('.address').html(element.eventAddress) + '</ul></div>'
  // });
  
  var marker = new google.maps.Marker({
    position: myLatlng,
    map: map
  });
};
  
  // initialize_map();
  // $(`.panel-collapse`).on('hidden.bs.collapse', function () {
  //   initialize_map();
  // })
  
  // $(`.panel-collapse`).on('shown.bs.collapse', function () {
  //   initialize_map(); 
  // })

  $(document).on('click', '.panel-title', function () {
    console.log('clicked this', this, $(this).attr('data-counter'))
    initialize_map($(this).attr('data-counter')); 
  })

  // google.maps.event.addDomListener(aTag, 'click', function() {
  //   initialize_map();
  // });

  
  // google.maps.event.addListener(marker, 'click', function() {
  //   infowindow.open(map,marker);
  // });




