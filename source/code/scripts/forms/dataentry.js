/**
 * DataEntry class.
 * https://github.com/RobertoPrevato/DataEntry
 *
 * Copyright 2019, Roberto Prevato
 * https://robertoprevato.github.io
 *
 * Licensed under the MIT license:
 * http://www.opensource.org/licenses/MIT
 */
import _ from "../../scripts/utils"
import { raise } from "../../scripts/raise"
import EventsEmitter from "../../scripts/components/events"
import Formatter from "./formatting/formatter"
import Validator from "./validation/validator"

const VERSION = "2.0.5"

const DEFAULTS = {
  
  useImplicitConstraints: true, // whether to enable implicit constraints by match with validator names

  useImplicitFormat: true, // whether to enable implicit formatting by match with validator names

  formatter: Formatter,

  validator: Validator,

  localizer: null, // used to localize error messages

  binder: null,

  triggersDelay: undefined // let specify a delay for validation triggers
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
const first = _.first;


function objOrInstance(v, dataentry) {
  if (!v) 
    return null;
  
  if (v.prototype) {
    return new v(dataentry);
  }
  return v;
}


function validateLocalizer(obj) {
  if (!_.quacks(obj, ["t", "lookup"])) {
    raise(22, "invalid `localizer` option: it must implement 't' and 'lookup' methods.")
  }
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

    extend(self, pick(options, baseProperties));
    self.options = options = extend({}, DataEntry.defaults, pick(options, baseProperties, 1));

    var missingTypes = [];
    each(["marker", "formatter", "harvester"], name => {
      if (!options[name]) missingTypes.push(name);
    });
    if (missingTypes.length) {
      raise(8, "missing options: " + missingTypes.join(", "))
    }

    const localizer = options.localizer;
    if (localizer)
      validateLocalizer(localizer);
    self.localizer = localizer;

    each([
      "marker", 
      "formatter", 
      "harvester", 
      "validator",
      "binder"], name => {
      self[name] = objOrInstance(options[name], self);
    })
  }

  /**
   * Configures global default options for the DataEntry.
   * 
   * @param {object} options 
   */
  static configure(options) {
    each(options, (v, k) => {
      DataEntry.defaults[k] = v;
    });
  }

  /**
   * Disposes of this dataentry.
   */
  dispose() {
    var self = this;
    each([
      "binder", 
      "marker", 
      "formatter", 
      "harvester", 
      "validator",
      "context"], name => {
      var o = self[name];
      if (o && o.dispose)
        o.dispose();
      delete self[name];
    })
    each(["validationContext"], name => {
      delete self.options[name];
    })
    delete self.options;
    // remove event listeners
    self.off();
    self.stopListening();
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
    options = options || {};
    if (fields && isFunction(fields)) fields = fields.call(self);
    if (fields && !isArray(fields)) raise(9, "validate `fields` argument must be an array of strings"); // invalid parameter: fields must be an array of strings

    var schema = self.schema;
    if (!schema) raise(11);

    return new Promise(function (resolve, reject) {
      var chain = [], validatingFields = [];
      for (var x in schema) {
        if (fields && !contains(fields, x)) continue;
        validatingFields.push(x); // names of fields being validated
      }

      options.validatingFields = validatingFields; // so we don't trigger validation for fields being validated

      each(validatingFields, fieldName => {
        chain.push(self.validateField(fieldName, options));
      })
      

      Promise.all(chain).then(function (a) {
        var data = flatten(a);
        var errors = where(data, function (o) { return o && o.error; });
        if (len(errors)) {
          self.trigger("first:error", errors[0]);
          self.trigger("errors", errors);

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
      depth: 0,
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

    // support for harvester returning multiple fields by the same name
    // the harvester can then return other kind of fields (such as HTML nodes)
    var fields = options.fields || (this.harvester.getFields 
      ? this.harvester.getFields(fieldName)
      : [fieldName]);
    var validator = self.validator,
      marker = self.marker,
      validation = self.getFieldValidationDefinition(fieldSchema.validation),
      chain = [];
    
    each(fields, function (field) {
      var value = self.harvester.getValue(field);

      // mark field neutrum before validation
      marker.markFieldNeutrum(field);
      
      var p = validator.validate(validation, field, value).then(function (data) {
        // the validation process succeeded (didn't produce any exception)
        // but this doesn't mean that the field is valid:
        for (var j = 0, q = len(data); j < q; j++) {
          var o = data[j];
          if (o.error) {
            // field invalid
            marker.markFieldInvalid(field, {
              message: o.message
            });
            // exit
            return data;
          }
        }
        
        // the field is valid; its value can be formatted;
        self.onGoodValidation(fieldSchema, field, fieldName, value, options);

        marker.markFieldValid(field);
        return data;
      }, function (arr) {
        // the validation process failed (it produced an exception)
        // this should happen, for example, when a validation rule that involves an Ajax request receives status 500 from the server side.
        var a = first(arr, function (o) {
          return o.error;
        });
        marker.markFieldInvalid(field, {
          message: a.message
        });
      });

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

  onGoodValidation(fieldSchema, field, fieldName, value, options) {
    this.formatAfterValidation(fieldSchema, field, fieldName, value)
        .handleTriggers(fieldSchema, field, fieldName, value, options);
  }

  formatAfterValidation(fieldSchema, field, fieldName, value) {
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
        formattedValue = self.formatter.format(matchingFormatRule, field, value);
      }
    }
    if (formattedValue !== value) {
      // trigger event to 
      self.trigger("format", field, fieldName, formattedValue);
      self.harvester.setValue(field, formattedValue, self, fieldName);
    }
    return self;
  }

  handleTriggers(fieldSchema, field, fieldName, value, options) {
    var trigger = fieldSchema.trigger;
    if (!trigger) return this;

    // don't repeat validation for fields already being validated
    if (options)
      trigger = _.reject(trigger, o => {
        return o === fieldName || _.contains(options.validatingFields, o);
      })

    if (!len(trigger))
      return this;

    var self = this, 
        dataentryOptions = self.options,
        triggersDelay = dataentryOptions.triggersDelay;
    // avoid recursive calls
    if (options && options.depth > 0) {
      return self;
    }
    var depth = 1;

    if (_.isNumber(triggersDelay)) {
      setTimeout(() => {
        self.validate(trigger, {
          depth: depth
        });
      }, triggersDelay)
    } else {
      self.validate(trigger, {
        depth: depth
      });
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

  /**
   * Get the value of the given field. Proxy function to harvester getValue function.
   * 
   * @param {string} field 
   */
  getFieldValue(field) {
    return this.harvester.getValue(field);
  }
}

DataEntry.Validator = Validator;
DataEntry.Formatter = Formatter;
DataEntry.defaults = DEFAULTS;
DataEntry.baseProperties = ["element", "schema", "context"];

export default DataEntry