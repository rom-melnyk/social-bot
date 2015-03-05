/**
 * Created by obryl on 2/11/2015.
 */
angular.module('SocialApp.vk', []).
    controller('vkController', function($scope, $http, $modal, $sce, $rootScope) {
        $scope.sinceDate = new Date(new Date().toLocaleDateString());
        var accessToken, uid, processFB = function(response) {
            accessToken = response.session.sid;
            $http.put('/api/state/vk', {
                token: accessToken
            }).success(function (response) {
                console.log('success state save');
            });
        }, filterFeedData = function (feeds, groupIndex) {
            var finalFeeds = [], indexWithComment = 1, lastIndexWithComment = 0;
            feeds.forEach(function (value, index) {
                //searching for keyword in post message
                for (var j = 0; j < $scope.allKeywords.length; j++) {
                	RE = new RegExp($scope.allKeywords[j], 'gi');
                	feeds[index].includeKeyword = feeds[index].includeKeyword || RE.test(value.text);
                }
                if (value.comments && value.comments.count) {
                    //require to set timeout: VK API can handle only 3 requests per second
                    setTimeout(function () {
                        //getting post comment
                        $http.jsonp("https://api.vk.com/method/wall.getComments?access_token=" + accessToken + "&scope=offline&callback=JSON_CALLBACK&count=100&owner_id=" + (-$scope.groups[groupIndex].id) + "&post_id=" + value.id)
                        .success(function (resp) {
                            var response = resp.response;
                            feeds[index].comments = response;
                            if (response instanceof Array) {
                                feeds[index].comments.shift();
                            }
                            //searching for keyword in comments
                            filterComments(value, index, finalFeeds, lastIndexWithComment);
                        });
                    }, 350 * indexWithComment);
                    //increasing counter for timeout setting
                    indexWithComment++;

                    //resetting index of last feed with comment (need to know when to hide loading spinner)
                    lastIndexWithComment = index;
                } else {
                    //clear comments property, if feed has 0 comments
                    feeds[index].comments = [];
                }
                //adding feed for displaying if comments contains keyword
                if (value.includeKeyword && finalFeeds.indexOf(value) === -1) {
                    finalFeeds.push(value);
                }
            });
            if (!lastIndexWithComment) {
                $scope.loading = false;
            }
            $scope.vkFeeds = finalFeeds;
        }, filterComments = function (value, index, finalFeeds, lastIndexWithComment) {
            //searching for keyword in comments
            value.comments.forEach(function (comment, commentIndex) {
                for (var j = 0; j < $scope.allKeywords.length; j++) {
                	RE = new RegExp($scope.allKeywords[j], 'gi');
                	value.includeKeyword = value.includeKeyword || RE.test(comment.text);
                }
                if (value.includeKeyword && finalFeeds.indexOf(value) === -1) {
                    finalFeeds.push(value);
                }
                if (index === lastIndexWithComment) {
                    $scope.loading = false;
                }
            });
        };
        $scope.setDate = function (since) {
            $scope.sinceDate = since;
        };
        $http.get('/api/state/vk').success(function (response) {
            if (response.state && response.state !== "auth-fail") {
                $scope.state = response.state;
                if (response.state !== "running") {
                    $scope.crawlerText = "Start VK crawler";
                } else {
                    $scope.crawlerText = "Stop VK crawler";
                }
                accessToken = response.token;
                setGroups();
            } else {
                VK.Auth.login(processFB);
            }
        });
        $scope.showAllGroupsPosts = function () {
            $scope.loading = true;
            $scope.vkFeeds = [];
            $scope.activeGroupIndex = null;
            var since = Math.round(($scope.sinceDate && $scope.sinceDate.getTime()) || (new Date().getTime()));
            $http.get('/api/data/vk/analyzed?since=' + since).success(function (resp) {
                $scope.groupsArray = resp;
                $scope.loading = false;
            });
        };
        $scope.showGroupPosts = function (groupIndex) {
            $scope.loading = true;
            $scope.allKeywords = [];
            $scope.groupsArray = [];
            $http.jsonp("https://api.vk.com/method/wall.get?access_token=" + accessToken + "&callback=JSON_CALLBACK&owner_id=" + (-$scope.groups[groupIndex].id) + "&count=50&extended=1&scope=offline")
                .success(function (data) {
                    if (data.error) {
                        VK.Auth.login(processFB);
                        $scope.loading = false;
                    } else if (data.response) {
                        if (data.response.wall instanceof Array) {
                            data.response.wall.shift();
                            $scope.keywords = $scope.groups[groupIndex].keywords;
                            $scope.keywords.forEach(function (kw) {
                                $scope.allKeywords.push(kw);
                            });
                            $scope.vkKeywords.forEach(function (kw) {
                                if ($scope.allKeywords.indexOf(kw) === -1) {
                                    $scope.allKeywords.push(kw);
                                }
                            });
                            filterFeedData(data.response.wall, groupIndex);
                            $scope.groupDomain = data.response.groups[0].screen_name;
                        }
                        $scope.emptyMessage =  !$scope.vkFeeds.length;
                        $scope.activeGroupIndex = groupIndex;
                    }
                });
        };
        $scope.openVKPage = function (ownerId, postId) {
            window.open("http://vk.com/public" + (-ownerId) + "?w=wall" + ownerId + "_" + postId);
        };
        $scope.isActive = function (groupIndex) {
            return groupIndex === $scope.activeGroupIndex;
        };
        var setGroups = function () {
            $http.get('api/setup/vk').success(function (response) {
                if (response.groups) {
                    $scope.groups = response.groups;
                    $scope.vkKeywords = response.keywords;
                }
            });
        };
        $scope.startCrawler = function (event) {
            if ($scope.state !== "running") {
                $http.get('/api/start/vk').success(function (response) {
                    $scope.state = "running";
                    $scope.crawlerText = "Stop VK crawler";
                });
            } else {
                $http.get('/api/stop/vk').success(function (response) {
                    $scope.state = "stopped";
                    $scope.crawlerText = "Start VK crawler";
                });
            }
        };
        $rootScope.$on('groupsChanged', function () {
            setGroups();
        });
    });