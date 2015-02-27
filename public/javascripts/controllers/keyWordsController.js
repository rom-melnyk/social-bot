/**
 * Created by obryl on 2/5/2015.
 */
angular.module('SocialApp.keyWordController', []).
    controller('keyWordsController', function($scope, $http, $modalInstance, ntw, group, newGroup, $rootScope) {

        $scope.submitChanges = function () {
            if (group.keywords && group.keywords.length && !(group.keywords instanceof Array)) {
                $scope.activeGroup.keywords = $scope.activeGroup.keywords.split(",");
            }
            if (newGroup) {
                $http.post('api/setup/' + ntw, $scope.activeGroup).success(function (response) {
                    $rootScope.$emit('groupsChanged');
                    $modalInstance.close(response);
                });
            } else {
                if (!$scope.activeGroup.keywords) {
                    $scope.activeGroup.keywords = [];
                }
                $http.put('api/setup/' + ntw + '/' + $scope.activeGroup.id, $scope.activeGroup).success(function (response) {
                    $rootScope.$emit('groupsChanged');
                    $modalInstance.close(response);
                });
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
        $scope.activeGroup = clone(group);
    });
