/**
 * Created by obryl on 2/5/2015.
 */
angular.module('SocialApp.keyWordController', []).
    controller('keyWordsController', function($scope, $http, $modalInstance, groups, $rootScope) {
        $scope.groups = groups;
        $scope.addNewGroup = function () {
            $scope.groups.push({
                id: "",
                name: "",
                description: "",
                keywords: []
            })
        };

        $scope.submitChanges = function () {
            $scope.groups.forEach(function (group, index) {
                if (group.keywords.length && !(group.keywords instanceof Array)) {
                    $scope.groups[index].keywords = group.keywords.split(",");
                }
            });
            $http.put('api/setup/fb', $scope.groups).success(function (response) {
                $rootScope.$emit('groupsChanged');
                $modalInstance.close(response);
            });
        };

        $scope.cancel = function () {
            $modalInstance.dismiss('cancel');
        };
    });
