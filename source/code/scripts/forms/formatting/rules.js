/**
 * DataEntry formatting rules.
 * https://github.com/RobertoPrevato/DataEntry
 *
 * Copyright 2017, Roberto Prevato
 * https://robertoprevato.github.io
 *
 * Licensed under the MIT license:
 * http://www.opensource.org/licenses/MIT
 */

const FormattingRules = {
  trim: function (field, value) {
    return value ? value.replace(/^[\s]+|[\s]+$/g, "") : value;
  },

  removeSpaces: function (field, value) {
    return value ? value.replace(rx, "") : value;
  },

  removeMultipleSpaces: function (field, value) {
    return value ? value.replace(/\s{2,}/g, " ") : value;
  },

  integer: function (field, value) {
    if (!value) return;
    //remove leading zeros
    return value ? value.replace(/^0+/, "") : value;
  }
};


// formatting rules to apply on focus, before editing a value
const FormattingPreRules = {
  integer: function (field, value) {
    if (/^0+$/.test(value))
      //if the value consists of only zeros, empty automatically the field (some users get confused when imputting numbers in a field with 0)
      setValue(field, "");
  }
}


export { FormattingRules, FormattingPreRules }