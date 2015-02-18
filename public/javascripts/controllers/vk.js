/**
 * Created by obryl on 2/11/2015.
 */
angular.module('SocialApp.vk', []).
    controller('vkController', function($scope, $http, $modal, $sce) {
        var accessToken, uid, processFB = function(response) {
            accessToken = response.session.sid;
            $http.put('/api/state/vk', {
                state: accessToken
            }).success(function (response) {
                console.log('success state save');
            });
        }, filterFeedData = function (feeds, groupIndex) {
            var finalFeeds = [], indexWithComment = 1, lastIndexWithComment = 0;
            feeds.forEach(function (value, index) {
                //searching for keyword in post message
                feeds[index].includeKeyword = !(!value.text || ($scope.keywords[0] && value.text.toLowerCase().indexOf($scope.keywords[0].toLowerCase()) === -1));
                if (value.comments && value.comments.count) {
                    //require to set timeout: VK API can handle only 3 requests per second
                    setTimeout(function () {
                        //getting post comment
                        $http.jsonp("https://api.vk.com/method/wall.getComments?access_token=" + accessToken + "&callback=JSON_CALLBACK&count=100&owner_id=" + (-$scope.groups[groupIndex].id) + "&post_id=" + value.id)
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
                value.includeKeyword =
                    value.includeKeyword
                    ||
                    !($scope.keywords[0] && comment.text.toLowerCase().indexOf($scope.keywords[0].toLowerCase()) === -1);
                if (value.includeKeyword && finalFeeds.indexOf(value) === -1) {
                    finalFeeds.push(value);
                }
                if (index === lastIndexWithComment) {
                    $scope.loading = false;
                }
            });
        };
        $http.get('/api/state/vk').success(function (response) {
            if (response.state && response.state !== "auth-fail") {
                if (response.state !== "running") {
                    $http.get('/api/stop/vk').success(function (response) {});
                }
                accessToken = response.token;
                setGroups();
            } else {
                VK.Auth.login(processFB);
            }
        });
        $scope.showGroupPosts = function (groupIndex) {
            $scope.loading = true;
            $http.jsonp("https://api.vk.com/method/wall.get?access_token=" + accessToken + "&callback=JSON_CALLBACK&owner_id=" + (-$scope.groups[groupIndex].id) + "&count=50&extended=1")
                .success(function (data) {
                    if (data.error) {
                        VK.Auth.login(processFB);
                        $scope.loading = false;
                    } else if (data.response) {
                        if (data.response.wall instanceof Array) {
                            data.response.wall.shift();
                            $scope.keywords = $scope.groups[groupIndex].keywords;
                            filterFeedData(data.response.wall, groupIndex);
                            $scope.groupDomain = data.response.groups[0].screen_name;
                        }
                        $scope.emptyMessage =  !$scope.vkFeeds.length;
                        $scope.activeGroupIndex = groupIndex;
                    }
                });
        };
        $scope.openVKPage = function (ownerId, postId) {
            window.open("http://vk.com/" + $scope.groupDomain + "?w=wall" + ownerId + "_" + postId);
        };
        $scope.isActive = function (groupIndex) {
            return groupIndex === $scope.activeGroupIndex;
        };
        $scope.highlight = function(text, search) {
            if (text) {
                if (!search) {
                    return $sce.trustAsHtml(text);
                }
                return $sce.trustAsHtml(text.replace(new RegExp(search, 'i'), '<span class="highlightedText">$&</span>'));
            }
            return "";
        };
        $scope.formatDate = function (dateString) {
            return $sce.trustAsHtml(new Date(dateString).toUTCString());
        };

        $scope.showMore = function (index, event) {
            if (!$scope.vkFeeds[index].showFullText) {
                event.currentTarget.innerText = "Show less";
            } else {
                event.currentTarget.innerText = "Show more";
            }
            $scope.vkFeeds[index].showFullText = !$scope.vkFeeds[index].showFullText;
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
        };
        var setGroups = function () {
            $scope.groups = [{
                id: 36573302,
                name: "Typical IF",
                keywords: ["президент"]
            }, {
                id: 56861614,
                name: "Я ♥ Івано-Франківськ",
                keywords: ["президент"]
            }, {
                name: "Наше Місто Івано-Франківськ",
                id: 3849694,
                keywords: ["президент"]
            }, {
                name: "Пороблено [В] Івано-Франківську ",
                id: 67398221,
                keywords: ["президент"]
            }, {
                name: "НАШЕ ПРИКАРПАТТЯ",
                id: 72084641,
                keywords: ["президент"]
            }, {
                name: "Івано-Франківськ",
                id: 972865,
                keywords: ["президент"]
            }, {
                name: "Типова Надвірна",
                id: 50377159,
                keywords: ["президент"]
            }, {
                name: "Типова Коломия",
                id: 52375606,
                keywords: ["президент"]
            }, {
                name: "Типовий Бурштин",
                id: 40218000,
                keywords: ["президент"]
            }, {
                name: "Молодь за Україну. Івано-Франківськ.",
                id: 17775029,
                keywords: ["президент"]
            }, {
                name: "ПРАВИЙ СЕКТОР (м. КОЛОМИЯ)",
                id: 65321851,
                keywords: ["президент"]
            }, {
                name: "Правий Сектор Прикарпаття",
                id: 63233193,
                keywords: ["президент"]
            }];
        };
    });