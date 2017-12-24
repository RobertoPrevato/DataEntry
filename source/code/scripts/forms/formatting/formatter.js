/**
 * DataEntry formatter class.
 * https://github.com/RobertoPrevato/DataEntry
 *
 * Copyright 2017, Roberto Prevato
 * https://robertoprevato.github.io
 *
 * Licensed under the MIT license:
 * http://www.opensource.org/licenses/MIT
 */
import _ from "../../../scripts/utils"
import { raise } from "../../../scripts/raise"
import { FormattingRules } from "./rules"


const len = _.len;
const map = _.map;
const toArray = _.toArray;
const wrap = _.wrap;
const each = _.each;
const isString = _.isString;
const isFunction = _.isFunction;
const isPlainObject = _.isPlainObject;
const extend = _.extend;


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
  constructor(dataentry) {
    var rules = _.clone(Formatter.Rules), 
      self = this,
      options = dataentry ? dataentry.options : null;
    if (options && options.formatRules) {
      extend(rules, options.formatRules);
    }
    self.rules = rules
    return self;
  }

  /**
   * Disposes of this formatter.
   */
  dispose() {
    delete this.rules;
    delete this.dataentry;
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
    for (var i = 0, l = len(rules); i < l; i++) {
      var a = normalizeRule(rules[i], 16);
      var ruleDefinition = self.rules[a.name];

      if (!ruleDefinition)
        raise(4, name);

      // call with the whole object used to configure the formatting
      value = (ruleDefinition.fn || ruleDefinition).call(self, field, value, _.omit(a, "name"));
    }
    return value;
  }
}

Formatter.Rules = FormattingRules

export default Formatter