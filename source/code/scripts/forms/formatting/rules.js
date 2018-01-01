/**
 * DataEntry built-in formatting rules.
 * https://github.com/RobertoPrevato/DataEntry
 *
 * Copyright 2018, Roberto Prevato
 * https://robertoprevato.github.io
 *
 * Licensed under the MIT license:
 * http://www.opensource.org/licenses/MIT
 */
import _ from "../../utils"


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

  cleanSpaces: function (field, value) {
    if (!value) return value;
    return value.replace(/^[\s]+|[\s]+$/g, "").replace(/\s{2,}/g, " ");
  },

  integer: function (field, value) {
    if (!value) return;
    //remove leading zeros
    return value ? value.replace(/^0+/, "") : value;
  },

  "zero-fill": function (field, value, options) {
    if (!value) return value;
    var l;
    if (_.isEmpty(options)) {
      var ml = field.getAttribute("maxlength");
      if (!ml) throw "maxlength is required for the zero-fill formatter";
      l = parseInt(ml);
    } else {
      if (!("length" in options)) {
        throw "missing length in options";
      }
      l = options.length;
    }
    var original = value;
    while (value.length < l) {
      value = "0" + value;
    }
    return value;
  },

  "zero-unfill": function (field, value) {
    if (!value) return value;
    if (/^0+/.test(value))
      value = value.replace(/^0+/, "");
    return value;
  }
};

export { FormattingRules }