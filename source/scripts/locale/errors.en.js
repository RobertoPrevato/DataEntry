//
// Example of error messages, localized using https://github.com/RobertoPrevato/I.js
//
(function () {

  if (!I.regional.en)
    I.regional.en = {};

  I.regional.en.errors = {
    "emptyValue": "The field cannot be empty",
    "selectValue": "Please select a value",
    "notInteger": "The value is not a valid integer",
    "minValue": "The minimum value is {{min}}",
    "maxValue": "The maximum value is {{max}}",
    "invalidValue": "The value is invalid",
    "canContainOnlyLetters": "The field can contain only letters",
    "canContainOnlyDigits": "The field can contain only digits",
    "mustBeChecked": "This must be checked",
    "failedValidation": "An error occurred while performing validation",
    "invalidEmail": "The email is not valid",
    "invalidPhone": "The phone number is not valid"
  };
})();
