/**
 * Built-in event handlers for DOM elements.
 * For example, these functions implement the logic that automatically executes validation
 * when a user interacts with a field (change, blur, paste, cut). 
 * This is painful if you have to implement it yourself.
 * 
 * https://github.com/RobertoPrevato/DataEntry
 *
 * Copyright 2018, Roberto Prevato
 * https://robertoprevato.github.io
 *
 * Licensed under the MIT license:
 * http://www.opensource.org/licenses/MIT
 */
import _ from "../../utils"
import $ from "../../dom"
import { raise } from "../../raise"
import { Constraints } from "../constraints/rules"
import EventsEmitter from "../../components/events"

const defer = _.defer;
const attr = $.attr;
const len = _.len;
const extend = _.extend;
const isString = _.isString;
const isFunction = _.isFunction;
const first = _.first;


class DomBinder extends EventsEmitter {

  constructor(dataentry) {
    super()
    const self = this;

    self.dataentry = dataentry;
    self.element = dataentry.element;
    if (!dataentry.element)
      raise(20, "missing `element` in dataentry");
    self.fn = {};

    var options = dataentry ? dataentry.options : {};
    self.constraints = _.extend({}, Constraints, options.constraintRules);

    if (options.events)
      self.events = options.events;

    self.validationEvent = options.validationEvent || DomBinder.validationEvent;

    if (self.element !== true)
      self.bind();
    
    // does the dataentry implement the event interface?
    if (_.quacks(dataentry, ["on", "trigger"])) {
      if (!dataentry.options.disableAutoFocus) {
        self.listenTo(dataentry, "first:error", error => {
          // focus the first invalid field
          $.fire(error.field, "focus");
        });
      }
    }
  }

