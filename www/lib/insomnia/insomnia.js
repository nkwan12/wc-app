angular.module("insomnia", [])
  .factory("$insomnia", function($window) {
    return {
      keepAwake: function() {
        $window.plugins.insomnia.keepAwake();
      },
      allowSleepAgain: function() {
        $window.plugins.insomnia.allowSleepAgain();
      }
    }
  });
