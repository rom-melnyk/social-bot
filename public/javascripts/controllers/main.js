/**
 * Created by obryl on 2/4/2015.
 */
angular.module('SocialApp.controllers', []).
    controller('socialController', function($scope, $http, $modal) {
        var accessToken, uid;
        FB.getLoginStatus(function(response) {
            if (response.status === 'connected') {
                // the user is logged in and has authenticated your
                // app, and response.authResponse supplies
                // the user's ID, a valid access token, a signed
                // request, and the time the access token
                // and signed request each expire
                uid = response.authResponse.userID;
                accessToken = response.authResponse.accessToken;
                processFB(response);
            } else {
                FB.login(processFB);
            }
        });
        var processFB = function(response) {
            accessToken = response.authResponse.accessToken;
            /*$http.get('https://graph.facebook.com/339711716217437/groups?access_token=' + accessToken).success(function (resp) {
             $scope.userGroups = resp.data;
             $http.get('https://graph.facebook.com/339711716217437/likes?access_token=' + accessToken).success(function (resp) {
             resp.data.forEach(function (value) {
             $scope.userGroups.push(value);
             });
             });
             });*/
            //$scope.showGroupPosts = function (groupIndex) {
            $http.get('https://graph.facebook.com/303201976514746/feed?since=2015-01-01&filter=test&access_token=' + accessToken).success(function (resp) {
                $scope.facebookFeeds = resp.data;
                $scope.emptyMessage =  !$scope.facebookFeeds.length;
            });
            //};
            $scope.openFbPage = function (itemId) {
                location.href = 'https://www.facebook.com/' + itemId;
            };
            };
            $scope.editKeyWords = function () {
                $modal.open({
                    templateUrl: "../../views/editKeyWordsModal.html",
                    controller: "keyWordsController",
                    backdrop: true
                });
            };

    }).filter('keyWordFilter', function () {
        return function (items) {
            var filtered = [];
            if (items && items.length) {
                for (var i = 0; i < items.length; i++) {
                    var item = items[i],
                        filterVal = document.getElementById('keyWordFilter').value.toLowerCase(),
                        containsWord = false;
                    if (item.message && item.message.toLowerCase().indexOf(filterVal) !== -1) {
                        filtered.push(item);
                    } else if (item.comments) {
                        item.comments.data.forEach(function (value) {
                            if (value.message.toLowerCase().indexOf(filterVal) !== -1) {
                                containsWord = true;
                            }
                        });
                        containsWord && filtered.push(item);
                        containsWord = false;
                    }
                }
            }
            return filtered;
        };
    });