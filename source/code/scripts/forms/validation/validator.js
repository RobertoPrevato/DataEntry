/**
 * DataEntry validator class.
 * https://github.com/RobertoPrevato/DataEntry
 *
 * Copyright 2019, Roberto Prevato
 * https://robertoprevato.github.io
 *
 * Licensed under the MIT license:
 * http://www.opensource.org/licenses/MIT
 */

import _ from "../../../scripts/utils"
import { raise } from "../../../scripts/raise"
import { ValidationRules, getError } from "./rules"


const len = _.len;
const map = _.map;
const toArray = _.toArray;
const wrap = _.wrap;
const each = _.each;
const isString = _.isString;
const isFunction = _.isFunction;
const isPlainObject = _.isPlainObject;
const extend = _.extend;
const failedValidationErrorKey = "failedValidation";


function ruleParams(args, currentFieldRule) {
  if (!currentFieldRule.params) {
    var extraParams = _.omit(currentFieldRule, ["fn", "name"]);
    return args.concat([extraParams]);
  }
  return args.concat(currentFieldRule.params);
}


class Validator {

  /**
   * Creates a new instance of Validator associated with the given dataentry.
   *
   * @param dataentry: instance of DataEntry.
   */
  constructor(dataentry) {
    var rules = _.clone(Validator.Rules), 
      self = this,
      options = dataentry ? dataentry.options : null;
    if (options && options.rules) {
      extend(rules, options.rules);
    }
    self.getError = getError;
    self.rules = rules
    self.dataentry = dataentry || {};
    return self;
  }

  dispose() {
    delete this.rules;
    delete this.dataentry;
  }

  /**
   * Ensures that a validation rule is defined inside this validator.
   * 
   * @param name
   */
  checkRule(name) {
    if (!this.rules[name]) {
      raise(3, "missing validation rule: " + name);
    }
  }

  normalizeRule(v) {
    if (isPlainObject(v)) {
      return v;
    }

    if (isFunction(v)) {
      return { fn: v };
    }
    raise(14, "invalid validation rule definition")
  }

  getRule(o) {
    var self = this,
      defaults = {},
      rules = self.rules;
    
    if (isString(o)) {
      self.checkRule(o);
      return extend({ name: o }, defaults, self.normalizeRule(rules[o]));
    }

    if (isPlainObject(o)) {
      if (!o.name)
        raise(6, "missing name in validation rule");
      self.checkRule(o.name);
      return extend({}, defaults, o, self.normalizeRule(rules[o.name]));
    }

    raise(14, "invalid validation rule");
  }

  getRules(a) {
    //get validators by name, accepts an array of names
    var v = { direct: [], deferred: [] }, t = this;
    each(a, function (val) {
      var validator = t.getRule(val);
      if (validator.deferred) {
        v.deferred.push(validator);
      } else {
        v.direct.push(validator);
      }
    });
    return v;
  }

  validate(rules, field, val, forced) {
    var queue = this.getValidationChain(rules);
    return this.chain(queue, field, val, forced);
  }

  getValidationChain(a) {
    var v = this.getRules(a), chain = [], self = this;
    //client side validation first
    each(v.direct, function (r) {
      r.fn = self.makeRuleDeferred(r.fn);
      chain.push(r);
    });
    //deferreds later
    each(v.deferred, function (r) {
      chain.push(r);
    });
    return chain;
  }

  /**
   * Wraps a synchronous function into a promise, so it can be run asynchronously.
   * 
   * @param {function} f 
   */
  makeRuleDeferred(f) {
    var validator = this;
    return wrap(f, function (func) {
      var args = toArray(arguments);
      return new Promise(function (resolve, reject) {
        var result = func.apply(validator.dataentry, args.slice(1, len(args)));
        //NB: using Native Promise, we don't want to treat a common scenario like an invalid field as a rejection
        resolve(result);
      });
    });
  }

  localizeError(error, parameters) {
    var dataentry = this.dataentry,
      localizer = dataentry ? dataentry.localizer : null;
    return localizer && localizer.lookup(error) ? localizer.t(error, parameters) : error;
  }

  /**
   * Executes a series of deferred that need to be executed one after the other.
   * returns a deferred object that completes when every single deferred completes, or at the first that fails.
   * 
   * @param queue
   * @returns {Promise}
   */
  chain(queue) {
    if (!len(queue))
      return new Promise(function (resolve) { resolve([]); });
    
    // normalize queue
    queue = map(queue, function (o) {
      if (isFunction(o)) {
        return { fn: o, params: [] };
      }
      return o;
    });
    var i = 0,
      currentFieldRule = queue[i],
      a = [],
      validator = this,
      args = toArray(arguments).slice(1, len(arguments)),
      fullArgs = ruleParams(args, currentFieldRule);
    
    return new Promise(function (resolve, reject) {
      function success(data) {
        // support specific error messages for validation rule definition in schema
        if (data.error) {
          var ruleMessage = currentFieldRule.message;
          if (ruleMessage)
            data.message = isFunction(ruleMessage) ? ruleMessage.apply(validator.dataentry, args) : ruleMessage;
          else {
            var errorKey = data.message;
            var localizedMessage = validator.localizeError(errorKey, ruleParams([], currentFieldRule));
            if (localizedMessage != errorKey) {
              data.errorKey = errorKey;
              data.message = localizedMessage;
            }
          }

          if (currentFieldRule.onError)
            currentFieldRule.onError.apply(validator.dataentry, args);
        }

        a.push(data);
        if (data.error) {
          // common validation error: resolve the chain
          return resolve(a);
        }
        next(); // go to next promise
      }
      function failure(data) {
        // NB: this callback will be called if an exception happen during validation.
        a.push({
          error: true,
          errorKey: failedValidationErrorKey,
          message: validator.localizeError(failedValidationErrorKey, ruleParams([], currentFieldRule))
        });
        reject(a);// reject the validation chain
      }
      function next() {
        i++;
        if (i == len(queue)) {
          // every single promise completed properly
          resolve(a);
        } else {
          currentFieldRule = queue[i];
          fullArgs = ruleParams(args, currentFieldRule);
          currentFieldRule.fn.apply(validator.dataentry, fullArgs).then(success, failure);
        }
      }
      currentFieldRule.fn.apply(validator.dataentry, fullArgs).then(success, failure);
    });
  }
}

Validator.getError = getError;
Validator.Rules = ValidationRules;

export default Validator