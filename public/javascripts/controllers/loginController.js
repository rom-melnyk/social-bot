/**
 * Created by obryl on 2/5/2015.
 */
angular.module('SocialApp.login', []).
    controller('LoginCtrl', function($scope, $http, $modal, $rootScope, $location) {
        if ( !document.cookie || document.cookie === 'session=-1' ) {
            $rootScope.loggedInUser = undefined;
        }
        $scope.login = function () {
            if ($scope.loginForm.$valid) {
                $rootScope.loggedInUser = $scope.user;
                $http.post('api/login', $scope.user).success(function (resp) {
                    $scope.err = false;
                    $scope.loggedInUser = resp.user;
                    $location.path("/");
                }).error(function (resp) {
                    $scope.err = resp.message;
                });
            }

        }
    })