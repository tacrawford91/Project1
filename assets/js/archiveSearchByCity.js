 
//   $(".searchBtn").on("click", function(event){
//   database.ref(`search`).off("child_added")
//       searchNumber = 0;
//       eventIDArray = [];
//       eventPriceArray = [];
//       eventPriceObjectArray = [];
//       noPriceObjectArray = [];
//       eventPriceCounter = 0;
//       htmladded = false 
//       database.ref().set("");
//       event.preventDefault();

//       //Grabbing User Input
//       userCity = $("#zip").val().trim();
//       userDateInput = $("#date").val();
//       userDate = userDateInput + "T17:00:00Z";
//       endDate = userDateInput + "T23:59:59Z";
//       userBudget = Number($("#budget").val())

//       queryOneURL = `https://app.ticketmaster.com/discovery/v2/events.json?city=${userCity}&startDateTime=${userDate}&endDateTime=${endDate}&size=50&apikey=${tmAPIKey}`
//       console.log(userDate);
//       console.log(endDate);
//       // pleaseGodLetItWork();
         
//     $.ajax({
//       url: queryOneURL,
//       method: "GET"
//     }) .done(function(response1){
//       // Add data to firebase -
//     for (var i = 0; i < response1._embedded.events.length; i++) {
//       searchNumber++
//        //event ID
//       var eventID = response1._embedded.events[i].id
//       eventIDArray.push(eventID);
//       //event name
//       var eventName = response1._embedded.events[i].name;
//       //event date
//       var eventDate = response1._embedded.events[i].dates.start.localDate;
//       // event image
//       var eventImage = response1._embedded.events[i].images[6].url;
//       //Name of the venue
//       var venueName = response1._embedded.events[i]._embedded.venues[0].name;
//       //Coordinates: location returns an object with longitude and latitude properties
//       var eventCoordinates = response1._embedded.events[i]._embedded.venues[0].location;
//       //address of event
//       var eventAddress = response1._embedded.events[i]._embedded.venues[0].address.line1;
//       //city
//       var eventCity = response1._embedded.events[i]._embedded.venues[0].city.name;
//       //state
//       var eventState = response1._embedded.events[i]._embedded.venues[0].state.name;
//       //Postal Code
//       var eventZip = response1._embedded.events[i]._embedded.venues[0].postalCode;
  
//       var eventLocation = {
//         venue: venueName,
//         coordinates: eventCoordinates,
//         address: eventAddress,
//         city: eventCity,
//         state: eventState,
//         zip: eventZip
//       };
//       database.ref(`search/${eventID}`).set ({
//         name: eventName,
//         eventDate: eventDate,
//         eventID: eventID,
//         eventImage: eventImage,
//         eventLocation: eventLocation
//       })
//     }
//   })


//   database.ref(`search`).on("child_added", function(snapshot) {
//       //console.log('child')
//     if (snapshot.val() == null) {
//     return;
// }
//   var eventIDSearch = snapshot.val().eventID;
//   //console.log(eventIDSearch)
//   var queryTwoURL = `https://app.ticketmaster.com/commerce/v2/events/${eventIDSearch}/offers.json?apikey=${tmAPIKey}`
//     $.ajax({
//       url: queryTwoURL,
//       method: "GET"
//     }) .done(function(response2){
//       //grab good responses and update db price, push into priced array and sort.
//       database.ref(`search/${eventIDSearch}`).update({price:Number(response2.prices.data[0].attributes.value)})


//       eventPriceObjectArray.push({
//         eventName: snapshot.val().name,
//         eventDate: snapshot.val().eventDate,
//         price: Number(response2.prices.data[0].attributes.value),
//         eventImage: snapshot.val().eventImage
//       })
//       eventPriceCounter++
//       eventPriceObjectArray.sort(function(a,b) {
//         return a.price-b.price
//       })
//     })
//     .fail(function(){
//       database.ref(`search/${eventIDSearch}`).update({price: "No price!"})
      
