function Friend(id, name) {
    this.graphUrl = "http://graph.facebook.com/";
    this.name = name;
    this.userId = id;
    this.curLocation = "";
    this.curLocationUrl = "";
    this.hometown = "";
    this.hometownUrl = "";
    this.fname = "";
    this.lname = "";
    this.bday = "";
    this.url = "";
    this.picture = "";
    this.error = {
        inError : false,
        errorMsg : ""
    }

}

Friend.prototype.getDetails = function(callback) {

    // retreive friend details from facebook
    var frnd = {
        query : "/" + this.userId + "/?fields=location,hometown",
        url : this.graphUrl + this.userId + "/",
        picture_icon : this.graphUrl + this.userId + "/" + "picture",
        picture_large : this.graphUrl + this.userId + "/" + "picture?type=large",
        name : this.name
    }

    return FB.api(frnd.query, function(response) {
        if (!response || response.error) {
            this.setError("Could not retreive friend details");

        } else {

            this.fname = !this.isEmptyProperty(response.first_name) ? response.first_name : "";
            this.lname = !this.isEmptyProperty(response.last_name) ? response.last_name : "";
            this.bday = !this.isEmptyProperty(response.birthday) ? response.birthday : "";

            if (response.location) {
                this.curlocation = !this.isEmptyProperty(response.location.name) ? response.location.name : "";
                this.curlocationUrl = !this.isEmptyProperty(response.location.id) ? this.graphUrl + response.location.id : "";
                frnd.address = this.curlocation;
                frnd.addressUrl = this.curlocationUrl;
                codeAddress(frnd, function(response) {
                    if (!response || response === "fail") {

                    } else {
                    }
                });

            }
            if (response.hometown) {
                this.hometown = !this.isEmptyProperty(response.hometown.name) ? response.hometown.name : "";
                this.hometownUrl = !this.isEmptyProperty(response.hometown.id) ? this.graphUrl + response.hometown.id : "";
            }

        }

        callback(this);

    });

};

codeAddress = function(friend, callback) {
    // map has to be loaded already for this phase to work
    var contentString = '<div id="content">' + '<div id="siteNotice">' + '</div>' + '<h1 id="firstHeading" class="firstHeading">Uluru</h1>' + '<div id="bodyContent">' + '<p><b>Uluru</b>, also referred to as <b>Ayers Rock</b>, is a large ' + 'sandstone rock formation in the southern part of the ' + 'Northern Territory, central Australia. It lies 335&#160;km (208&#160;mi) ' + 'south west of the nearest large town, Alice Springs; 450&#160;km ' + '(280&#160;mi) by road. Kata Tjuta and Uluru are the two major ' + 'features of the Uluru - Kata Tjuta National Park. Uluru is ' + 'sacred to the Pitjantjatjara and Yankunytjatjara, the ' + 'Aboriginal people of the area. It has many springs, waterholes, ' + 'rock caves and ancient paintings. Uluru is listed as a World ' + 'Heritage Site.</p>' + '<p>Attribution: Uluru, <a href="http://en.wikipedia.org/w/index.php?title=Uluru&oldid=297882194">' + 'http://en.wikipedia.org/w/index.php?title=Uluru</a> ' + '(last visited June 22, 2009).</p>' + '</div>' + '</div>';
    geocoder.geocode({
        'address' : friend.address
    }, function(results, status) {
        if (status == google.maps.GeocoderStatus.OK) {
            //map.setCenter(results[0].geometry.location);
            var marker = new google.maps.Marker({
                map : map,
                position : results[0].geometry.location,
                icon : friend.picture_icon,
                title : friend.name
            });
            marker.info = new google.maps.InfoWindow({
                content : "<div id=\"disc\"><h4>" + friend.name + "</h4><hr /><p>" + friend.address + "<p></div>"
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
            callback('success');
        } else {
            callback('fail');
        }
    });

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
