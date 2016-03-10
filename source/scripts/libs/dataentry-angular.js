/**
 * DataEntry Angular 1.x connector.
 * https://github.com/RobertoPrevato/DataEntry
 *
 * Copyright 2016, Roberto Prevato
 * http://ugrose.com
 *
 * Licensed under the MIT license:
 * http://www.opensource.org/licenses/MIT
 */

angular.module("ug.dataentry", [])
  .directive("dataentry", ["$compile", function ($compile) {

    var linker = function (scope, el, attrs) {
      // extend the scope with functions for the form validation
      var element = el[0];

      if (scope.dataentry) throw "the scope has already a `dataentry` property. Only one dataentry per scope is supported";
      if (!scope.schema) throw "no schema defined inside the scope";

      // supports only one dataentry per scope
      scope.dataentry = new Forms.DataEntry({
        element: element,
        schema: scope.schema,
        context: scope
      });

      if (!scope.validate)
        scope.validate = function (params) {
          return this.dataentry.validate(params);
        };

      //bind event handler to unbind events
      scope.$on("$destroy", function() {
        //dispose of the dataentry
        scope.dataentry.dispose();
        scope.dataentry = null;
      });
    };

    return {
      restrict: "A",
      replace: false,
      link: linker
    };
  }]);
