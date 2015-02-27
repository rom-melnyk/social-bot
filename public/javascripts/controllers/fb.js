/**
 * Created by obryl on 2/4/2015.
 */
angular.module('SocialApp.controllers', []).
    controller('fbController', function($scope, $http, $modal, $sce, $rootScope, $filter) {
        $scope.groupsArray = [];
        $scope.sinceDate = new Date();
        $scope.setDate = function (since) {
            $scope.sinceDate = since;
        }
        var accessToken, uid,
            getGroups = function () {
                $http.get('api/setup/fb').success(function (response) {
                    if (response.groups) {
                        $scope.groups = response.groups;
                        $scope.networkKeywords = response.keywords;
                    }
                });
            }, getLoginAccess = function () {
                $http.get('/api/state/fb').success(function (response) {
                    if (response.token && response.state !== "auth-fail") {
                        /*if (response.state !== "running") {
                            $http.get('/api/stop/fb').success(function (response) {});
                        }*/
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
            var since = $scope.sinceDate.getTime()/1000;
            $scope.groupsArray = [];
            $scope.loading = true;
            $http.get('https://graph.facebook.com/' + $scope.groups[groupIndex].id + '/feed?access_token=' + accessToken + "&since=" + since + "&limit=50").success(function (resp) {
                if (resp.data) {
                    $scope.facebookFeeds = resp.data;
                    $scope.keywords = $scope.groups[groupIndex].keywords;
                    $scope.networkKeywords.forEach(function (kw) {
                        if ($scope.keywords.indexOf(kw) === -1) {
                            $scope.keywords.push(kw);
                        }
                    });
                    $scope.emptyMessage =  !$scope.facebookFeeds.length;
                    $scope.activeGroupIndex = groupIndex;
                    $scope.loading = false;
                }
            }).error(function (resp) {
                 FB.login(processFB);
            });
        };
        $scope.showAllGroupsPosts = function () {
            $scope.facebookFeeds = [];
            $scope.groupsArray = [];
            $scope.activeGroupIndex = null;
            $scope.groups.forEach(function (group) {
                var feedsArray = [],
                    page = 0,
                    since = $scope.sinceDate.toLocaleDateString().split('.').join('-');
                var getFeeds = function (nextPage) {
                    var url = 'https://graph.facebook.com/' + group.id + '/feed?access_token=' + accessToken + '&since=' + since;
                    if (nextPage) {
                        url = nextPage + '&since=' + since;
                    }
                    $http.get(url).success(function (resp) {
                        if (resp.data) {
                            $scope.networkKeywords.forEach(function (kw) {
                                if (group.keywords.indexOf(kw) === -1) {
                                    group.keywords.push(kw);
                                }
                            });
                            if (resp.paging && resp.paging.next) {
                                page++;
                                getFeeds(resp.paging.next);
                            } else {
                                console.log("no next page found");
                                $scope.groupsArray.push({
                                    group: group,
                                    feeds: feedsArray
                                });
                            }
                            var filtered = $filter('keyWordFilter')(resp.data, group.keywords);
                            feedsArray = feedsArray.concat(filtered);
                        }
                    });
                    };
                    getFeeds();
                });
        };
        $scope.openFbPage = function (itemId) {
            window.open('https://www.facebook.com/' + itemId, '_newtab');
        };
        $scope.isActive = function (groupIndex) {
            return groupIndex === $scope.activeGroupIndex;
        };

        $rootScope.$on('groupsChanged', function () {
            getGroups();
        });

    })