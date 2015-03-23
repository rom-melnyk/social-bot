/**
 * Created by obryl on 2/4/2015.
 */
angular.module('SocialApp.controllers', []).
    controller('fbController', function($scope, $http, $modal, $sce, $rootScope, $filter) {
        $scope.postsArray = [];
        var getGroups = function () {
            $http.get('api/setup/fb').success(function (response) {
                if (response.groups) {
                    $scope.groups = response.groups;
                    $scope.networkKeywords = $rootScope.loggedInUser.keywords.fb;
                }
            });
        };
        $rootScope.$on('userSet', function () {
            var accessToken, uid,
                getLoginAccess = function () {
                    $http.get('/api/state/fb').success(function (response) {
                        if (response.token && response.state !== "auth-fail") {
                            $scope.state = response.state;
                            if (response.state !== "running") {
                                $scope.crawlerText = "Start FB crawler";
                            } else {
                                $scope.crawlerText = "Stop FB crawler";
                            }
                            accessToken = response.token;
                            var refreshToken = function () {
                                $http.jsonp('/auth?callback=JSON_CALLBACK').success(function (resp) {
                                    console.log(resp);
                                });
                            };
                            if (!$rootScope.fbInterval) {
                                $rootScope.fbInterval = setInterval(refreshToken, 5000000);
                                refreshToken();
                            }
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
            $scope.startCrawler = function (event) {
                if ($scope.state !== "running") {
                    $http.get('/api/start/fb').success(function (response) {
                        $scope.state = "running";
                        $scope.crawlerText = "Stop FB crawler";
                    });
                } else {
                    $http.get('/api/stop/fb').success(function (response) {
                        $scope.state = "stopped";
                        $scope.crawlerText = "Start FB crawler";
                    });
                }
            };
        });
        $rootScope.$on('groupsChanged', function () {
            getGroups();
        });
    });