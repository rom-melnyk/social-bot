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
            keyword: "Перш"
        }, {
            id: "413176182109914",
            name: "LocalDev knowledge sharing",
            keyword: "прогр"
        }, {
            id: 1111,
            name: "Lisp",
            keyword: ""
        }, {
            id: 8888,
            name: "Домашний тренинг - максимум свободы онлайн",
            keyword: ""
        }];
        $http.get('api/setup').success(function (response) {
            if (response.data) {
                $scope.groups = response.data;
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
