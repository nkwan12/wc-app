// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.controllers' is found in controllers.js
angular.module('wc', ['ionic', "ionic.utils", 'wc.controllers', "global-vars", "wc.services", "wc-auth.services", "wc.dirs", "ngCordova", "insomnia", "ngFitText"])

.run(function($ionicPlatform) {
  $ionicPlatform.ready(function() {
    // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
    // for form inputs)
    if(window.cordova && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
    }
    if(window.StatusBar) {
      // org.apache.cordova.statusbar required
      StatusBar.styleDefault();
    }
  });
})

.run(function($ionicPlatform, $http, Global, $localstorage, AuthenticationService) {
  $ionicPlatform.ready(function() {
    $http.defaults.headers.common.Accept = "application/json";
    $http.defaults.headers.common.Authorization = $localstorage.get("token", null);
    AuthenticationService.checkValidity();
  });
})

.config(function($stateProvider, $urlRouterProvider) {
  $stateProvider

    .state('app', {
      url: "/app",
      abstract: true,
      templateUrl: "templates/menu.html",
      controller: 'AppCtrl'
    })

    .state("app.home", {
      url: "/home",
      views: {
        "menuContent": {
          templateUrl: "templates/home.html",
          controller: "HomeCtrl"
        }
      }
    })

    .state('app.workouts', {
      url: "/workouts",
      views: {
        'menuContent' :{
          templateUrl: "templates/workouts.html",
          controller: 'WorkoutsCtrl'
        }
      }
    })

    .state("app.new_workout", {
      url: "/workout/new",
      views: {
        "menuContent": {
          templateUrl: "templates/workouts/form.html",
          controller: "NewWorkoutCtrl"
        }
      }
    })

    .state('app.workout', {
      url: "/workouts/:workoutId",
      views: {
        'menuContent' :{
          templateUrl: "templates/workout.html",
          controller: 'WorkoutCtrl'
        }
      }
    })

    .state("app.play_workout", {
      url: "/workouts/:workoutId/play",
      views: {
        "menuContent": {
          templateUrl: "templates/workouts/play.html",
          controller: "PlayWorkoutCtrl"
        }
      }
    })

    .state("app.edit_workout", {
      url: "/workouts/:workoutId/edit",
      views: {
        "menuContent": {
          templateUrl: "templates/workouts/form.html",
          controller: "EditWorkoutCtrl"
        }
      }
    });

  // if none of the above states are matched, use this as the fallback
  $urlRouterProvider.otherwise('/app/home');
});

