/**
 * DataEntry validator class.
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
import { ValidationRules, getError } from "./rules"


const LEN = "length";
const map = _.map;
const toArray = _.toArray;
const wrap = _.wrap;
const each = _.each;
const isString = _.isString;
const isFunction = _.isFunction;
const isPlainObject = _.isPlainObject;
const extend = _.extend;


class Validator {

  /**
   * Creates a new instance of Validator associated with the given dataentry.
   *
   * @param dataentry: instance of DataEntry.
   */
  constructor(dataentry) {
    var rules = Validator.Rules, self = this;
    self.rules = rules
    self.dataentry = dataentry;
    return self;
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
      defaults = {}, // Validator.defaults, ??
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

  makeRuleDeferred (f) {
    var validator = this;
    return wrap(f, function (func) {
      var args = toArray(arguments);
      return new Promise(function (resolve, reject) {
        var result = func.apply(validator.dataentry, args.slice(1, args[LEN]));
        //NB: using Native Promise, we don't want to treat a common scenario like an invalid field as a rejection
        resolve(result);
      });
    });
  }

  /**
   * Executes a series of deferred that need to be executed one after the other.
   * returns a deferred object that completes when every single deferred completes, or at the first that fails.
   * 
   * @param queue
   * @returns {Promise}
   */
  chain(queue) {
    if (!queue[LEN])
      return new Promise(function (resolve) { resolve([]); });
    
    //normalize queue
    queue = map(queue, function (o) {
      if (isFunction(o)) {
        return { fn: o, params: [] };
      }
      return o;
    });
    var i = 0,
      a = [],
      validator = this,
      args = toArray(arguments).slice(1, arguments[LEN]);
    
    return new Promise(function (resolve, reject) {
      function success(data) {
        a.push(data);
        if (data.error) {
          //common validation error: resolve the chain
          return resolve(a);
        }
        next();//go to next promise
      }
      function failure(data) {
        //NB: this callback will be called if an exception happen during validation.
        a.push({
          error: true,
          message: localizeError("failedValidation")
        });
        reject(a);//reject the validation chain
      }
      function next() {
        i++;
        if (i == queue[LEN]) {
          //every single promise completed properly
          resolve(a);
        } else {
          queue[i].fn.apply(validator.dataentry, args.concat(queue[i].params)).then(success, failure);
        }
      }
      queue[i].fn.apply(validator.dataentry, args.concat(queue[i].params)).then(success, failure);
    });
  }
}

Validator.getError = getError;
Validator.Rules = ValidationRules;

export default Validator