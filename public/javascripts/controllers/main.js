/**
 * Created by obryl on 2/11/2015.
 */
/**
 * Created by obryl on 2/5/2015.
 */
angular.module('SocialApp.main', []).
    controller('mainController', function($scope, $http, $modal, $rootScope) {
        $scope.editKeyWords = function (ntw) {
            var modalInstance = $modal.open({
                templateUrl: "../../views/editKeyWordsModal.html",
                controller: "keyWordsController",
                resolve: {
                    ntw: function () {
                        return ntw;
                    }
                }
            });
            modalInstance.result.then(function (groups) {

            });
        };
        $scope.editGroup = function (group, ntw) {
            var modalInstance = $modal.open({
                templateUrl: "../../views/editKeyWordsModal.html",
                controller: "keyWordsController",
                resolve: {
                    ntw: function () {
                        return ntw;
                    },
                    group: function () {
                        return group;
                    }
                }
            });
        };
        $scope.removeGroup = function (group, ntw) {
            $http.delete('api/setup/' + ntw + '/' + group.id).success(function (response) {
                $rootScope.$emit('groupsChanged');
            });
        };
        $scope.addNewGroup = function (ntw) {
            var modalInstance = $modal.open({
                templateUrl: "../../views/editKeyWordsModal.html",
                controller: "keyWordsController",
                resolve: {
                    ntw: function () {
                        return ntw;
                    },
                    group: function () {
                        return {};
                    }
                }
            });
        };
    });
