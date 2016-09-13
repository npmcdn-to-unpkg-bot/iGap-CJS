/**
 * Router
 * Created by iGapWeb on 24/07/2016.
 */


angular.module('iGap.router', []).config(function ($routeProvider) {
    $routeProvider
        .when('/', {template: '', controller: 'AppController'})
        .when('/iG', {template: '', controller: 'AppIGController'})
        .otherwise({redirectTo: '/'})
});