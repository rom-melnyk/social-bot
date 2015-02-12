/**
 * Created by obryl on 2/11/2015.
 */
angular.module('SocialApp.vk', []).
    controller('vkController', function($scope, $http, $modal, $sce) {
        var accessToken, uid;
        $http.get('/api/state/vk').success(function (response) {
            if (response.state && response.state !== "auth-fail") {
                if (response.state !== "running") {
                    $http.get('/api/start/vk').success(function (response) {});
                }
                accessToken = response.state;
                $scope.groups = [{
                    id: 1111,
                    name: "Lisp",
                    keyword: ""
                }, {
                    id: 8888,
                    name: "Домашний тренинг - максимум свободы онлайн",
                    keyword: ""
                }];
                $scope.showGroupPosts = function (groupIndex) {
                    VK.api('wall.get', {
                        owner_id: $scope.groups[groupIndex].id
                        }, function (data) {
                        if (data.response) {
                            console.log(data.response);
                            $scope.vkFeeds = data.response;
                            $scope.keyword = $scope.groups[groupIndex].keyword;
                            $scope.emptyMessage =  !$scope.vkFeeds.length;
                            $scope.activeGroupIndex = groupIndex;
                        }
                    });
                };
            } else {
                VK.Auth.login(processFB);
            }
        });
        var processFB = function(response) {
            accessToken = response.session.sid;
            $http.put('/api/state/vk', {
                state: accessToken
            }).success(function (response) {
                console.log('success state save');
            });
            /*$http.get('https://graph.facebook.com/339711716217437/groups?access_token=' + accessToken).success(function (resp) {
             $scope.userGroups = resp.data;
             $http.get('https://graph.facebook.com/339711716217437/likes?access_token=' + accessToken).success(function (resp) {
             resp.data.forEach(function (value) {
             $scope.userGroups.push(value);
             });
             });
             });*/
            $scope.showGroupPosts = function (groupIndex) {
                VK.api('wall.get', {
                    owner_id: $scope.groups[groupIndex].id
                }, function (data) {
                    if (data.response) {
                        $scope.vkFeeds = data.response;
                        $scope.keyword = $scope.groups[groupIndex].keyword;
                        $scope.emptyMessage =  !$scope.vkFeeds.length;
                        $scope.activeGroupIndex = groupIndex;
                    }
                });
            };
        };
        $scope.isActive = function (groupIndex) {
            return groupIndex === $scope.activeGroupIndex;
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

    });