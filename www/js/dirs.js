var dirs = angular.module("wc.dirs", []);

dirs.directive('selectOnClick', function () {
  return {
    restrict: 'A',
    link: function (scope, element, attrs) {
      element.on('click', function () {
        this.select();
      });
    }
  };
})

.directive('fitEx', function() {
  return {
    restrict: 'A',
    scope: true,
    link: function(scope, element, attrs) {
        var parent = element.parent();

        var reset = function() {
          element[0].style.fontSize = "52px";
        };

        var resizer = function() {
            var fs = window.getComputedStyle(element[0], null).getPropertyValue('font-size');
            fs = parseInt(fs);
            var lh = window.getComputedStyle(element[0], null).getPropertyValue('line-height');
            lh = parseInt(lh);
            while ((parent[0].offsetHeight - 30) <= element[0].scrollHeight) {
              element[0].style.fontSize = --fs + "px";
            };
        }; resizer();

        scope.$watch(attrs.ngModel, function() { reset(); resizer() });

        angular.element(window).bind('resize', function(){ scope.$apply(resizer)});
    }
  }
});  
