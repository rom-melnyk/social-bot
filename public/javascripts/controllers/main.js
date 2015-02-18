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
                templateUrl: "../../views/editKeyWordsModal.html",
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
            openModal(ntw, true, {});
        };
        $scope.setNetworkKeywords = function (ntw) {
            var modalInstance = $modal.open({
                templateUrl: "../../views/editNetworkKeyword.html",
                controller: "networkKeywordsController",
                resolve: {
                    ntw: function () {
                        return ntw;
                    }
                }
            });
        };
        $scope.highlight = function(text, search) {
            if (text) {
                if (!search) {
                    return $sce.trustAsHtml(text);
                }
                return $sce.trustAsHtml(text.replace(new RegExp(search, 'gi'), '<span class="highlightedText">$&</span>'));
            }
            return "";
        };
        $scope.formatDate = function (dateString) {
            return $sce.trustAsHtml(new Date(dateString).toUTCString());
        };
    });
