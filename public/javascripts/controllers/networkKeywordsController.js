/**
 * Created by obryl on 2/5/2015.
 */
angular.module('SocialApp.networkKeywordController', []).
    controller('networkKeywordsController', function($scope, $http, $modalInstance, ntw, keywords, $rootScope) {
        var networkNamesMap = {
            fb: "Facebook",
            vk: "Vkontakte"
        };
        $scope.networkKeywords = keywords;
        $scope.networkName = networkNamesMap[ntw];
        $scope.submitChanges = function () {
            $scope.networkKeywords = $scope.networkKeywords ? $scope.networkKeywords : "";
            if (!($scope.networkKeywords instanceof Array)) {
               $scope.networkKeywords = $scope.networkKeywords.split(',');
            }
            $http.put('/api/setup/' + ntw + '/keywords', {
            keywords: $scope.networkKeywords
            }).success(function (response) {
                $modalInstance.close(response);
                $rootScope.$emit('groupsChanged');
            });
        };

        $scope.cancel = function () {
            $modalInstance.dismiss('cancel');
        };
    });
