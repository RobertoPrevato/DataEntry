/**
 * DataEntry defaul validation rules.
 * https://github.com/RobertoPrevato/KingTable
 *
 * Copyright 2017, Roberto Prevato
 * https://robertoprevato.github.io
 *
 * Licensed under the MIT license:
 * http://www.opensource.org/licenses/MIT
 */
import _ from "../../utils"


function getError(message, args) {
  return {
    error: true,
    message: message,
    field: args[0],
    value: args[1],
    params: _.toArray(args).splice(2)
  };
}


const ValidationRules = {

  none: function () {
    return true;
  },

  not: function (field, value, forced, params) {
    var exclude = params;
    if (_.isArray(exclude)) {
      if (_.any(exclude, x => x === value)) {
        return getError("cannotBe", arguments);
      }
    }
    if (value === params) {
      return getError("cannotBe", arguments);
    }
    return true;
  },

  noSpaces: function (field, value, forced) {
    if (!value) return true;
    if (value.match(/\s/)) 
      return getError("spacesInValue", arguments);
    return true;
  },

  remote: {
    deferred: true,
    fn: function (field, value, forced, promiseProvider) {
      if (!promiseProvider)
        raise(7);
      return promiseProvider.apply(field, arguments);
    }
  },

  required: function (field, value, forced, params) {
    if (_.isString(params))
      params = { message: params };
    var defaults = { message: "requiredValue" },
      o = _.extend(defaults, params);
    /*
    // TODO: handle where appropriate
    if (isRadioButton(field)) {
      //any radio button within the same group must be selected
      var group = find(this.element, nameSelector(field));
      if (any(group, function (o) { return o.checked; }))
        return true;
      else
        return getError(o.message, arguments);
    }
    */

    if (!value || !!value.toString().match(/^\s+$/))
      return getError(o.message, arguments);
    return true;
  },

  integer: function (field, value, forced, options) {
    if (!value) return true;
    if (!/^\d+$/.test(value))
      return getError("notInteger", arguments);
    if (options) {
      var intVal = parseInt(value);
      if (isNumber(options.min) && intVal < options.min)
        return getError("minValue", options, arguments);
      if (isNumber(options.max) && intVal > options.max)
        return getError("maxValue", options, arguments);
    }
    return true;
  },

  letters: function (field, value, forced) {
    if (!value) return true;
    if (!/^[a-zA-Z]+$/.test(value))
      return getError("canContainOnlyLetters", arguments);
    return true;
  },

  digits: function (field, value, forced) {
    if (!value) return true;
    if (!/^\d+$/.test(value))
      return getError("canContainOnlyDigits", arguments);
    return true;
  },

  maxLength: function (field, value, forced, limit) {
    if (!value) return true;
    if (value[LEN] > limit)
      return getError("maxLength:" + limit, arguments);
    return true;
  },

  minLength: function (field, value, forced, limit) {
    if (!value) return true;
    if (value[LEN] < limit)
      return getError("minLength:" + limit, arguments);
    return true;
  },

  mustCheck: function (field, value, forced, limit) {
    if (!field.checked)
      return getError("mustBeChecked", arguments);
    return true;
  }
};

export { ValidationRules, getError }