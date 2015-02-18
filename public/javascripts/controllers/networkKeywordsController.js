/**
 * Created by obryl on 2/5/2015.
 */
angular.module('SocialApp.networkKeywordController', []).
    controller('networkKeywordsController', function($scope, $http, $modalInstance, ntw, $rootScope) {
        $scope.submitChanges = function () {
            $http.put('/api/setup/' + ntw + '/keywords', {
            keywords: $scope.keywords.split(',')
            }).success(function (response) {
                $modalInstance.close(response);
            });
        };

        $scope.cancel = function () {
            $modalInstance.dismiss('cancel');
        };
    });
