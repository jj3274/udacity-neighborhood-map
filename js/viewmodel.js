// Here's my data model
var ViewModel = function(first, last) {
    this.firstName = ko.observable(first);
    this.lastName = ko.observable(last);

    this.fullName = ko.computed(function() {
        // Knockout tracks dependencies automatically. It knows that fullName depends on firstName and lastName, because these get called when evaluating fullName.
        return this.firstName() + " " + this.lastName();
    }, this);
};

var showLocationList = function(locations) {
  var $locationListView = $("#location-list-view");

  $locationListView.empty();

  for (var i = 0; i < locations.length; i++) {
    $locationListView.append("<li>" + locations[i].title + "</li>");
  }
}

showLocationList(jumi_locations);

var refreshLocationList = function() {
  var filterStr = $("#filter-input").val();

  var newLocations = [];

  for (var i = 0; i < jumi_locations.length; i++) {
    if (jumi_locations[i].title.toLowerCase().indexOf(filterStr.toLowerCase()) >= 0) {
      newLocations.push(jumi_locations[i]);
    }
  }

  showLocationList(newLocations);
  refreshListings(newLocations);
}

var filter_input_onkeypress = function(e) {
    // if (e.keyCode == 13) {
        refreshLocationList();
        return true;
    // }
}
