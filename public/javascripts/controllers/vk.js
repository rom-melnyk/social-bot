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
        },  filterFeedData = function (feeds) {   
                var finalFeeds = [];
                for (var i=1; i<feeds.length; i++) {
                    for (var j = 0; j < $scope.vkKeywords.length; j++) {
                        RE = new RegExp($scope.vkKeywords[j], 'gi'); 
                        var result = RE.test(feeds[i].text);
                        if (result == true) {    
                            feeds[i].found = feeds[i].text.match(RE).length;
                            console.log(feeds[i].found);
                            finalFeeds.push(feeds[i]);
                        }
                    }  
                }     
            return finalFeeds;            
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

        $scope.showInReal = function () {
            var allFeeds = [], groupFeeds = [];
            for (var i=0; i<$scope.groups.length; ++i) {
            $http.jsonp("https://api.vk.com/method/wall.get?access_token=" + accessToken + "&callback=JSON_CALLBACK&owner_id=" + (-$scope.groups[i].id) + "&count=100&extended=1") 
                .success(function (data) {
                    if (data.error) {
                        VK.Auth.login(processFB);
                        $scope.loading = false;
                    } else if (data.response) {
                            if (data.response.wall instanceof Array) {
                                groupFeeds = filterFeedData(data.response.wall);
                                if (groupFeeds.length > 0) {
                                    for (var j=0; j<groupFeeds.length; j++) {
                                        allFeeds.push(groupFeeds[j]);     
                                    }
                                }; 
                                for (var h=0; h<allFeeds.length; h++)  {
                                    for (var z=0; z<$scope.groups.length; z++) {
                                        if (allFeeds[h].to_id == -$scope.groups[z].id) {
                                        allFeeds[h].name = $scope.groups[z].name;
                                        }
                                    }   
                                }    
                            $scope.realTimeFeeds = allFeeds;                               
                            }  
                        }   
                });
            };
         };

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