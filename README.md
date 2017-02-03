# DataEntry
Forms validation library that implements ES6 Promise based validation of fields and forms, automatic decoration of fields, localized error messages. Integrable with Angular, Backbone, Knockout, React.

[Live demo](http://ugrose.com/content/demos/dataentry/index.html)

## Objectives
The objectives of the DataEntry library are:
* allow the implementation of application-wide validation strategy: centralizing the logic that displays error messages, marks fields in valid or invalid state, and applies validation and formatting rules
* implement Promise based validation of fields and forms, therefore supporting AJAX calls as part of validation process
* validation of fields implemented in a declarative way
* provide a way to implement form validation with (relatively) little amount of code
* support multiple validation rules for every field: the validation of every field stops at the first rule that is not respected - in order to avoid useless AJAX calls, whenever AJAX is necessary
* support for formatting rules upon focus and upon blur, constraints rules, all configurable in a declarative way
* allow to define custom validation, formatting and constraint rules in a simple way

## Targeting the new browsers
The DataEntry widget has been written as a re-design of a [previous library](https://github.com/RobertoPrevato/jQuery-DataEntry) that depended upon both Lodash and jQuery, and was using the Deferred object from jQuery. 

The main objectives of the new library were:
* to remove the dependency from both jQuery and Lodash
* to use the native Promise object
* to focus on new browsers

Therefore the new library is targeting browsers that support [addEventListener](https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/addEventListener) and [removeEventListener](https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/removeEventListener) functions, and others properties like `classList`, `querySelectorAll`, that may be not available in old browsers.
If the support for old browsers is required, the [older DataEntry library](https://github.com/RobertoPrevato/jQuery-DataEntry) is still available.

## Features
* ES6 Promise based validation of fields and forms
* automatic decoration of fields (valid state, invalid state, neuter)
* logic to define validation rules
* logic to define formatting rules
* logic to apply pre-formatting rules (formatting to be applied upon field focus)
* logic to define constraints (disallow certain inputs, e.g. only positive integer values, only letters, .etc)
* logic to dispose of registered event handlers
* examples of integration with Angular, Knockout and React

## Differences with the previous version
The main differences with the previous version of the DataEntry library, are:
* removed dependency from jQuery and Lodash
* use of native Promise instead of jQuery 2.x Deferred

Since the [official WC3 specification of the ES6 Promise](https://www.w3.org/2001/tag/doc/promises-guide) specifies that the rejection should be used only for exceptional situations, the new implementation of DataEntry always resolve the promises utilized during the validation of fields and forms: returning a value indicating whether a form is valid or not.
Therefore any rejection that may happen must be caused by an unhandled exception happened while applying validation logic, and is ultimately related to a bug in the code. In such situations the DataEntry widget is designed to decorate the field for which the validation caused exception and consider the whole form invalid.
Furthermore, the native Promise doesn't feature `done` and `fail` functions: the success and failure callbacks are both passed to the `then` function instead.
The logic to define validation, formatting, preformatting and constraints rules is unchanged.

Other minor differences in respect of the previous version are:
* support for Node/CommonJS and AMD loading
* improved documentation
* improved handling of radio input elements
 
## Documentation
Refer to [the wiki page](https://github.com/RobertoPrevato/DataEntry/wiki).
