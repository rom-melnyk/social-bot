/**
 * Created by obryl on 2/4/2015.
 */
angular.module('SocialApp.controllers', []).
    controller('fbController', function($scope, $http, $modal, $sce) {
        var accessToken, uid,
            getGroups = function () {
                $http.get('api/setup/fb').success(function (response) {
                    if (response.groups) {
                        $scope.groups = response.groups;
                    }
                });
            }, getLoginAccess = function () {
                $http.get('/api/state/fb').success(function (response) {
                    if (response.state && response.state !== "auth-fail") {
                        if (response.state !== "running") {
                            $http.get('/api/start/fb').success(function (response) {});
                        }
                        accessToken = response.token;
                        getGroups();
                    } else {
                        FB.getLoginStatus(function (resp) {
                            if (resp.authResponse && resp.authResponse.accessToken) {
                                processFB(resp);
                            } else {
                                FB.login(processFB);
                            }
                        });
                    }
                });
            }, processFB = function(response) {
            accessToken = response.authResponse && response.authResponse.accessToken;
            getGroups();
            $http.put('/api/state/fb', {
                token: accessToken
            }).success(function (response) {
                console.log('success state save');
            });
        };
        getLoginAccess();

        //static scope methods
        $scope.showGroupPosts = function (groupIndex) {
            $http.get('https://graph.facebook.com/' + $scope.groups[groupIndex].id + '/feed?access_token=' + accessToken).success(function (resp) {
                $scope.facebookFeeds = resp.data;
                $scope.keywords = $scope.groups[groupIndex].keywords;
                $scope.emptyMessage =  !$scope.facebookFeeds.length;
                $scope.activeGroupIndex = groupIndex;
            });
        };
        $scope.isActive = function (groupIndex) {
            return groupIndex === $scope.activeGroupIndex;
        };
        $scope.openFbPage = function (itemId) {
            window.open('https://www.facebook.com/' + itemId, '_newtab');
        };
        $scope.highlight = function(text, search) {
            if (!search) {
                return $sce.trustAsHtml(text);
            }
            return $sce.trustAsHtml(text.replace(new RegExp(search, 'i'), '<span class="highlightedText">$&</span>'));
        };
        $scope.formatDate = function (dateString) {
            return $sce.trustAsHtml(new Date(dateString).toUTCString());
        };

    }).filter('keyWordFilter', function () {
        return function (items, keyword) {
            var filtered = [];
            if (items && items.length && keyword) {
                for (var i = 0; i < items.length; i++) {
                    var item = items[i],
                        containsWord = false;
                    if (item.message && item.message.toLowerCase().indexOf(keyword.toLowerCase()) !== -1) {
                        filtered.push(item);
                    } else if (item.comments) {
                        item.comments.data.forEach(function (value) {
                            if (value.message.toLowerCase().indexOf(keyword.toLowerCase()) !== -1) {
                                containsWord = true;
                            }
                        });
                        containsWord && filtered.push(item);
                        containsWord = false;
                    }
                }
            } else {
                return items;
            }
            return filtered;
        };
    });