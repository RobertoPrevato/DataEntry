ug.controller("demo", ['$scope', function (scope) {
window.scope = scope;
  _.extend(scope, {

    person: {
      name: "",
      age: "",
      favoriteBand: ""
    },

    personEdit: {
      name: "",
      age: "",
      favoriteBand: ""
    },

    editing: true,
    cancelActive: false,

    edit: function () {
      scope.personEdit = _.clone(scope.person);
      scope.editing = true;
    },

    save: function () {
      //validate
      //NB: it is important to use the context here, and not "scope"; because the ng-if creates a child scope, and scope.$$childHead would be necessary ;(
      this.validate().then(function (data) {
        //validation success
        if (data.valid) {
          scope.person = scope.personEdit;
          scope.editing = false;
        }
      }, function () {
        //the fail callback is generally not needed; this is just a demonstration
        console.log("%cThere are errors in the form", "color:darkred;");
      });
    },

    cancel: function () {
      scope.editing = false;
      return false;
    },

    //the validation schema in this case is defined inside the scope
    schema: {
      name: {
        validation: ["required"],
        format: ["cleanSpaces"]
      },
      age: {
        validation: ["required", "integer"]
      },
      band: {
        validation: ["required"],
        format: ["cleanSpaces"]
      }
    }

  });

}]);