/**
 * Created by obryl on 2/11/2015.
 */
/**
 * Created by obryl on 2/5/2015.
 */
angular.module('SocialApp.main', []).
    controller('mainController', function($scope, $http, $modal, $rootScope, $sce) {
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
        };
        $scope.highlight = function(text, searchArray) {
            if (text) {
                if (!(searchArray instanceof Array)) {
                    return $sce.trustAsHtml(text);
                }
                searchArray.forEach(function (search) {
                    text = text.replace(new RegExp(search, 'gi'), '<span class="highlightedText">$&</span>');
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
                event.currentTarget.innerText = "Show less";
            } else {
                event.currentTarget.innerText = "Show more";
            }
            feed.showFullText = !feed.showFullText;
        };
        $scope.formatDate = function (dateString) {
            return $sce.trustAsHtml(new Date(dateString).toUTCString());
        };
    }).filter('keyWordFilter', function () {
        return function (items, keywords) {
            var filtered = [];
            if (items && items.length && keywords.length) {
                for (var i = 0; i < items.length; i++) {
                    var item = items[i],
                        containsWord = false;
                    if (item.message) {
                        for (var j = 0; j < keywords.length; j++) {
                        	RE = new RegExp(keywords[j], 'gi');
                        	containsWord = containsWord || RE.test(item.message);
                        }
                        containsWord && filtered.push(item);
                    } else if (item.comments) {
                        item.comments.data.forEach(function (value) {
                            for (var j = 0; j < keywords.length; j++) {
                            	RE = new RegExp(keywords[j], 'gi');
                            	containsWord = containsWord || RE.test(value.message);
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