  dispose() {
    const self = this;
    self.unbind();
    self.off();
    self.stopListening();
    // delete handlers
    for (var x in self.fn) {
      delete self.fn[x];
    }

    if (_.quacks(self.dataentry, ["on", "trigger"]))
      self.stopListening(self.dataentry);
    self.dataentry = null;
    self.element = null;
    self.constraints = null;
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

      method = method.bind(self.dataentry); // execute methods in the context of the dataentry
      $.on(element, type, selector, method);
    }
    return self;
  }

  unbind() {
    $.off(this.element);
  }

  getEvents() {
    var self = this,
      events = self.events || {};
    if (isFunction(events)) events = events.call(self);
    //extends events object with validation events
    events = extend({}, events,
      self.getValidationDefinition(),
      self.getPreFormattingDefinition(),
      self.getMetaEvents(),
      self.getConstraintsDefinition()
    );
    return events;
  }

  /**
   * Gets an "events" object that describes on keypress constraints for all input inside the given element
   */
  getConstraintsDefinition() {
    var self = this, 
        constraints = self.constraints,
        dataentry = self.dataentry,
        schema = dataentry.schema;

    if (!schema) return {};

    var o = {}, x;
    for (x in schema) {
      var ev = `keypress [name='${x}']`,
        functionName = "constraint_" + x,
        ox = schema[x],
        constraint = ox.constraint;
      if (constraint) {
        // explicit constraint
        if (isFunction(constraint)) constraint = constraint.call(dataentry);

        // constraint must be a single function name
        if (hasOwnProperty(constraints, constraint)) {
          // set reference in events object
          o[ev] = functionName;
          // set function
          self.fn[functionName] = constraints[constraint];
        } else {
          raise(5, constraint);
        }
      } else if (dataentry.options.useImplicitConstraints !== false) {
        // set implicit constraints by validator names, if available
        // check validation schema
        var validation = ox.validation || ox;
        if (validation) {
          // implicit constraint
          if (isFunction(validation)) validation = validation.call(dataentry);
          for (var i = 0, l = len(validation); i < l; i++) {

            var name = isString(validation[i]) ? validation[i] : validation[i].name;
            if (_.has(constraints, name)) {
              // set reference in events object
              o[ev] = functionName;
              // set function
              self.fn[functionName] = constraints[name];
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
    var self = this, 
        dataentry = self.dataentry,
        schema = dataentry.schema;
    if (!schema) return {};
    var o = {}, x;

    function getHandler(name, preformat) {
      return function (e, forced) {
        var el = e.target;
        const v = dataentry.formatter.format(preformat, el, $.getValue(el));
        dataentry.harvester.setValue(el, v);
      }
    }

    for (x in schema) {
      // get preformat definition
      var preformat = self.getFieldPreformatRules(x);
      if (preformat && len(preformat)) {

        var preformattingEvent = "focus", 
            ev = `${preformattingEvent} [name='${x}']`,
            functionName = "preformat_" + x;

        o[ev] = functionName;
        self.fn[functionName] = getHandler(x, preformat);
      }
    }
    return o;
  }

  /**
   * Gets formatting rules to be applied upon focus, for a field.
   */
  getFieldPreformatRules(x) {
    var self = this, 
        dataentry = self.dataentry,
        schema = dataentry.schema,
        fieldSchema = schema[x];
    if (!fieldSchema) return;
    
    // pre formatting works only explicitly; since it is using the same formatting rules used to format valid values
    return fieldSchema.preformat;
  }

  /**
   * Gets an "events" object that describes on blur validation events for all input inside the given element
   * which appears inside the schema of this object
   */
  getValidationDefinition() {
    var self = this, 
      dataentry = self.dataentry,
      schema = dataentry.schema;
    if (!schema) return {};
    var o = {}, x;
    for (x in schema) {
      var validationEvent = schema[x].validationEvent || self.validationEvent;
      // support multiple events:
      var names = validationEvent.split(/,|;/g);
      var functionName = "validation_" + x;
      _.each(names, name => {
        name = name.trim();
        var ev = `${name} [name='${x}']`;
        o[ev] = functionName;
      })
      // store handler
      self.fn[functionName] = self.getValidationEventHandler(x);
    }
    return o;
  }

  getValidationEventHandler(name) {
    var self = this, 
        dataentry = self.dataentry,
        schema = dataentry.schema, 
        validator = dataentry.validator,
        formatter = dataentry.formatter,
        marker = dataentry.marker,
        useImplicitFormat = dataentry.options.useImplicitFormat !== false;

    return function (e, forced) {
      // validate only after user interaction
      if (!dataentry.validationActive) return true;

      if (forced == undefined) forced = false;
      
      var f = e.target;
      
      // mark the field neutrum before validation
      marker.markFieldNeutrum(f);

      var fieldSchema = schema[name], 
          validation = dataentry.getFieldValidationDefinition(fieldSchema.validation || fieldSchema),
          value = dataentry.getFieldValue(f);
      
      validator.validate(validation, f, value, forced).then(function(data) {
        // the validation process succeeded (didn't produce any exception)
        // but this doesn't mean that the field is valid
        var error = first(data, function (o) { return o.error; });

        if (error) {
          const errorData = {
            message: error.message
          };
          marker.markFieldInvalid(f, errorData);
          dataentry.trigger("errors", [errorData]);
        } else {
          // mark the field valid
          marker.markFieldValid(f);
          
          dataentry.onGoodValidation(fieldSchema, f, name, value);
        }
      }, function (data) {
        // the validation process failed (it produced an exception)
        // this should happen, for example, when a validation rule that involves an Ajax request receives status 500 from the server side.
        if (!data) return;
        for (var i = 0, l = len(data); i < l; i++) {
          if (!data[i] || data[i].error) {
            // mark field invalid on the first validation dataentry failed
            const errorData = {
              message: data[i].message
            };
            marker.markFieldInvalid(f, errorData);
            dataentry.trigger("errors", [errorData]);
          }
        }
      });
    }
  }

  /**
   * Returns events definitions that are used for contextual information for the dataentry.
   */
  getMetaEvents() {
    const dataentry = this.dataentry;

    var activationCallback = function (e) {
      // add a class to the element
      dataentry.marker.markFieldTouched(e.target);
      // activate validation after keypress
      dataentry.validationActive = true;
      return true;
    };
    var changeCallback = function (e, forced) {
      // add a class to the element
      dataentry.marker.markFieldTouched(e.target);
      dataentry.validationActive = true;
      // trigger validation
      var target = e.target, name = target.name;
      // on the other hand, we don't want to validate the whole form before the user trying to input anything
      if (_.has(dataentry.schema, name)) {
        defer(function () {
          dataentry.validateField(name, {
            fields: [e.target]
          });
        });
      }
    };
    return {
      "keypress input,select,textarea,[contenteditable]": activationCallback,
      "keydown input,select,textarea,[contenteditable]": activationCallback,
      "change select": changeCallback,
      "change input[type='radio']": changeCallback,
      "change input[type='checkbox']": changeCallback
    };
  }
}

DomBinder.validationEvent = "blur";

export default DomBinder