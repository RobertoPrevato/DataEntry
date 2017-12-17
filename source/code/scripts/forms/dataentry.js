/**
 * DataEntry class.
 * https://github.com/RobertoPrevato/DataEntry
 *
 * Copyright 2017, Roberto Prevato
 * https://robertoprevato.github.io
 *
 * Licensed under the MIT license:
 * http://www.opensource.org/licenses/MIT
 */
import _ from "../../scripts/utils"
import raise from "../../scripts/raise"
import EventsEmitter from "../../scripts/components/events"
import Formatter from "./formatting/formatter"
import Validator from "./validation/validator"
import { debug } from "util";

const VERSION = "2.0.0"


const DEFAULTS = {
  // Whether to enable implicit constraints by match with validator names
  useImplicitConstraints: true,

  // Whether to enable implicit formatting by match with validator names
  useImplicitFormat: true,

  formatter: Formatter,

  validator: Validator
}

const len = _.len;
const isString = _.isString;
const isPlainObject = _.isPlainObject;
const isFunction = _.isFunction;
const isArray = _.isArray;
const extend = _.extend;
const each = _.each;
const find = _.find;
const where = _.where;
const pick = _.pick;
const contains = _.contains;
const flatten = _.flatten;

function objOrInstance(v, dataentry) {
  if (v.prototype) {
    return new v(dataentry);
  }
  return v;
}


class DataEntry extends EventsEmitter {

  static get version() {
    return VERSION;
  }

  /**
   * Creates a new instance of DataEntry with the given options and static properties.
   *
   * @param options: options to use for this instance of DataEntry.
   * @param staticProperties: properties to override in the instance of DataEntry.
   */
  constructor(options) {
    super();
    
    if (!options) raise(8, "missing options"); // missing options
    if (!options.schema) raise(8, "missing schema"); // missing schema

    var self = this, baseProperties = DataEntry.baseProperties;

    this.rules = DataEntry.rules; // TODO: support extra rules
    extend(self, pick(options, baseProperties));
    self.options = options = extend({}, DataEntry.defaults, pick(options, baseProperties, 1));
    
    var missingTypes = [];
    each(["marker", "formatter", "harvester"], name => {
      if (!options[name]) missingTypes.push(name);
    });
    if (missingTypes.length) {
      raise(8, "missing options: " + missingTypes.join(", "))
    }

    self.marker = objOrInstance(options.marker, self);
    self.formatter = objOrInstance(options.formatter, self);
    self.harvester = objOrInstance(options.harvester, self);
    self.validator = objOrInstance(options.validator, self);
  }

  /**
   * Configures global default options for the DataEntry.
   * 
   * @param {object} options 
   */
  static configure(options) {
    each(options, (k, v) => {
      DataEntry.defaults[k] = v;
    });
  }

  /**
   * Disposes of this dataentry.
   */
  dispose() {
    var self = this;
    each(["marker", "formatter", "harvester", "validator"], name => {
      var o = self[name];
      if (o.dispose)
        o.dispose();
      self[name] = null;
    })
    return self;
  }

  /**
   * Validates the fields defined in the schema of this DataEntry; or specific fields by name.
   * 
   * @param fields
   * @param options
   * @returns {Promise}
   */
  validate(fields, options) {
    var self = this;
    if (fields && isFunction(fields)) fields = fields.call(self);
    if (fields && !isArray(fields)) raise(9); // invalid parameter: fields must be an array of strings

    var schema = self.schema;
    if (!schema) raise(11);

    return new Promise(function (resolve, reject) {
      var chain = [];
      for (var x in schema) {
        if (fields && !contains(fields, x)) continue;
        chain.push(self.validateField(x, options));
      }

      Promise.all(chain).then(function (a) {
        var data = flatten(a);
        var errors = where(data, function (o) { return o && o.error; });
        if (len(errors)) {
          //TODO: focus the first invalid field
          //errors[0].field.focus();
          //resolve with failure value
          resolve.call(self, {
            valid: false,
            errors: errors
          });
        } else {
          //all the validation rules returned success
          resolve.call(self, {
            valid: true,
            values: self.harvester.getValues()
          });
        }
      }, function (data) {
        //an exception happen while performing validation; reject the promise
        reject.apply(self, [data]);
      });
    });
  }

