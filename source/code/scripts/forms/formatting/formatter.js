/**
 * DataEntry formatter class.
 * https://github.com/RobertoPrevato/KingTable
 *
 * Copyright 2017, Roberto Prevato
 * https://robertoprevato.github.io
 *
 * Licensed under the MIT license:
 * http://www.opensource.org/licenses/MIT
 */
import _ from "../../../scripts/utils"
import raise from "../../../scripts/raise"
import { FormattingRules, FormattingPreRules } from "./rules"


const LEN = "length";
const map = _.map;
const toArray = _.toArray;
const wrap = _.wrap;
const each = _.each;
const isString = _.isString;
const isFunction = _.isFunction;
const isPlainObject = _.isPlainObject;


class Formatter {

  /**
   * Creates a new instance of Validator associated with the given dataentry.
   *
   * @param dataentry: instance of DataEntry.
   */
  constructor(dataentry) {
    var rules = Formatter.Rules, self = this;
    self.rules = rules
    self.dataentry = dataentry;
    return self;
  }

  /**
   * Disposes of this formatter.
   */
  dispose() {
    var self = this;
    self.rules = self.dataentry = self.marker = null;
    return self;
  }

  /**
   * Applies formatting rules on the given field.
   * 
   * @param rules
   * @param view
   * @param field
   * @param value
   * @returns {Formatter}
   */
  format(rules, view, field, value, params) {
    var self = this;
    if (isString(rules)) {
      var name = rules;
      if (self.rules[name])
        self.rules[name].fn.call(view, field, value, params);
      else
        raise(4, name);
      return self;
    }
    for (var i = 0, l = rules[LEN]; i < l; i++) {
      var a = normalizeRule(rules[i], 16);
      self.format(a.name, view, field, value, a.params);
    }
    return self;
  }
}

Formatter.Rules = FormattingRules
Formatter.PreRules = FormattingPreRules

export default Formatter