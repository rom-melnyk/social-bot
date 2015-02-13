/**
 * Created by obryl on 2/11/2015.
 */
/**
 * Created by obryl on 2/5/2015.
 */
angular.module('SocialApp.main', []).
    controller('mainController', function($scope, $http, $modal) {
        $scope.groups = [{
            id: "303201976514746",
            name: "Тепле ІТ середовище",
            keywords: ["Перш"]
        }, {
            id: "413176182109914",
            name: "LocalDev knowledge sharing",
            keywords: ["прогр"]
        }, {
            id: 1111,
            name: "Lisp",
            keywords: [""]
        }, {
            id: 8888,
            name: "Домашний тренинг - максимум свободы онлайн",
            keywords: [""]
        }];
        $http.get('api/setup/fb').success(function (response) {
            if (response.groups) {
                $scope.groups = response.groups;
            }
        });
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
