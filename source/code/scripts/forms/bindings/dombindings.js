/**
 * Built-in event handlers for DOM elements.
 * For example, these functions implement the logic that automatically executes validation
 * when a user interacts with a field (change, blur, paste, cut). 
 * This is painful if you have to implement yourself.
 * 
 * https://github.com/RobertoPrevato/DataEntry
 *
 * Copyright 2017, Roberto Prevato
 * https://robertoprevato.github.io
 *
 * Licensed under the MIT license:
 * http://www.opensource.org/licenses/MIT
 */
import _ from "../../utils"
import $ from "../../dom"


const extend = _.extend;
const isFunction = _.isFunction;


class DomBinder {

  constructor(dataentry) {
    this.dataentry = dataentry;
  }

  dispose() {
    this.unbind();
    this.dataentry = null;
  }

  bind() {
    var self = this,
      events = self.getEvents(),
      element = self.element,
      delegateEventSplitter = /^(\S+)\s*(.*)$/;
    for (var key in events) {
      var method = events[key];
      if (!isFunction(method)) method = self.fn[method];
      if (!method) continue;
      var match = key.match(delegateEventSplitter);
      var type = match[1], selector = match[2];
      method = method.bind(self);
      self.setEventListener(element, type, selector, method);
    }
    return self;
  }

  unbind() {

  }

  getEvents() {
    var self = this,
      events = self.events || {};
    if (isFunction(events)) events = events.call(self);
    //extends events object with validation events
    events = extend({}, events,
      self.getValidationDefinition(),
      self.getPreFormattingDefinition(),
      self.getMetaEvents()/*,
      self.getConstraintsDefinition(),
      self.getMemoryDefinition()*/);
    return events;
  }

  /**
   * Function used to store form values.
   */
  memorize(e) {
    var self = this, schema = self.schema, storage = self.getStorage();
    setTimeout(function () {
      var element = e.target, name = attrName(element);
      if (!name) return;
      var fieldSchema = schema[name];
      if (!fieldSchema || fieldSchema.mem === false) {
        return;
      }
      if (isPassword(element)) return;
      var val = getValue(element),
        key = self.getMemoryKey(name);
      storage.setItem(key, val);
    }, 50);
  }

  /**
   * Gets an "events" object for event handlers that allow to keep values in memory
   * @returns {}
   */
  getMemoryDefinition() {
    var self = this;
    if (!self.element.dataset.memory || !self.getStorage())
      // storage disabled
      return null;
    var memorize = self.memorize.bind(self);
    return {
      "keypress input,textarea": memorize,
      "paste input,textarea": memorize,
      "cut input,textarea": memorize,
      "change select": memorize,
      "change input[type='checkbox']": memorize,
      "change input[type='radio']": memorize
    };
    return o;
  }

  /**
   * Gets an "events" object that describes on keypress constraints for all input inside the given element
   * @returns {}
   * 
   * @deprecated
   */
  getConstraintsDefinition() {
    var self = this, schema = self.schema;
    if (!schema) return {};
    var o = {}, x;
    for (x in schema) {
      var ev = self.string.format("{0} [name='{1}']", "keypress", x),
        functionName = "constraint_" + x,
        ox = schema[x];
      var constraint = ox.constraint;
      if (constraint) {
        //explicit constraint
        if (isFunction(constraint)) constraint = constraint.call(self.context || self);
        //constraint must be a single function name
        if (hasOwnProperty(Constraints, constraint)) {
          //set reference in events object
          o[ev] = functionName;
          //set function
          self.fn[functionName] = Constraints[constraint];
        } else {
          raise(5, constraint);
        }
      } else if (self.options.allowImplicitConstraints) {
        //set implicit constraints by validator names
        //check validation schema
        var validation = ox.validation;
        if (validation) {
          //implicit constraint
          if (isFunction(validation)) validation = validation.call(self.context || self);
          for (var i = 0, l = validation[LEN]; i < l; i++) {
            var name = isString(validation[i]) ? validation[i] : validation[i].name;
            if (hasOwnProperty(Constraints, name)) {
              //set reference in events object
              o[ev] = functionName;
              //set function
              self.fn[functionName] = Constraints[name];
            }
          }
        }
      }
    }
    return o;
  }

