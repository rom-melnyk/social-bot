/**
 * Created by obryl on 2/4/2015.
 */
var app = angular.module('SocialApp', [
    'SocialApp.login',
    'SocialApp.main',
    'SocialApp.users',
    'SocialApp.adduser',
    'SocialApp.controllers',
    'SocialApp.vk',
    'SocialApp.keyWordController',
    'SocialApp.networkKeywordController',
    'ui.bootstrap',
    'ngRoute',
    'ngTagsInput',
    'ngAnimate'
, function ($routeProvider, $locationProvider, $httpProvider, $provide, $rootScopeProvider) {

    $provide.factory('myHttpInterceptor', function($q) {
      return {
        'response': function(response) {
          // do something on success
          return response || $q.when(response);
        },

       'responseError': function(rejection) {
          // do something on error
          if (rejection.status === 599) {
             window.location.hash = '/login';
             $rootScopeProvider.loggedInUser = null;
          }
          return $q.reject(rejection);
        }
      };
    });
    $httpProvider.interceptors.push('myHttpInterceptor');
  }]).config(function($routeProvider, $locationProvider) {
  $routeProvider.
    when("/",
      { templateUrl: "views/mainView.html" }).
    when("/user-info",
          { templateUrl: "views/user-info.html", controller: "usersController" }).
    when("/login",
      { templateUrl: "views/login.html", controller: "LoginCtrl" }).
    // event more routes here ...
    otherwise( { redirectTo: "/" });
}).
run(function($rootScope, $location, $http) {
    $rootScope.$on( "$routeChangeStart", function(event, next, current) {
        $http.get('api/check-session').success(function (resp) {
            $rootScope.loggedInUser = resp;
            if ($rootScope.loggedInUser == null) {
                  console.log("not logged in");
              if ( next.templateUrl === "public/login.html") {
              } else {
                $location.path("/login");
              }
            }
            $rootScope.$broadcast('userSet');
        }).error(function () {
            $location.path("/login");
        });
    });
});