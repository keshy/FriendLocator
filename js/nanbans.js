loadFriends = function(callback) {

    return FB.api("/me/friends", function(response) {
        if (!response || response.error) {
            callback('fail')
        } else {
            var str = JSON.stringify(response);
            friends = JSON.parse(str).data;
            var frndList = new Array();
            var i = 0;
            setInterval(function() {
                frnd = new Friend(friends[i].id, friends[i].name);
                frnd.getDetails(function(result) {
                    // do not fail out if some information cannot be extracted
                    if (!result.error) {
                        frndList.push(frnd);
                        callback('success');
                    } else {
                        callback('failed to get resource for :' + friends[i].name);
                    }
                });
                i++;
            }, 2000);

        }
    });
}
