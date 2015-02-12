/**
 * Created by obryl on 2/11/2015.
 */
/**
 * Created by obryl on 2/5/2015.
 */
angular.module('SocialApp.main', []).
    controller('mainController', function($scope, $http, $modal) {
        $scope.editKeyWords = function () {
            var modalInstance = $modal.open({
                templateUrl: "../../views/editKeyWordsModal.html",
                controller: "keyWordsController",
                backdrop: true,
                resolve: {
                    groups: function () {
                        return $scope.groups;
                    }
                }
            });
            modalInstance.result.then(function (groups) {

            });
        };
    });
