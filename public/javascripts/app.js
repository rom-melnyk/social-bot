/**
 * Created by obryl on 2/4/2015.
 */
var app = angular.module('SocialApp', [
    'SocialApp.login',
    'SocialApp.main',
    'SocialApp.controllers',
    'SocialApp.vk',
    'SocialApp.keyWordController',
    'SocialApp.networkKeywordController',
    'ui.bootstrap',
    'ngRoute'
]).config(function($routeProvider, $locationProvider) {
  $routeProvider.
    when("/",
      { templateUrl: "views/mainView.html" }).
    when("/login",
      { templateUrl: "views/login.html", controller: "LoginCtrl" }).
    // event more routes here ...
    otherwise( { redirectTo: "/persons" });
}).
run(function($rootScope, $location) {
  $rootScope.$on( "$routeChangeStart", function(event, next, current) {
    //$rootScope.loggedInUser = true;
    if ($rootScope.loggedInUser == null) {
          console.log("not logged in");
      if ( next.templateUrl === "public/login.html") {
      } else {
        $location.path("/login");
      }
    }
  });
});