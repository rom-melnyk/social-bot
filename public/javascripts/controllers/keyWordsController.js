/**
 * Created by obryl on 2/5/2015.
 */
angular.module('SocialApp.keyWordController', []).
    controller('keyWordsController', function($scope, $http, $modalInstance, ntw, group, newGroup, $rootScope) {
        $scope.newGroup = newGroup;
        $scope.submitChanges = function () {
            if ($scope.groupKeywords.$valid) {
                if (newGroup) {
                    $http.post('api/setup/' + ntw, $scope.activeGroup).success(function (response) {
                        $rootScope.$emit('groupsChanged');
                        $modalInstance.close(response);
                    }).error(function (response) {
                        $scope.groupDuplicationError = true;
                    });
                } else {if (
                    group.keywords && group.keywords.length && !(group.keywords instanceof Array)) {
                        $scope.activeGroup.keywords = $scope.activeGroup.keywords.split(",");
                    }
                    if (!$scope.activeGroup.keywords) {
                        $scope.activeGroup.keywords = [];
                    }
                    $http.put('api/setup/' + ntw + '/' + $scope.activeGroup.id, $scope.activeGroup).success(function (response) {
                        $rootScope.$emit('groupsChanged');
                        $modalInstance.close(response);
                    });
                }
            }
        };

        $scope.cancel = function () {
            $modalInstance.dismiss('cancel');
        };
        var clone = function (obj) {
            if (null == obj || "object" != typeof obj) return obj;
            var copy = obj.constructor();
            for (var attr in obj) {
                if (obj.hasOwnProperty(attr)) copy[attr] = obj[attr];
            }
            return copy;
        };
        if (!newGroup) {
            $scope.activeGroup = clone(group);
            $scope.activeGroup.id = parseInt($scope.activeGroup.id);
        }
    });
