/**
 * Created by obryl on 2/5/2015.
 */
angular.module('SocialApp.keyWordController', []).
    controller('keyWordsController', function($scope, $http, $modalInstance, ntw, group, newGroup, $rootScope) {
        $scope.group = group;
        $scope.submitChanges = function () {
            if (group.keywords.length && !(group.keywords instanceof Array)) {
                $scope.group.keywords = $scope.group.keywords.split(",");
            }
            if (newGroup) {
                $http.post('api/setup/' + ntw, $scope.group).success(function (response) {
                    $rootScope.$emit('groupsChanged');
                    $modalInstance.close(response);
                });
            } else {
                $http.put('api/setup/' + ntw + '/' + $scope.group.id, $scope.group).success(function (response) {
                    $rootScope.$emit('groupsChanged');
                    $modalInstance.close(response);
                });
            }
        };

        $scope.cancel = function () {
            $modalInstance.dismiss('cancel');
        };
    });
