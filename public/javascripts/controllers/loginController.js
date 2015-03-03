/**
 * Created by obryl on 2/11/2015.
 */
/**
 * Created by obryl on 2/5/2015.
 */
angular.module('SocialApp.login', []).
    controller('LoginCtrl', function($scope, $http, $modal, $rootScope, $location) {
        $scope.login = function () {
            if ($scope.loginForm.$valid) {
                $rootScope.loggedInUser = $scope.user;
                $http.post('api/login', $scope.user).success(function (resp) {
                    $scope.loggedInUser = resp.user;
                });
                $location.path("/");
            }

        }
    })