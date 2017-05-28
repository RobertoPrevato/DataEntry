/**
 * DataEntry formatting rules.
 * https://github.com/RobertoPrevato/KingTable
 *
 * Copyright 2017, Roberto Prevato
 * https://robertoprevato.github.io
 *
 * Licensed under the MIT license:
 * http://www.opensource.org/licenses/MIT
 */

const FormattingRules = {
  trim: {
    fn: function (field, value) {
      var rx = /^[\s]+|[\s]+$/g;
      if (value.match(rx)) {
        setValue(field, value[REP](rx, ""));
      }
    }
  },

  removeSpaces: {
    fn: function (field, value) {
      var rx = /\s/g;
      if (value.match(rx)) {
        setValue(field, value[REP](rx, ""));
      }
    }
  },

  removeMultipleSpaces: {
    fn: function (field, value) {
      var rx = /\s{2,}/g;
      if (value.match(rx)) {
        setValue(field, value[REP](rx, " "));
      }
    }
  },

  cleanSpaces: {
    fn: function (field, value) {
      if (!value) return;
      var v = S.trim(S.removeMultipleSpaces(value));
      if (v != value) {
        setValue(field, v);
      }
    }
  },

  integer: {
    fn: function (field, value) {
      if (!value) return;
      //remove leading zeros
      if (/^0+/.test(value))
        setValue(field, value[REP](/^0+/, ""));
    }
  }
};


// formatting rules to apply on focus, before editing a value
const FormattingPreRules = {
  integer: {
    fn: function (field, value) {
      if (/^0+$/.test(value))
        //if the value consists of only zeros, empty automatically the field (some users get confused when imputting numbers in a field with 0)
        setValue(field, "");
    }
  }
}


export { FormattingRules, FormattingPreRules }