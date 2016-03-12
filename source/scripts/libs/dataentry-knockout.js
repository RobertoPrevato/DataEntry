/**
 * DataEntry Knockout connector.
 * https://github.com/RobertoPrevato/DataEntry
 *
 * Copyright 2016, Roberto Prevato
 *
 * Licensed under the MIT license:
 * http://www.opensource.org/licenses/MIT
 */

ko.bindingHandlers.dataentry = {
  init: function (element, valueAccessor, allBindings, viewModel, bindingContext) {
    if (!viewModel.schema)
      throw new Error("missing schema definition inside the model. cannot define a dataentry without a schema.");

    if (viewModel.dataentry)
      throw "the model has already a `dataentry` property. Only one dataentry per scope is supported. Use view composition if more than one dataentry is needed.";
    var options = valueAccessor();
    //add reference to the dataentry business logic to the model
    viewModel.dataentry = new Forms.DataEntry({
      element: element,
      schema: viewModel.schema,
      context: viewModel
    });

    //extend the model with proxy functions
    var fn = "validate";
    if (!viewModel[fn])
      viewModel[fn] = function (params) {
        return this.dataentry.validate(params);
      };
    var fn = "validateTouched";
    if (!viewModel[fn])
      viewModel[fn] = function (params) {
      return this.dataentry.validate(params, {
        onlyTouched: true
      });
    };

    ko.utils.domNodeDisposal.addDisposeCallback(element, function (element) {
      // This will be called when the element is removed by Knockout or
      // if some other part of your code calls ko.removeNode(element)
      // Dispose of the dataentry
      this.dataentry.dispose();
      this.dataentry = null;
    }.bind(viewModel));
  }
};