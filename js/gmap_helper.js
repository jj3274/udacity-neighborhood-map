// Google Map API: AIzaSyBS6cub5HjL08nwSwPNRoOOdNrQmVmPwtU
var map;

// Create a new blank array for all the listing markers.
var markers = [];
var markersForTitle = {};

// This global polygon variable is to ensure only ONE polygon is rendered.
var polygon = null;

// Create placemarkers array to use in multiple functions to have control
// over the number of places that show.
var placeMarkers = [];
var streetviewApiKey = 'AIzaSyA4HRSTeqi-Yr0UWHCaxXd56DB5kZjW-5U';
var streetviewApiUrl = 'https://maps.googleapis.com/maps/api/streetview?size=200x200&location=';
var streetviewApiUrlParam = '&fov=90&heading=235&pitch=10&key=';

var geocodeApiKey = 'AIzaSyD0kQxpo0WfCocy54JQ9SUPcGrK83XZ5Og';

function initMap() {

  // Constructor creates a new map - only center and zoom are required.
  map = new google.maps.Map(document.getElementById('map'), {
    center: {lat: 40.7413549, lng: -73.9980244},
    zoom: 13,
    mapTypeControl: false
  });

  locations = jumi_locations;

  var largeInfowindow = new google.maps.InfoWindow();
  var geocoder = new google.maps.Geocoder();

  // Style the markers a bit. This will be our listing marker icon.
  var defaultIcon = makeMarkerIcon('0091ff');
  var customIconUrl = 'https://lh3.googleusercontent.com/VNfRfhtu9zdJPBMTdQl81aEAfbDvqs8N5hmvsYK9Z9RPJSipwGXBLvA5X67_z8_uad9CHGTNzLVNsSC35OPqq_7Hdg5zN-y2QB7cu5B4X5eqLUf4HVDO7VUdMQwXoGmxvhJ0bgdIipOZDvSXYspY5vbRHFJ9EgRno0LiYLQMUwEipPi3yzi91DRH4W1wr9V6Z2eK2BLnhBNMtAm4qVGNN9FztqHL3IOVe1rKYdjgqlfZjaVXE9fvgAIHreiAm0UcJOsQRpVDF6Bj7T6VF7gf_DDsbApOtC-q7lm1IPDmb-acj0-XBO69m5UIIpPQo4A2KVlzYjJc5IsEgvThYMo2VbLxs1FVXot_gURhXUrJmw7w5o3YWEMhXqNR6o-s4q7br7q0HMb_nHrxhO0PjXaDLrEpkfLSJN0JZW6U6ZdaS5quB3HaXQw4-sEoxma1NfpckLMmYxZ9wS3Ju62j_M6mkALx06QOuku8Uz6IqF6Hyf82WWbiFgf94vkQwNtuRA_J45Fr9I_LWDLNsM0cck76zscAySsSZZwxafRoSB_eK-uXf1fNj0PNo-9NBP2JEjhM9YUEPL1Jt3yuXIDBeIF2TkRVOnYtACG1tF6QxzdLL-jPsoDY=h32-no';

  // Create a "highlighted location" marker color for when the user
  // mouses over the marker.
  var highlightedIcon = makeMarkerIcon('FFFF24');

  // The following group uses the location array to create an array of markers on initialize.
  for (var i = 0; i < locations.length; i++) {
    // Get the position from the location array.
    var position = locations[i].location; // {lat: xxx, lng: yyy}
    var title = locations[i].title;
    // Create a marker per location, and put into markers array.
    var marker = new google.maps.Marker({
      position: position,
      title: title,
      animation: google.maps.Animation.DROP,
      icon: customIconUrl,
      id: i
    });

    // Push the marker to our array of markers.
    markers.push(marker);
    markersForTitle[title] = marker;
    // Create an onclick event to open the large infowindow at each marker.
    marker.addListener('click', function() {
      populateInfoWindow(this, largeInfowindow, geocoder);
    });
    // Two event listeners - one for mouseover, one for mouseout,
    // to change the colors back and forth.
    marker.addListener('mouseover', function() {
      this.setIcon(highlightedIcon);
    });
    marker.addListener('mouseout', function() {
      this.setIcon(customIconUrl);
    });
  }

  showListings();

  document.getElementById('show-listings').addEventListener('click', showListings);

  document.getElementById('hide-listings').addEventListener('click', function() {
    hideMarkers(markers);
  });
}
// This function populates the infowindow when the marker is clicked. We'll only allow
// one infowindow which will open at the marker that is clicked, and populate based
// on that markers position.
function populateInfoWindow(marker, infowindow, geocoder) {

  var latlng = {lat: marker.position.lat(), lng: marker.position.lng()};
  geocoder.geocode({'location': latlng}, function(results, status) {
    var address = 'No address found';

          if (status === 'OK') {
            if (results[1]) {
              address = results[1].formatted_address;
            } else {
              window.alert('No results found');
            }
          } else {
            window.alert('Geocoder failed due to: ' + status);
          }

        var locationStr = marker.position.lat() + ', ' + marker.position.lng(); // locationStr = 'xxx, yyy'
        var streetviewImgUrl = streetviewApiUrl + locationStr + streetviewApiUrlParam + streetviewApiKey;

        if (infowindow.marker != marker) {
          infowindow.marker = marker;
          var content = '<div>' +
                          '<div>' + marker.title + '</div>' +
                          '<div>' + address + '</div>' +
                          '<img src=\'' + streetviewImgUrl + '\'>' +
                        '</div>';
          infowindow.setContent(content);
          infowindow.open(map, marker);
          // Make sure the marker property is cleared if the infowindow is closed.
          infowindow.addListener('closeclick', function() {
            infowindow.marker = null;
          });
        }
      });

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

function refreshListings(locations) {
  hideMarkers(markers);
  var bounds = new google.maps.LatLngBounds();
  // Extend the boundaries of the map for each marker and display the marker
  for (var i = 0; i < locations.length; i++) {
    var marker = markersForTitle[locations[i].title];
    if (marker) {
      marker.setMap(map);
      bounds.extend(marker.position);
    }
  }
  map.fitBounds(bounds);
}

// This function will loop through the listings and hide them all.
function hideMarkers(markers) {
  for (var i = 0; i < markers.length; i++) {
    markers[i].setMap(null);
  }
}

// This function takes in a COLOR, and then creates a new marker
// icon of that color. The icon will be 21 px wide by 34 high, have an origin
// of 0, 0 and be anchored at 10, 34).
function makeMarkerIcon(markerColor) {
  var markerImage = new google.maps.MarkerImage(
    'http://chart.googleapis.com/chart?chst=d_map_spin&chld=1.15|0|'+ markerColor +
    '|40|_|%E2%80%A2',
    new google.maps.Size(21, 34),
    new google.maps.Point(0, 0),
    new google.maps.Point(10, 34),
    new google.maps.Size(21,34));
  return markerImage;
}
