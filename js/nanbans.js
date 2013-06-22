loadFriends = function(callback) {

    FB.api("/me/", function(response) {
        if (!response || response.error) {
            callback(response.error)
        } else {
            var FBStore = Parse.Object.extend("FBStore_" + response.name.split(" ")[0]);
            FB.api("/me/friends?fields=name,location,hometown", function(response) {
                var str = JSON.stringify(response);
                friends = JSON.parse(str).data;
                var frndList = new Array();
                var i = 0;
                var frndCount = friends.length;
                //var frndCount = 200;
                setInterval(function() {
                    if (i < frndCount) {

                        frnd = new Friend(friends[i]);

                        // do not fail out if some information cannot be extracted
                        frnd.getDetails(FBStore, function(result) {

                            if (result) {
                                frndList.push(frnd);

                                obj = JSON.parse(result);
                                if (obj.length > 0) {
                                    obj = obj[0];
                                }
                                codeAddress("current", obj, function(status) {
                                    if (status === "success") {
                                        //callback('completed');

                                    }

                                });
                            } else {
                                //callback('failed to retreive lat long');
                            }

                        });

                    }
                    i = i + 1;
                    if (i == frndCount) {
                        return callback("Geo Locate complete");
                    }
                }, 500, callback);

            });

        }
    });
}

