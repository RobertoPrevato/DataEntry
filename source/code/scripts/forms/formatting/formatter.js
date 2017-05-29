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


function normalizeRule(a, error) {
  if (isString(a))
    return { name: a };
  if (isPlainObject(a)) {
    var name = a.name;
    if (!name) raise(error);
    return a;
  }
  raise(14, name);
}


class Formatter {

  /**
   * Creates a new instance of Validator associated with the given dataentry.
   *
   * @param dataentry: instance of DataEntry.
   */
  constructor() {
    var rules = Formatter.Rules, self = this;
    self.rules = rules
    return self;
  }

  /**
   * Disposes of this formatter.
   */
  dispose() {
    this.rules = null;
    return this;
  }

  /**
   * Applies formatting rules on the given field.
   * 
   * @param rules
   * @param field
   * @param value
   * @returns {Formatter}
   */
  format(rules, field, value, params) {
    var self = this;
    if (isString(rules)) {
      var name = rules, rule = self.rules[name];
      if (rule)
        return (rule.fn || rule).call(self, field, value, params);
      
      raise(4, name);
    }
    for (var i = 0, l = rules[LEN]; i < l; i++) {
      var a = normalizeRule(rules[i], 16);
      value = self.format(a.name, field, value, a.params);
    }
    return value;
  }
}

Formatter.Rules = FormattingRules
Formatter.PreRules = FormattingPreRules

export default Formatter