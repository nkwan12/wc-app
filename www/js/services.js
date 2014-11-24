var globalVars = angular.module("global-vars", []);
globalVars.factory("Global", function() {
  vars = {
    userSession: {
      userId: null,
      authToken: null,
      loggedIn: false,
      workoutId: null
    },

    domain: "http://54.148.0.117",//"54.68.194.217","http://fast-taiga-4105.herokuapp.com",
    workoutIds: []    
  };

  return vars;
});

var workoutServices = angular.module("wc.services", []);
workoutServices.factory("Workout", function ($http, $q, Global) {

  services = {
    get: function(workoutId) {
      var deferred = $q.defer();
      $http.get(Global.domain + "/workouts/" + workoutId)
      .success(function(data, status, headers, config) {
        deferred.resolve(data);
      });
    return deferred.promise
    },

    getAll: function() {
      var deferred = $q.defer();
      $http.get(Global.domain + "/users/" + Global.userSession.userId + "/workouts")
      .success(function(data, status) {
        deferred.resolve(data.workouts);
      });
      return deferred.promise;
    },

    create: function(workout, exercises) {
      var deferred = $q.defer();
      $http.post(Global.domain + "/workouts", {workout: workout, exercise: exercises})
      .success(function(data, status, headers, config) {
        deferred.resolve(data.workoutId);
      })
      .error(function(data, status, headers, config) {
        deferred.reject(status);
      });
      return deferred.promise;
    },

    edit: function(workout, exercises, workoutId) {
      var deferred = $q.defer();
      $http.put(Global.domain + "/workouts/" + workoutId, {workout: workout, exercise: exercises})
      .success(function(data, status, headers, config) {
        deferred.resolve(data.workoutId);
      })
      .error(function(data, status, headers, config) {
        deferred.reject(status);
      });
      return deferred.promise;
    }
  }

  return services;
});

var authServs = angular.module("wc-auth.services", ["http-auth-interceptor"]);
authServs.factory("AuthenticationService", function($rootScope, $http, authService, Global, $localstorage) {
  var service = {
    login: function(user) {
      $http.post(Global.domain + "/authorization/authorize", {user: user}, {ignoreAuthModule: true})
      .success(function(data, status, headers, config) {
        $http.defaults.headers.common.Authorization = data.authToken;
        $localstorage.set("token", data.authToken);
        Global.userSession.userId = data.userId;
        Global.userSession.loggedIn = true;

        authService.loginConfirmed(data, function(config) {
          config.headers.Authorization = data.authToken;
          return config;
        });
      })
      .error(function(data, status, headers, config) {
        $rootScope.$broadcast("event:auth-login-failed", status);
      });
    },

    logout: function() {
      $http.get(Global.domain + "/authorization/revoke", {ignoreAuthModule: true})
      .success(function(data) {
        delete $http.defaults.headers.common.Authorization;
        Global.userSession.loggedIn = false;
        Global.userSession.userId = null;
        $rootScope.$broadcast("event:auth-logout-complete");
      });
    },

    loginCancelled: function() {
      authService.loginCancelled();
    },

    checkValidity: function() {
      $http.get(Global.domain + "/authorization/check_validity")
      .success(function(data, status, headers, config) {
        Global.userSession.loggedIn = true;
        Global.userSession.userId = data.userId;
        $rootScope.$broadcast("event:auth-token-valid");
      })
      .error(function(data, status, headers, config) {
        Global.userSession.loggedIn = false;
        Global.userSession.userId = null;
        $localstorage.clear("token");
        $http.defaults.headers.common.Authorization = null;
      })
    },

    newUser: function(user) {
      $http.post(Global.domain + "/authorization/new_user", { user: user })
      .success(function(data, status, headers, config) {
        $http.defaults.headers.common.Authorization = data.authToken;
        $localstorage.set("token", data.authToken);
        Global.userSession.userId = data.userId;
        Global.userSession.loggedIn = true;
        $rootScope.$broadcast("event:auth-new-user-success");
      })
      .error(function(data, status, headers, config) {
        if (status == "409") {
          $rootScope.$broadcast("event:auth-email-in-use", status);
        }
      });
    },

    resetPassword: function(user) {
      $http.post(Global.domain + "/authorization/reset_password", { user: user })
      .success(function(data, status, headers, config) {
        $rootScope.$broadcast("event:auth-password-reset-success");
      })
      .error(function(data, status, headers, config) {
        if (status == 404) {
          $rootScope.$broadcast("event:auth-password-reset-not-found");
        } else {
          $rootScope.$broadcast("event:auth-password-reset-failure");
        };
      });
    }
  };
  return service;
});
