/**
 * Created by obryl on 2/5/2015.
 */
angular.module('SocialApp.keyWordController', []).
    controller('keyWordsController', function($scope, $http, $modalInstance, groups) {
        $scope.groups = groups;
        $scope.addNewGroup = function () {
            $scope.groups.push({
                id: "",
                name: "",
                keyword: ""
            })
        };
        $scope.ok = function () {
            $modalInstance.close($scope.groups);
        };

        $scope.cancel = function () {
            $modalInstance.dismiss('cancel');
        };
    });
