# DataEntry
Forms validation library that implements Promise based validation of fields and forms, automatic decoration of fields, localized error messages. The library has no dependency on other libraries and can be integrated with frameworks such as React, Vue.js, Aurelia, Knockout, Angular, etc.

* [Getting started](https://github.com/RobertoPrevato/DataEntry/wiki/Getting-started)
* [Live demo, with React](https://robertoprevato.github.io/demos/dataentry/index.html)
* [Live demo, with Vue.js](https://robertoprevato.github.io/demos/dataentry-vuejs/index.html)

## Objectives
The objectives of the DataEntry library are:
* to enable the implementation of application-wide validation strategy: centralizing the logic that displays error messages, marks fields in valid or invalid state, and applies validation and formatting rules
* to simplify the implementation of fields validation in new applications
* to simplify the definition of asynchronous validation rules (for example, rules involving AJAX requests)
* to provide a simple way to define new validation and formatting rules

## Features
* ES6 source code
* Unit tested source code
* Promise based validation of fields and forms
* automatic decoration of fields (valid state, invalid state, neutral)
* logic to define validation rules
* logic to define formatting rules
* logic to apply pre-formatting rules (formatting to be applied upon field focus)
* logic to define constraints (disallow certain inputs, e.g. only positive integer values, only letters, .etc)
* support for validation triggers between fields
* good documentation, in [GitHub wiki](https://github.com/RobertoPrevato/DataEntry/wiki)
* raised exceptions include a link to [GitHub wiki](https://github.com/RobertoPrevato/DataEntry/wiki/Errors), with instructions on how they can be resolved

### What DataEntry is not
DataEntry is not a templating engine. It doesn't create HTML forms, nor populates the values of HTML input elements with values read from objects. DataEntry is only concerned with validation, which can be of objects in memory, or HTML elements. In the latter case, whether the HTML of a form is generated using a server side engine, or the templating engine of client side libraries or frameworks, DataEntry can be used to validate the values of these forms. The only exception is formatting of values inside input fields: DataEntry has built-in features to automatically format values after successful validation (this feature can be turned off as desired), which is a simple case to handle.

## Design
The library is designed to clearly separate functions that do business logic from classes that read / write values and mark fields as valid or invalid. See [Core classes and design](https://github.com/RobertoPrevato/DataEntry/wiki/Core-classes-and-design) for more information.

## Validation schema
In DataEntry, the validation of a group of fields is a promise, composed of validation chains (one for each field defined in the dataentry `schema` object). Each validation chain is a promise that completes when either the first validation rule fails (resolved with error result or rejected), or all validation rules succeed. This way, every field can have asynchronous methods as part of their validation and all errors are populated at once (the first error for each field). If AJAX requests are necessary to validate certain fields, they can and should be executed after synchronous validation that may happen on the client side, to avoid AJAX requests for a value that it's already known to be invalid.

![Validation and chains](https://raw.githubusercontent.com/RobertoPrevato/DataEntry/master/docs/renders/validation-and-chains.svg?sanitize=true)

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

## For more information
Refer to the rich documentation in [GitHub wiki](https://github.com/RobertoPrevato/DataEntry/wiki).
