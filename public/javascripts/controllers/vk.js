/**
 * Created by obryl on 2/11/2015.
 */
angular.module('SocialApp.vk', []).
    controller('vkController', function($scope, $http, $modal, $sce, $rootScope) {
        var setGroups = function () {
            $http.get('api/setup/vk').success(function (response) {
                if (response.groups) {
                    $scope.groups = response.groups;
                    $scope.vkKeywords = $rootScope.loggedInUser.keywords.vk;
                }
            });
        };
        var accessToken, uid, processFB = function(response) {
            accessToken = response.session.sid;
            $http.put('/api/state/vk', {
                token: accessToken
            }).success(function (response) {
                console.log('success state save');
            });
        };
        $http.get('/api/state/vk').success(function (response) {
            if (response.state && response.state !== "auth-fail") {
                $scope.state = response.state;
                if (response.state !== "running") {
                    $scope.crawlerText = "Запустити моніторинг";
                } else {
                    $scope.crawlerText = "Зупинити моніторинг";
                }
                accessToken = response.token;
                setGroups();
            } else {
                VK.Auth.login(processFB);
            }
        });
        $scope.startCrawler = function (event) {
            if ($scope.state !== "running") {
                $http.get('/api/start/vk').success(function (response) {
                    $scope.state = "running";
                    $scope.crawlerText = "Зупинити моніторинг";
                });
            } else {
                $http.get('/api/stop/vk').success(function (response) {
                    $scope.state = "stopped";
                    $scope.crawlerText = "Запустити моніторинг";
                });
            }
        };

        $rootScope.$on('groupsChanged', function () {
            setGroups();
        });
    });