  /**
   * Validates one or more fields, by a single name
   * it returns a deferred that completes when validation completes for each field with the given name.
   * 
   * @param fieldName
   * @param options
   * @returns {Promise}
   */
  validateField(fieldName, options) {
    // set options with default values
    options = extend({
      decorateField: true,
      onlyTouched: false
    }, options || {});
    var self = this, schema = self.schema;

    if (!fieldName)
      raise(12);

    if (!schema)
      raise(11);

    var fieldSchema = schema[fieldName];
    if (!fieldSchema)
      // Cannot validate field because the schema object does not contain its definition 
      // or its validation definition
      raise(13, fieldName);

    // normalize, if array
    if (isArray(fieldSchema)) {
      schema[fieldName] = fieldSchema = {
        validation: fieldSchema
      };
    } else if (!fieldSchema.validation) {
      raise(13, fieldName);
    }

    // TODO: IMPLEMENT HERE THE LOGIC THAT OBTAINS A FIELD (EVENTUALLY DOM ELEMENT) BY NAME

    // support for harvester returning multiple fields by the same name (like in standard HTML)
    var fields = this.harvester.getFields 
      ? this.harvester.getFields(fieldName)
      : [fieldName];
    var validator = self.validator,
      marker = self.marker,
      validation = self.getFieldValidationDefinition(fieldSchema.validation),
      chain = [];
    
    each(fields, function (field) {
      var value = self.harvester.getValue(fieldName, field);

      if (options.decorateField) {
        //mark field neutrum before validation
        marker.markFieldNeutrum(fieldName, field);
      }
      var p;
      if (options.decorateField) {
        p = validator.validate(validation, field, value).then(function (data) {
          // the validation process succeeded (didn't produce any exception)
          // but this doesn't mean that the field is valid:
          for (var j = 0, q = len(data); j < q; j++) {
            var o = data[j];
            if (o.error) {
              //field invalid
              marker.markFieldInvalid(field, {
                message: o.message
              });
              //exit
              return data;
            }
          }
          
          // the field is valid; its value can be formatted;
          self.onGoodValidation(fieldSchema, field, fieldName, value);

          marker.markFieldValid(field);
          return data;
        }, function (arr) {
          //the validation process failed (it produced an exception)
          //this should happen, for example, when a validation rule that involves an Ajax request receives status 500 from the server side.
          var a = first(arr, function (o) {
            return o.error;
          });
          marker.markFieldInvalid(field, {
            message: a.message
          });
        });
      } else {
        p = validator.validate(validation, field, value);
      }
      chain.push(p);
    });
    // NB: the chain can contain more than one element, when a fieldset contains multiple elements with the same name
    // (which is proper HTML and relatively common scenario)
    return new Promise(function (resolve, reject) {
      Promise.all(chain).then(function () {
        resolve(_.toArray(arguments));
      });
    });
  }

  onGoodValidation(fieldSchema, field, fieldName, value) {
    var self = this;
    var format = fieldSchema.format, validation = fieldSchema.validation;
    if (isFunction(format)) format = format.call(self, f, value);
    
    var formattedValue = value;
    if (format) {
      formattedValue = self.formatter.format(format, field, value);
    } else if (self.options.useImplicitFormat) {
      // apply format rules implicitly (in this case, there are no parameters)
      var matchingFormatRule = [];
      _.each(validation, rule => {
        var name = isString(rule) ? rule : rule.name;
        if (name && self.formatter.rules[name])
          matchingFormatRule.push(name);
      })
      if (matchingFormatRule.length) {
        formattedValue = self.formatter.format(name, field, value);
      }
    }
    if (formattedValue !== value) {
      self.harvester.setValue(field, formattedValue, self, fieldName);
    }
    return self;
  }

  /**
   * Gets an array of validations to apply on a field.
     * it supports the use of arrays or functions, which return arrays.
     * 
     * @param schema
     * @returns {Array}
   */
  getFieldValidationDefinition(schema) {
    return isFunction(schema) ? schema.call(this.context || this) : schema;
  }

}

DataEntry.Validator = Validator;
DataEntry.Formatter = Formatter;
DataEntry.defaults = DEFAULTS;
DataEntry.baseProperties = ["element", "schema", "context", "events"];

if (typeof window != "undefined") {
  window.DataEntry = DataEntry;
}

export default DataEntry