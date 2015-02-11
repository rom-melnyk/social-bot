/**
 * Created by obryl on 2/11/2015.
 */
angular.module('SocialApp.vk', []).
    controller('vkController', function($scope, $http, $modal, $sce) {
        var accessToken, uid;
        $http.get('/api/token/vk').success(function (response) {
            if (response.token && response.state !== "auth-fail") {
                accessToken = response.token;
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
            $http.put('/api/token/vk', {
                token: accessToken
            }).success(function (response) {
                console.log('success token save');
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
                $http.get('https://graph.facebook.com/' + $scope.groups[groupIndex].id + '/feed?access_token=' + accessToken).success(function (resp) {
                    $scope.facebookFeeds = resp.data;
                    $scope.keyword = $scope.groups[groupIndex].keyword;
                    $scope.emptyMessage =  !$scope.facebookFeeds.length;
                    $scope.activeGroupIndex = groupIndex;
                });
            };
        };
        $scope.isActive = function (groupIndex) {
            return groupIndex === $scope.activeGroupIndex;
        };
        $scope.openFbPage = function (itemId) {
            window.open('https://www.facebook.com/' + itemId, '_newtab');
        };
        $scope.editKeyWords = function () {
            var modalInstance = $modal.open({
                templateUrl: "../../views/editKeyWordsModal.html",
                controller: "keyWordsController",
                backdrop: true,
                resolve: {
                    groups: function () {
                        return $scope.groups;
                    }
                }
            });
            modalInstance.result.then(function (groups) {
                $scope.groups = groups;
                $scope.facebookFeeds = [];
            });
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