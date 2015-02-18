/**
 * Created by obryl on 2/4/2015.
 */
angular.module('SocialApp.controllers', []).
    controller('fbController', function($scope, $http, $modal, $sce, $rootScope) {
        var accessToken, uid,
            getGroups = function () {
                $http.get('api/setup/fb').success(function (response) {
                    if (response.groups) {
                        $scope.groups = response.groups;
                    }
                });
            }, getLoginAccess = function () {
                $http.get('/api/state/fb').success(function (response) {
                    if (response.token && response.state !== "auth-fail") {
                        if (response.state !== "running") {
                            $http.get('/api/stop/fb').success(function (response) {});
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
            $scope.loading = false;
            $http.put('/api/state/fb', {
                token: accessToken
            }).success(function (response) {
                console.log('success state save');
            });
        };
        getLoginAccess();

        //static scope methods
        $scope.showGroupPosts = function (groupIndex) {
            $scope.loading = true;
            $http.get('https://graph.facebook.com/' + $scope.groups[groupIndex].id + '/feed?access_token=' + accessToken).success(function (resp) {
                if (resp.data) {
                    $scope.facebookFeeds = resp.data;
                    $scope.keywords = $scope.groups[groupIndex].keywords;
                    $scope.emptyMessage =  !$scope.facebookFeeds.length;
                    $scope.activeGroupIndex = groupIndex;
                    $scope.loading = false;
                }
            }).error(function (resp) {
                 FB.login(processFB);
            });
        };
        $scope.isActive = function (groupIndex) {
            return groupIndex === $scope.activeGroupIndex;
        };
        $scope.openFbPage = function (itemId) {
            window.open('https://www.facebook.com/' + itemId, '_newtab');
        };
        $scope.showMore = function (index, event) {
            if (!$scope.facebookFeeds[index].showFullText) {
                event.currentTarget.innerText = "Show less";
            } else {
                event.currentTarget.innerText = "Show more";
            }
            $scope.facebookFeeds[index].showFullText = !$scope.facebookFeeds[index].showFullText;
        };
        $scope.cropText = function (value, len, word) {
            if (value && value.length > len) {
                if (word) {
                    var vs = value.substr(0, len - 2),
                    index = Math.max(vs.lastIndexOf(' '), vs.lastIndexOf('.'), vs.lastIndexOf('!'), vs.lastIndexOf('?'));
                    if (index !== -1 && index >= (len - 15)) {
                        return vs.substr(0, index) + "...";
                    }
                }
                return $sce.trustAsHtml(value.substr(0, len - 3) + "...");
            }
            return $sce.trustAsHtml(value);
        }

        $rootScope.$on('groupsChanged', function () {
            getGroups();
        });

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