  /**
   * Gets an "events" object that describes on focus pre formatting events for all input inside the given element
   */
  getPreFormattingDefinition() {
    var self = this, schema = self.schema;
    if (!schema) return {};
    var o = {}, x;
    for (x in schema) {
      //get preformat definition
      var preformat = self.getFieldPreformatRules(x);
      if (preformat && preformat[LEN]) {
        var preformattingEvent = "focus",
          ev = self.string.format('{0} [name="{1}"]', preformattingEvent, x);
        var functionName = "preformat_" + x;
        o[ev] = functionName;
        self.fn[functionName] = function (e, forced) {
          var el = e.target, name = attr(el, "name"), preformat = self.getFieldPreformatRules(name);
          for (var i = 0, l = preformat[LEN]; i < l; i++) {
            var a = normalizeRule(preformat[i], 16);
            var rule = Forms.Formatting.PreRules[a.name];
            rule.fn.call(self.context || self, el, getValue(el), a.params);
          }
        };
      }
    }
    return o;
  }

  /**
   * Gets an "events" object that describes on blur validation events for all input inside the given element
   * which appears inside the schema of this object
   * @returns {}
   */
  getValidationDefinition() {
    var self = this, schema = self.schema, marker = self.marker;
    if (!schema) return {};
    var o = {}, x;
    for (x in schema) {
      var validationEvent = schema[x].validationEvent,
        ev = self.string.format("{0} [name='{1}']", validationEvent || self.validator.ev, x);
      var functionName = "validation_" + x;
      o[ev] = functionName;
      self.fn[functionName] = function (e, forced) {
        //validate only after user interaction
        if (!self.validationActive) return true;
        if (forced == undefined) forced = false;
        var f = e.target, name = attr(f, "name");
        //mark the field neutrum before validation
        marker.markFieldNeutrum(f);

        var fieldSchema = self.schema[name], validation = self.getFieldValidationDefinition(fieldSchema.validation);
        var value = self.getFieldValue(name, f);

        //I can easily pass the whole context as parameter, if needed
        self.validator.validate(validation, f, value, forced).then(function done(data) {
          //the validation process succeeded (didn't produce any exception)
          //but this doesn't mean that the field is valid
          var error = first(data, function (o) { return o.error; });
          if (error) {
            marker.markFieldInvalid(f, {
              message: error.message
            });
          } else {
            //mark the field valid
            marker.markFieldValid(f);
            //apply formatters if applicable
            var name = attr(f, "name"), format = self.schema[name].format;
            if (isFunction(format)) format = format.call(self.context || self, f, value);
            if (format) {
              self.formatter.format(format, self, f, value);
            } else if (self.options.allowImplicitFormat) {
              //apply format rules implicitly (in this case, there are no parameters)
              for (var i = 0, l = validation[LEN]; i < l; i++) {
                var name = isString(validation[i]) ? validation[i] : validation[i].name;
                if (name && self.formatter.rules[name])
                  self.formatter.format(name, self, f, value);
              }
            }
          }
        }, function fail(data) {
          //the validation process failed (it produced an exception)
          //this should happen, for example, when a validation rule that involves an Ajax request receives status 500 from the server side.
          if (!data) return;
          for (var i = 0, l = data[LEN]; i < l; i++) {
            if (!data[i] || data[i].error) {
              //mark field invalid on the first validation dataentry failed
              marker.markFieldInvalid(f, {
                message: data[i].message
              });
            }
          }
        });
      };
    }
    return o;
  }

  /**
   * Returns events definitions that are used for contextual information for the dataentry.
   * 
   * @returns {object}
   */
  getMetaEvents() {
    var activationCallback = function (e) {
      // add a class to the element
      this.formatter.marker.markFieldTouched(e.target);
      // activate validation after keypress
      this.validationActive = true;
      return true;
    };
    var changeCallback = function (e, forced) {
      //add a class to the element
      var self = this;
      self.formatter.marker.markFieldTouched(e.target);
      self.validationActive = true;
      //trigger validation
      var target = e.target,
        name = target.name;
      //on the other hand, we don't want to validate the whole form before the user trying to input anything
      if (hasOwnProperty(self.schema, name)) {
        //if the target is a radio button, then we need to trigger validation of all radio buttons with the same name
        var elementsToValidate = /radio/i.test(target.type)
          ? find(self.element, nameSelector(target))
          : [e.target];
        defer(function () {
          self.validateField(name, {
            elements: elementsToValidate
          });
        });
      }
    };
    return {
      "keypress input,select,textarea": activationCallback,
      "keydown input,select,textarea": activationCallback,
      "change select": changeCallback,
      "change input[type='radio']": changeCallback,
      "change input[type='checkbox']": changeCallback
    };
  }
}

export default DomBinder