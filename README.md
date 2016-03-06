# DataEntry
Forms validation library that implements ES6 Promise based validation of fields and forms, automatic decoration of fields, localized error messages.

## Objectives, targeting the new
The DataEntry widget has been written as a re-design of a [previous library](https://github.com/RobertoPrevato/jQuery-DataEntry) that depended upon both Lodash and jQuery, and was using the Deferred object from jQuery. 

The main objectives of the new library were:
* to remove the dependency from both jQuery and Lodash
* to use the native Promise object
* to focus on new browsers

Therefore the new library is targeting browsers that support [addEventListener](https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/addEventListener) and [removeEventListener](https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/removeEventListener) functions, and others properties like `classList`, `querySelectorAll`, that may be not available in older browsers.
If the support for older browsers is required, the [older DataEntry library](https://github.com/RobertoPrevato/jQuery-DataEntry) is still available for download.

## Differences with the previous version
Since the [official WC3 specification of the ES6 Promise](https://www.w3.org/2001/tag/doc/promises-guide) specifies that the rejection should be used only for exceptional situations, the new implementation of DataEntry always resolve the promises utilized during the validation of fields and forms: returning a value indicating whether a form is valid or not.
Therefore any rejection that may happen must be caused by an unhandled exception happened while applying validation logic, and is ultimely related to a bug in the code. In such situations the DataEntry widget is designed to decorate the field for which the validation caused exception and consider the whole form invalid.
