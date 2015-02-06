/**
 * Created by obryl on 2/4/2015.
 */
angular.module('SocialApp.controllers', []).
    controller('socialController', function($scope, $http, $modal, $sce) {
        var accessToken, uid;
        $scope.groups = [{
            id: "303201976514746",
            name: "Тепле ІТ середовище",
            keyword: "Перш"
        }, {
            id: "413176182109914",
            name: "LocalDev knowledge sharing",
            keyword: "прогр"
        }];
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
            setTimeout(function() {
                $scope.isLoggedIn = true;
            }, 1000);
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
            $scope.isActive = function (groupIndex) {
                return groupIndex === $scope.activeGroupIndex;
            };
            $scope.openFbPage = function (itemId) {
                    window.open('https://www.facebook.com/' + itemId, '_newtab');
            };
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

    }).filter('keyWordFilter', function ($sce) {
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