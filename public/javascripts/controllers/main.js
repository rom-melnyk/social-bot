/**
 * Created by obryl on 2/4/2015.
 */
angular.module('SocialApp.controllers', []).
    controller('socialController', function($scope, $http) {
        var accessToken;
        FB.getLoginStatus(function(response) {
            accessToken = "CAACEdEose0cBAB6ZARK21ZAN0gS81wI9yPQVvoisi89HYvrQWMKbMuAVY2WtBrD4jJHlmpBdFbToWo5PVCppObobK4YRur365J2ZARvbZCyMFASScFExU7q3LTzzrU3Rv4671JhEZCeydAFJzcRLYGhBxAX5XrtsnR2bIGI2gIdvyP10iZCoJCbpKI8KYVuDZCGizD9VatpfCYETPfwVMSt";
            $http.get('https://graph.facebook.com/339711716217437/groups?access_token=' + accessToken).success(function (resp) {
                $scope.userGroups = resp.data;
                $http.get('https://graph.facebook.com/339711716217437/likes?access_token=' + accessToken).success(function (resp) {
                    resp.data.forEach(function (value) {
                        $scope.userGroups.push(value);
                    });
                });
            });
            $scope.showGroupPosts = function (groupIndex) {
                $http.get('https://graph.facebook.com/' + $scope.userGroups[groupIndex].id + '/feed?since=2015-01-01&access_token=' + accessToken).success(function (resp) {
                    $scope.facebookFeeds = resp.data;
                    $scope.emptyMessage =  !$scope.facebookFeeds.length;
                });
            };
            $scope.openFbPage = function (itemId) {
                location.href = 'https://www.facebook.com/' + itemId;
            };
        });
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