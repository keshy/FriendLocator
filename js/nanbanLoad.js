// Need this map[city, number_of_friends] to handle cases where many friends are mapped to the same location
// Adjust pointer location by a factor of
// lat + = sameLocationMap['cityName'] * 0.01;
// lng + = sameLocationMap['cityName'] * 0.01;

var sameLocationMap = {};

updateMap = function(city) {
    if (!sameLocationMap[city]) {
        sameLocationMap[city] = 1;
    } else {
        // city exists in map;
        sameLocationMap[city] = sameLocationMap[city] + 1;
    }
}
function Friend(f) {

    this.data = {};
    this.data.graphUrl = "http://graph.facebook.com/";
    this.data.name = f.name;
    this.data.userId = f.id;
    this.data.curLocation = (f.location) ? (f.location.name) ? f.location.name : "" : "";
    this.data.curLocationUrl = (f.location) ? (f.location.id) ? this.data.graphUrl + f.location.id : "" : "";
    this.data.curLocation !== "" ? updateMap(this.data.curLocation) : "";
    this.data.curLocationLatLong = {
        lat : "",
        lon : ""
    }
    this.data.hometown = (f.hometown) ? (f.hometown.name) ? f.hometown.name : "" : "";
    this.data.hometown !== "" ? updateMap(this.data.hometown) : "";
    this.data.hometownUrl = (f.hometown) ? (f.hometown.id) ? this.data.graphUrl + f.hometown.id : "" : "";
    this.data.hometownLatLong = {
        lat : "",
        lon : ""
    }

    this.data.url = "";
    this.data.error = {
        inError : false,
        errorMsg : ""
    }

}

Friend.prototype.getDetails = function(FBStore, callback) {
    var query = new Parse.Query(FBStore);
    var f = this.data;
    query.equalTo("userId", this.data.userId);
    query.find({
        success : function(result) {
            if (result.length == 0) {
                f.url = f.graphUrl + f.userId + "/";
                f.picture_icon = f.graphUrl + f.userId + "/" + "picture";
                f.picture_large = f.graphUrl + f.userId + "/" + "picture?type=large";
                // set these for caching
                var fbStore = new FBStore();
                fbStore.set("userId", f.userId);
                fbStore.set("url", f.url);
                fbStore.set("name", f.name);
                fbStore.set("picture_icon", f.picture_icon);
                fbStore.set("picture_large", f.picture_large);
                fbStore.set("curLocation", f.curLocation);
                fbStore.set("curLocationUrl", f.curLocationUrl);
                fbStore.set("hometown", f.hometown);
                fbStore.set("hometownUrl", f.hometownUrl);
                getLatLong(fbStore, f, function(res) {
                    if (res) {
                        res.save(null, {
                            success : function(result) {
                                return callback(JSON.stringify(result));
                            }
                        });
                    }
                });

            } else {
                return callback(JSON.stringify(result));
            }

        },
        error : function(error) {
            return callback(null);
        }
    });

}
getLatLong = function(fbStore, f, callback) {
    var latlon = {
        lat : "",
        lon : ""
    }
    if (f.curLocation) {
        return geocoder.geocode({
            'address' : f.curLocation
        }, function(results, status) {
            if (status == google.maps.GeocoderStatus.OK) {
                f.curLocationLatLong.lat = results[0].geometry.location.lat();
                f.curLocationLatLong.lon = results[0].geometry.location.lng();
                fbStore.set("curLocationLatLong", f.curLocationLatLong);

                return callback(fbStore);

            }
        });
    } else if (f.hometown) {
        return geocoder.geocode({
            'address' : f.hometown
        }, function(results, status) {
            if (status == google.maps.GeocoderStatus.OK) {
                f.hometownLatLong.lat = results[0].geometry.location.lat();
                f.hometownLatLong.lon = results[0].geometry.location.lng();
                fbStore.set("hometownLatLong", f.hometownLatLong);
                return callback(fbStore);
            }
        });
    }

}
codeAddress = function(addressType, friend, callback) {
    // map has to be loaded already for this phase to work
    var contentString = '<div id="content">' + '<div id="siteNotice">' + '</div>' + '<h1 id="firstHeading" class="firstHeading">Uluru</h1>' + '<div id="bodyContent">' + '<p><b>Uluru</b>, also referred to as <b>Ayers Rock</b>, is a large ' + 'sandstone rock formation in the southern part of the ' + 'Northern Territory, central Australia. It lies 335&#160;km (208&#160;mi) ' + 'south west of the nearest large town, Alice Springs; 450&#160;km ' + '(280&#160;mi) by road. Kata Tjuta and Uluru are the two major ' + 'features of the Uluru - Kata Tjuta National Park. Uluru is ' + 'sacred to the Pitjantjatjara and Yankunytjatjara, the ' + 'Aboriginal people of the area. It has many springs, waterholes, ' + 'rock caves and ancient paintings. Uluru is listed as a World ' + 'Heritage Site.</p>' + '<p>Attribution: Uluru, <a href="http://en.wikipedia.org/w/index.php?title=Uluru&oldid=297882194">' + 'http://en.wikipedia.org/w/index.php?title=Uluru</a> ' + '(last visited June 22, 2009).</p>' + '</div>' + '</div>';
    var latlng = "";
    var address = "";

    if (addressType === "current") {
        if (friend && friend.curLocationLatLong) {

            str = friend.curLocationLatLong;
            num = Math.random();
            str.lat = str.lat + ((sameLocationMap[friend.curLocation] > 1) ? (num < 0.5) ? -1 * num * 0.1 : num * 0.1 : 0);
            str.lon = str.lon + ((sameLocationMap[friend.curLocation] > 1) ? (num < 0.5) ? 1 * num * 0.1 : -1 * num * 0.1 : 0);
            console.log(friend.curLocation + " : " + str.lat);
            latlng = new google.maps.LatLng(str.lat, str.lon);
            address = friend.curLocation;
        } else {
            return;
        }
    } else {
        if (friend && friend.hometownLatLong) {
            str = friend.hometownLatLong;
            num = Math.random();
            str.lat = str.lat + ((sameLocationMap[friend.hometown] > 1) ? (num < 0.5) ? -1 * num * 0.1 : num * 0.1 : 0);
            str.lon = str.lon + ((sameLocationMap[friend.hometown] > 1) ? (num < 0.5) ? -1 * num * 0.1 : num * 0.1 : 0);
            latlng = new google.maps.LatLng(str.lat, str.lon);
            address = friend.hometown;
        } else {
            return;
        }
    }

    //map.setCenter(results[0].geometry.location);
    var marker = new google.maps.Marker({
        map : map,
        position : latlng,
        icon : friend.picture_icon,
        title : friend.name,

    });
    marker.info = new google.maps.InfoWindow({
        content : "<div id=\"disc\"><h4>" + friend.name + "</h4><hr /><p>" + address + "<p></div>"
    });
    google.maps.event.addListener(marker, 'click', function() {

        marker.info.open(map, marker);

    });
    // add transition effects on mouse over
    google.maps.event.addListener(marker, 'mouseover', function() {
        marker.setIcon(friend.picture_large);

    });

    google.maps.event.addListener(marker, 'mouseout', function() {
        marker.setIcon(friend.picture_icon);
        marker.info.close(map, marker);

    });
    callback("success");
}
isEmptyProperty = function(property) {
    if (property == undefined || property === "") {
        return true;
    } else {
        return false;
    }
}

Friend.prototype.setError = function(message) {
    this.error.inError = true;
    this.error.errorMsg = message;
    return this.error;
}
