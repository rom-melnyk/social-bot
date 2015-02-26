/**
 * Created by obryl on 2/5/2015.
 */
angular.module('SocialApp.networkKeywordController', []).
    controller('networkKeywordsController', function($scope, $http, $modalInstance, ntw, keywords, $rootScope) {
        var networkNamesMap = {
            fb: "Facebook",
            vk: "Vkontakte"
        };
        $scope.keywords = keywords;
        $scope.networkName = networkNamesMap[ntw];
        $scope.submitChanges = function () {
            $scope.keywords = $scope.keywords ? $scope.keywords : "";
            if (!($scope.keywords instanceof Array)) {
               $scope.keywords = $scope.keywords.split(',');
            }
            $http.put('/api/setup/' + ntw + '/keywords', {
            keywords: $scope.keywords
            }).success(function (response) {
                $modalInstance.close(response);
                $rootScope.$emit('groupsChanged');
            });
        };

        $scope.cancel = function () {
            $modalInstance.dismiss('cancel');
        };
    });
