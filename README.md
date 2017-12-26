# DataEntry
Forms validation library that implements Promise based validation of fields and forms, automatic decoration of fields, localized error messages. The library has no dependency on other libraries and can be integrated with frameworks such as React, Vue.js, Aurelia, Knockout, Angular, etc.

* [Getting started](https://github.com/RobertoPrevato/DataEntry/wiki/Getting-started)
* [Live demo](https://robertoprevato.github.io/demos/dataentry/index.html)

## Objectives
The objectives of the DataEntry library are:
* to enable the implementation of application-wide validation strategy: centralizing the logic that displays error messages, marks fields in valid or invalid state, and applies validation and formatting rules
* to implement Promise based validation of fields and forms, therefore supporting validation rules resolved asynchronously (e.g. rules involving AJAX requests) as part of validation process
* to define validation rules for fields in a declarative way
* enabling the definition of new validation and formatting rules in a simple way
* to provide rich built-in handlers of DOM events, pluggable (they can be disabled, if desired)

## Features
* ES6 source code
* Unit tested source code
* Promise based validation of fields and forms
* automatic decoration of fields (valid state, invalid state, neuter)
* logic to define validation rules
* logic to define formatting rules
* logic to apply pre-formatting rules (formatting to be applied upon field focus)
* logic to define constraints (disallow certain inputs, e.g. only positive integer values, only letters, .etc)
* good documentation, in [GitHub wiki](https://github.com/RobertoPrevato/DataEntry/wiki)

## Pluggable design
The library is designed to clearly separate functions that do business logic from classes that read / write values and mark fields as valid or invalid. See [Core classes and design](https://github.com/RobertoPrevato/DataEntry/wiki/Core-classes-and-design) for more information.

## Use downloading distribution files
DataEntry library can be used downloading and using distribution files, in `distribution` folder.
```html
<script src="dataentry.js"></script>
```

## Install using npm
DataEntry library can be installed using npm.
```bash
npm install dataentry
```

Modules can then be imported using CommonJS syntax:
```js
var DataEntry = require("dataentry")
var DataEntryDom = require("dataentry/dom")
// var DataEntryContext = require("dataentry/context")
```

Or ES6 import syntax:
```js
import DataEntry from "dataentry"
import DataEntryDom from "dataentry/dom"

// example of configuration to use built-int methods for DOM manipulation:
DataEntry.configure({
  marker: DataEntryDom.DomMarker,
  harvester: DataEntryDom.DomHarvester,
  binder: DataEntryDom.DomBinder
})
```

Example using built-in methods completely abstracted from DOM manipulation:
```js
import DataEntry from "dataentry"
import DataEntryContext from "dataentry/context"

// example of configuration to use built-int methods without DOM manipulation:
DataEntry.configure({
  marker: DataEntryContext.ContextMarker,
  harvester: DataEntryContext.ContextHarvester
})
```

<<<<<<< HEAD
Since the [official WC3 specification of the ES6 Promise](https://www.w3.org/2001/tag/doc/promises-guide) specifies that the rejection should only be used for exceptional situations, the new implementation of DataEntry always resolve the promises used during the validation of fields and forms, returning a value indicating whether a form is valid or not.
Therefore any rejection can only be caused by an unhandled exception happened while applying validation logic, and is ultimately related to a bug in the code or flow error (for example, when a call to external web api fails). In such situations the DataEntry widget is designed to decorate the field for which the validation caused exception and consider the whole form invalid.
=======
## Promise based validation
Since the [official WC3 specification of the ES6 Promise](https://www.w3.org/2001/tag/doc/promises-guide) specifies that the rejection should be used only for exceptional situations (_ref. [Rejections should be exceptional](https://www.w3.org/2001/tag/doc/promises-guide#rejections-should-be-exceptional)_), the DataEntry library always resolve the promises utilized during the validation of fields and forms: returning a value indicating whether a form is valid or not. Rejection should only happen due to bugs in source code or rejection of a validation rule promise (for example, in case a validation rule requires an AJAX request and a web request completes with status 500).
Therefore any rejection must be caused by an unhandled exception happened while applying validation logic, and is ultimately related to a bug in the code. In such situations the DataEntry widget is designed to decorate the field for which the validation caused exception and consider the whole form invalid.
>>>>>>> es6
Furthermore, the native Promise doesn't feature `done` and `fail` functions: the success and failure callbacks are both passed to the `then` function instead.
