/**
 * Created by obryl on 2/5/2015.
 */
angular.module('SocialApp.adduser', []).
    controller('addUserController', function($scope, $http, $modal, $rootScope, $location, $modalInstance) {
        $scope.submitChanges = function () {
            if ($scope.userForm.$valid) {
                $http.post('api/create-user', $scope.user).success(function (resp) {
                    $modalInstance.close(resp);
                });
            }
        };
        $scope.cancel = function () {
            $modalInstance.dismiss('cancel');
        };
    })