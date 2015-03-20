/**
 * Created by obryl on 2/11/2015.
 */
/**
 * Created by obryl on 2/5/2015.
 */
angular.module('SocialApp.main', []).
    controller('mainController', function($scope, $http, $modal, $rootScope, $sce) {
        $scope.network = "all";
        $scope.fbPageNum = 1;
        $scope.vkPageNum = 1;
        $scope.sinceDate = new Date(new Date().toLocaleDateString());
        $scope.setDate = function (since) {
            $scope.sinceDate = since;
        };
        $rootScope.$on('userSet', function () {
            $scope.vkKeywords = $rootScope.loggedInUser.keywords.vk;
            $scope.networkKeywords = $rootScope.loggedInUser.keywords.fb;
        });
        var openModal = function (ntw, newGroup, group) {
            var modalInstance = $modal.open({
                templateUrl: "../../views/editKeywordsModal.html",
                controller: "keyWordsController",
                resolve: {
                    ntw: function () {
                        return ntw;
                    },
                    group: function () {
                        return group;
                    },
                    newGroup: function () {
                        return newGroup;
                    }
                }
            });
        };
        $scope.showAllGroupsPosts = function () {
            $scope.fbPageNum = 1;
            $scope.vkPageNum = 1;
            $http.get('api/data/fb/analyzed?since=' + $scope.sinceDate.getTime()).success(function (resp) {
                $scope.fbRespArray = resp;
                $scope.fbPostsArray = $scope.fbRespArray.slice(($scope.fbPageNum - 1) * 5, ($scope.fbPageNum - 1) * 5 + 5);
                if (($scope.fbRespArray.length / 5) > Math.floor($scope.fbRespArray.length / 5)) {
                    $scope.fbPagesCount = Math.floor($scope.fbRespArray.length / 5) + 1;
                } else {
                    $scope.fbPagesCount = Math.floor($scope.fbRespArray.length / 5);
                }
                $scope.loading = false;
            });
            $http.get('api/data/vk/analyzed?since=' + $scope.sinceDate.getTime()).success(function (resp) {
                $scope.vkRespArray = resp;
                $scope.vkPostsArray = $scope.vkRespArray.slice(($scope.vkPageNum - 1) * 5, ($scope.vkPageNum - 1) * 5 + 5);
                if (($scope.vkRespArray.length / 5) > Math.floor($scope.vkRespArray.length / 5)) {
                    $scope.vkPagesCount = Math.floor($scope.vkRespArray.length / 5) + 1;
                } else {
                    $scope.vkPagesCount = Math.floor($scope.vkRespArray.length / 5);
                }
                $scope.loading = false;
            });
        };
        $scope.paginate = function (ntw, forward) {
            if (ntw === 'fb') {
                if (forward) $scope.fbPageNum++;
                else $scope.fbPageNum--;
                $scope.fbPostsArray = $scope.fbRespArray.slice(($scope.fbPageNum - 1) * 5, ($scope.fbPageNum - 1) * 5 + 5);
            } else if (ntw === 'vk') {
                if (forward) $scope.vkPageNum++;
                else $scope.vkPageNum--;
                $scope.vkPostsArray = $scope.vkRespArray.slice(($scope.vkPageNum - 1) * 5, ($scope.vkPageNum - 1) * 5 + 5);
            }
        };
        $scope.clearResults = function () {
            $scope.vkPostsArray = [];
            $scope.fbPostsArray = [];
        };
        $scope.editGroup = function (group, ntw) {
            openModal(ntw, false, group);
        };
        $scope.removeGroup = function (group, ntw) {
            $http.delete('api/setup/' + ntw + '/' + group.id).success(function (response) {
                $rootScope.$emit('groupsChanged');
            });
        };
        $scope.addNewGroup = function (ntw) {
            openModal(ntw, true, undefined);
        };
        $scope.setNetworkKeywords = function (ntw, keywords) {
            var modalInstance = $modal.open({
                templateUrl: "../../views/editNetworkKeyword.html",
                controller: "networkKeywordsController",
                resolve: {
                    ntw: function () {
                        return ntw;
                    },
                    keywords: function () {
                        return keywords;
                    }
                }
            });
            modalInstance.result.then(function (resp) {
                $scope.vkKeywords = $rootScope.loggedInUser.keywords.vk;
                $scope.networkKeywords = $rootScope.loggedInUser.keywords.fb;
            });
        };
        $scope.highlight = function(text, searchArray) {
            if (text && searchArray) {
                if (!(searchArray instanceof Array)) {
                    return $sce.trustAsHtml(text);
                }
                searchArray.forEach(function (search) {
                    if (typeof(search) === "string") {
                        text = text.replace(new RegExp(search, 'gi'), '<span class="highlightedText">$&</span>');
                    } else {
                        text = text.replace(new RegExp(search.text, 'gi'), '<span class="highlightedText">$&</span>');
                    }
                });
                return $sce.trustAsHtml(text);
            }
            return "";
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
        $scope.showMore = function (feed, event) {
            //var groupIndex = $scope.groupsArray.indexOf(group);
            if (!feed.showFullText) {
                event.currentTarget.innerText = "Приховати";
            } else {
                event.currentTarget.innerText = "Показати більше...";
            }
            feed.showFullText = !feed.showFullText;
        };
        $scope.formatDate = function (dateString) {
            return $sce.trustAsHtml(new Date(dateString).toUTCString());
        };
        $scope.openFbPage = function (link) {
            window.open(link, '_newtab');
        };
        $scope.openVKPage = function (ownerId, postId) {
            window.open("http://vk.com/public" + (-ownerId) + "?w=wall" + ownerId + "_" + postId);
        };
    });
