/**
 * Created by obryl on 2/5/2015.
 */
angular.module('SocialApp.users', []).
    controller('usersController', function($scope, $http, $modal, $rootScope, $sce) {
        $rootScope.$on('userSet', function () {
            $scope.user = $rootScope.loggedInUser;
        });
        $http.get('api/users').success(function (resp) {
            $scope.users = resp.users;
        });
        $scope.submitChanges = function () {
            if ($scope.user.keywords.vk) {
                var keywords = [];
                $scope.user.keywords.vk.forEach(function (kw) {
                    keywords.push(kw.text);
                });
               $scope.user.keywords.vk = keywords;
           }
           if ($scope.user.keywords.fb) {
               var keywords = [];
                $scope.user.keywords.fb.forEach(function (kw) {
                    keywords.push(kw.text);
                });
               $scope.user.keywords.fb = keywords;
           }
            $http.put('api/create-user', $scope.user).success(function (resp) {
                $rootScope.loggedInUser = resp;
            });
        };
        $scope.addUser = function () {
            var modalInstance = $modal.open({
                templateUrl: "../../views/addUser.html",
                controller: "addUserController"
            });
            modalInstance.result.then(function (resp) {
                $scope.users.push(resp.user);
            });
        };
        $scope.removeUser = function (user, index) {
            $http.delete('api/user/' + user.id).success(function (resp) {
                $scope.users.splice(index, 1);
            });
        };

    });