//       noPriceObjectArray.push({
//         eventName: snapshot.val().name,
//         eventDate: snapshot.val().eventDate,
//         eventImage: snapshot.val().eventImage
//       })
//     })

//   // database.ref("search").on("child_changed", function() {
//   //   if (snapshot.val() == null) {
//   //     return;
//   // }
//   //   if (eventPriceObjectArray.length + noPriceObjectArray.length === eventIDArray.length && htmladded === false) {
//   //     //create html
//   //     eventPriceObjectArray.forEach(function(element){
//   //       //create content div
//   //       var priceContent = $("<p>").html(`event name: ${element.eventName} ---- price: ${element.price}`)
//   //       $(".priced").append(priceContent);
//   //     })
//   //     htmladded = true
//   //   } else {
//   //     //show loading, finding the best eventss
//   //   }  
//   // })
 
//   });

$(document).ajaxStop(function() {
    // if  (eventPriceObjectArray.length + noPriceObjectArray.length === eventIDArray.length && htmladded === false) {
      //create html
      eventPriceObjectArray.forEach(function(element){
        // if (element.price < userBudget) {
        //Build Html element
        //contain col
        var containingDiv = $("<div>").addClass("col-xs-12 col-sm-12 col-md-12 col-lg-12")
        //accordian
        var accordion = $("<div>").addClass("panel-group result-item").attr("data-toggle", "collapse").attr("data-target", "#map").attr("id","accordion")
        //panel div
        var panelDiv = $("<div>").addClass("panel panel-default")
        //panel-headeing
        var panelHeadingDiv = $("<div>").addClass("panel-heading");
        //panel title
        var panelTitleDiv = $("<h4>").addClass("panel-title");
        // a tag
        var aTag = $("<a>").addClass("map-button").attr("data-toggle", "collaspe").attr("data-target", "#map")
        //row div
        var rowDiv = $("<div>").addClass("row result-item");
        //create icon
        var icon = $("i").addClass("fa fa-chevron-down fa-spacing");
        //create image section
        var imgDiv = $("<div>").addClass("col-xs-2 col-sm-2 col-md-2 col-lg-2 img-div").append($("<img>").attr("src",element.eventImage).addClass("event-image"));
        //event detais div
        var detailsDiv = $("<div>").addClass("col-xs-6 col-sm-6 col-md-6 col-lg-6 details-div")
        var date_h3 = $("<h3>").html(element.eventDate).addClass("event-date");
        var name_h1= $("<h1>").html(element.eventName).addClass("event-name");
        var click_h4=$("<h4>").html("Click Event for Map Details").addClass("event-click");    
        detailsDiv.append(date_h3,name_h1,click_h4);
        //pricing and location div
        var pricingDiv = $("<div>").addClass("col-xs-4 col-sm-4 col-md-4 col-lg-4 pricing-div")
        var start_h3 = $("<h3>").html("Starting as low as").addClass("start-as");
        var dollar_h1 = $("<h1>").html("$").addClass("dollar");
        var price_h1 = $("<h1>").html(element.price).addClass("event-price");
        pricingDiv.append(start_h3,dollar_h1,price_h1);
        // add all to row div
        rowDiv.append(imgDiv,detailsDiv,pricingDiv);
        //add  result item to aTag
        aTag.append(rowDiv,icon);
        //aTag to title
        panelTitleDiv.append(aTag);
        //title to heading
        panelHeadingDiv.append(panelTitleDiv);
        // heading to panel
        panelDiv.append(panelHeadingDiv);
        //panel to accorion
        accordion.append(panelDiv);
        //accordion to continaingDiv
        containingDiv.append(accordion);
        //add row to html containter
        $(".results-div").append(containingDiv);
      })
      htmladded = true
      // } else {
      //  console.log("NOOOOO HTMLLLLLL") //show loading, finding the best eventss

//       // }  
// })
// });