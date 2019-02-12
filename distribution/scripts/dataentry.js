(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; /**
                                                                                                                                                                                                                                                                               * Events.
                                                                                                                                                                                                                                                                               * https://github.com/RobertoPrevato/DataEntry
                                                                                                                                                                                                                                                                               *
                                                                                                                                                                                                                                                                               * Copyright 2019, Roberto Prevato
                                                                                                                                                                                                                                                                               * https://robertoprevato.github.io
                                                                                                                                                                                                                                                                               *
                                                                                                                                                                                                                                                                               * Licensed under the MIT license:
                                                                                                                                                                                                                                                                               * http://www.opensource.org/licenses/MIT
                                                                                                                                                                                                                                                                               */


var _utils = require("../../scripts/utils");

var _utils2 = _interopRequireDefault(_utils);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var array = [];
var push = array.push;
var slice = array.slice;
var splice = array.splice;

// Regular expression used to split event strings.
var eventSplitter = /\s+/;

var eventsApi = function eventsApi(obj, action, name, rest) {
  if (!name) return true;

  // Handle event maps.
  if ((typeof name === "undefined" ? "undefined" : _typeof(name)) === "object") {
    for (var key in name) {
      obj[action].apply(obj, [key, name[key]].concat(rest));
    }
    return false;
  }

  // Handle space separated event names.
  if (eventSplitter.test(name)) {
    var names = name.split(eventSplitter);
    for (var i = 0, l = names.length; i < l; i++) {
      obj[action].apply(obj, [names[i]].concat(rest));
    }
    return false;
  }

  return true;
};

var triggerEvents = function triggerEvents(events, args) {
  var ev,
      i = -1,
      l = events.length,
      a1 = args[0],
      a2 = args[1],
      a3 = args[2];
  switch (args.length) {
    case 0:
      while (++i < l) {
        (ev = events[i]).callback.call(ev.ctx);
      }return;
    case 1:
      while (++i < l) {
        (ev = events[i]).callback.call(ev.ctx, a1);
      }return;
    case 2:
      while (++i < l) {
        (ev = events[i]).callback.call(ev.ctx, a1, a2);
      }return;
    case 3:
      while (++i < l) {
        (ev = events[i]).callback.call(ev.ctx, a1, a2, a3);
      }return;
    default:
      while (++i < l) {
        (ev = events[i]).callback.apply(ev.ctx, args);
      }}
};

//
// Base class for events emitters
//

var EventsEmitter = function () {
  function EventsEmitter() {
    _classCallCheck(this, EventsEmitter);
  }

  _createClass(EventsEmitter, [{
    key: "on",


    // Bind an event to a `callback` function. Passing `"all"` will bind
    // the callback to all events fired.
    value: function on(name, callback, context) {
      if (!eventsApi(this, "on", name, [callback, context]) || !callback) return this;
      this._events || (this._events = {});
      var events = this._events[name] || (this._events[name] = []);
      events.push({ callback: callback, context: context, ctx: context || this });
      return this;
    }

    // Bind an event to only be triggered a single time. After the first time
    // the callback is invoked, it will be removed.

  }, {
    key: "once",
    value: function once(name, callback, context) {
      if (!eventsApi(this, "once", name, [callback, context]) || !callback) return this;
      var self = this;
      var once = _utils2.default.once(function () {
        self.off(name, once);
        callback.apply(this, arguments);
      });
      once._callback = callback;
      return this.on(name, once, context);
    }

    // Remove one or many callbacks.

  }, {
    key: "off",
    value: function off(name, callback, context) {
      var retain, ev, events, names, i, l, j, k;
      if (!this._events || !eventsApi(this, "off", name, [callback, context])) return this;
      if (!name && !callback && !context) {
        this._events = {};
        return this;
      }

      names = name ? [name] : _utils2.default.keys(this._events);
      for (i = 0, l = names.length; i < l; i++) {
        name = names[i];
        if (events = this._events[name]) {
          this._events[name] = retain = [];
          if (callback || context) {
            for (j = 0, k = events.length; j < k; j++) {
              ev = events[j];
              if (callback && callback !== ev.callback && callback !== ev.callback._callback || context && context !== ev.context) {
                retain.push(ev);
              }
            }
          }
          if (!retain.length) delete this._events[name];
        }
      }

      return this;
    }

    // Trigger one or many events, firing all bound callbacks.

  }, {
    key: "trigger",
    value: function trigger(name) {
      if (!this._events) return this;
      var args = slice.call(arguments, 1);
      if (!eventsApi(this, "trigger", name, args)) return this;
      var events = this._events[name];
      var allEvents = this._events.all;
      if (events) triggerEvents(events, args);
      if (allEvents) triggerEvents(allEvents, arguments);
      return this;
    }

    // Trigger one or many events, firing all bound callbacks.

  }, {
    key: "emit",
    value: function emit(name) {
      return this.trigger(name);
    }

    // Tell this object to stop listening to either specific events, or
    // to every object it's currently listening to.

  }, {
    key: "stopListening",
    value: function stopListening(obj, name, callback) {
      var listeners = this._listeners;
      if (!listeners) return this;
      var deleteListener = !name && !callback;
      if ((typeof name === "undefined" ? "undefined" : _typeof(name)) === "object") callback = this;
      if (obj) (listeners = {})[obj._listenerId] = obj;
      for (var id in listeners) {
        listeners[id].off(name, callback, this);
        if (deleteListener) delete this._listeners[id];
      }
      return this;
    }
  }, {
    key: "listenTo",
    value: function listenTo(obj, name, callback) {
      // support calling the method with an object as second parameter
      if (arguments.length == 2 && (typeof name === "undefined" ? "undefined" : _typeof(name)) == "object") {
        var x;
        for (x in name) {
          this.listenTo(obj, x, name[x]);
        }
        return this;
      }

      var listeners = this._listeners || (this._listeners = {});
      var id = obj._listenerId || (obj._listenerId = _utils2.default.uniqueId("l"));
      listeners[id] = obj;
      if ((typeof name === "undefined" ? "undefined" : _typeof(name)) === "object") callback = this;
      obj.on(name, callback, this);
      return this;
    }
  }, {
    key: "listenToOnce",
    value: function listenToOnce(obj, name, callback) {
      var listeners = this._listeners || (this._listeners = {});
      var id = obj._listenerId || (obj._listenerId = _utils2.default.uniqueId("l"));
      listeners[id] = obj;
      if ((typeof name === "undefined" ? "undefined" : _typeof(name)) === "object") callback = this;
      obj.once(name, callback, this);
      return this;
    }
  }]);

  return EventsEmitter;
}();

exports.default = EventsEmitter;
;

},{"../../scripts/utils":9}],2:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
/**
 * Proxy functions to raise exceptions.
 * https://github.com/RobertoPrevato/DataEntry
 *
 * Copyright 2019, Roberto Prevato
 * https://robertoprevato.github.io
 *
 * Licensed under the MIT license:
 * http://www.opensource.org/licenses/MIT
 */
var NO_PARAM = "???";

function ArgumentNullException(name) {
  throw new Error("The parameter cannot be null: " + (name || NO_PARAM));
}

function ArgumentException(details) {
  throw new Error("Invalid argument: " + (details || NO_PARAM));
}

function TypeException(name, expectedType) {
  throw new Error("Expected parameter: " + (name || NO_PARAM) + " of type: " + (type || NO_PARAM));
}

function OperationException(desc) {
  throw new Error("Invalid operation: " + desc);
}

exports.ArgumentException = ArgumentException;
exports.ArgumentNullException = ArgumentNullException;
exports.TypeException = TypeException;
exports.OperationException = OperationException;

},{}],3:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _utils = require("../../scripts/utils");

var _utils2 = _interopRequireDefault(_utils);

var _raise = require("../../scripts/raise");

var _events = require("../../scripts/components/events");

var _events2 = _interopRequireDefault(_events);

var _formatter = require("./formatting/formatter");

var _formatter2 = _interopRequireDefault(_formatter);

var _validator = require("./validation/validator");

var _validator2 = _interopRequireDefault(_validator);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; } /**
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                * DataEntry class.
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                * https://github.com/RobertoPrevato/DataEntry
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                *
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                * Copyright 2019, Roberto Prevato
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                * https://robertoprevato.github.io
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                *
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                * Licensed under the MIT license:
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                * http://www.opensource.org/licenses/MIT
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                */


var VERSION = "2.0.5";

var DEFAULTS = {

  useImplicitConstraints: true, // whether to enable implicit constraints by match with validator names

  useImplicitFormat: true, // whether to enable implicit formatting by match with validator names

  formatter: _formatter2.default,

  validator: _validator2.default,

  localizer: null, // used to localize error messages

  binder: null,

  triggersDelay: undefined // let specify a delay for validation triggers
};

var len = _utils2.default.len;
var isString = _utils2.default.isString;
var isPlainObject = _utils2.default.isPlainObject;
var isFunction = _utils2.default.isFunction;
var isArray = _utils2.default.isArray;
var extend = _utils2.default.extend;
var each = _utils2.default.each;
var find = _utils2.default.find;
var where = _utils2.default.where;
var pick = _utils2.default.pick;
var contains = _utils2.default.contains;
var flatten = _utils2.default.flatten;
var first = _utils2.default.first;

function objOrInstance(v, dataentry) {
  if (!v) return null;

  if (v.prototype) {
    return new v(dataentry);
  }
  return v;
}

function validateLocalizer(obj) {
  if (!_utils2.default.quacks(obj, ["t", "lookup"])) {
    (0, _raise.raise)(22, "invalid `localizer` option: it must implement 't' and 'lookup' methods.");
  }
}

var DataEntry = function (_EventsEmitter) {
  _inherits(DataEntry, _EventsEmitter);

  _createClass(DataEntry, null, [{
    key: "version",
    get: function get() {
      return VERSION;
    }

    /**
     * Creates a new instance of DataEntry with the given options and static properties.
     *
     * @param options: options to use for this instance of DataEntry.
     * @param staticProperties: properties to override in the instance of DataEntry.
     */

  }]);

  function DataEntry(options) {
    _classCallCheck(this, DataEntry);

    var _this = _possibleConstructorReturn(this, (DataEntry.__proto__ || Object.getPrototypeOf(DataEntry)).call(this));

    if (!options) (0, _raise.raise)(8, "missing options"); // missing options
    if (!options.schema) (0, _raise.raise)(8, "missing schema"); // missing schema

    var self = _this,
        baseProperties = DataEntry.baseProperties;

    extend(self, pick(options, baseProperties));
    self.options = options = extend({}, DataEntry.defaults, pick(options, baseProperties, 1));

    var missingTypes = [];
    each(["marker", "formatter", "harvester"], function (name) {
      if (!options[name]) missingTypes.push(name);
    });
    if (missingTypes.length) {
      (0, _raise.raise)(8, "missing options: " + missingTypes.join(", "));
    }

    var localizer = options.localizer;
    if (localizer) validateLocalizer(localizer);
    self.localizer = localizer;

    each(["marker", "formatter", "harvester", "validator", "binder"], function (name) {
      self[name] = objOrInstance(options[name], self);
    });
    return _this;
  }

  /**
   * Configures global default options for the DataEntry.
   * 
   * @param {object} options 
   */


  _createClass(DataEntry, [{
    key: "dispose",


    /**
     * Disposes of this dataentry.
     */
    value: function dispose() {
      var self = this;
      each(["binder", "marker", "formatter", "harvester", "validator", "context"], function (name) {
        var o = self[name];
        if (o && o.dispose) o.dispose();
        delete self[name];
      });
      each(["validationContext"], function (name) {
        delete self.options[name];
      });
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

  }, {
    key: "validate",
    value: function validate(fields, options) {
      var self = this;
      options = options || {};
      if (fields && isFunction(fields)) fields = fields.call(self);
      if (fields && !isArray(fields)) (0, _raise.raise)(9, "validate `fields` argument must be an array of strings"); // invalid parameter: fields must be an array of strings

      var schema = self.schema;
      if (!schema) (0, _raise.raise)(11);

      return new Promise(function (resolve, reject) {
        var chain = [],
            validatingFields = [];
        for (var x in schema) {
          if (fields && !contains(fields, x)) continue;
          validatingFields.push(x); // names of fields being validated
        }

        options.validatingFields = validatingFields; // so we don't trigger validation for fields being validated

        each(validatingFields, function (fieldName) {
          chain.push(self.validateField(fieldName, options));
        });

        Promise.all(chain).then(function (a) {
          var data = flatten(a);
          var errors = where(data, function (o) {
            return o && o.error;
          });
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

  }, {
    key: "validateField",
    value: function validateField(fieldName, options) {
      // set options with default values
      options = extend({
        depth: 0,
        onlyTouched: false
      }, options || {});
      var self = this,
          schema = self.schema;

      if (!fieldName) (0, _raise.raise)(12);

      if (!schema) (0, _raise.raise)(11);

      var fieldSchema = schema[fieldName];
      if (!fieldSchema)
        // Cannot validate field because the schema object does not contain its definition 
        // or its validation definition
        (0, _raise.raise)(13, fieldName);

      // normalize, if array
      if (isArray(fieldSchema)) {
        schema[fieldName] = fieldSchema = {
          validation: fieldSchema
        };
      } else if (!fieldSchema.validation) {
        (0, _raise.raise)(13, fieldName);
      }

      // support for harvester returning multiple fields by the same name
      // the harvester can then return other kind of fields (such as HTML nodes)
      var fields = options.fields || (this.harvester.getFields ? this.harvester.getFields(fieldName) : [fieldName]);
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
          resolve(_utils2.default.toArray(arguments));
        });
      });
    }
  }, {
    key: "onGoodValidation",
    value: function onGoodValidation(fieldSchema, field, fieldName, value, options) {
      this.formatAfterValidation(fieldSchema, field, fieldName, value).handleTriggers(fieldSchema, field, fieldName, value, options);
    }
  }, {
    key: "formatAfterValidation",
    value: function formatAfterValidation(fieldSchema, field, fieldName, value) {
      var self = this;
      var format = fieldSchema.format,
          validation = fieldSchema.validation;
      if (isFunction(format)) format = format.call(self, f, value);

      var formattedValue = value;
      if (format) {
        formattedValue = self.formatter.format(format, field, value);
      } else if (self.options.useImplicitFormat) {
        // apply format rules implicitly (in this case, there are no parameters)
        var matchingFormatRule = [];
        _utils2.default.each(validation, function (rule) {
          var name = isString(rule) ? rule : rule.name;
          if (name && self.formatter.rules[name]) matchingFormatRule.push(name);
        });
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
  }, {
    key: "handleTriggers",
    value: function handleTriggers(fieldSchema, field, fieldName, value, options) {
      var trigger = fieldSchema.trigger;
      if (!trigger) return this;

      // don't repeat validation for fields already being validated
      if (options) trigger = _utils2.default.reject(trigger, function (o) {
        return o === fieldName || _utils2.default.contains(options.validatingFields, o);
      });

      if (!len(trigger)) return this;

      var self = this,
          dataentryOptions = self.options,
          triggersDelay = dataentryOptions.triggersDelay;
      // avoid recursive calls
      if (options && options.depth > 0) {
        return self;
      }
      var depth = 1;

      if (_utils2.default.isNumber(triggersDelay)) {
        setTimeout(function () {
          self.validate(trigger, {
            depth: depth
          });
        }, triggersDelay);
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

  }, {
    key: "getFieldValidationDefinition",
    value: function getFieldValidationDefinition(schema) {
      return isFunction(schema) ? schema.call(this.context || this) : schema;
    }

    /**
     * Get the value of the given field. Proxy function to harvester getValue function.
     * 
     * @param {string} field 
     */

  }, {
    key: "getFieldValue",
    value: function getFieldValue(field) {
      return this.harvester.getValue(field);
    }
  }], [{
    key: "configure",
    value: function configure(options) {
      each(options, function (v, k) {
        DataEntry.defaults[k] = v;
      });
    }
  }]);

  return DataEntry;
}(_events2.default);

DataEntry.Validator = _validator2.default;
DataEntry.Formatter = _formatter2.default;
DataEntry.defaults = DEFAULTS;
DataEntry.baseProperties = ["element", "schema", "context"];

exports.default = DataEntry;

},{"../../scripts/components/events":1,"../../scripts/raise":8,"../../scripts/utils":9,"./formatting/formatter":4,"./validation/validator":7}],4:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }(); /**
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      * DataEntry formatter class.
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      * https://github.com/RobertoPrevato/DataEntry
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      *
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      * Copyright 2019, Roberto Prevato
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      * https://robertoprevato.github.io
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      *
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      * Licensed under the MIT license:
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      * http://www.opensource.org/licenses/MIT
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      */


var _utils = require("../../../scripts/utils");

var _utils2 = _interopRequireDefault(_utils);

var _raise = require("../../../scripts/raise");

var _rules = require("./rules");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var len = _utils2.default.len;
var map = _utils2.default.map;
var toArray = _utils2.default.toArray;
var wrap = _utils2.default.wrap;
var each = _utils2.default.each;
var isString = _utils2.default.isString;
var isFunction = _utils2.default.isFunction;
var isPlainObject = _utils2.default.isPlainObject;
var extend = _utils2.default.extend;

function normalizeRule(a, error) {
  if (isString(a)) return { name: a };
  if (isPlainObject(a)) {
    var name = a.name;
    if (!name) (0, _raise.raise)(error);
    return a;
  }
  (0, _raise.raise)(14, name);
}

var Formatter = function () {

  /**
   * Creates a new instance of Validator associated with the given dataentry.
   *
   * @param dataentry: instance of DataEntry.
   */
  function Formatter(dataentry) {
    _classCallCheck(this, Formatter);

    var rules = _utils2.default.clone(Formatter.Rules),
        self = this,
        options = dataentry ? dataentry.options : null;
    if (options && options.formatRules) {
      extend(rules, options.formatRules);
    }
    self.rules = rules;
    return self;
  }

  /**
   * Disposes of this formatter.
   */


  _createClass(Formatter, [{
    key: "dispose",
    value: function dispose() {
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

  }, {
    key: "format",
    value: function format(rules, field, value, params) {
      var self = this;
      if (isString(rules)) {
        var name = rules,
            rule = self.rules[name];
        if (rule) return (rule.fn || rule).call(self, field, value, params);

        (0, _raise.raise)(4, name);
      }
      for (var i = 0, l = len(rules); i < l; i++) {
        var a = normalizeRule(rules[i], 16);
        var ruleDefinition = self.rules[a.name];

        if (!ruleDefinition) (0, _raise.raise)(4, name);

        // call with the whole object used to configure the formatting
        value = (ruleDefinition.fn || ruleDefinition).call(self, field, value, _utils2.default.omit(a, "name"));
      }
      return value;
    }
  }]);

  return Formatter;
}();

Formatter.Rules = _rules.FormattingRules;

exports.default = Formatter;

},{"../../../scripts/raise":8,"../../../scripts/utils":9,"./rules":5}],5:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.FormattingRules = undefined;

var _utils = require("../../utils");

var _utils2 = _interopRequireDefault(_utils);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var FormattingRules = {
  trim: function trim(field, value) {
    return value ? value.replace(/^[\s]+|[\s]+$/g, "") : value;
  },

  removeSpaces: function removeSpaces(field, value) {
    return value ? value.replace(rx, "") : value;
  },

  removeMultipleSpaces: function removeMultipleSpaces(field, value) {
    return value ? value.replace(/\s{2,}/g, " ") : value;
  },

  cleanSpaces: function cleanSpaces(field, value) {
    if (!value) return value;
    return value.replace(/^[\s]+|[\s]+$/g, "").replace(/\s{2,}/g, " ");
  },

  integer: function integer(field, value) {
    if (!value) return;
    //remove leading zeros
    return value ? value.replace(/^0+/, "") : value;
  },

  "zero-fill": function zeroFill(field, value, options) {
    if (!value) return value;
    var l;
    if (_utils2.default.isEmpty(options)) {
      var ml = field.getAttribute("maxlength");
      if (!ml) throw "maxlength is required for the zero-fill formatter";
      l = parseInt(ml);
    } else {
      if (!("length" in options)) {
        throw "missing length in options";
      }
      l = options.length;
    }
    var original = value;
    while (value.length < l) {
      value = "0" + value;
    }
    return value;
  },

  "zero-unfill": function zeroUnfill(field, value) {
    if (!value) return value;
    if (/^0+/.test(value)) value = value.replace(/^0+/, "");
    return value;
  }
}; /**
    * DataEntry built-in formatting rules.
    * https://github.com/RobertoPrevato/DataEntry
    *
    * Copyright 2019, Roberto Prevato
    * https://robertoprevato.github.io
    *
    * Licensed under the MIT license:
    * http://www.opensource.org/licenses/MIT
    */
exports.FormattingRules = FormattingRules;

},{"../../utils":9}],6:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getError = exports.ValidationRules = undefined;

var _utils = require("../../utils");

var _utils2 = _interopRequireDefault(_utils);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var len = _utils2.default.len; /**
                                * DataEntry base validation rules.
                                * https://github.com/RobertoPrevato/DataEntry
                                *
                                * Copyright 2019, Roberto Prevato
                                * https://robertoprevato.github.io
                                *
                                * Licensed under the MIT license:
                                * http://www.opensource.org/licenses/MIT
                                */

var isPlainObject = _utils2.default.isPlainObject;
var isString = _utils2.default.isString;
var isNumber = _utils2.default.isNumber;
var isArray = _utils2.default.isArray;
var isEmpty = _utils2.default.isEmpty;

function getError(message, args) {
  return {
    error: true,
    message: message,
    field: args[0],
    value: args[1],
    params: _utils2.default.toArray(args).splice(2)
  };
}

var ValidationRules = {

  none: function none() {
    return true;
  },

  not: function not(field, value, forced, params) {
    var exclude = params;
    if (_utils2.default.isArray(exclude)) {
      if (_utils2.default.any(exclude, function (x) {
        return x === value;
      })) {
        return getError("cannotBe", arguments);
      }
    }
    if (value === params) {
      return getError("cannotBe", arguments);
    }
    return true;
  },

  noSpaces: function noSpaces(field, value, forced) {
    if (!value) return true;
    if (value.match(/\s/)) return getError("spacesInValue", arguments);
    return true;
  },

  remote: {
    deferred: true,
    fn: function fn(field, value, forced, promiseProvider) {
      if (!promiseProvider) raise(7);
      return promiseProvider.apply(field, arguments);
    }
  },

  required: function required(field, value, forced, params) {
    if (isString(params)) params = { message: params };

    if (!value || isArray(value) && isEmpty(value) || !!value.toString().match(/^\s+$/)) return getError("required", arguments);
    return true;
  },

  integer: function integer(field, value, forced, options) {
    if (!value) return true;
    if (!/^\d+$/.test(value)) return getError("notInteger", arguments);
    if (options) {
      var intVal = parseInt(value);
      if (isNumber(options.min) && intVal < options.min) return getError("minValue", arguments);
      if (isNumber(options.max) && intVal > options.max) return getError("maxValue", arguments);
    }
    return true;
  },

  equal: function equal(field, value, forced, expectedValue) {
    if (value !== expectedValue) {
      return getError("expectedValue", arguments);
    }
    return true;
  },

  letters: function letters(field, value, forced) {
    if (!value) return true;
    if (!/^[a-zA-Z]+$/.test(value)) return getError("canContainOnlyLetters", arguments);
    return true;
  },

  digits: function digits(field, value, forced) {
    if (!value) return true;
    if (!/^\d+$/.test(value)) return getError("canContainOnlyDigits", arguments);
    return true;
  },

  maxLength: function maxLength(field, value, forced, limit) {
    if (!value) return true;

    if (isPlainObject(limit)) {
      limit = limit.length;
    }
    if (!isNumber(limit)) throw "maxLength rule requires a numeric limit (use length option, or params: [num]";

    if (len(value) > limit) return getError("maxLength", arguments);
    return true;
  },

  minLength: function minLength(field, value, forced, limit) {
    if (!value) return false;

    if (isPlainObject(limit)) {
      limit = limit.length;
    }
    if (!isNumber(limit)) throw "minLength rule requires a numeric limit (use length option, or params: [num]";

    if (len(value) < limit) return getError("minLength", arguments);
    return true;
  },

  mustCheck: function mustCheck(field, value, forced, limit) {
    if (!field.checked) return getError("mustBeChecked", arguments);
    return true;
  }
};

exports.ValidationRules = ValidationRules;
exports.getError = getError;

},{"../../utils":9}],7:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }(); /**
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      * DataEntry validator class.
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      * https://github.com/RobertoPrevato/DataEntry
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      *
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      * Copyright 2019, Roberto Prevato
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      * https://robertoprevato.github.io
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      *
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      * Licensed under the MIT license:
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      * http://www.opensource.org/licenses/MIT
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      */

var _utils = require("../../../scripts/utils");

var _utils2 = _interopRequireDefault(_utils);

var _raise = require("../../../scripts/raise");

var _rules = require("./rules");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var len = _utils2.default.len;
var map = _utils2.default.map;
var toArray = _utils2.default.toArray;
var wrap = _utils2.default.wrap;
var each = _utils2.default.each;
var isString = _utils2.default.isString;
var isFunction = _utils2.default.isFunction;
var isPlainObject = _utils2.default.isPlainObject;
var extend = _utils2.default.extend;
var failedValidationErrorKey = "failedValidation";

function ruleParams(args, currentFieldRule) {
  if (!currentFieldRule.params) {
    var extraParams = _utils2.default.omit(currentFieldRule, ["fn", "name"]);
    return args.concat([extraParams]);
  }
  return args.concat(currentFieldRule.params);
}

var Validator = function () {

  /**
   * Creates a new instance of Validator associated with the given dataentry.
   *
   * @param dataentry: instance of DataEntry.
   */
  function Validator(dataentry) {
    _classCallCheck(this, Validator);

    var rules = _utils2.default.clone(Validator.Rules),
        self = this,
        options = dataentry ? dataentry.options : null;
    if (options && options.rules) {
      extend(rules, options.rules);
    }
    self.getError = _rules.getError;
    self.rules = rules;
    self.dataentry = dataentry || {};
    return self;
  }

  _createClass(Validator, [{
    key: "dispose",
    value: function dispose() {
      delete this.rules;
      delete this.dataentry;
    }

    /**
     * Ensures that a validation rule is defined inside this validator.
     * 
     * @param name
     */

  }, {
    key: "checkRule",
    value: function checkRule(name) {
      if (!this.rules[name]) {
        (0, _raise.raise)(3, "missing validation rule: " + name);
      }
    }
  }, {
    key: "normalizeRule",
    value: function normalizeRule(v) {
      if (isPlainObject(v)) {
        return v;
      }

      if (isFunction(v)) {
        return { fn: v };
      }
      (0, _raise.raise)(14, "invalid validation rule definition");
    }
  }, {
    key: "getRule",
    value: function getRule(o) {
      var self = this,
          defaults = {},
          rules = self.rules;

      if (isString(o)) {
        self.checkRule(o);
        return extend({ name: o }, defaults, self.normalizeRule(rules[o]));
      }

      if (isPlainObject(o)) {
        if (!o.name) (0, _raise.raise)(6, "missing name in validation rule");
        self.checkRule(o.name);
        return extend({}, defaults, o, self.normalizeRule(rules[o.name]));
      }

      (0, _raise.raise)(14, "invalid validation rule");
    }
  }, {
    key: "getRules",
    value: function getRules(a) {
      //get validators by name, accepts an array of names
      var v = { direct: [], deferred: [] },
          t = this;
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
  }, {
    key: "validate",
    value: function validate(rules, field, val, forced) {
      var queue = this.getValidationChain(rules);
      return this.chain(queue, field, val, forced);
    }
  }, {
    key: "getValidationChain",
    value: function getValidationChain(a) {
      var v = this.getRules(a),
          chain = [],
          self = this;
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

  }, {
    key: "makeRuleDeferred",
    value: function makeRuleDeferred(f) {
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
  }, {
    key: "localizeError",
    value: function localizeError(error, parameters) {
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

  }, {
    key: "chain",
    value: function chain(queue) {
      if (!len(queue)) return new Promise(function (resolve) {
        resolve([]);
      });

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
            if (ruleMessage) data.message = isFunction(ruleMessage) ? ruleMessage.apply(validator.dataentry, args) : ruleMessage;else {
              var errorKey = data.message;
              var localizedMessage = validator.localizeError(errorKey, ruleParams([], currentFieldRule));
              if (localizedMessage != errorKey) {
                data.errorKey = errorKey;
                data.message = localizedMessage;
              }
            }

            if (currentFieldRule.onError) currentFieldRule.onError.apply(validator.dataentry, args);
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
          reject(a); // reject the validation chain
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
  }]);

  return Validator;
}();

Validator.getError = _rules.getError;
Validator.Rules = _rules.ValidationRules;

exports.default = Validator;

},{"../../../scripts/raise":8,"../../../scripts/utils":9,"./rules":6}],8:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
/**
 * DataEntry raise function.
 * This function is used to raise exceptions that include a link to the GitHub wiki,
 * providing further information and details.
 * https://github.com/RobertoPrevato/DataEntry
 *
 * Copyright 2019, Roberto Prevato
 * https://robertoprevato.github.io
 *
 * Licensed under the MIT license:
 * http://www.opensource.org/licenses/MIT
 */

var raiseSettings = {
  writeToConsole: true
};

/**
 * Raises an exception, offering a link to the GitHub wiki.
 * https://github.com/RobertoPrevato/DataEntry/wiki/Errors
 */
function raise(err, detail) {
  var message = (detail ? detail : "Error") + ". For further details: https://github.com/RobertoPrevato/DataEntry/wiki/Errors#" + err;
  if (raiseSettings.writeToConsole && typeof console != "undefined") {
    console.error(message);
  }
  throw new Error(message);
}

exports.raise = raise;
exports.raiseSettings = raiseSettings;

},{}],9:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _exceptions = require("../scripts/exceptions");

/**
 * Generic utilities to work with objects and functions.
 * https://github.com/RobertoPrevato/DataEntry
 *
 * Copyright 2019, Roberto Prevato
 * https://robertoprevato.github.io
 *
 * Licensed under the MIT license:
 * http://www.opensource.org/licenses/MIT
 */
// 
var OBJECT = "object",
    STRING = "string",
    NUMBER = "number",
    FUNCTION = "function",
    REP = "replace";

/**
* Returns the lenght of the given variable.
* Handles array, object keys, string and any other object with length property.
* 
* @param {*} o 
*/
function len(o) {
  if (!o) return 0;
  if (isString(o)) return o.length;
  if (isPlainObject(o)) {
    var i = 0;
    for (var x in o) {
      i++;
    }
    return i;
  }
  return "length" in o ? o.length : undefined;
}

function map(a, fn) {
  if (!a || !len(a)) {
    if (isPlainObject(a)) {
      var x,
          b = [];
      for (x in a) {
        b.push(fn(x, a[x]));
      }
      return b;
    }
  };
  var b = [];
  for (var i = 0, l = len(a); i < l; i++) {
    b.push(fn(a[i]));
  }return b;
}

function each(a, fn) {
  if (isPlainObject(a)) {
    for (var x in a) {
      fn(a[x], x);
    }return a;
  }
  if (!a || !len(a)) return a;
  for (var i = 0, l = len(a); i < l; i++) {
    fn(a[i], i);
  }
}

function exec(fn, j) {
  for (var i = 0; i < j; i++) {
    fn(i);
  }
}

function isString(s) {
  return (typeof s === "undefined" ? "undefined" : _typeof(s)) == STRING;
}

function isNumber(o) {
  // in JavaScript NaN (Not a Number) if of type "number" (curious..)
  // However, when checking if something is a number it's desirable to return
  // false if it is NaN!
  if (isNaN(o)) {
    return false;
  }
  return (typeof o === "undefined" ? "undefined" : _typeof(o)) == NUMBER;
}

function isFunction(o) {
  return (typeof o === "undefined" ? "undefined" : _typeof(o)) == FUNCTION;
}

function isObject(o) {
  return (typeof o === "undefined" ? "undefined" : _typeof(o)) == OBJECT;
}

function isArray(o) {
  return o instanceof Array;
}

function isDate(o) {
  return o instanceof Date;
}

function isRegExp(o) {
  return o instanceof RegExp;
}

function isPlainObject(o) {
  return (typeof o === "undefined" ? "undefined" : _typeof(o)) == OBJECT && o !== null && o.constructor == Object;
}

function isEmpty(o) {
  if (!o) return true;
  if (isArray(o)) {
    return o.length == 0;
  }
  if (isPlainObject(o)) {
    var x;
    for (x in o) {
      return false;
    }
    return true;
  }
  if (isString(o)) {
    return o === "";
  }
  if (isNumber(o)) {
    return o === 0;
  }
  throw new Error("invalid argument");
}

function hasOwnProperty(o, n) {
  return o && o.hasOwnProperty(n);
}

function upper(s) {
  return s.toUpperCase();
}

function lower(s) {
  return s.toLowerCase();
}

function first(a, fn) {
  if (!fn) {
    return a ? a[0] : undefined;
  }
  for (var i = 0, l = len(a); i < l; i++) {
    if (fn(a[i])) return a[i];
  }
}

function toArray(a) {
  if (isArray(a)) return a;
  if ((typeof a === "undefined" ? "undefined" : _typeof(a)) == OBJECT && len(a)) return map(a, function (o) {
    return o;
  });
  return Array.prototype.slice.call(arguments);
}

function flatten(a) {
  if (isArray(a)) return [].concat.apply([], map(a, flatten));
  return a;
}

var _id = -1;
function uniqueId(name) {
  _id++;
  return (name || "id") + _id;
}

function resetSeed() {
  _id = -1;
}

function keys(o) {
  if (!o) return [];
  var x,
      a = [];
  for (x in o) {
    a.push(x);
  }
  return a;
}

function values(o) {
  if (!o) return [];
  var x,
      a = [];
  for (x in o) {
    a.push(o[x]);
  }
  return a;
}

function minus(o, props) {
  if (!o) return o;
  if (!props) props = [];
  var a = {},
      x;
  for (x in o) {
    if (props.indexOf(x) == -1) {
      a[x] = o[x];
    }
  }
  return a;
}

function isUnd(x) {
  return typeof x === "undefined";
}

/**
 * Deep clones an item (except function types).
 */
function clone(o) {
  var x, a;
  if (o === null) return null;
  if (o === undefined) return undefined;
  if (isObject(o)) {
    if (isArray(o)) {
      a = [];
      for (var i = 0, l = o.length; i < l; i++) {
        a[i] = clone(o[i]);
      }
    } else {
      a = {};
      var v;
      for (x in o) {
        v = o[x];
        if (v === null || v === undefined) {
          a[x] = v;
          continue;
        }
        if (isObject(v)) {
          if (isDate(v)) {
            a[x] = new Date(v.getTime());
          } else if (isRegExp(v)) {
            a[x] = new RegExp(v.source, v.flags);
          } else if (isArray(v)) {
            a[x] = [];
            for (var i = 0, l = v.length; i < l; i++) {
              a[x][i] = clone(v[i]);
            }
          } else {
            a[x] = clone(v);
          }
        } else {
          a[x] = v;
        }
      }
    }
  } else {
    a = o;
  }
  return a;
}

exports.default = {
  extend: function extend() {
    var args = arguments;
    if (!len(args)) return;
    if (len(args) == 1) return args[0];
    var a = args[0],
        b,
        x;
    for (var i = 1, l = len(args); i < l; i++) {
      b = args[i];
      if (!b) continue;
      for (x in b) {
        a[x] = b[x];
      }
    }
    return a;
  },
  stringArgs: function stringArgs(a) {
    if (!a || isUnd(a.length)) throw new Error("expected array argument");
    if (!a.length) return [];
    var l = a.length;
    if (l === 1) {
      var first = a[0];
      if (isString(first) && first.indexOf(" ") > -1) {
        return first.split(/\s+/g);
      }
    }
    return a;
  },


  uniqueId: uniqueId,

  resetSeed: resetSeed,

  flatten: flatten,

  each: each,

  exec: exec,

  keys: keys,

  values: values,

  minus: minus,

  map: map,

  first: first,

  toArray: toArray,

  isArray: isArray,

  isDate: isDate,

  isString: isString,

  isNumber: isNumber,

  isObject: isObject,

  isPlainObject: isPlainObject,

  isEmpty: isEmpty,

  isFunction: isFunction,

  has: hasOwnProperty,

  isNullOrEmptyString: function isNullOrEmptyString(v) {
    return v === null || v === undefined || v === "";
  },


  lower: lower,

  upper: upper,

  /**
   * Duck typing: checks if an object "Quacks like a Promise"
   *
   * @param {Promise} o;
   */
  quacksLikePromise: function quacksLikePromise(o) {
    if (o && _typeof(o.then) == FUNCTION) {
      return true;
    }
    return false;
  },


  /**
   * Returns the sum of values inside an array, eventually by predicate.
   */
  sum: function sum(a, fn) {
    if (!a) return;
    var b,
        l = len(a);
    if (!l) return;
    for (var i = 0, l = len(a); i < l; i++) {
      var v = fn ? fn(a[i]) : a[i];
      if (isUnd(b)) {
        b = v;
      } else {
        b += v;
      }
    }
    return b;
  },


  /**
   * Returns the maximum value inside an array, by predicate.
   */
  max: function max(a, fn) {
    var o = -Infinity;
    for (var i = 0, l = len(a); i < l; i++) {
      var v = fn ? fn(a[i]) : a[i];
      if (v > o) o = v;
    }
    return o;
  },


  /**
   * Returns the minimum value inside an array, by predicate.
   */
  min: function min(a, fn) {
    var o = Infinity;
    for (var i = 0, l = len(a); i < l; i++) {
      var v = fn ? fn(a[i]) : a[i];
      if (v < o) o = v;
    }
    return o;
  },


  /**
   * Returns the item with the maximum value inside an array, by predicate.
   */
  withMax: function withMax(a, fn) {
    var o;
    for (var i = 0, l = len(a); i < l; i++) {
      if (!o) {
        o = a[i];
        continue;
      }
      var v = fn(a[i]);
      if (v > fn(o)) o = a[i];
    }
    return o;
  },


  /**
   * Returns the item with the minimum value inside an array, by predicate.
   */
  withMin: function withMin(a, fn) {
    var o;
    for (var i = 0, l = len(a); i < l; i++) {
      if (!o) {
        o = a[i];
        continue;
      }
      var v = fn(a[i]);
      if (v < fn(o)) o = a[i];
    }
    return o;
  },
  indexOf: function indexOf(a, o) {
    return a.indexOf(o);
  },
  contains: function contains(a, o) {
    if (!a) return false;
    return a.indexOf(o) > -1;
  },


  /**
   * Returns a value indicating whether any object inside an array, or any
   * key-value pair inside an object, respect a given predicate.
   *
   * @param a: input array or object
   * @param fn: predicate to test items or key-value pairs
   */
  any: function any(a, fn) {
    if (isPlainObject(a)) {
      var x;
      for (x in a) {
        if (fn(x, a[x])) return true;
      }
      return false;
    }
    for (var i = 0, l = len(a); i < l; i++) {
      if (fn(a[i])) return true;
    }
    return false;
  },


  /**
   * Returns a value indicating whether all object inside an array, or any
   * key-value pair inside an object, respect a given predicate.
   *
   * @param a: input array or object
   * @param fn: predicate to test items or key-value pairs
   */
  all: function all(a, fn) {
    if (isPlainObject(a)) {
      var x;
      for (x in a) {
        if (!fn(x, a[x])) return false;
      }
      return true;
    }
    for (var i = 0, l = len(a); i < l; i++) {
      if (!fn(a[i])) return false;
    }
    return true;
  },


  /**
   * Finds the first item or property that respects a given predicate.
   */
  find: function find(a, fn) {
    if (!a) return null;
    if (isArray(a)) {
      if (!a || !len(a)) return;
      for (var i = 0, l = len(a); i < l; i++) {
        if (fn(a[i])) return a[i];
      }
    }
    if (isPlainObject(a)) {
      var x;
      for (x in a) {
        if (fn(a[x], x)) return a[x];
      }
    }
    return;
  },
  where: function where(a, fn) {
    if (!a || !len(a)) return [];
    var b = [];
    for (var i = 0, l = len(a); i < l; i++) {
      if (fn(a[i])) b.push(a[i]);
    }
    return b;
  },
  removeItem: function removeItem(a, o) {
    var x = -1;
    for (var i = 0, l = len(a); i < l; i++) {
      if (a[i] === o) {
        x = i;
        break;
      }
    }
    a.splice(x, 1);
  },
  removeItems: function removeItems(a, b) {
    var _this = this;

    each(b, function (toRemove) {
      _this.removeItem(a, toRemove);
    });
  },
  reject: function reject(a, fn) {
    if (!a || !len(a)) return [];
    var b = [];
    for (var i = 0, l = len(a); i < l; i++) {
      if (!fn(a[i])) b.push(a[i]);
    }
    return b;
  },
  pick: function pick(o, arr, exclude) {
    var a = {};
    if (exclude) {
      for (var x in o) {
        if (arr.indexOf(x) == -1) a[x] = o[x];
      }
    } else {
      for (var i = 0, l = len(arr); i < l; i++) {
        var p = arr[i];
        if (hasOwnProperty(o, p)) a[p] = o[p];
      }
    }
    return a;
  },
  omit: function omit(a, arr) {
    return this.pick(a, arr, 1);
  },


  /**
   * Requires an object to be defined and to have the given properties.
   *
   * @param {Object} o: object to validate
   * @param {String[]} props: list of properties to require
   * @param {string} [name=options]:
   */
  require: function require(o, props, name) {
    if (!name) name = "options";
    var error = "";
    if (o) {
      this.each(props, function (x) {
        if (!hasOwnProperty(o, x)) {
          error += "missing '" + x + "' in " + name;
        }
      });
    } else {
      error = "missing " + name;
    }
    if (error) throw new Error(error);
  },
  wrap: function wrap(fn, callback, context) {
    var wrapper = function wrapper() {
      return callback.apply(this, [fn].concat(toArray(arguments)));
    };
    wrapper.bind(context || this);
    return wrapper;
  },
  unwrap: function (_unwrap) {
    function unwrap(_x) {
      return _unwrap.apply(this, arguments);
    }

    unwrap.toString = function () {
      return _unwrap.toString();
    };

    return unwrap;
  }(function (o) {
    return isFunction(o) ? unwrap(o()) : o;
  }),
  defer: function defer(fn) {
    setTimeout(fn, 0);
  },


  /**
   * Returns a new function that can be invoked at most n times.
   */
  atMost: function atMost(n, fn, context) {
    var m = n,
        result;
    function a() {
      if (n > 0) {
        n--;
        result = fn.apply(context || this, arguments);
      }
      return result;
    }
    return a;
  },


  isUnd: isUnd,

  /**
   * Returns a new function that can be invoked at most once.
   */
  once: function once(fn, context) {
    return this.atMost(1, fn, context);
  },


  /**
   * Returns a new function that is executed always passing the given arguments to it.
   * Python-fashion.
  */
  partial: function partial(fn) {
    var self = this;
    var args = self.toArray(arguments);
    args.shift();
    return function partial() {
      var bargs = self.toArray(arguments);
      return fn.apply({}, args.concat(bargs));
    };
  },


  clone: clone,

  /**
   * Returns a new function that can be fired only once every n milliseconds.
   * The function is fired after the timeout, and as late as possible.
   *
   * @param fn: function
   * @param ms: milliseconds
   * @param {any} context: function context.
   */
  debounce: function debounce(fn, ms, context) {
    var it;
    function d() {
      if (it) {
        clearTimeout(it);
      }
      var args = arguments.length ? toArray(arguments) : undefined;
      it = setTimeout(function () {
        it = null;
        fn.apply(context, args);
      }, ms);
    }
    return d;
  },


  /**
   * Edits the items of an array by using a given function.
   *
   * @param {array} a: array of items.
   * @param {function} fn: editing function.
   */
  reach: function reach(a, fn) {
    if (!isArray(a)) throw new Error("expected array");
    var item;
    for (var i = 0, l = a.length; i < l; i++) {
      item = a[i];
      if (isArray(item)) {
        this.reach(item, fn);
      } else {
        a[i] = fn(item);
      }
    }
    return a;
  },


  /**
   * Returns a value indicating whether the given object implements all given methods.
   */
  quacks: function quacks(o, methods) {
    if (!o) return false;
    if (!methods) throw "missing methods list";
    if (isString(methods)) {
      methods = toArray(arguments).slice(1, arguments.length);
    }
    for (var i = 0, l = methods.length; i < l; i++) {
      if (!isFunction(o[methods[i]])) {
        return false;
      }
    }
    return true;
  },


  /**
   * Replaces values in strings, using mustaches.
   */
  format: function format(s, o) {
    return s.replace(/\{\{(.+?)\}\}/g, function (s, a) {
      if (!o.hasOwnProperty(a)) return s;
      return o[a];
    });
  },


  /**
   * Proxy function to fn bind.
   */
  bind: function bind(fn, o) {
    return fn.bind(o);
  },
  ifcall: function ifcall(fn, ctx, args) {
    if (!fn) return;
    if (!args) {
      fn.call(ctx);
      return;
    }
    switch (args.length) {
      case 0:
        fn.call(ctx);return;
      case 1:
        fn.call(ctx, args[0]);return;
      case 2:
        fn.call(ctx, args[0], args[1]);return;
      case 3:
        fn.call(ctx, args[0], args[1], args[2]);return;
      default:
        fn.apply(ctx, args);
    }
  },


  len: len,

  nil: function nil(v) {
    return v === null || v === undefined;
  },
  nilOrEmpty: function nilOrEmpty(v) {
    return v === null || v === undefined || v === "";
  }
};

},{"../scripts/exceptions":2}],10:[function(require,module,exports){
"use strict";

var _dataentry = require("../code/scripts/forms/dataentry");

var _dataentry2 = _interopRequireDefault(_dataentry);

var _validator = require("../code/scripts/forms/validation/validator");

var _validator2 = _interopRequireDefault(_validator);

var _formatter = require("../code/scripts/forms/formatting/formatter");

var _formatter2 = _interopRequireDefault(_formatter);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

if (typeof window != "undefined") {
  window.DataEntry = {
    DataEntry: _dataentry2.default,
    Validator: _validator2.default,
    Formatter: _formatter2.default
  };
} /**
   * Core DataEntry classes.
   * https://github.com/RobertoPrevato/DataEntry
   *
   * Copyright 2019, Roberto Prevato
   * https://robertoprevato.github.io
   *
   * Licensed under the MIT license:
   * http://www.opensource.org/licenses/MIT
   */


module.exports = {
  DataEntry: _dataentry2.default,
  Validator: _validator2.default,
  Formatter: _formatter2.default
};

},{"../code/scripts/forms/dataentry":3,"../code/scripts/forms/formatting/formatter":4,"../code/scripts/forms/validation/validator":7}]},{},[10])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJjb2RlL3NjcmlwdHMvY29tcG9uZW50cy9ldmVudHMuanMiLCJjb2RlL3NjcmlwdHMvZXhjZXB0aW9ucy5qcyIsImNvZGUvc2NyaXB0cy9mb3Jtcy9kYXRhZW50cnkuanMiLCJjb2RlL3NjcmlwdHMvZm9ybXMvZm9ybWF0dGluZy9mb3JtYXR0ZXIuanMiLCJjb2RlL3NjcmlwdHMvZm9ybXMvZm9ybWF0dGluZy9ydWxlcy5qcyIsImNvZGUvc2NyaXB0cy9mb3Jtcy92YWxpZGF0aW9uL3J1bGVzLmpzIiwiY29kZS9zY3JpcHRzL2Zvcm1zL3ZhbGlkYXRpb24vdmFsaWRhdG9yLmpzIiwiY29kZS9zY3JpcHRzL3JhaXNlLmpzIiwiY29kZS9zY3JpcHRzL3V0aWxzLmpzIiwiZGlzdHJpYnV0aW9uZmlsZXMvZGF0YWVudHJ5LmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7Ozs7OFFDQUE7Ozs7Ozs7Ozs7OztBQVVBOzs7Ozs7OztBQUVBLElBQUksUUFBUSxFQUFaO0FBQ0EsSUFBSSxPQUFPLE1BQU0sSUFBakI7QUFDQSxJQUFJLFFBQVEsTUFBTSxLQUFsQjtBQUNBLElBQUksU0FBUyxNQUFNLE1BQW5COztBQUVBO0FBQ0EsSUFBTSxnQkFBZ0IsS0FBdEI7O0FBRUEsSUFBSSxZQUFZLFNBQVosU0FBWSxDQUFVLEdBQVYsRUFBZSxNQUFmLEVBQXVCLElBQXZCLEVBQTZCLElBQTdCLEVBQW1DO0FBQ2pELE1BQUksQ0FBQyxJQUFMLEVBQVcsT0FBTyxJQUFQOztBQUVYO0FBQ0EsTUFBSSxRQUFPLElBQVAseUNBQU8sSUFBUCxPQUFnQixRQUFwQixFQUE4QjtBQUM1QixTQUFLLElBQUksR0FBVCxJQUFnQixJQUFoQixFQUFzQjtBQUNwQixVQUFJLE1BQUosRUFBWSxLQUFaLENBQWtCLEdBQWxCLEVBQXVCLENBQUMsR0FBRCxFQUFNLEtBQUssR0FBTCxDQUFOLEVBQWlCLE1BQWpCLENBQXdCLElBQXhCLENBQXZCO0FBQ0Q7QUFDRCxXQUFPLEtBQVA7QUFDRDs7QUFFRDtBQUNBLE1BQUksY0FBYyxJQUFkLENBQW1CLElBQW5CLENBQUosRUFBOEI7QUFDNUIsUUFBSSxRQUFRLEtBQUssS0FBTCxDQUFXLGFBQVgsQ0FBWjtBQUNBLFNBQUssSUFBSSxJQUFJLENBQVIsRUFBVyxJQUFJLE1BQU0sTUFBMUIsRUFBa0MsSUFBSSxDQUF0QyxFQUF5QyxHQUF6QyxFQUE4QztBQUM1QyxVQUFJLE1BQUosRUFBWSxLQUFaLENBQWtCLEdBQWxCLEVBQXVCLENBQUMsTUFBTSxDQUFOLENBQUQsRUFBVyxNQUFYLENBQWtCLElBQWxCLENBQXZCO0FBQ0Q7QUFDRCxXQUFPLEtBQVA7QUFDRDs7QUFFRCxTQUFPLElBQVA7QUFDRCxDQXJCRDs7QUF1QkEsSUFBSSxnQkFBZ0IsU0FBaEIsYUFBZ0IsQ0FBVSxNQUFWLEVBQWtCLElBQWxCLEVBQXdCO0FBQzFDLE1BQUksRUFBSjtBQUFBLE1BQVEsSUFBSSxDQUFDLENBQWI7QUFBQSxNQUFnQixJQUFJLE9BQU8sTUFBM0I7QUFBQSxNQUFtQyxLQUFLLEtBQUssQ0FBTCxDQUF4QztBQUFBLE1BQWlELEtBQUssS0FBSyxDQUFMLENBQXREO0FBQUEsTUFBK0QsS0FBSyxLQUFLLENBQUwsQ0FBcEU7QUFDQSxVQUFRLEtBQUssTUFBYjtBQUNFLFNBQUssQ0FBTDtBQUFRLGFBQU8sRUFBRSxDQUFGLEdBQU0sQ0FBYjtBQUFnQixTQUFDLEtBQUssT0FBTyxDQUFQLENBQU4sRUFBaUIsUUFBakIsQ0FBMEIsSUFBMUIsQ0FBK0IsR0FBRyxHQUFsQztBQUFoQixPQUF3RDtBQUNoRSxTQUFLLENBQUw7QUFBUSxhQUFPLEVBQUUsQ0FBRixHQUFNLENBQWI7QUFBZ0IsU0FBQyxLQUFLLE9BQU8sQ0FBUCxDQUFOLEVBQWlCLFFBQWpCLENBQTBCLElBQTFCLENBQStCLEdBQUcsR0FBbEMsRUFBdUMsRUFBdkM7QUFBaEIsT0FBNEQ7QUFDcEUsU0FBSyxDQUFMO0FBQVEsYUFBTyxFQUFFLENBQUYsR0FBTSxDQUFiO0FBQWdCLFNBQUMsS0FBSyxPQUFPLENBQVAsQ0FBTixFQUFpQixRQUFqQixDQUEwQixJQUExQixDQUErQixHQUFHLEdBQWxDLEVBQXVDLEVBQXZDLEVBQTJDLEVBQTNDO0FBQWhCLE9BQWdFO0FBQ3hFLFNBQUssQ0FBTDtBQUFRLGFBQU8sRUFBRSxDQUFGLEdBQU0sQ0FBYjtBQUFnQixTQUFDLEtBQUssT0FBTyxDQUFQLENBQU4sRUFBaUIsUUFBakIsQ0FBMEIsSUFBMUIsQ0FBK0IsR0FBRyxHQUFsQyxFQUF1QyxFQUF2QyxFQUEyQyxFQUEzQyxFQUErQyxFQUEvQztBQUFoQixPQUFvRTtBQUM1RTtBQUFTLGFBQU8sRUFBRSxDQUFGLEdBQU0sQ0FBYjtBQUFnQixTQUFDLEtBQUssT0FBTyxDQUFQLENBQU4sRUFBaUIsUUFBakIsQ0FBMEIsS0FBMUIsQ0FBZ0MsR0FBRyxHQUFuQyxFQUF3QyxJQUF4QztBQUFoQixPQUxYO0FBT0QsQ0FURDs7QUFXQTtBQUNBO0FBQ0E7O0lBQ3FCLGE7Ozs7Ozs7OztBQUVuQjtBQUNBO3VCQUNHLEksRUFBTSxRLEVBQVUsTyxFQUFTO0FBQzFCLFVBQUksQ0FBQyxVQUFVLElBQVYsRUFBZ0IsSUFBaEIsRUFBc0IsSUFBdEIsRUFBNEIsQ0FBQyxRQUFELEVBQVcsT0FBWCxDQUE1QixDQUFELElBQXFELENBQUMsUUFBMUQsRUFBb0UsT0FBTyxJQUFQO0FBQ3BFLFdBQUssT0FBTCxLQUFpQixLQUFLLE9BQUwsR0FBZSxFQUFoQztBQUNBLFVBQUksU0FBUyxLQUFLLE9BQUwsQ0FBYSxJQUFiLE1BQXVCLEtBQUssT0FBTCxDQUFhLElBQWIsSUFBcUIsRUFBNUMsQ0FBYjtBQUNBLGFBQU8sSUFBUCxDQUFZLEVBQUUsVUFBVSxRQUFaLEVBQXNCLFNBQVMsT0FBL0IsRUFBd0MsS0FBSyxXQUFXLElBQXhELEVBQVo7QUFDQSxhQUFPLElBQVA7QUFDRDs7QUFFRDtBQUNBOzs7O3lCQUNLLEksRUFBTSxRLEVBQVUsTyxFQUFTO0FBQzVCLFVBQUksQ0FBQyxVQUFVLElBQVYsRUFBZ0IsTUFBaEIsRUFBd0IsSUFBeEIsRUFBOEIsQ0FBQyxRQUFELEVBQVcsT0FBWCxDQUE5QixDQUFELElBQXVELENBQUMsUUFBNUQsRUFBc0UsT0FBTyxJQUFQO0FBQ3RFLFVBQUksT0FBTyxJQUFYO0FBQ0EsVUFBSSxPQUFPLGdCQUFFLElBQUYsQ0FBTyxZQUFZO0FBQzVCLGFBQUssR0FBTCxDQUFTLElBQVQsRUFBZSxJQUFmO0FBQ0EsaUJBQVMsS0FBVCxDQUFlLElBQWYsRUFBcUIsU0FBckI7QUFDRCxPQUhVLENBQVg7QUFJQSxXQUFLLFNBQUwsR0FBaUIsUUFBakI7QUFDQSxhQUFPLEtBQUssRUFBTCxDQUFRLElBQVIsRUFBYyxJQUFkLEVBQW9CLE9BQXBCLENBQVA7QUFDRDs7QUFFRDs7Ozt3QkFDSSxJLEVBQU0sUSxFQUFVLE8sRUFBUztBQUMzQixVQUFJLE1BQUosRUFBWSxFQUFaLEVBQWdCLE1BQWhCLEVBQXdCLEtBQXhCLEVBQStCLENBQS9CLEVBQWtDLENBQWxDLEVBQXFDLENBQXJDLEVBQXdDLENBQXhDO0FBQ0EsVUFBSSxDQUFDLEtBQUssT0FBTixJQUFpQixDQUFDLFVBQVUsSUFBVixFQUFnQixLQUFoQixFQUF1QixJQUF2QixFQUE2QixDQUFDLFFBQUQsRUFBVyxPQUFYLENBQTdCLENBQXRCLEVBQXlFLE9BQU8sSUFBUDtBQUN6RSxVQUFJLENBQUMsSUFBRCxJQUFTLENBQUMsUUFBVixJQUFzQixDQUFDLE9BQTNCLEVBQW9DO0FBQ2xDLGFBQUssT0FBTCxHQUFlLEVBQWY7QUFDQSxlQUFPLElBQVA7QUFDRDs7QUFFRCxjQUFRLE9BQU8sQ0FBQyxJQUFELENBQVAsR0FBZ0IsZ0JBQUUsSUFBRixDQUFPLEtBQUssT0FBWixDQUF4QjtBQUNBLFdBQUssSUFBSSxDQUFKLEVBQU8sSUFBSSxNQUFNLE1BQXRCLEVBQThCLElBQUksQ0FBbEMsRUFBcUMsR0FBckMsRUFBMEM7QUFDeEMsZUFBTyxNQUFNLENBQU4sQ0FBUDtBQUNBLFlBQUksU0FBUyxLQUFLLE9BQUwsQ0FBYSxJQUFiLENBQWIsRUFBaUM7QUFDL0IsZUFBSyxPQUFMLENBQWEsSUFBYixJQUFxQixTQUFTLEVBQTlCO0FBQ0EsY0FBSSxZQUFZLE9BQWhCLEVBQXlCO0FBQ3ZCLGlCQUFLLElBQUksQ0FBSixFQUFPLElBQUksT0FBTyxNQUF2QixFQUErQixJQUFJLENBQW5DLEVBQXNDLEdBQXRDLEVBQTJDO0FBQ3pDLG1CQUFLLE9BQU8sQ0FBUCxDQUFMO0FBQ0Esa0JBQUssWUFBWSxhQUFhLEdBQUcsUUFBNUIsSUFBd0MsYUFBYSxHQUFHLFFBQUgsQ0FBWSxTQUFsRSxJQUNILFdBQVcsWUFBWSxHQUFHLE9BRDNCLEVBQ3FDO0FBQ25DLHVCQUFPLElBQVAsQ0FBWSxFQUFaO0FBQ0Q7QUFDRjtBQUNGO0FBQ0QsY0FBSSxDQUFDLE9BQU8sTUFBWixFQUFvQixPQUFPLEtBQUssT0FBTCxDQUFhLElBQWIsQ0FBUDtBQUNyQjtBQUNGOztBQUVELGFBQU8sSUFBUDtBQUNEOztBQUVEOzs7OzRCQUNRLEksRUFBTTtBQUNaLFVBQUksQ0FBQyxLQUFLLE9BQVYsRUFBbUIsT0FBTyxJQUFQO0FBQ25CLFVBQUksT0FBTyxNQUFNLElBQU4sQ0FBVyxTQUFYLEVBQXNCLENBQXRCLENBQVg7QUFDQSxVQUFJLENBQUMsVUFBVSxJQUFWLEVBQWdCLFNBQWhCLEVBQTJCLElBQTNCLEVBQWlDLElBQWpDLENBQUwsRUFBNkMsT0FBTyxJQUFQO0FBQzdDLFVBQUksU0FBUyxLQUFLLE9BQUwsQ0FBYSxJQUFiLENBQWI7QUFDQSxVQUFJLFlBQVksS0FBSyxPQUFMLENBQWEsR0FBN0I7QUFDQSxVQUFJLE1BQUosRUFBWSxjQUFjLE1BQWQsRUFBc0IsSUFBdEI7QUFDWixVQUFJLFNBQUosRUFBZSxjQUFjLFNBQWQsRUFBeUIsU0FBekI7QUFDZixhQUFPLElBQVA7QUFDRDs7QUFFRDs7Ozt5QkFDSyxJLEVBQU07QUFDVCxhQUFPLEtBQUssT0FBTCxDQUFhLElBQWIsQ0FBUDtBQUNEOztBQUVEO0FBQ0E7Ozs7a0NBQ2MsRyxFQUFLLEksRUFBTSxRLEVBQVU7QUFDakMsVUFBSSxZQUFZLEtBQUssVUFBckI7QUFDQSxVQUFJLENBQUMsU0FBTCxFQUFnQixPQUFPLElBQVA7QUFDaEIsVUFBSSxpQkFBaUIsQ0FBQyxJQUFELElBQVMsQ0FBQyxRQUEvQjtBQUNBLFVBQUksUUFBTyxJQUFQLHlDQUFPLElBQVAsT0FBZ0IsUUFBcEIsRUFBOEIsV0FBVyxJQUFYO0FBQzlCLFVBQUksR0FBSixFQUFTLENBQUMsWUFBWSxFQUFiLEVBQWlCLElBQUksV0FBckIsSUFBb0MsR0FBcEM7QUFDVCxXQUFLLElBQUksRUFBVCxJQUFlLFNBQWYsRUFBMEI7QUFDeEIsa0JBQVUsRUFBVixFQUFjLEdBQWQsQ0FBa0IsSUFBbEIsRUFBd0IsUUFBeEIsRUFBa0MsSUFBbEM7QUFDQSxZQUFJLGNBQUosRUFBb0IsT0FBTyxLQUFLLFVBQUwsQ0FBZ0IsRUFBaEIsQ0FBUDtBQUNyQjtBQUNELGFBQU8sSUFBUDtBQUNEOzs7NkJBRVEsRyxFQUFLLEksRUFBTSxRLEVBQVU7QUFDNUI7QUFDQSxVQUFJLFVBQVUsTUFBVixJQUFvQixDQUFwQixJQUF5QixRQUFPLElBQVAseUNBQU8sSUFBUCxNQUFlLFFBQTVDLEVBQXNEO0FBQ3BELFlBQUksQ0FBSjtBQUNBLGFBQUssQ0FBTCxJQUFVLElBQVYsRUFBZ0I7QUFDZCxlQUFLLFFBQUwsQ0FBYyxHQUFkLEVBQW1CLENBQW5CLEVBQXNCLEtBQUssQ0FBTCxDQUF0QjtBQUNEO0FBQ0QsZUFBTyxJQUFQO0FBQ0Q7O0FBRUQsVUFBSSxZQUFZLEtBQUssVUFBTCxLQUFvQixLQUFLLFVBQUwsR0FBa0IsRUFBdEMsQ0FBaEI7QUFDQSxVQUFJLEtBQUssSUFBSSxXQUFKLEtBQW9CLElBQUksV0FBSixHQUFrQixnQkFBRSxRQUFGLENBQVcsR0FBWCxDQUF0QyxDQUFUO0FBQ0EsZ0JBQVUsRUFBVixJQUFnQixHQUFoQjtBQUNBLFVBQUksUUFBTyxJQUFQLHlDQUFPLElBQVAsT0FBZ0IsUUFBcEIsRUFBOEIsV0FBVyxJQUFYO0FBQzlCLFVBQUksRUFBSixDQUFPLElBQVAsRUFBYSxRQUFiLEVBQXVCLElBQXZCO0FBQ0EsYUFBTyxJQUFQO0FBQ0Q7OztpQ0FFWSxHLEVBQUssSSxFQUFNLFEsRUFBVTtBQUNoQyxVQUFJLFlBQVksS0FBSyxVQUFMLEtBQW9CLEtBQUssVUFBTCxHQUFrQixFQUF0QyxDQUFoQjtBQUNBLFVBQUksS0FBSyxJQUFJLFdBQUosS0FBb0IsSUFBSSxXQUFKLEdBQWtCLGdCQUFFLFFBQUYsQ0FBVyxHQUFYLENBQXRDLENBQVQ7QUFDQSxnQkFBVSxFQUFWLElBQWdCLEdBQWhCO0FBQ0EsVUFBSSxRQUFPLElBQVAseUNBQU8sSUFBUCxPQUFnQixRQUFwQixFQUE4QixXQUFXLElBQVg7QUFDOUIsVUFBSSxJQUFKLENBQVMsSUFBVCxFQUFlLFFBQWYsRUFBeUIsSUFBekI7QUFDQSxhQUFPLElBQVA7QUFDRDs7Ozs7O2tCQWhIa0IsYTtBQWlIcEI7Ozs7Ozs7O0FDMUtEOzs7Ozs7Ozs7O0FBVUEsSUFBTSxXQUFXLEtBQWpCOztBQUVBLFNBQVMscUJBQVQsQ0FBK0IsSUFBL0IsRUFBcUM7QUFDbkMsUUFBTSxJQUFJLEtBQUosQ0FBVSxvQ0FBb0MsUUFBUSxRQUE1QyxDQUFWLENBQU47QUFDRDs7QUFFRCxTQUFTLGlCQUFULENBQTJCLE9BQTNCLEVBQW9DO0FBQ2xDLFFBQU0sSUFBSSxLQUFKLENBQVUsd0JBQXdCLFdBQVcsUUFBbkMsQ0FBVixDQUFOO0FBQ0Q7O0FBRUQsU0FBUyxhQUFULENBQXVCLElBQXZCLEVBQTZCLFlBQTdCLEVBQTJDO0FBQ3pDLFFBQU0sSUFBSSxLQUFKLENBQVUsMEJBQTBCLFFBQVEsUUFBbEMsSUFBOEMsWUFBOUMsSUFBOEQsUUFBUSxRQUF0RSxDQUFWLENBQU47QUFDRDs7QUFFRCxTQUFTLGtCQUFULENBQTRCLElBQTVCLEVBQWtDO0FBQ2hDLFFBQU0sSUFBSSxLQUFKLENBQVUsd0JBQXdCLElBQWxDLENBQU47QUFDRDs7UUFHQyxpQixHQUFBLGlCO1FBQ0EscUIsR0FBQSxxQjtRQUNBLGEsR0FBQSxhO1FBQ0Esa0IsR0FBQSxrQjs7Ozs7Ozs7Ozs7QUN0QkY7Ozs7QUFDQTs7QUFDQTs7OztBQUNBOzs7O0FBQ0E7Ozs7Ozs7Ozs7K2VBZEE7Ozs7Ozs7Ozs7OztBQWdCQSxJQUFNLFVBQVUsT0FBaEI7O0FBRUEsSUFBTSxXQUFXOztBQUVmLDBCQUF3QixJQUZULEVBRWU7O0FBRTlCLHFCQUFtQixJQUpKLEVBSVU7O0FBRXpCLGFBQVcsbUJBTkk7O0FBUWYsYUFBVyxtQkFSSTs7QUFVZixhQUFXLElBVkksRUFVRTs7QUFFakIsVUFBUSxJQVpPOztBQWNmLGlCQUFlLFNBZEEsQ0FjVTtBQWRWLENBQWpCOztBQWlCQSxJQUFNLE1BQU0sZ0JBQUUsR0FBZDtBQUNBLElBQU0sV0FBVyxnQkFBRSxRQUFuQjtBQUNBLElBQU0sZ0JBQWdCLGdCQUFFLGFBQXhCO0FBQ0EsSUFBTSxhQUFhLGdCQUFFLFVBQXJCO0FBQ0EsSUFBTSxVQUFVLGdCQUFFLE9BQWxCO0FBQ0EsSUFBTSxTQUFTLGdCQUFFLE1BQWpCO0FBQ0EsSUFBTSxPQUFPLGdCQUFFLElBQWY7QUFDQSxJQUFNLE9BQU8sZ0JBQUUsSUFBZjtBQUNBLElBQU0sUUFBUSxnQkFBRSxLQUFoQjtBQUNBLElBQU0sT0FBTyxnQkFBRSxJQUFmO0FBQ0EsSUFBTSxXQUFXLGdCQUFFLFFBQW5CO0FBQ0EsSUFBTSxVQUFVLGdCQUFFLE9BQWxCO0FBQ0EsSUFBTSxRQUFRLGdCQUFFLEtBQWhCOztBQUdBLFNBQVMsYUFBVCxDQUF1QixDQUF2QixFQUEwQixTQUExQixFQUFxQztBQUNuQyxNQUFJLENBQUMsQ0FBTCxFQUNFLE9BQU8sSUFBUDs7QUFFRixNQUFJLEVBQUUsU0FBTixFQUFpQjtBQUNmLFdBQU8sSUFBSSxDQUFKLENBQU0sU0FBTixDQUFQO0FBQ0Q7QUFDRCxTQUFPLENBQVA7QUFDRDs7QUFHRCxTQUFTLGlCQUFULENBQTJCLEdBQTNCLEVBQWdDO0FBQzlCLE1BQUksQ0FBQyxnQkFBRSxNQUFGLENBQVMsR0FBVCxFQUFjLENBQUMsR0FBRCxFQUFNLFFBQU4sQ0FBZCxDQUFMLEVBQXFDO0FBQ25DLHNCQUFNLEVBQU4sRUFBVSx5RUFBVjtBQUNEO0FBQ0Y7O0lBR0ssUzs7Ozs7d0JBRWlCO0FBQ25CLGFBQU8sT0FBUDtBQUNEOztBQUVEOzs7Ozs7Ozs7QUFNQSxxQkFBWSxPQUFaLEVBQXFCO0FBQUE7O0FBQUE7O0FBRW5CLFFBQUksQ0FBQyxPQUFMLEVBQWMsa0JBQU0sQ0FBTixFQUFTLGlCQUFULEVBRkssQ0FFd0I7QUFDM0MsUUFBSSxDQUFDLFFBQVEsTUFBYixFQUFxQixrQkFBTSxDQUFOLEVBQVMsZ0JBQVQsRUFIRixDQUc4Qjs7QUFFakQsUUFBSSxZQUFKO0FBQUEsUUFBaUIsaUJBQWlCLFVBQVUsY0FBNUM7O0FBRUEsV0FBTyxJQUFQLEVBQWEsS0FBSyxPQUFMLEVBQWMsY0FBZCxDQUFiO0FBQ0EsU0FBSyxPQUFMLEdBQWUsVUFBVSxPQUFPLEVBQVAsRUFBVyxVQUFVLFFBQXJCLEVBQStCLEtBQUssT0FBTCxFQUFjLGNBQWQsRUFBOEIsQ0FBOUIsQ0FBL0IsQ0FBekI7O0FBRUEsUUFBSSxlQUFlLEVBQW5CO0FBQ0EsU0FBSyxDQUFDLFFBQUQsRUFBVyxXQUFYLEVBQXdCLFdBQXhCLENBQUwsRUFBMkMsZ0JBQVE7QUFDakQsVUFBSSxDQUFDLFFBQVEsSUFBUixDQUFMLEVBQW9CLGFBQWEsSUFBYixDQUFrQixJQUFsQjtBQUNyQixLQUZEO0FBR0EsUUFBSSxhQUFhLE1BQWpCLEVBQXlCO0FBQ3ZCLHdCQUFNLENBQU4sRUFBUyxzQkFBc0IsYUFBYSxJQUFiLENBQWtCLElBQWxCLENBQS9CO0FBQ0Q7O0FBRUQsUUFBTSxZQUFZLFFBQVEsU0FBMUI7QUFDQSxRQUFJLFNBQUosRUFDRSxrQkFBa0IsU0FBbEI7QUFDRixTQUFLLFNBQUwsR0FBaUIsU0FBakI7O0FBRUEsU0FBSyxDQUNILFFBREcsRUFFSCxXQUZHLEVBR0gsV0FIRyxFQUlILFdBSkcsRUFLSCxRQUxHLENBQUwsRUFLYSxnQkFBUTtBQUNuQixXQUFLLElBQUwsSUFBYSxjQUFjLFFBQVEsSUFBUixDQUFkLEVBQTZCLElBQTdCLENBQWI7QUFDRCxLQVBEO0FBdkJtQjtBQStCcEI7O0FBRUQ7Ozs7Ozs7Ozs7O0FBV0E7Ozs4QkFHVTtBQUNSLFVBQUksT0FBTyxJQUFYO0FBQ0EsV0FBSyxDQUNILFFBREcsRUFFSCxRQUZHLEVBR0gsV0FIRyxFQUlILFdBSkcsRUFLSCxXQUxHLEVBTUgsU0FORyxDQUFMLEVBTWMsZ0JBQVE7QUFDcEIsWUFBSSxJQUFJLEtBQUssSUFBTCxDQUFSO0FBQ0EsWUFBSSxLQUFLLEVBQUUsT0FBWCxFQUNFLEVBQUUsT0FBRjtBQUNGLGVBQU8sS0FBSyxJQUFMLENBQVA7QUFDRCxPQVhEO0FBWUEsV0FBSyxDQUFDLG1CQUFELENBQUwsRUFBNEIsZ0JBQVE7QUFDbEMsZUFBTyxLQUFLLE9BQUwsQ0FBYSxJQUFiLENBQVA7QUFDRCxPQUZEO0FBR0EsYUFBTyxLQUFLLE9BQVo7QUFDQTtBQUNBLFdBQUssR0FBTDtBQUNBLFdBQUssYUFBTDtBQUNBLGFBQU8sSUFBUDtBQUNEOztBQUVEOzs7Ozs7Ozs7OzZCQU9TLE0sRUFBUSxPLEVBQVM7QUFDeEIsVUFBSSxPQUFPLElBQVg7QUFDQSxnQkFBVSxXQUFXLEVBQXJCO0FBQ0EsVUFBSSxVQUFVLFdBQVcsTUFBWCxDQUFkLEVBQWtDLFNBQVMsT0FBTyxJQUFQLENBQVksSUFBWixDQUFUO0FBQ2xDLFVBQUksVUFBVSxDQUFDLFFBQVEsTUFBUixDQUFmLEVBQWdDLGtCQUFNLENBQU4sRUFBUyx3REFBVCxFQUpSLENBSTRFOztBQUVwRyxVQUFJLFNBQVMsS0FBSyxNQUFsQjtBQUNBLFVBQUksQ0FBQyxNQUFMLEVBQWEsa0JBQU0sRUFBTjs7QUFFYixhQUFPLElBQUksT0FBSixDQUFZLFVBQVUsT0FBVixFQUFtQixNQUFuQixFQUEyQjtBQUM1QyxZQUFJLFFBQVEsRUFBWjtBQUFBLFlBQWdCLG1CQUFtQixFQUFuQztBQUNBLGFBQUssSUFBSSxDQUFULElBQWMsTUFBZCxFQUFzQjtBQUNwQixjQUFJLFVBQVUsQ0FBQyxTQUFTLE1BQVQsRUFBaUIsQ0FBakIsQ0FBZixFQUFvQztBQUNwQywyQkFBaUIsSUFBakIsQ0FBc0IsQ0FBdEIsRUFGb0IsQ0FFTTtBQUMzQjs7QUFFRCxnQkFBUSxnQkFBUixHQUEyQixnQkFBM0IsQ0FQNEMsQ0FPQzs7QUFFN0MsYUFBSyxnQkFBTCxFQUF1QixxQkFBYTtBQUNsQyxnQkFBTSxJQUFOLENBQVcsS0FBSyxhQUFMLENBQW1CLFNBQW5CLEVBQThCLE9BQTlCLENBQVg7QUFDRCxTQUZEOztBQUtBLGdCQUFRLEdBQVIsQ0FBWSxLQUFaLEVBQW1CLElBQW5CLENBQXdCLFVBQVUsQ0FBVixFQUFhO0FBQ25DLGNBQUksT0FBTyxRQUFRLENBQVIsQ0FBWDtBQUNBLGNBQUksU0FBUyxNQUFNLElBQU4sRUFBWSxVQUFVLENBQVYsRUFBYTtBQUFFLG1CQUFPLEtBQUssRUFBRSxLQUFkO0FBQXNCLFdBQWpELENBQWI7QUFDQSxjQUFJLElBQUksTUFBSixDQUFKLEVBQWlCO0FBQ2YsaUJBQUssT0FBTCxDQUFhLGFBQWIsRUFBNEIsT0FBTyxDQUFQLENBQTVCO0FBQ0EsaUJBQUssT0FBTCxDQUFhLFFBQWIsRUFBdUIsTUFBdkI7O0FBRUE7QUFDQSxvQkFBUSxJQUFSLENBQWEsSUFBYixFQUFtQjtBQUNqQixxQkFBTyxLQURVO0FBRWpCLHNCQUFRO0FBRlMsYUFBbkI7QUFJRCxXQVRELE1BU087QUFDTDtBQUNBLG9CQUFRLElBQVIsQ0FBYSxJQUFiLEVBQW1CO0FBQ2pCLHFCQUFPLElBRFU7QUFFakIsc0JBQVEsS0FBSyxTQUFMLENBQWUsU0FBZjtBQUZTLGFBQW5CO0FBSUQ7QUFDRixTQW5CRCxFQW1CRyxVQUFVLElBQVYsRUFBZ0I7QUFDakI7QUFDQSxpQkFBTyxLQUFQLENBQWEsSUFBYixFQUFtQixDQUFDLElBQUQsQ0FBbkI7QUFDRCxTQXRCRDtBQXVCRCxPQXJDTSxDQUFQO0FBc0NEOztBQUVEOzs7Ozs7Ozs7OztrQ0FRYyxTLEVBQVcsTyxFQUFTO0FBQ2hDO0FBQ0EsZ0JBQVUsT0FBTztBQUNmLGVBQU8sQ0FEUTtBQUVmLHFCQUFhO0FBRkUsT0FBUCxFQUdQLFdBQVcsRUFISixDQUFWO0FBSUEsVUFBSSxPQUFPLElBQVg7QUFBQSxVQUFpQixTQUFTLEtBQUssTUFBL0I7O0FBRUEsVUFBSSxDQUFDLFNBQUwsRUFDRSxrQkFBTSxFQUFOOztBQUVGLFVBQUksQ0FBQyxNQUFMLEVBQ0Usa0JBQU0sRUFBTjs7QUFFRixVQUFJLGNBQWMsT0FBTyxTQUFQLENBQWxCO0FBQ0EsVUFBSSxDQUFDLFdBQUw7QUFDRTtBQUNBO0FBQ0EsMEJBQU0sRUFBTixFQUFVLFNBQVY7O0FBRUY7QUFDQSxVQUFJLFFBQVEsV0FBUixDQUFKLEVBQTBCO0FBQ3hCLGVBQU8sU0FBUCxJQUFvQixjQUFjO0FBQ2hDLHNCQUFZO0FBRG9CLFNBQWxDO0FBR0QsT0FKRCxNQUlPLElBQUksQ0FBQyxZQUFZLFVBQWpCLEVBQTZCO0FBQ2xDLDBCQUFNLEVBQU4sRUFBVSxTQUFWO0FBQ0Q7O0FBRUQ7QUFDQTtBQUNBLFVBQUksU0FBUyxRQUFRLE1BQVIsS0FBbUIsS0FBSyxTQUFMLENBQWUsU0FBZixHQUM1QixLQUFLLFNBQUwsQ0FBZSxTQUFmLENBQXlCLFNBQXpCLENBRDRCLEdBRTVCLENBQUMsU0FBRCxDQUZTLENBQWI7QUFHQSxVQUFJLFlBQVksS0FBSyxTQUFyQjtBQUFBLFVBQ0UsU0FBUyxLQUFLLE1BRGhCO0FBQUEsVUFFRSxhQUFhLEtBQUssNEJBQUwsQ0FBa0MsWUFBWSxVQUE5QyxDQUZmO0FBQUEsVUFHRSxRQUFRLEVBSFY7O0FBS0EsV0FBSyxNQUFMLEVBQWEsVUFBVSxLQUFWLEVBQWlCO0FBQzVCLFlBQUksUUFBUSxLQUFLLFNBQUwsQ0FBZSxRQUFmLENBQXdCLEtBQXhCLENBQVo7O0FBRUE7QUFDQSxlQUFPLGdCQUFQLENBQXdCLEtBQXhCOztBQUVBLFlBQUksSUFBSSxVQUFVLFFBQVYsQ0FBbUIsVUFBbkIsRUFBK0IsS0FBL0IsRUFBc0MsS0FBdEMsRUFBNkMsSUFBN0MsQ0FBa0QsVUFBVSxJQUFWLEVBQWdCO0FBQ3hFO0FBQ0E7QUFDQSxlQUFLLElBQUksSUFBSSxDQUFSLEVBQVcsSUFBSSxJQUFJLElBQUosQ0FBcEIsRUFBK0IsSUFBSSxDQUFuQyxFQUFzQyxHQUF0QyxFQUEyQztBQUN6QyxnQkFBSSxJQUFJLEtBQUssQ0FBTCxDQUFSO0FBQ0EsZ0JBQUksRUFBRSxLQUFOLEVBQWE7QUFDWDtBQUNBLHFCQUFPLGdCQUFQLENBQXdCLEtBQXhCLEVBQStCO0FBQzdCLHlCQUFTLEVBQUU7QUFEa0IsZUFBL0I7QUFHQTtBQUNBLHFCQUFPLElBQVA7QUFDRDtBQUNGOztBQUVEO0FBQ0EsZUFBSyxnQkFBTCxDQUFzQixXQUF0QixFQUFtQyxLQUFuQyxFQUEwQyxTQUExQyxFQUFxRCxLQUFyRCxFQUE0RCxPQUE1RDs7QUFFQSxpQkFBTyxjQUFQLENBQXNCLEtBQXRCO0FBQ0EsaUJBQU8sSUFBUDtBQUNELFNBcEJPLEVBb0JMLFVBQVUsR0FBVixFQUFlO0FBQ2hCO0FBQ0E7QUFDQSxjQUFJLElBQUksTUFBTSxHQUFOLEVBQVcsVUFBVSxDQUFWLEVBQWE7QUFDOUIsbUJBQU8sRUFBRSxLQUFUO0FBQ0QsV0FGTyxDQUFSO0FBR0EsaUJBQU8sZ0JBQVAsQ0FBd0IsS0FBeEIsRUFBK0I7QUFDN0IscUJBQVMsRUFBRTtBQURrQixXQUEvQjtBQUdELFNBN0JPLENBQVI7O0FBK0JBLGNBQU0sSUFBTixDQUFXLENBQVg7QUFDRCxPQXRDRDtBQXVDQTtBQUNBO0FBQ0EsYUFBTyxJQUFJLE9BQUosQ0FBWSxVQUFVLE9BQVYsRUFBbUIsTUFBbkIsRUFBMkI7QUFDNUMsZ0JBQVEsR0FBUixDQUFZLEtBQVosRUFBbUIsSUFBbkIsQ0FBd0IsWUFBWTtBQUNsQyxrQkFBUSxnQkFBRSxPQUFGLENBQVUsU0FBVixDQUFSO0FBQ0QsU0FGRDtBQUdELE9BSk0sQ0FBUDtBQUtEOzs7cUNBRWdCLFcsRUFBYSxLLEVBQU8sUyxFQUFXLEssRUFBTyxPLEVBQVM7QUFDOUQsV0FBSyxxQkFBTCxDQUEyQixXQUEzQixFQUF3QyxLQUF4QyxFQUErQyxTQUEvQyxFQUEwRCxLQUExRCxFQUNLLGNBREwsQ0FDb0IsV0FEcEIsRUFDaUMsS0FEakMsRUFDd0MsU0FEeEMsRUFDbUQsS0FEbkQsRUFDMEQsT0FEMUQ7QUFFRDs7OzBDQUVxQixXLEVBQWEsSyxFQUFPLFMsRUFBVyxLLEVBQU87QUFDMUQsVUFBSSxPQUFPLElBQVg7QUFDQSxVQUFJLFNBQVMsWUFBWSxNQUF6QjtBQUFBLFVBQWlDLGFBQWEsWUFBWSxVQUExRDtBQUNBLFVBQUksV0FBVyxNQUFYLENBQUosRUFBd0IsU0FBUyxPQUFPLElBQVAsQ0FBWSxJQUFaLEVBQWtCLENBQWxCLEVBQXFCLEtBQXJCLENBQVQ7O0FBRXhCLFVBQUksaUJBQWlCLEtBQXJCO0FBQ0EsVUFBSSxNQUFKLEVBQVk7QUFDVix5QkFBaUIsS0FBSyxTQUFMLENBQWUsTUFBZixDQUFzQixNQUF0QixFQUE4QixLQUE5QixFQUFxQyxLQUFyQyxDQUFqQjtBQUNELE9BRkQsTUFFTyxJQUFJLEtBQUssT0FBTCxDQUFhLGlCQUFqQixFQUFvQztBQUN6QztBQUNBLFlBQUkscUJBQXFCLEVBQXpCO0FBQ0Esd0JBQUUsSUFBRixDQUFPLFVBQVAsRUFBbUIsZ0JBQVE7QUFDekIsY0FBSSxPQUFPLFNBQVMsSUFBVCxJQUFpQixJQUFqQixHQUF3QixLQUFLLElBQXhDO0FBQ0EsY0FBSSxRQUFRLEtBQUssU0FBTCxDQUFlLEtBQWYsQ0FBcUIsSUFBckIsQ0FBWixFQUNFLG1CQUFtQixJQUFuQixDQUF3QixJQUF4QjtBQUNILFNBSkQ7QUFLQSxZQUFJLG1CQUFtQixNQUF2QixFQUErQjtBQUM3QiwyQkFBaUIsS0FBSyxTQUFMLENBQWUsTUFBZixDQUFzQixrQkFBdEIsRUFBMEMsS0FBMUMsRUFBaUQsS0FBakQsQ0FBakI7QUFDRDtBQUNGO0FBQ0QsVUFBSSxtQkFBbUIsS0FBdkIsRUFBOEI7QUFDNUI7QUFDQSxhQUFLLE9BQUwsQ0FBYSxRQUFiLEVBQXVCLEtBQXZCLEVBQThCLFNBQTlCLEVBQXlDLGNBQXpDO0FBQ0EsYUFBSyxTQUFMLENBQWUsUUFBZixDQUF3QixLQUF4QixFQUErQixjQUEvQixFQUErQyxJQUEvQyxFQUFxRCxTQUFyRDtBQUNEO0FBQ0QsYUFBTyxJQUFQO0FBQ0Q7OzttQ0FFYyxXLEVBQWEsSyxFQUFPLFMsRUFBVyxLLEVBQU8sTyxFQUFTO0FBQzVELFVBQUksVUFBVSxZQUFZLE9BQTFCO0FBQ0EsVUFBSSxDQUFDLE9BQUwsRUFBYyxPQUFPLElBQVA7O0FBRWQ7QUFDQSxVQUFJLE9BQUosRUFDRSxVQUFVLGdCQUFFLE1BQUYsQ0FBUyxPQUFULEVBQWtCLGFBQUs7QUFDL0IsZUFBTyxNQUFNLFNBQU4sSUFBbUIsZ0JBQUUsUUFBRixDQUFXLFFBQVEsZ0JBQW5CLEVBQXFDLENBQXJDLENBQTFCO0FBQ0QsT0FGUyxDQUFWOztBQUlGLFVBQUksQ0FBQyxJQUFJLE9BQUosQ0FBTCxFQUNFLE9BQU8sSUFBUDs7QUFFRixVQUFJLE9BQU8sSUFBWDtBQUFBLFVBQ0ksbUJBQW1CLEtBQUssT0FENUI7QUFBQSxVQUVJLGdCQUFnQixpQkFBaUIsYUFGckM7QUFHQTtBQUNBLFVBQUksV0FBVyxRQUFRLEtBQVIsR0FBZ0IsQ0FBL0IsRUFBa0M7QUFDaEMsZUFBTyxJQUFQO0FBQ0Q7QUFDRCxVQUFJLFFBQVEsQ0FBWjs7QUFFQSxVQUFJLGdCQUFFLFFBQUYsQ0FBVyxhQUFYLENBQUosRUFBK0I7QUFDN0IsbUJBQVcsWUFBTTtBQUNmLGVBQUssUUFBTCxDQUFjLE9BQWQsRUFBdUI7QUFDckIsbUJBQU87QUFEYyxXQUF2QjtBQUdELFNBSkQsRUFJRyxhQUpIO0FBS0QsT0FORCxNQU1PO0FBQ0wsYUFBSyxRQUFMLENBQWMsT0FBZCxFQUF1QjtBQUNyQixpQkFBTztBQURjLFNBQXZCO0FBR0Q7QUFDRCxhQUFPLElBQVA7QUFDRDs7QUFFRDs7Ozs7Ozs7OztpREFPNkIsTSxFQUFRO0FBQ25DLGFBQU8sV0FBVyxNQUFYLElBQXFCLE9BQU8sSUFBUCxDQUFZLEtBQUssT0FBTCxJQUFnQixJQUE1QixDQUFyQixHQUF5RCxNQUFoRTtBQUNEOztBQUVEOzs7Ozs7OztrQ0FLYyxLLEVBQU87QUFDbkIsYUFBTyxLQUFLLFNBQUwsQ0FBZSxRQUFmLENBQXdCLEtBQXhCLENBQVA7QUFDRDs7OzhCQS9RZ0IsTyxFQUFTO0FBQ3hCLFdBQUssT0FBTCxFQUFjLFVBQUMsQ0FBRCxFQUFJLENBQUosRUFBVTtBQUN0QixrQkFBVSxRQUFWLENBQW1CLENBQW5CLElBQXdCLENBQXhCO0FBQ0QsT0FGRDtBQUdEOzs7O0VBdERxQixnQjs7QUFvVXhCLFVBQVUsU0FBVixHQUFzQixtQkFBdEI7QUFDQSxVQUFVLFNBQVYsR0FBc0IsbUJBQXRCO0FBQ0EsVUFBVSxRQUFWLEdBQXFCLFFBQXJCO0FBQ0EsVUFBVSxjQUFWLEdBQTJCLENBQUMsU0FBRCxFQUFZLFFBQVosRUFBc0IsU0FBdEIsQ0FBM0I7O2tCQUVlLFM7Ozs7Ozs7OztxakJDN1lmOzs7Ozs7Ozs7Ozs7QUFVQTs7OztBQUNBOztBQUNBOzs7Ozs7QUFHQSxJQUFNLE1BQU0sZ0JBQUUsR0FBZDtBQUNBLElBQU0sTUFBTSxnQkFBRSxHQUFkO0FBQ0EsSUFBTSxVQUFVLGdCQUFFLE9BQWxCO0FBQ0EsSUFBTSxPQUFPLGdCQUFFLElBQWY7QUFDQSxJQUFNLE9BQU8sZ0JBQUUsSUFBZjtBQUNBLElBQU0sV0FBVyxnQkFBRSxRQUFuQjtBQUNBLElBQU0sYUFBYSxnQkFBRSxVQUFyQjtBQUNBLElBQU0sZ0JBQWdCLGdCQUFFLGFBQXhCO0FBQ0EsSUFBTSxTQUFTLGdCQUFFLE1BQWpCOztBQUdBLFNBQVMsYUFBVCxDQUF1QixDQUF2QixFQUEwQixLQUExQixFQUFpQztBQUMvQixNQUFJLFNBQVMsQ0FBVCxDQUFKLEVBQ0UsT0FBTyxFQUFFLE1BQU0sQ0FBUixFQUFQO0FBQ0YsTUFBSSxjQUFjLENBQWQsQ0FBSixFQUFzQjtBQUNwQixRQUFJLE9BQU8sRUFBRSxJQUFiO0FBQ0EsUUFBSSxDQUFDLElBQUwsRUFBVyxrQkFBTSxLQUFOO0FBQ1gsV0FBTyxDQUFQO0FBQ0Q7QUFDRCxvQkFBTSxFQUFOLEVBQVUsSUFBVjtBQUNEOztJQUdLLFM7O0FBRUo7Ozs7O0FBS0EscUJBQVksU0FBWixFQUF1QjtBQUFBOztBQUNyQixRQUFJLFFBQVEsZ0JBQUUsS0FBRixDQUFRLFVBQVUsS0FBbEIsQ0FBWjtBQUFBLFFBQ0UsT0FBTyxJQURUO0FBQUEsUUFFRSxVQUFVLFlBQVksVUFBVSxPQUF0QixHQUFnQyxJQUY1QztBQUdBLFFBQUksV0FBVyxRQUFRLFdBQXZCLEVBQW9DO0FBQ2xDLGFBQU8sS0FBUCxFQUFjLFFBQVEsV0FBdEI7QUFDRDtBQUNELFNBQUssS0FBTCxHQUFhLEtBQWI7QUFDQSxXQUFPLElBQVA7QUFDRDs7QUFFRDs7Ozs7Ozs4QkFHVTtBQUNSLGFBQU8sS0FBSyxLQUFaO0FBQ0EsYUFBTyxLQUFLLFNBQVo7QUFDRDs7QUFFRDs7Ozs7Ozs7Ozs7MkJBUU8sSyxFQUFPLEssRUFBTyxLLEVBQU8sTSxFQUFRO0FBQ2xDLFVBQUksT0FBTyxJQUFYO0FBQ0EsVUFBSSxTQUFTLEtBQVQsQ0FBSixFQUFxQjtBQUNuQixZQUFJLE9BQU8sS0FBWDtBQUFBLFlBQWtCLE9BQU8sS0FBSyxLQUFMLENBQVcsSUFBWCxDQUF6QjtBQUNBLFlBQUksSUFBSixFQUNFLE9BQU8sQ0FBQyxLQUFLLEVBQUwsSUFBVyxJQUFaLEVBQWtCLElBQWxCLENBQXVCLElBQXZCLEVBQTZCLEtBQTdCLEVBQW9DLEtBQXBDLEVBQTJDLE1BQTNDLENBQVA7O0FBRUYsMEJBQU0sQ0FBTixFQUFTLElBQVQ7QUFDRDtBQUNELFdBQUssSUFBSSxJQUFJLENBQVIsRUFBVyxJQUFJLElBQUksS0FBSixDQUFwQixFQUFnQyxJQUFJLENBQXBDLEVBQXVDLEdBQXZDLEVBQTRDO0FBQzFDLFlBQUksSUFBSSxjQUFjLE1BQU0sQ0FBTixDQUFkLEVBQXdCLEVBQXhCLENBQVI7QUFDQSxZQUFJLGlCQUFpQixLQUFLLEtBQUwsQ0FBVyxFQUFFLElBQWIsQ0FBckI7O0FBRUEsWUFBSSxDQUFDLGNBQUwsRUFDRSxrQkFBTSxDQUFOLEVBQVMsSUFBVDs7QUFFRjtBQUNBLGdCQUFRLENBQUMsZUFBZSxFQUFmLElBQXFCLGNBQXRCLEVBQXNDLElBQXRDLENBQTJDLElBQTNDLEVBQWlELEtBQWpELEVBQXdELEtBQXhELEVBQStELGdCQUFFLElBQUYsQ0FBTyxDQUFQLEVBQVUsTUFBVixDQUEvRCxDQUFSO0FBQ0Q7QUFDRCxhQUFPLEtBQVA7QUFDRDs7Ozs7O0FBR0gsVUFBVSxLQUFWLEdBQWtCLHNCQUFsQjs7a0JBRWUsUzs7Ozs7Ozs7OztBQ3ZGZjs7Ozs7O0FBR0EsSUFBTSxrQkFBa0I7QUFDdEIsUUFBTSxjQUFVLEtBQVYsRUFBaUIsS0FBakIsRUFBd0I7QUFDNUIsV0FBTyxRQUFRLE1BQU0sT0FBTixDQUFjLGdCQUFkLEVBQWdDLEVBQWhDLENBQVIsR0FBOEMsS0FBckQ7QUFDRCxHQUhxQjs7QUFLdEIsZ0JBQWMsc0JBQVUsS0FBVixFQUFpQixLQUFqQixFQUF3QjtBQUNwQyxXQUFPLFFBQVEsTUFBTSxPQUFOLENBQWMsRUFBZCxFQUFrQixFQUFsQixDQUFSLEdBQWdDLEtBQXZDO0FBQ0QsR0FQcUI7O0FBU3RCLHdCQUFzQiw4QkFBVSxLQUFWLEVBQWlCLEtBQWpCLEVBQXdCO0FBQzVDLFdBQU8sUUFBUSxNQUFNLE9BQU4sQ0FBYyxTQUFkLEVBQXlCLEdBQXpCLENBQVIsR0FBd0MsS0FBL0M7QUFDRCxHQVhxQjs7QUFhdEIsZUFBYSxxQkFBVSxLQUFWLEVBQWlCLEtBQWpCLEVBQXdCO0FBQ25DLFFBQUksQ0FBQyxLQUFMLEVBQVksT0FBTyxLQUFQO0FBQ1osV0FBTyxNQUFNLE9BQU4sQ0FBYyxnQkFBZCxFQUFnQyxFQUFoQyxFQUFvQyxPQUFwQyxDQUE0QyxTQUE1QyxFQUF1RCxHQUF2RCxDQUFQO0FBQ0QsR0FoQnFCOztBQWtCdEIsV0FBUyxpQkFBVSxLQUFWLEVBQWlCLEtBQWpCLEVBQXdCO0FBQy9CLFFBQUksQ0FBQyxLQUFMLEVBQVk7QUFDWjtBQUNBLFdBQU8sUUFBUSxNQUFNLE9BQU4sQ0FBYyxLQUFkLEVBQXFCLEVBQXJCLENBQVIsR0FBbUMsS0FBMUM7QUFDRCxHQXRCcUI7O0FBd0J0QixlQUFhLGtCQUFVLEtBQVYsRUFBaUIsS0FBakIsRUFBd0IsT0FBeEIsRUFBaUM7QUFDNUMsUUFBSSxDQUFDLEtBQUwsRUFBWSxPQUFPLEtBQVA7QUFDWixRQUFJLENBQUo7QUFDQSxRQUFJLGdCQUFFLE9BQUYsQ0FBVSxPQUFWLENBQUosRUFBd0I7QUFDdEIsVUFBSSxLQUFLLE1BQU0sWUFBTixDQUFtQixXQUFuQixDQUFUO0FBQ0EsVUFBSSxDQUFDLEVBQUwsRUFBUyxNQUFNLG1EQUFOO0FBQ1QsVUFBSSxTQUFTLEVBQVQsQ0FBSjtBQUNELEtBSkQsTUFJTztBQUNMLFVBQUksRUFBRSxZQUFZLE9BQWQsQ0FBSixFQUE0QjtBQUMxQixjQUFNLDJCQUFOO0FBQ0Q7QUFDRCxVQUFJLFFBQVEsTUFBWjtBQUNEO0FBQ0QsUUFBSSxXQUFXLEtBQWY7QUFDQSxXQUFPLE1BQU0sTUFBTixHQUFlLENBQXRCLEVBQXlCO0FBQ3ZCLGNBQVEsTUFBTSxLQUFkO0FBQ0Q7QUFDRCxXQUFPLEtBQVA7QUFDRCxHQTFDcUI7O0FBNEN0QixpQkFBZSxvQkFBVSxLQUFWLEVBQWlCLEtBQWpCLEVBQXdCO0FBQ3JDLFFBQUksQ0FBQyxLQUFMLEVBQVksT0FBTyxLQUFQO0FBQ1osUUFBSSxNQUFNLElBQU4sQ0FBVyxLQUFYLENBQUosRUFDRSxRQUFRLE1BQU0sT0FBTixDQUFjLEtBQWQsRUFBcUIsRUFBckIsQ0FBUjtBQUNGLFdBQU8sS0FBUDtBQUNEO0FBakRxQixDQUF4QixDLENBYkE7Ozs7Ozs7Ozs7UUFpRVMsZSxHQUFBLGU7Ozs7Ozs7Ozs7QUN2RFQ7Ozs7OztBQUVBLElBQU0sTUFBTSxnQkFBRSxHQUFkLEMsQ0FaQTs7Ozs7Ozs7Ozs7QUFhQSxJQUFNLGdCQUFnQixnQkFBRSxhQUF4QjtBQUNBLElBQU0sV0FBVyxnQkFBRSxRQUFuQjtBQUNBLElBQU0sV0FBVyxnQkFBRSxRQUFuQjtBQUNBLElBQU0sVUFBVSxnQkFBRSxPQUFsQjtBQUNBLElBQU0sVUFBVSxnQkFBRSxPQUFsQjs7QUFHQSxTQUFTLFFBQVQsQ0FBa0IsT0FBbEIsRUFBMkIsSUFBM0IsRUFBaUM7QUFDL0IsU0FBTztBQUNMLFdBQU8sSUFERjtBQUVMLGFBQVMsT0FGSjtBQUdMLFdBQU8sS0FBSyxDQUFMLENBSEY7QUFJTCxXQUFPLEtBQUssQ0FBTCxDQUpGO0FBS0wsWUFBUSxnQkFBRSxPQUFGLENBQVUsSUFBVixFQUFnQixNQUFoQixDQUF1QixDQUF2QjtBQUxILEdBQVA7QUFPRDs7QUFHRCxJQUFNLGtCQUFrQjs7QUFFdEIsUUFBTSxnQkFBWTtBQUNoQixXQUFPLElBQVA7QUFDRCxHQUpxQjs7QUFNdEIsT0FBSyxhQUFVLEtBQVYsRUFBaUIsS0FBakIsRUFBd0IsTUFBeEIsRUFBZ0MsTUFBaEMsRUFBd0M7QUFDM0MsUUFBSSxVQUFVLE1BQWQ7QUFDQSxRQUFJLGdCQUFFLE9BQUYsQ0FBVSxPQUFWLENBQUosRUFBd0I7QUFDdEIsVUFBSSxnQkFBRSxHQUFGLENBQU0sT0FBTixFQUFlO0FBQUEsZUFBSyxNQUFNLEtBQVg7QUFBQSxPQUFmLENBQUosRUFBc0M7QUFDcEMsZUFBTyxTQUFTLFVBQVQsRUFBcUIsU0FBckIsQ0FBUDtBQUNEO0FBQ0Y7QUFDRCxRQUFJLFVBQVUsTUFBZCxFQUFzQjtBQUNwQixhQUFPLFNBQVMsVUFBVCxFQUFxQixTQUFyQixDQUFQO0FBQ0Q7QUFDRCxXQUFPLElBQVA7QUFDRCxHQWpCcUI7O0FBbUJ0QixZQUFVLGtCQUFVLEtBQVYsRUFBaUIsS0FBakIsRUFBd0IsTUFBeEIsRUFBZ0M7QUFDeEMsUUFBSSxDQUFDLEtBQUwsRUFBWSxPQUFPLElBQVA7QUFDWixRQUFJLE1BQU0sS0FBTixDQUFZLElBQVosQ0FBSixFQUNFLE9BQU8sU0FBUyxlQUFULEVBQTBCLFNBQTFCLENBQVA7QUFDRixXQUFPLElBQVA7QUFDRCxHQXhCcUI7O0FBMEJ0QixVQUFRO0FBQ04sY0FBVSxJQURKO0FBRU4sUUFBSSxZQUFVLEtBQVYsRUFBaUIsS0FBakIsRUFBd0IsTUFBeEIsRUFBZ0MsZUFBaEMsRUFBaUQ7QUFDbkQsVUFBSSxDQUFDLGVBQUwsRUFDRSxNQUFNLENBQU47QUFDRixhQUFPLGdCQUFnQixLQUFoQixDQUFzQixLQUF0QixFQUE2QixTQUE3QixDQUFQO0FBQ0Q7QUFOSyxHQTFCYzs7QUFtQ3RCLFlBQVUsa0JBQVUsS0FBVixFQUFpQixLQUFqQixFQUF3QixNQUF4QixFQUFnQyxNQUFoQyxFQUF3QztBQUNoRCxRQUFJLFNBQVMsTUFBVCxDQUFKLEVBQ0UsU0FBUyxFQUFFLFNBQVMsTUFBWCxFQUFUOztBQUVGLFFBQUksQ0FBQyxLQUFELElBQVcsUUFBUSxLQUFSLEtBQWtCLFFBQVEsS0FBUixDQUE3QixJQUFnRCxDQUFDLENBQUMsTUFBTSxRQUFOLEdBQWlCLEtBQWpCLENBQXVCLE9BQXZCLENBQXRELEVBQ0UsT0FBTyxTQUFTLFVBQVQsRUFBcUIsU0FBckIsQ0FBUDtBQUNGLFdBQU8sSUFBUDtBQUNELEdBMUNxQjs7QUE0Q3RCLFdBQVMsaUJBQVUsS0FBVixFQUFpQixLQUFqQixFQUF3QixNQUF4QixFQUFnQyxPQUFoQyxFQUF5QztBQUNoRCxRQUFJLENBQUMsS0FBTCxFQUFZLE9BQU8sSUFBUDtBQUNaLFFBQUksQ0FBQyxRQUFRLElBQVIsQ0FBYSxLQUFiLENBQUwsRUFDRSxPQUFPLFNBQVMsWUFBVCxFQUF1QixTQUF2QixDQUFQO0FBQ0YsUUFBSSxPQUFKLEVBQWE7QUFDWCxVQUFJLFNBQVMsU0FBUyxLQUFULENBQWI7QUFDQSxVQUFJLFNBQVMsUUFBUSxHQUFqQixLQUF5QixTQUFTLFFBQVEsR0FBOUMsRUFDRSxPQUFPLFNBQVMsVUFBVCxFQUFxQixTQUFyQixDQUFQO0FBQ0YsVUFBSSxTQUFTLFFBQVEsR0FBakIsS0FBeUIsU0FBUyxRQUFRLEdBQTlDLEVBQ0UsT0FBTyxTQUFTLFVBQVQsRUFBcUIsU0FBckIsQ0FBUDtBQUNIO0FBQ0QsV0FBTyxJQUFQO0FBQ0QsR0F4RHFCOztBQTBEdEIsU0FBTyxlQUFVLEtBQVYsRUFBaUIsS0FBakIsRUFBd0IsTUFBeEIsRUFBZ0MsYUFBaEMsRUFBK0M7QUFDcEQsUUFBSSxVQUFVLGFBQWQsRUFBNkI7QUFDM0IsYUFBTyxTQUFTLGVBQVQsRUFBMEIsU0FBMUIsQ0FBUDtBQUNEO0FBQ0QsV0FBTyxJQUFQO0FBQ0QsR0EvRHFCOztBQWlFdEIsV0FBUyxpQkFBVSxLQUFWLEVBQWlCLEtBQWpCLEVBQXdCLE1BQXhCLEVBQWdDO0FBQ3ZDLFFBQUksQ0FBQyxLQUFMLEVBQVksT0FBTyxJQUFQO0FBQ1osUUFBSSxDQUFDLGNBQWMsSUFBZCxDQUFtQixLQUFuQixDQUFMLEVBQ0UsT0FBTyxTQUFTLHVCQUFULEVBQWtDLFNBQWxDLENBQVA7QUFDRixXQUFPLElBQVA7QUFDRCxHQXRFcUI7O0FBd0V0QixVQUFRLGdCQUFVLEtBQVYsRUFBaUIsS0FBakIsRUFBd0IsTUFBeEIsRUFBZ0M7QUFDdEMsUUFBSSxDQUFDLEtBQUwsRUFBWSxPQUFPLElBQVA7QUFDWixRQUFJLENBQUMsUUFBUSxJQUFSLENBQWEsS0FBYixDQUFMLEVBQ0UsT0FBTyxTQUFTLHNCQUFULEVBQWlDLFNBQWpDLENBQVA7QUFDRixXQUFPLElBQVA7QUFDRCxHQTdFcUI7O0FBK0V0QixhQUFXLG1CQUFVLEtBQVYsRUFBaUIsS0FBakIsRUFBd0IsTUFBeEIsRUFBZ0MsS0FBaEMsRUFBdUM7QUFDaEQsUUFBSSxDQUFDLEtBQUwsRUFBWSxPQUFPLElBQVA7O0FBRVosUUFBSSxjQUFjLEtBQWQsQ0FBSixFQUEwQjtBQUN4QixjQUFRLE1BQU0sTUFBZDtBQUNEO0FBQ0QsUUFBSSxDQUFDLFNBQVMsS0FBVCxDQUFMLEVBQ0UsTUFBTSw4RUFBTjs7QUFFRixRQUFJLElBQUksS0FBSixJQUFhLEtBQWpCLEVBQ0UsT0FBTyxTQUFTLFdBQVQsRUFBc0IsU0FBdEIsQ0FBUDtBQUNGLFdBQU8sSUFBUDtBQUNELEdBM0ZxQjs7QUE2RnRCLGFBQVcsbUJBQVUsS0FBVixFQUFpQixLQUFqQixFQUF3QixNQUF4QixFQUFnQyxLQUFoQyxFQUF1QztBQUNoRCxRQUFJLENBQUMsS0FBTCxFQUFZLE9BQU8sS0FBUDs7QUFFWixRQUFJLGNBQWMsS0FBZCxDQUFKLEVBQTBCO0FBQ3hCLGNBQVEsTUFBTSxNQUFkO0FBQ0Q7QUFDRCxRQUFJLENBQUMsU0FBUyxLQUFULENBQUwsRUFDRSxNQUFNLDhFQUFOOztBQUVGLFFBQUksSUFBSSxLQUFKLElBQWEsS0FBakIsRUFDRSxPQUFPLFNBQVMsV0FBVCxFQUFzQixTQUF0QixDQUFQO0FBQ0YsV0FBTyxJQUFQO0FBQ0QsR0F6R3FCOztBQTJHdEIsYUFBVyxtQkFBVSxLQUFWLEVBQWlCLEtBQWpCLEVBQXdCLE1BQXhCLEVBQWdDLEtBQWhDLEVBQXVDO0FBQ2hELFFBQUksQ0FBQyxNQUFNLE9BQVgsRUFDRSxPQUFPLFNBQVMsZUFBVCxFQUEwQixTQUExQixDQUFQO0FBQ0YsV0FBTyxJQUFQO0FBQ0Q7QUEvR3FCLENBQXhCOztRQWtIUyxlLEdBQUEsZTtRQUFpQixRLEdBQUEsUTs7Ozs7Ozs7O3FqQkNqSjFCOzs7Ozs7Ozs7OztBQVdBOzs7O0FBQ0E7O0FBQ0E7Ozs7OztBQUdBLElBQU0sTUFBTSxnQkFBRSxHQUFkO0FBQ0EsSUFBTSxNQUFNLGdCQUFFLEdBQWQ7QUFDQSxJQUFNLFVBQVUsZ0JBQUUsT0FBbEI7QUFDQSxJQUFNLE9BQU8sZ0JBQUUsSUFBZjtBQUNBLElBQU0sT0FBTyxnQkFBRSxJQUFmO0FBQ0EsSUFBTSxXQUFXLGdCQUFFLFFBQW5CO0FBQ0EsSUFBTSxhQUFhLGdCQUFFLFVBQXJCO0FBQ0EsSUFBTSxnQkFBZ0IsZ0JBQUUsYUFBeEI7QUFDQSxJQUFNLFNBQVMsZ0JBQUUsTUFBakI7QUFDQSxJQUFNLDJCQUEyQixrQkFBakM7O0FBR0EsU0FBUyxVQUFULENBQW9CLElBQXBCLEVBQTBCLGdCQUExQixFQUE0QztBQUMxQyxNQUFJLENBQUMsaUJBQWlCLE1BQXRCLEVBQThCO0FBQzVCLFFBQUksY0FBYyxnQkFBRSxJQUFGLENBQU8sZ0JBQVAsRUFBeUIsQ0FBQyxJQUFELEVBQU8sTUFBUCxDQUF6QixDQUFsQjtBQUNBLFdBQU8sS0FBSyxNQUFMLENBQVksQ0FBQyxXQUFELENBQVosQ0FBUDtBQUNEO0FBQ0QsU0FBTyxLQUFLLE1BQUwsQ0FBWSxpQkFBaUIsTUFBN0IsQ0FBUDtBQUNEOztJQUdLLFM7O0FBRUo7Ozs7O0FBS0EscUJBQVksU0FBWixFQUF1QjtBQUFBOztBQUNyQixRQUFJLFFBQVEsZ0JBQUUsS0FBRixDQUFRLFVBQVUsS0FBbEIsQ0FBWjtBQUFBLFFBQ0UsT0FBTyxJQURUO0FBQUEsUUFFRSxVQUFVLFlBQVksVUFBVSxPQUF0QixHQUFnQyxJQUY1QztBQUdBLFFBQUksV0FBVyxRQUFRLEtBQXZCLEVBQThCO0FBQzVCLGFBQU8sS0FBUCxFQUFjLFFBQVEsS0FBdEI7QUFDRDtBQUNELFNBQUssUUFBTCxHQUFnQixlQUFoQjtBQUNBLFNBQUssS0FBTCxHQUFhLEtBQWI7QUFDQSxTQUFLLFNBQUwsR0FBaUIsYUFBYSxFQUE5QjtBQUNBLFdBQU8sSUFBUDtBQUNEOzs7OzhCQUVTO0FBQ1IsYUFBTyxLQUFLLEtBQVo7QUFDQSxhQUFPLEtBQUssU0FBWjtBQUNEOztBQUVEOzs7Ozs7Ozs4QkFLVSxJLEVBQU07QUFDZCxVQUFJLENBQUMsS0FBSyxLQUFMLENBQVcsSUFBWCxDQUFMLEVBQXVCO0FBQ3JCLDBCQUFNLENBQU4sRUFBUyw4QkFBOEIsSUFBdkM7QUFDRDtBQUNGOzs7a0NBRWEsQyxFQUFHO0FBQ2YsVUFBSSxjQUFjLENBQWQsQ0FBSixFQUFzQjtBQUNwQixlQUFPLENBQVA7QUFDRDs7QUFFRCxVQUFJLFdBQVcsQ0FBWCxDQUFKLEVBQW1CO0FBQ2pCLGVBQU8sRUFBRSxJQUFJLENBQU4sRUFBUDtBQUNEO0FBQ0Qsd0JBQU0sRUFBTixFQUFVLG9DQUFWO0FBQ0Q7Ozs0QkFFTyxDLEVBQUc7QUFDVCxVQUFJLE9BQU8sSUFBWDtBQUFBLFVBQ0UsV0FBVyxFQURiO0FBQUEsVUFFRSxRQUFRLEtBQUssS0FGZjs7QUFJQSxVQUFJLFNBQVMsQ0FBVCxDQUFKLEVBQWlCO0FBQ2YsYUFBSyxTQUFMLENBQWUsQ0FBZjtBQUNBLGVBQU8sT0FBTyxFQUFFLE1BQU0sQ0FBUixFQUFQLEVBQW9CLFFBQXBCLEVBQThCLEtBQUssYUFBTCxDQUFtQixNQUFNLENBQU4sQ0FBbkIsQ0FBOUIsQ0FBUDtBQUNEOztBQUVELFVBQUksY0FBYyxDQUFkLENBQUosRUFBc0I7QUFDcEIsWUFBSSxDQUFDLEVBQUUsSUFBUCxFQUNFLGtCQUFNLENBQU4sRUFBUyxpQ0FBVDtBQUNGLGFBQUssU0FBTCxDQUFlLEVBQUUsSUFBakI7QUFDQSxlQUFPLE9BQU8sRUFBUCxFQUFXLFFBQVgsRUFBcUIsQ0FBckIsRUFBd0IsS0FBSyxhQUFMLENBQW1CLE1BQU0sRUFBRSxJQUFSLENBQW5CLENBQXhCLENBQVA7QUFDRDs7QUFFRCx3QkFBTSxFQUFOLEVBQVUseUJBQVY7QUFDRDs7OzZCQUVRLEMsRUFBRztBQUNWO0FBQ0EsVUFBSSxJQUFJLEVBQUUsUUFBUSxFQUFWLEVBQWMsVUFBVSxFQUF4QixFQUFSO0FBQUEsVUFBc0MsSUFBSSxJQUExQztBQUNBLFdBQUssQ0FBTCxFQUFRLFVBQVUsR0FBVixFQUFlO0FBQ3JCLFlBQUksWUFBWSxFQUFFLE9BQUYsQ0FBVSxHQUFWLENBQWhCO0FBQ0EsWUFBSSxVQUFVLFFBQWQsRUFBd0I7QUFDdEIsWUFBRSxRQUFGLENBQVcsSUFBWCxDQUFnQixTQUFoQjtBQUNELFNBRkQsTUFFTztBQUNMLFlBQUUsTUFBRixDQUFTLElBQVQsQ0FBYyxTQUFkO0FBQ0Q7QUFDRixPQVBEO0FBUUEsYUFBTyxDQUFQO0FBQ0Q7Ozs2QkFFUSxLLEVBQU8sSyxFQUFPLEcsRUFBSyxNLEVBQVE7QUFDbEMsVUFBSSxRQUFRLEtBQUssa0JBQUwsQ0FBd0IsS0FBeEIsQ0FBWjtBQUNBLGFBQU8sS0FBSyxLQUFMLENBQVcsS0FBWCxFQUFrQixLQUFsQixFQUF5QixHQUF6QixFQUE4QixNQUE5QixDQUFQO0FBQ0Q7Ozt1Q0FFa0IsQyxFQUFHO0FBQ3BCLFVBQUksSUFBSSxLQUFLLFFBQUwsQ0FBYyxDQUFkLENBQVI7QUFBQSxVQUEwQixRQUFRLEVBQWxDO0FBQUEsVUFBc0MsT0FBTyxJQUE3QztBQUNBO0FBQ0EsV0FBSyxFQUFFLE1BQVAsRUFBZSxVQUFVLENBQVYsRUFBYTtBQUMxQixVQUFFLEVBQUYsR0FBTyxLQUFLLGdCQUFMLENBQXNCLEVBQUUsRUFBeEIsQ0FBUDtBQUNBLGNBQU0sSUFBTixDQUFXLENBQVg7QUFDRCxPQUhEO0FBSUE7QUFDQSxXQUFLLEVBQUUsUUFBUCxFQUFpQixVQUFVLENBQVYsRUFBYTtBQUM1QixjQUFNLElBQU4sQ0FBVyxDQUFYO0FBQ0QsT0FGRDtBQUdBLGFBQU8sS0FBUDtBQUNEOztBQUVEOzs7Ozs7OztxQ0FLaUIsQyxFQUFHO0FBQ2xCLFVBQUksWUFBWSxJQUFoQjtBQUNBLGFBQU8sS0FBSyxDQUFMLEVBQVEsVUFBVSxJQUFWLEVBQWdCO0FBQzdCLFlBQUksT0FBTyxRQUFRLFNBQVIsQ0FBWDtBQUNBLGVBQU8sSUFBSSxPQUFKLENBQVksVUFBVSxPQUFWLEVBQW1CLE1BQW5CLEVBQTJCO0FBQzVDLGNBQUksU0FBUyxLQUFLLEtBQUwsQ0FBVyxVQUFVLFNBQXJCLEVBQWdDLEtBQUssS0FBTCxDQUFXLENBQVgsRUFBYyxJQUFJLElBQUosQ0FBZCxDQUFoQyxDQUFiO0FBQ0E7QUFDQSxrQkFBUSxNQUFSO0FBQ0QsU0FKTSxDQUFQO0FBS0QsT0FQTSxDQUFQO0FBUUQ7OztrQ0FFYSxLLEVBQU8sVSxFQUFZO0FBQy9CLFVBQUksWUFBWSxLQUFLLFNBQXJCO0FBQUEsVUFDRSxZQUFZLFlBQVksVUFBVSxTQUF0QixHQUFrQyxJQURoRDtBQUVBLGFBQU8sYUFBYSxVQUFVLE1BQVYsQ0FBaUIsS0FBakIsQ0FBYixHQUF1QyxVQUFVLENBQVYsQ0FBWSxLQUFaLEVBQW1CLFVBQW5CLENBQXZDLEdBQXdFLEtBQS9FO0FBQ0Q7O0FBRUQ7Ozs7Ozs7Ozs7MEJBT00sSyxFQUFPO0FBQ1gsVUFBSSxDQUFDLElBQUksS0FBSixDQUFMLEVBQ0UsT0FBTyxJQUFJLE9BQUosQ0FBWSxVQUFVLE9BQVYsRUFBbUI7QUFBRSxnQkFBUSxFQUFSO0FBQWMsT0FBL0MsQ0FBUDs7QUFFRjtBQUNBLGNBQVEsSUFBSSxLQUFKLEVBQVcsVUFBVSxDQUFWLEVBQWE7QUFDOUIsWUFBSSxXQUFXLENBQVgsQ0FBSixFQUFtQjtBQUNqQixpQkFBTyxFQUFFLElBQUksQ0FBTixFQUFTLFFBQVEsRUFBakIsRUFBUDtBQUNEO0FBQ0QsZUFBTyxDQUFQO0FBQ0QsT0FMTyxDQUFSO0FBTUEsVUFBSSxJQUFJLENBQVI7QUFBQSxVQUNFLG1CQUFtQixNQUFNLENBQU4sQ0FEckI7QUFBQSxVQUVFLElBQUksRUFGTjtBQUFBLFVBR0UsWUFBWSxJQUhkO0FBQUEsVUFJRSxPQUFPLFFBQVEsU0FBUixFQUFtQixLQUFuQixDQUF5QixDQUF6QixFQUE0QixJQUFJLFNBQUosQ0FBNUIsQ0FKVDtBQUFBLFVBS0UsV0FBVyxXQUFXLElBQVgsRUFBaUIsZ0JBQWpCLENBTGI7O0FBT0EsYUFBTyxJQUFJLE9BQUosQ0FBWSxVQUFVLE9BQVYsRUFBbUIsTUFBbkIsRUFBMkI7QUFDNUMsaUJBQVMsT0FBVCxDQUFpQixJQUFqQixFQUF1QjtBQUNyQjtBQUNBLGNBQUksS0FBSyxLQUFULEVBQWdCO0FBQ2QsZ0JBQUksY0FBYyxpQkFBaUIsT0FBbkM7QUFDQSxnQkFBSSxXQUFKLEVBQ0UsS0FBSyxPQUFMLEdBQWUsV0FBVyxXQUFYLElBQTBCLFlBQVksS0FBWixDQUFrQixVQUFVLFNBQTVCLEVBQXVDLElBQXZDLENBQTFCLEdBQXlFLFdBQXhGLENBREYsS0FFSztBQUNILGtCQUFJLFdBQVcsS0FBSyxPQUFwQjtBQUNBLGtCQUFJLG1CQUFtQixVQUFVLGFBQVYsQ0FBd0IsUUFBeEIsRUFBa0MsV0FBVyxFQUFYLEVBQWUsZ0JBQWYsQ0FBbEMsQ0FBdkI7QUFDQSxrQkFBSSxvQkFBb0IsUUFBeEIsRUFBa0M7QUFDaEMscUJBQUssUUFBTCxHQUFnQixRQUFoQjtBQUNBLHFCQUFLLE9BQUwsR0FBZSxnQkFBZjtBQUNEO0FBQ0Y7O0FBRUQsZ0JBQUksaUJBQWlCLE9BQXJCLEVBQ0UsaUJBQWlCLE9BQWpCLENBQXlCLEtBQXpCLENBQStCLFVBQVUsU0FBekMsRUFBb0QsSUFBcEQ7QUFDSDs7QUFFRCxZQUFFLElBQUYsQ0FBTyxJQUFQO0FBQ0EsY0FBSSxLQUFLLEtBQVQsRUFBZ0I7QUFDZDtBQUNBLG1CQUFPLFFBQVEsQ0FBUixDQUFQO0FBQ0Q7QUFDRCxpQkF4QnFCLENBd0JiO0FBQ1Q7QUFDRCxpQkFBUyxPQUFULENBQWlCLElBQWpCLEVBQXVCO0FBQ3JCO0FBQ0EsWUFBRSxJQUFGLENBQU87QUFDTCxtQkFBTyxJQURGO0FBRUwsc0JBQVUsd0JBRkw7QUFHTCxxQkFBUyxVQUFVLGFBQVYsQ0FBd0Isd0JBQXhCLEVBQWtELFdBQVcsRUFBWCxFQUFlLGdCQUFmLENBQWxEO0FBSEosV0FBUDtBQUtBLGlCQUFPLENBQVAsRUFQcUIsQ0FPWDtBQUNYO0FBQ0QsaUJBQVMsSUFBVCxHQUFnQjtBQUNkO0FBQ0EsY0FBSSxLQUFLLElBQUksS0FBSixDQUFULEVBQXFCO0FBQ25CO0FBQ0Esb0JBQVEsQ0FBUjtBQUNELFdBSEQsTUFHTztBQUNMLCtCQUFtQixNQUFNLENBQU4sQ0FBbkI7QUFDQSx1QkFBVyxXQUFXLElBQVgsRUFBaUIsZ0JBQWpCLENBQVg7QUFDQSw2QkFBaUIsRUFBakIsQ0FBb0IsS0FBcEIsQ0FBMEIsVUFBVSxTQUFwQyxFQUErQyxRQUEvQyxFQUF5RCxJQUF6RCxDQUE4RCxPQUE5RCxFQUF1RSxPQUF2RTtBQUNEO0FBQ0Y7QUFDRCx5QkFBaUIsRUFBakIsQ0FBb0IsS0FBcEIsQ0FBMEIsVUFBVSxTQUFwQyxFQUErQyxRQUEvQyxFQUF5RCxJQUF6RCxDQUE4RCxPQUE5RCxFQUF1RSxPQUF2RTtBQUNELE9BaERNLENBQVA7QUFpREQ7Ozs7OztBQUdILFVBQVUsUUFBVixHQUFxQixlQUFyQjtBQUNBLFVBQVUsS0FBVixHQUFrQixzQkFBbEI7O2tCQUVlLFM7Ozs7Ozs7O0FDaFBmOzs7Ozs7Ozs7Ozs7O0FBYUEsSUFBTSxnQkFBZ0I7QUFDcEIsa0JBQWdCO0FBREksQ0FBdEI7O0FBSUE7Ozs7QUFJQSxTQUFTLEtBQVQsQ0FBZSxHQUFmLEVBQW9CLE1BQXBCLEVBQTRCO0FBQzFCLE1BQUksVUFBVSxDQUFDLFNBQVMsTUFBVCxHQUFrQixPQUFuQixJQUE4QixpRkFBOUIsR0FBa0gsR0FBaEk7QUFDQSxNQUFJLGNBQWMsY0FBZCxJQUFnQyxPQUFPLE9BQVAsSUFBa0IsV0FBdEQsRUFBbUU7QUFDakUsWUFBUSxLQUFSLENBQWMsT0FBZDtBQUNEO0FBQ0QsUUFBTSxJQUFJLEtBQUosQ0FBVSxPQUFWLENBQU47QUFDRDs7UUFFUSxLLEdBQUEsSztRQUFPLGEsR0FBQSxhOzs7Ozs7Ozs7OztBQ1poQjs7QUFqQkE7Ozs7Ozs7Ozs7QUFVQTtBQUNBLElBQU0sU0FBUyxRQUFmO0FBQUEsSUFDRSxTQUFTLFFBRFg7QUFBQSxJQUVFLFNBQVMsUUFGWDtBQUFBLElBR0UsV0FBVyxVQUhiO0FBQUEsSUFJRSxNQUFNLFNBSlI7O0FBV0E7Ozs7OztBQU1BLFNBQVMsR0FBVCxDQUFhLENBQWIsRUFBZ0I7QUFDZCxNQUFJLENBQUMsQ0FBTCxFQUFRLE9BQU8sQ0FBUDtBQUNSLE1BQUksU0FBUyxDQUFULENBQUosRUFDRSxPQUFPLEVBQUUsTUFBVDtBQUNGLE1BQUksY0FBYyxDQUFkLENBQUosRUFBc0I7QUFDcEIsUUFBSSxJQUFJLENBQVI7QUFDQSxTQUFLLElBQUksQ0FBVCxJQUFjLENBQWQsRUFBaUI7QUFDZjtBQUNEO0FBQ0QsV0FBTyxDQUFQO0FBQ0Q7QUFDRCxTQUFPLFlBQVksQ0FBWixHQUFnQixFQUFFLE1BQWxCLEdBQTJCLFNBQWxDO0FBQ0Q7O0FBRUQsU0FBUyxHQUFULENBQWEsQ0FBYixFQUFnQixFQUFoQixFQUFvQjtBQUNsQixNQUFJLENBQUMsQ0FBRCxJQUFNLENBQUMsSUFBSSxDQUFKLENBQVgsRUFBbUI7QUFDakIsUUFBSSxjQUFjLENBQWQsQ0FBSixFQUFzQjtBQUNwQixVQUFJLENBQUo7QUFBQSxVQUFPLElBQUksRUFBWDtBQUNBLFdBQUssQ0FBTCxJQUFVLENBQVYsRUFBYTtBQUNYLFVBQUUsSUFBRixDQUFPLEdBQUcsQ0FBSCxFQUFNLEVBQUUsQ0FBRixDQUFOLENBQVA7QUFDRDtBQUNELGFBQU8sQ0FBUDtBQUNEO0FBQ0Y7QUFDRCxNQUFJLElBQUksRUFBUjtBQUNBLE9BQUssSUFBSSxJQUFJLENBQVIsRUFBVyxJQUFJLElBQUksQ0FBSixDQUFwQixFQUE0QixJQUFJLENBQWhDLEVBQW1DLEdBQW5DO0FBQ0UsTUFBRSxJQUFGLENBQU8sR0FBRyxFQUFFLENBQUYsQ0FBSCxDQUFQO0FBREYsR0FFQSxPQUFPLENBQVA7QUFDRDs7QUFFRCxTQUFTLElBQVQsQ0FBYyxDQUFkLEVBQWlCLEVBQWpCLEVBQXFCO0FBQ25CLE1BQUksY0FBYyxDQUFkLENBQUosRUFBc0I7QUFDcEIsU0FBSyxJQUFJLENBQVQsSUFBYyxDQUFkO0FBQ0UsU0FBRyxFQUFFLENBQUYsQ0FBSCxFQUFTLENBQVQ7QUFERixLQUVBLE9BQU8sQ0FBUDtBQUNEO0FBQ0QsTUFBSSxDQUFDLENBQUQsSUFBTSxDQUFDLElBQUksQ0FBSixDQUFYLEVBQW1CLE9BQU8sQ0FBUDtBQUNuQixPQUFLLElBQUksSUFBSSxDQUFSLEVBQVcsSUFBSSxJQUFJLENBQUosQ0FBcEIsRUFBNEIsSUFBSSxDQUFoQyxFQUFtQyxHQUFuQztBQUNFLE9BQUcsRUFBRSxDQUFGLENBQUgsRUFBUyxDQUFUO0FBREY7QUFFRDs7QUFFRCxTQUFTLElBQVQsQ0FBYyxFQUFkLEVBQWtCLENBQWxCLEVBQXFCO0FBQ25CLE9BQUssSUFBSSxJQUFJLENBQWIsRUFBZ0IsSUFBSSxDQUFwQixFQUF1QixHQUF2QjtBQUNFLE9BQUcsQ0FBSDtBQURGO0FBRUQ7O0FBRUQsU0FBUyxRQUFULENBQWtCLENBQWxCLEVBQXFCO0FBQ25CLFNBQU8sUUFBTyxDQUFQLHlDQUFPLENBQVAsTUFBWSxNQUFuQjtBQUNEOztBQUVELFNBQVMsUUFBVCxDQUFrQixDQUFsQixFQUFxQjtBQUNuQjtBQUNBO0FBQ0E7QUFDQSxNQUFJLE1BQU0sQ0FBTixDQUFKLEVBQWM7QUFDWixXQUFPLEtBQVA7QUFDRDtBQUNELFNBQU8sUUFBTyxDQUFQLHlDQUFPLENBQVAsTUFBWSxNQUFuQjtBQUNEOztBQUVELFNBQVMsVUFBVCxDQUFvQixDQUFwQixFQUF1QjtBQUNyQixTQUFPLFFBQU8sQ0FBUCx5Q0FBTyxDQUFQLE1BQVksUUFBbkI7QUFDRDs7QUFFRCxTQUFTLFFBQVQsQ0FBa0IsQ0FBbEIsRUFBcUI7QUFDbkIsU0FBTyxRQUFPLENBQVAseUNBQU8sQ0FBUCxNQUFZLE1BQW5CO0FBQ0Q7O0FBRUQsU0FBUyxPQUFULENBQWlCLENBQWpCLEVBQW9CO0FBQ2xCLFNBQU8sYUFBYSxLQUFwQjtBQUNEOztBQUVELFNBQVMsTUFBVCxDQUFnQixDQUFoQixFQUFtQjtBQUNqQixTQUFPLGFBQWEsSUFBcEI7QUFDRDs7QUFFRCxTQUFTLFFBQVQsQ0FBa0IsQ0FBbEIsRUFBcUI7QUFDbkIsU0FBTyxhQUFhLE1BQXBCO0FBQ0Q7O0FBRUQsU0FBUyxhQUFULENBQXVCLENBQXZCLEVBQTBCO0FBQ3hCLFNBQU8sUUFBTyxDQUFQLHlDQUFPLENBQVAsTUFBWSxNQUFaLElBQXNCLE1BQU0sSUFBNUIsSUFBb0MsRUFBRSxXQUFGLElBQWlCLE1BQTVEO0FBQ0Q7O0FBRUQsU0FBUyxPQUFULENBQWlCLENBQWpCLEVBQW9CO0FBQ2xCLE1BQUksQ0FBQyxDQUFMLEVBQVEsT0FBTyxJQUFQO0FBQ1IsTUFBSSxRQUFRLENBQVIsQ0FBSixFQUFnQjtBQUNkLFdBQU8sRUFBRSxNQUFGLElBQVksQ0FBbkI7QUFDRDtBQUNELE1BQUksY0FBYyxDQUFkLENBQUosRUFBc0I7QUFDcEIsUUFBSSxDQUFKO0FBQ0EsU0FBSyxDQUFMLElBQVUsQ0FBVixFQUFhO0FBQ1gsYUFBTyxLQUFQO0FBQ0Q7QUFDRCxXQUFPLElBQVA7QUFDRDtBQUNELE1BQUksU0FBUyxDQUFULENBQUosRUFBaUI7QUFDZixXQUFPLE1BQU0sRUFBYjtBQUNEO0FBQ0QsTUFBSSxTQUFTLENBQVQsQ0FBSixFQUFpQjtBQUNmLFdBQU8sTUFBTSxDQUFiO0FBQ0Q7QUFDRCxRQUFNLElBQUksS0FBSixDQUFVLGtCQUFWLENBQU47QUFDRDs7QUFFRCxTQUFTLGNBQVQsQ0FBd0IsQ0FBeEIsRUFBMkIsQ0FBM0IsRUFBOEI7QUFDNUIsU0FBTyxLQUFLLEVBQUUsY0FBRixDQUFpQixDQUFqQixDQUFaO0FBQ0Q7O0FBRUQsU0FBUyxLQUFULENBQWUsQ0FBZixFQUFrQjtBQUNoQixTQUFPLEVBQUUsV0FBRixFQUFQO0FBQ0Q7O0FBRUQsU0FBUyxLQUFULENBQWUsQ0FBZixFQUFrQjtBQUNoQixTQUFPLEVBQUUsV0FBRixFQUFQO0FBQ0Q7O0FBRUQsU0FBUyxLQUFULENBQWUsQ0FBZixFQUFrQixFQUFsQixFQUFzQjtBQUNwQixNQUFJLENBQUMsRUFBTCxFQUFTO0FBQ1AsV0FBTyxJQUFJLEVBQUUsQ0FBRixDQUFKLEdBQVcsU0FBbEI7QUFDRDtBQUNELE9BQUssSUFBSSxJQUFJLENBQVIsRUFBVyxJQUFJLElBQUksQ0FBSixDQUFwQixFQUE0QixJQUFJLENBQWhDLEVBQW1DLEdBQW5DLEVBQXdDO0FBQ3RDLFFBQUksR0FBRyxFQUFFLENBQUYsQ0FBSCxDQUFKLEVBQWMsT0FBTyxFQUFFLENBQUYsQ0FBUDtBQUNmO0FBQ0Y7O0FBRUQsU0FBUyxPQUFULENBQWlCLENBQWpCLEVBQW9CO0FBQ2xCLE1BQUksUUFBUSxDQUFSLENBQUosRUFBZ0IsT0FBTyxDQUFQO0FBQ2hCLE1BQUksUUFBTyxDQUFQLHlDQUFPLENBQVAsTUFBWSxNQUFaLElBQXNCLElBQUksQ0FBSixDQUExQixFQUNFLE9BQU8sSUFBSSxDQUFKLEVBQU8sVUFBVSxDQUFWLEVBQWE7QUFBRSxXQUFPLENBQVA7QUFBVyxHQUFqQyxDQUFQO0FBQ0YsU0FBTyxNQUFNLFNBQU4sQ0FBZ0IsS0FBaEIsQ0FBc0IsSUFBdEIsQ0FBMkIsU0FBM0IsQ0FBUDtBQUNEOztBQUVELFNBQVMsT0FBVCxDQUFpQixDQUFqQixFQUFvQjtBQUNsQixNQUFJLFFBQVEsQ0FBUixDQUFKLEVBQ0UsT0FBTyxHQUFHLE1BQUgsQ0FBVSxLQUFWLENBQWdCLEVBQWhCLEVBQW9CLElBQUksQ0FBSixFQUFPLE9BQVAsQ0FBcEIsQ0FBUDtBQUNGLFNBQU8sQ0FBUDtBQUNEOztBQUVELElBQUksTUFBTSxDQUFDLENBQVg7QUFDQSxTQUFTLFFBQVQsQ0FBa0IsSUFBbEIsRUFBd0I7QUFDdEI7QUFDQSxTQUFPLENBQUMsUUFBUSxJQUFULElBQWlCLEdBQXhCO0FBQ0Q7O0FBRUQsU0FBUyxTQUFULEdBQXFCO0FBQ25CLFFBQU0sQ0FBQyxDQUFQO0FBQ0Q7O0FBRUQsU0FBUyxJQUFULENBQWMsQ0FBZCxFQUFpQjtBQUNmLE1BQUksQ0FBQyxDQUFMLEVBQVEsT0FBTyxFQUFQO0FBQ1IsTUFBSSxDQUFKO0FBQUEsTUFBTyxJQUFJLEVBQVg7QUFDQSxPQUFLLENBQUwsSUFBVSxDQUFWLEVBQWE7QUFDWCxNQUFFLElBQUYsQ0FBTyxDQUFQO0FBQ0Q7QUFDRCxTQUFPLENBQVA7QUFDRDs7QUFFRCxTQUFTLE1BQVQsQ0FBZ0IsQ0FBaEIsRUFBbUI7QUFDakIsTUFBSSxDQUFDLENBQUwsRUFBUSxPQUFPLEVBQVA7QUFDUixNQUFJLENBQUo7QUFBQSxNQUFPLElBQUksRUFBWDtBQUNBLE9BQUssQ0FBTCxJQUFVLENBQVYsRUFBYTtBQUNYLE1BQUUsSUFBRixDQUFPLEVBQUUsQ0FBRixDQUFQO0FBQ0Q7QUFDRCxTQUFPLENBQVA7QUFDRDs7QUFFRCxTQUFTLEtBQVQsQ0FBZSxDQUFmLEVBQWtCLEtBQWxCLEVBQXlCO0FBQ3ZCLE1BQUksQ0FBQyxDQUFMLEVBQVEsT0FBTyxDQUFQO0FBQ1IsTUFBSSxDQUFDLEtBQUwsRUFBWSxRQUFRLEVBQVI7QUFDWixNQUFJLElBQUksRUFBUjtBQUFBLE1BQVksQ0FBWjtBQUNBLE9BQUssQ0FBTCxJQUFVLENBQVYsRUFBYTtBQUNYLFFBQUksTUFBTSxPQUFOLENBQWMsQ0FBZCxLQUFvQixDQUFDLENBQXpCLEVBQTRCO0FBQzFCLFFBQUUsQ0FBRixJQUFPLEVBQUUsQ0FBRixDQUFQO0FBQ0Q7QUFDRjtBQUNELFNBQU8sQ0FBUDtBQUNEOztBQUVELFNBQVMsS0FBVCxDQUFlLENBQWYsRUFBa0I7QUFDaEIsU0FBTyxPQUFPLENBQVAsS0FBYSxXQUFwQjtBQUNEOztBQUVEOzs7QUFHQSxTQUFTLEtBQVQsQ0FBZSxDQUFmLEVBQWtCO0FBQ2hCLE1BQUksQ0FBSixFQUFPLENBQVA7QUFDQSxNQUFJLE1BQU0sSUFBVixFQUFnQixPQUFPLElBQVA7QUFDaEIsTUFBSSxNQUFNLFNBQVYsRUFBcUIsT0FBTyxTQUFQO0FBQ3JCLE1BQUksU0FBUyxDQUFULENBQUosRUFBaUI7QUFDZixRQUFJLFFBQVEsQ0FBUixDQUFKLEVBQWdCO0FBQ2QsVUFBSSxFQUFKO0FBQ0EsV0FBSyxJQUFJLElBQUksQ0FBUixFQUFXLElBQUksRUFBRSxNQUF0QixFQUE4QixJQUFJLENBQWxDLEVBQXFDLEdBQXJDLEVBQTBDO0FBQ3hDLFVBQUUsQ0FBRixJQUFPLE1BQU0sRUFBRSxDQUFGLENBQU4sQ0FBUDtBQUNEO0FBQ0YsS0FMRCxNQUtPO0FBQ0wsVUFBSSxFQUFKO0FBQ0EsVUFBSSxDQUFKO0FBQ0EsV0FBSyxDQUFMLElBQVUsQ0FBVixFQUFhO0FBQ1gsWUFBSSxFQUFFLENBQUYsQ0FBSjtBQUNBLFlBQUksTUFBTSxJQUFOLElBQWMsTUFBTSxTQUF4QixFQUFtQztBQUNqQyxZQUFFLENBQUYsSUFBTyxDQUFQO0FBQ0E7QUFDRDtBQUNELFlBQUksU0FBUyxDQUFULENBQUosRUFBaUI7QUFDZixjQUFJLE9BQU8sQ0FBUCxDQUFKLEVBQWU7QUFDYixjQUFFLENBQUYsSUFBTyxJQUFJLElBQUosQ0FBUyxFQUFFLE9BQUYsRUFBVCxDQUFQO0FBQ0QsV0FGRCxNQUVPLElBQUksU0FBUyxDQUFULENBQUosRUFBaUI7QUFDdEIsY0FBRSxDQUFGLElBQU8sSUFBSSxNQUFKLENBQVcsRUFBRSxNQUFiLEVBQXFCLEVBQUUsS0FBdkIsQ0FBUDtBQUNELFdBRk0sTUFFQSxJQUFJLFFBQVEsQ0FBUixDQUFKLEVBQWdCO0FBQ3JCLGNBQUUsQ0FBRixJQUFPLEVBQVA7QUFDQSxpQkFBSyxJQUFJLElBQUksQ0FBUixFQUFXLElBQUksRUFBRSxNQUF0QixFQUE4QixJQUFJLENBQWxDLEVBQXFDLEdBQXJDLEVBQTBDO0FBQ3hDLGdCQUFFLENBQUYsRUFBSyxDQUFMLElBQVUsTUFBTSxFQUFFLENBQUYsQ0FBTixDQUFWO0FBQ0Q7QUFDRixXQUxNLE1BS0E7QUFDTCxjQUFFLENBQUYsSUFBTyxNQUFNLENBQU4sQ0FBUDtBQUNEO0FBQ0YsU0FiRCxNQWFPO0FBQ0wsWUFBRSxDQUFGLElBQU8sQ0FBUDtBQUNEO0FBQ0Y7QUFDRjtBQUNGLEdBakNELE1BaUNPO0FBQ0wsUUFBSSxDQUFKO0FBQ0Q7QUFDRCxTQUFPLENBQVA7QUFDRDs7a0JBRWM7QUFDYixRQURhLG9CQUNKO0FBQ1AsUUFBSSxPQUFPLFNBQVg7QUFDQSxRQUFJLENBQUMsSUFBSSxJQUFKLENBQUwsRUFBZ0I7QUFDaEIsUUFBSSxJQUFJLElBQUosS0FBYSxDQUFqQixFQUFvQixPQUFPLEtBQUssQ0FBTCxDQUFQO0FBQ3BCLFFBQUksSUFBSSxLQUFLLENBQUwsQ0FBUjtBQUFBLFFBQWlCLENBQWpCO0FBQUEsUUFBb0IsQ0FBcEI7QUFDQSxTQUFLLElBQUksSUFBSSxDQUFSLEVBQVcsSUFBSSxJQUFJLElBQUosQ0FBcEIsRUFBK0IsSUFBSSxDQUFuQyxFQUFzQyxHQUF0QyxFQUEyQztBQUN6QyxVQUFJLEtBQUssQ0FBTCxDQUFKO0FBQ0EsVUFBSSxDQUFDLENBQUwsRUFBUTtBQUNSLFdBQUssQ0FBTCxJQUFVLENBQVYsRUFBYTtBQUNYLFVBQUUsQ0FBRixJQUFPLEVBQUUsQ0FBRixDQUFQO0FBQ0Q7QUFDRjtBQUNELFdBQU8sQ0FBUDtBQUNELEdBZFk7QUFnQmIsWUFoQmEsc0JBZ0JGLENBaEJFLEVBZ0JDO0FBQ1osUUFBSSxDQUFDLENBQUQsSUFBTSxNQUFNLEVBQUUsTUFBUixDQUFWLEVBQTJCLE1BQU0sSUFBSSxLQUFKLENBQVUseUJBQVYsQ0FBTjtBQUMzQixRQUFJLENBQUMsRUFBRSxNQUFQLEVBQWUsT0FBTyxFQUFQO0FBQ2YsUUFBSSxJQUFJLEVBQUUsTUFBVjtBQUNBLFFBQUksTUFBTSxDQUFWLEVBQWE7QUFDWCxVQUFJLFFBQVEsRUFBRSxDQUFGLENBQVo7QUFDQSxVQUFJLFNBQVMsS0FBVCxLQUFtQixNQUFNLE9BQU4sQ0FBYyxHQUFkLElBQXFCLENBQUMsQ0FBN0MsRUFBZ0Q7QUFDOUMsZUFBTyxNQUFNLEtBQU4sQ0FBWSxNQUFaLENBQVA7QUFDRDtBQUNGO0FBQ0QsV0FBTyxDQUFQO0FBQ0QsR0EzQlk7OztBQTZCYixvQkE3QmE7O0FBK0JiLHNCQS9CYTs7QUFpQ2Isa0JBakNhOztBQW1DYixZQW5DYTs7QUFxQ2IsWUFyQ2E7O0FBdUNiLFlBdkNhOztBQXlDYixnQkF6Q2E7O0FBMkNiLGNBM0NhOztBQTZDYixVQTdDYTs7QUErQ2IsY0EvQ2E7O0FBaURiLGtCQWpEYTs7QUFtRGIsa0JBbkRhOztBQXFEYixnQkFyRGE7O0FBdURiLG9CQXZEYTs7QUF5RGIsb0JBekRhOztBQTJEYixvQkEzRGE7O0FBNkRiLDhCQTdEYTs7QUErRGIsa0JBL0RhOztBQWlFYix3QkFqRWE7O0FBbUViLE9BQUssY0FuRVE7O0FBcUViLHFCQXJFYSwrQkFxRU8sQ0FyRVAsRUFxRVU7QUFDckIsV0FBTyxNQUFNLElBQU4sSUFBYyxNQUFNLFNBQXBCLElBQWlDLE1BQU0sRUFBOUM7QUFDRCxHQXZFWTs7O0FBeUViLGNBekVhOztBQTJFYixjQTNFYTs7QUE2RWI7Ozs7O0FBS0EsbUJBbEZhLDZCQWtGSyxDQWxGTCxFQWtGUTtBQUNuQixRQUFJLEtBQUssUUFBTyxFQUFFLElBQVQsS0FBaUIsUUFBMUIsRUFBb0M7QUFDbEMsYUFBTyxJQUFQO0FBQ0Q7QUFDRCxXQUFPLEtBQVA7QUFDRCxHQXZGWTs7O0FBeUZiOzs7QUFHQSxLQTVGYSxlQTRGVCxDQTVGUyxFQTRGTixFQTVGTSxFQTRGRjtBQUNULFFBQUksQ0FBQyxDQUFMLEVBQVE7QUFDUixRQUFJLENBQUo7QUFBQSxRQUFPLElBQUksSUFBSSxDQUFKLENBQVg7QUFDQSxRQUFJLENBQUMsQ0FBTCxFQUFRO0FBQ1IsU0FBSyxJQUFJLElBQUksQ0FBUixFQUFXLElBQUksSUFBSSxDQUFKLENBQXBCLEVBQTRCLElBQUksQ0FBaEMsRUFBbUMsR0FBbkMsRUFBd0M7QUFDdEMsVUFBSSxJQUFJLEtBQUssR0FBRyxFQUFFLENBQUYsQ0FBSCxDQUFMLEdBQWdCLEVBQUUsQ0FBRixDQUF4QjtBQUNBLFVBQUksTUFBTSxDQUFOLENBQUosRUFBYztBQUNaLFlBQUksQ0FBSjtBQUNELE9BRkQsTUFFTztBQUNMLGFBQUssQ0FBTDtBQUNEO0FBQ0Y7QUFDRCxXQUFPLENBQVA7QUFDRCxHQXpHWTs7O0FBMkdiOzs7QUFHQSxLQTlHYSxlQThHVCxDQTlHUyxFQThHTixFQTlHTSxFQThHRjtBQUNULFFBQUksSUFBSSxDQUFDLFFBQVQ7QUFDQSxTQUFLLElBQUksSUFBSSxDQUFSLEVBQVcsSUFBSSxJQUFJLENBQUosQ0FBcEIsRUFBNEIsSUFBSSxDQUFoQyxFQUFtQyxHQUFuQyxFQUF3QztBQUN0QyxVQUFJLElBQUksS0FBSyxHQUFHLEVBQUUsQ0FBRixDQUFILENBQUwsR0FBZ0IsRUFBRSxDQUFGLENBQXhCO0FBQ0EsVUFBSSxJQUFJLENBQVIsRUFDRSxJQUFJLENBQUo7QUFDSDtBQUNELFdBQU8sQ0FBUDtBQUNELEdBdEhZOzs7QUF3SGI7OztBQUdBLEtBM0hhLGVBMkhULENBM0hTLEVBMkhOLEVBM0hNLEVBMkhGO0FBQ1QsUUFBSSxJQUFJLFFBQVI7QUFDQSxTQUFLLElBQUksSUFBSSxDQUFSLEVBQVcsSUFBSSxJQUFJLENBQUosQ0FBcEIsRUFBNEIsSUFBSSxDQUFoQyxFQUFtQyxHQUFuQyxFQUF3QztBQUN0QyxVQUFJLElBQUksS0FBSyxHQUFHLEVBQUUsQ0FBRixDQUFILENBQUwsR0FBZ0IsRUFBRSxDQUFGLENBQXhCO0FBQ0EsVUFBSSxJQUFJLENBQVIsRUFDRSxJQUFJLENBQUo7QUFDSDtBQUNELFdBQU8sQ0FBUDtBQUNELEdBbklZOzs7QUFxSWI7OztBQUdBLFNBeElhLG1CQXdJTCxDQXhJSyxFQXdJRixFQXhJRSxFQXdJRTtBQUNiLFFBQUksQ0FBSjtBQUNBLFNBQUssSUFBSSxJQUFJLENBQVIsRUFBVyxJQUFJLElBQUksQ0FBSixDQUFwQixFQUE0QixJQUFJLENBQWhDLEVBQW1DLEdBQW5DLEVBQXdDO0FBQ3RDLFVBQUksQ0FBQyxDQUFMLEVBQVE7QUFDTixZQUFJLEVBQUUsQ0FBRixDQUFKO0FBQ0E7QUFDRDtBQUNELFVBQUksSUFBSSxHQUFHLEVBQUUsQ0FBRixDQUFILENBQVI7QUFDQSxVQUFJLElBQUksR0FBRyxDQUFILENBQVIsRUFDRSxJQUFJLEVBQUUsQ0FBRixDQUFKO0FBQ0g7QUFDRCxXQUFPLENBQVA7QUFDRCxHQXBKWTs7O0FBc0piOzs7QUFHQSxTQXpKYSxtQkF5SkwsQ0F6SkssRUF5SkYsRUF6SkUsRUF5SkU7QUFDYixRQUFJLENBQUo7QUFDQSxTQUFLLElBQUksSUFBSSxDQUFSLEVBQVcsSUFBSSxJQUFJLENBQUosQ0FBcEIsRUFBNEIsSUFBSSxDQUFoQyxFQUFtQyxHQUFuQyxFQUF3QztBQUN0QyxVQUFJLENBQUMsQ0FBTCxFQUFRO0FBQ04sWUFBSSxFQUFFLENBQUYsQ0FBSjtBQUNBO0FBQ0Q7QUFDRCxVQUFJLElBQUksR0FBRyxFQUFFLENBQUYsQ0FBSCxDQUFSO0FBQ0EsVUFBSSxJQUFJLEdBQUcsQ0FBSCxDQUFSLEVBQ0UsSUFBSSxFQUFFLENBQUYsQ0FBSjtBQUNIO0FBQ0QsV0FBTyxDQUFQO0FBQ0QsR0FyS1k7QUF1S2IsU0F2S2EsbUJBdUtMLENBdktLLEVBdUtGLENBdktFLEVBdUtDO0FBQ1osV0FBTyxFQUFFLE9BQUYsQ0FBVSxDQUFWLENBQVA7QUFDRCxHQXpLWTtBQTJLYixVQTNLYSxvQkEyS0osQ0EzS0ksRUEyS0QsQ0EzS0MsRUEyS0U7QUFDYixRQUFJLENBQUMsQ0FBTCxFQUFRLE9BQU8sS0FBUDtBQUNSLFdBQU8sRUFBRSxPQUFGLENBQVUsQ0FBVixJQUFlLENBQUMsQ0FBdkI7QUFDRCxHQTlLWTs7O0FBZ0xiOzs7Ozs7O0FBT0EsS0F2TGEsZUF1TFQsQ0F2TFMsRUF1TE4sRUF2TE0sRUF1TEY7QUFDVCxRQUFJLGNBQWMsQ0FBZCxDQUFKLEVBQXNCO0FBQ3BCLFVBQUksQ0FBSjtBQUNBLFdBQUssQ0FBTCxJQUFVLENBQVYsRUFBYTtBQUNYLFlBQUksR0FBRyxDQUFILEVBQU0sRUFBRSxDQUFGLENBQU4sQ0FBSixFQUNFLE9BQU8sSUFBUDtBQUNIO0FBQ0QsYUFBTyxLQUFQO0FBQ0Q7QUFDRCxTQUFLLElBQUksSUFBSSxDQUFSLEVBQVcsSUFBSSxJQUFJLENBQUosQ0FBcEIsRUFBNEIsSUFBSSxDQUFoQyxFQUFtQyxHQUFuQyxFQUF3QztBQUN0QyxVQUFJLEdBQUcsRUFBRSxDQUFGLENBQUgsQ0FBSixFQUNFLE9BQU8sSUFBUDtBQUNIO0FBQ0QsV0FBTyxLQUFQO0FBQ0QsR0FyTVk7OztBQXVNYjs7Ozs7OztBQU9BLEtBOU1hLGVBOE1ULENBOU1TLEVBOE1OLEVBOU1NLEVBOE1GO0FBQ1QsUUFBSSxjQUFjLENBQWQsQ0FBSixFQUFzQjtBQUNwQixVQUFJLENBQUo7QUFDQSxXQUFLLENBQUwsSUFBVSxDQUFWLEVBQWE7QUFDWCxZQUFJLENBQUMsR0FBRyxDQUFILEVBQU0sRUFBRSxDQUFGLENBQU4sQ0FBTCxFQUNFLE9BQU8sS0FBUDtBQUNIO0FBQ0QsYUFBTyxJQUFQO0FBQ0Q7QUFDRCxTQUFLLElBQUksSUFBSSxDQUFSLEVBQVcsSUFBSSxJQUFJLENBQUosQ0FBcEIsRUFBNEIsSUFBSSxDQUFoQyxFQUFtQyxHQUFuQyxFQUF3QztBQUN0QyxVQUFJLENBQUMsR0FBRyxFQUFFLENBQUYsQ0FBSCxDQUFMLEVBQ0UsT0FBTyxLQUFQO0FBQ0g7QUFDRCxXQUFPLElBQVA7QUFDRCxHQTVOWTs7O0FBOE5iOzs7QUFHQSxNQWpPYSxnQkFpT1IsQ0FqT1EsRUFpT0wsRUFqT0ssRUFpT0Q7QUFDVixRQUFJLENBQUMsQ0FBTCxFQUFRLE9BQU8sSUFBUDtBQUNSLFFBQUksUUFBUSxDQUFSLENBQUosRUFBZ0I7QUFDZCxVQUFJLENBQUMsQ0FBRCxJQUFNLENBQUMsSUFBSSxDQUFKLENBQVgsRUFBbUI7QUFDbkIsV0FBSyxJQUFJLElBQUksQ0FBUixFQUFXLElBQUksSUFBSSxDQUFKLENBQXBCLEVBQTRCLElBQUksQ0FBaEMsRUFBbUMsR0FBbkMsRUFBd0M7QUFDdEMsWUFBSSxHQUFHLEVBQUUsQ0FBRixDQUFILENBQUosRUFDRSxPQUFPLEVBQUUsQ0FBRixDQUFQO0FBQ0g7QUFDRjtBQUNELFFBQUksY0FBYyxDQUFkLENBQUosRUFBc0I7QUFDcEIsVUFBSSxDQUFKO0FBQ0EsV0FBSyxDQUFMLElBQVUsQ0FBVixFQUFhO0FBQ1gsWUFBSSxHQUFHLEVBQUUsQ0FBRixDQUFILEVBQVMsQ0FBVCxDQUFKLEVBQ0UsT0FBTyxFQUFFLENBQUYsQ0FBUDtBQUNIO0FBQ0Y7QUFDRDtBQUNELEdBbFBZO0FBb1BiLE9BcFBhLGlCQW9QUCxDQXBQTyxFQW9QSixFQXBQSSxFQW9QQTtBQUNYLFFBQUksQ0FBQyxDQUFELElBQU0sQ0FBQyxJQUFJLENBQUosQ0FBWCxFQUFtQixPQUFPLEVBQVA7QUFDbkIsUUFBSSxJQUFJLEVBQVI7QUFDQSxTQUFLLElBQUksSUFBSSxDQUFSLEVBQVcsSUFBSSxJQUFJLENBQUosQ0FBcEIsRUFBNEIsSUFBSSxDQUFoQyxFQUFtQyxHQUFuQyxFQUF3QztBQUN0QyxVQUFJLEdBQUcsRUFBRSxDQUFGLENBQUgsQ0FBSixFQUNFLEVBQUUsSUFBRixDQUFPLEVBQUUsQ0FBRixDQUFQO0FBQ0g7QUFDRCxXQUFPLENBQVA7QUFDRCxHQTVQWTtBQThQYixZQTlQYSxzQkE4UEYsQ0E5UEUsRUE4UEMsQ0E5UEQsRUE4UEk7QUFDZixRQUFJLElBQUksQ0FBQyxDQUFUO0FBQ0EsU0FBSyxJQUFJLElBQUksQ0FBUixFQUFXLElBQUksSUFBSSxDQUFKLENBQXBCLEVBQTRCLElBQUksQ0FBaEMsRUFBbUMsR0FBbkMsRUFBd0M7QUFDdEMsVUFBSSxFQUFFLENBQUYsTUFBUyxDQUFiLEVBQWdCO0FBQ2QsWUFBSSxDQUFKO0FBQ0E7QUFDRDtBQUNGO0FBQ0QsTUFBRSxNQUFGLENBQVMsQ0FBVCxFQUFZLENBQVo7QUFDRCxHQXZRWTtBQXlRYixhQXpRYSx1QkF5UUQsQ0F6UUMsRUF5UUUsQ0F6UUYsRUF5UUs7QUFBQTs7QUFDaEIsU0FBSyxDQUFMLEVBQVEsb0JBQVk7QUFDbEIsWUFBSyxVQUFMLENBQWdCLENBQWhCLEVBQW1CLFFBQW5CO0FBQ0QsS0FGRDtBQUdELEdBN1FZO0FBK1FiLFFBL1FhLGtCQStRTixDQS9RTSxFQStRSCxFQS9RRyxFQStRQztBQUNaLFFBQUksQ0FBQyxDQUFELElBQU0sQ0FBQyxJQUFJLENBQUosQ0FBWCxFQUFtQixPQUFPLEVBQVA7QUFDbkIsUUFBSSxJQUFJLEVBQVI7QUFDQSxTQUFLLElBQUksSUFBSSxDQUFSLEVBQVcsSUFBSSxJQUFJLENBQUosQ0FBcEIsRUFBNEIsSUFBSSxDQUFoQyxFQUFtQyxHQUFuQyxFQUF3QztBQUN0QyxVQUFJLENBQUMsR0FBRyxFQUFFLENBQUYsQ0FBSCxDQUFMLEVBQ0UsRUFBRSxJQUFGLENBQU8sRUFBRSxDQUFGLENBQVA7QUFDSDtBQUNELFdBQU8sQ0FBUDtBQUNELEdBdlJZO0FBeVJiLE1BelJhLGdCQXlSUixDQXpSUSxFQXlSTCxHQXpSSyxFQXlSQSxPQXpSQSxFQXlSUztBQUNwQixRQUFJLElBQUksRUFBUjtBQUNBLFFBQUksT0FBSixFQUFhO0FBQ1gsV0FBSyxJQUFJLENBQVQsSUFBYyxDQUFkLEVBQWlCO0FBQ2YsWUFBSSxJQUFJLE9BQUosQ0FBWSxDQUFaLEtBQWtCLENBQUMsQ0FBdkIsRUFDRSxFQUFFLENBQUYsSUFBTyxFQUFFLENBQUYsQ0FBUDtBQUNIO0FBQ0YsS0FMRCxNQUtPO0FBQ0wsV0FBSyxJQUFJLElBQUksQ0FBUixFQUFXLElBQUksSUFBSSxHQUFKLENBQXBCLEVBQThCLElBQUksQ0FBbEMsRUFBcUMsR0FBckMsRUFBMEM7QUFDeEMsWUFBSSxJQUFJLElBQUksQ0FBSixDQUFSO0FBQ0EsWUFBSSxlQUFlLENBQWYsRUFBa0IsQ0FBbEIsQ0FBSixFQUNFLEVBQUUsQ0FBRixJQUFPLEVBQUUsQ0FBRixDQUFQO0FBQ0g7QUFDRjtBQUNELFdBQU8sQ0FBUDtBQUNELEdBeFNZO0FBMFNiLE1BMVNhLGdCQTBTUixDQTFTUSxFQTBTTCxHQTFTSyxFQTBTQTtBQUNYLFdBQU8sS0FBSyxJQUFMLENBQVUsQ0FBVixFQUFhLEdBQWIsRUFBa0IsQ0FBbEIsQ0FBUDtBQUNELEdBNVNZOzs7QUE4U2I7Ozs7Ozs7QUFPQSxTQXJUYSxtQkFxVEwsQ0FyVEssRUFxVEYsS0FyVEUsRUFxVEssSUFyVEwsRUFxVFc7QUFDdEIsUUFBSSxDQUFDLElBQUwsRUFBVyxPQUFPLFNBQVA7QUFDWCxRQUFJLFFBQVEsRUFBWjtBQUNBLFFBQUksQ0FBSixFQUFPO0FBQ0wsV0FBSyxJQUFMLENBQVUsS0FBVixFQUFpQixhQUFLO0FBQ3BCLFlBQUksQ0FBQyxlQUFlLENBQWYsRUFBa0IsQ0FBbEIsQ0FBTCxFQUEyQjtBQUN6QixtQkFBUyxjQUFjLENBQWQsR0FBa0IsT0FBbEIsR0FBNEIsSUFBckM7QUFDRDtBQUNGLE9BSkQ7QUFLRCxLQU5ELE1BTU87QUFDTCxjQUFRLGFBQWEsSUFBckI7QUFDRDtBQUNELFFBQUksS0FBSixFQUNFLE1BQU0sSUFBSSxLQUFKLENBQVUsS0FBVixDQUFOO0FBQ0gsR0FuVVk7QUFxVWIsTUFyVWEsZ0JBcVVSLEVBclVRLEVBcVVKLFFBclVJLEVBcVVNLE9BclVOLEVBcVVlO0FBQzFCLFFBQUksVUFBVSxTQUFWLE9BQVUsR0FBWTtBQUN4QixhQUFPLFNBQVMsS0FBVCxDQUFlLElBQWYsRUFBcUIsQ0FBQyxFQUFELEVBQUssTUFBTCxDQUFZLFFBQVEsU0FBUixDQUFaLENBQXJCLENBQVA7QUFDRCxLQUZEO0FBR0EsWUFBUSxJQUFSLENBQWEsV0FBVyxJQUF4QjtBQUNBLFdBQU8sT0FBUDtBQUNELEdBM1VZO0FBNlViLFFBN1VhO0FBQUE7QUFBQTtBQUFBOztBQUFBO0FBQUE7QUFBQTs7QUFBQTtBQUFBLGNBNlVOLENBN1VNLEVBNlVIO0FBQ1IsV0FBTyxXQUFXLENBQVgsSUFBZ0IsT0FBTyxHQUFQLENBQWhCLEdBQThCLENBQXJDO0FBQ0QsR0EvVVk7QUFpVmIsT0FqVmEsaUJBaVZQLEVBalZPLEVBaVZIO0FBQ1IsZUFBVyxFQUFYLEVBQWUsQ0FBZjtBQUNELEdBblZZOzs7QUFxVmI7OztBQUdBLFFBeFZhLGtCQXdWTixDQXhWTSxFQXdWSCxFQXhWRyxFQXdWQyxPQXhWRCxFQXdWVTtBQUNyQixRQUFJLElBQUksQ0FBUjtBQUFBLFFBQVcsTUFBWDtBQUNBLGFBQVMsQ0FBVCxHQUFhO0FBQ1gsVUFBSSxJQUFJLENBQVIsRUFBVztBQUNUO0FBQ0EsaUJBQVMsR0FBRyxLQUFILENBQVMsV0FBVyxJQUFwQixFQUEwQixTQUExQixDQUFUO0FBQ0Q7QUFDRCxhQUFPLE1BQVA7QUFDRDtBQUNELFdBQU8sQ0FBUDtBQUNELEdBbFdZOzs7QUFvV2IsY0FwV2E7O0FBc1diOzs7QUFHQSxNQXpXYSxnQkF5V1IsRUF6V1EsRUF5V0osT0F6V0ksRUF5V0s7QUFDaEIsV0FBTyxLQUFLLE1BQUwsQ0FBWSxDQUFaLEVBQWUsRUFBZixFQUFtQixPQUFuQixDQUFQO0FBQ0QsR0EzV1k7OztBQTZXYjs7OztBQUlBLFNBalhhLG1CQWlYTCxFQWpYSyxFQWlYRDtBQUNWLFFBQUksT0FBTyxJQUFYO0FBQ0EsUUFBSSxPQUFPLEtBQUssT0FBTCxDQUFhLFNBQWIsQ0FBWDtBQUNBLFNBQUssS0FBTDtBQUNBLFdBQU8sU0FBUyxPQUFULEdBQW1CO0FBQ3hCLFVBQUksUUFBUSxLQUFLLE9BQUwsQ0FBYSxTQUFiLENBQVo7QUFDQSxhQUFPLEdBQUcsS0FBSCxDQUFTLEVBQVQsRUFBYSxLQUFLLE1BQUwsQ0FBWSxLQUFaLENBQWIsQ0FBUDtBQUNELEtBSEQ7QUFJRCxHQXpYWTs7O0FBMlhiLGNBM1hhOztBQTZYYjs7Ozs7Ozs7QUFRQSxVQXJZYSxvQkFxWUosRUFyWUksRUFxWUEsRUFyWUEsRUFxWUksT0FyWUosRUFxWWE7QUFDeEIsUUFBSSxFQUFKO0FBQ0EsYUFBUyxDQUFULEdBQWE7QUFDWCxVQUFJLEVBQUosRUFBUTtBQUNOLHFCQUFhLEVBQWI7QUFDRDtBQUNELFVBQUksT0FBTyxVQUFVLE1BQVYsR0FBbUIsUUFBUSxTQUFSLENBQW5CLEdBQXdDLFNBQW5EO0FBQ0EsV0FBSyxXQUFXLFlBQU07QUFDcEIsYUFBSyxJQUFMO0FBQ0EsV0FBRyxLQUFILENBQVMsT0FBVCxFQUFrQixJQUFsQjtBQUNELE9BSEksRUFHRixFQUhFLENBQUw7QUFJRDtBQUNELFdBQU8sQ0FBUDtBQUNELEdBbFpZOzs7QUFvWmI7Ozs7OztBQU1BLE9BMVphLGlCQTBaUCxDQTFaTyxFQTBaSixFQTFaSSxFQTBaQTtBQUNYLFFBQUksQ0FBQyxRQUFRLENBQVIsQ0FBTCxFQUFpQixNQUFNLElBQUksS0FBSixDQUFVLGdCQUFWLENBQU47QUFDakIsUUFBSSxJQUFKO0FBQ0EsU0FBSyxJQUFJLElBQUksQ0FBUixFQUFXLElBQUksRUFBRSxNQUF0QixFQUE4QixJQUFJLENBQWxDLEVBQXFDLEdBQXJDLEVBQTBDO0FBQ3hDLGFBQU8sRUFBRSxDQUFGLENBQVA7QUFDQSxVQUFJLFFBQVEsSUFBUixDQUFKLEVBQW1CO0FBQ2pCLGFBQUssS0FBTCxDQUFXLElBQVgsRUFBaUIsRUFBakI7QUFDRCxPQUZELE1BRU87QUFDTCxVQUFFLENBQUYsSUFBTyxHQUFHLElBQUgsQ0FBUDtBQUNEO0FBQ0Y7QUFDRCxXQUFPLENBQVA7QUFDRCxHQXRhWTs7O0FBd2FiOzs7QUFHQSxRQTNhYSxrQkEyYU4sQ0EzYU0sRUEyYUgsT0EzYUcsRUEyYU07QUFDakIsUUFBSSxDQUFDLENBQUwsRUFBUSxPQUFPLEtBQVA7QUFDUixRQUFJLENBQUMsT0FBTCxFQUFjLE1BQU0sc0JBQU47QUFDZCxRQUFJLFNBQVMsT0FBVCxDQUFKLEVBQXVCO0FBQ3JCLGdCQUFVLFFBQVEsU0FBUixFQUFtQixLQUFuQixDQUF5QixDQUF6QixFQUE0QixVQUFVLE1BQXRDLENBQVY7QUFDRDtBQUNELFNBQUssSUFBSSxJQUFJLENBQVIsRUFBVyxJQUFJLFFBQVEsTUFBNUIsRUFBb0MsSUFBSSxDQUF4QyxFQUEyQyxHQUEzQyxFQUFnRDtBQUM5QyxVQUFJLENBQUMsV0FBVyxFQUFFLFFBQVEsQ0FBUixDQUFGLENBQVgsQ0FBTCxFQUFnQztBQUM5QixlQUFPLEtBQVA7QUFDRDtBQUNGO0FBQ0QsV0FBTyxJQUFQO0FBQ0QsR0F2Ylk7OztBQXliYjs7O0FBR0EsUUE1YmEsa0JBNGJOLENBNWJNLEVBNGJILENBNWJHLEVBNGJBO0FBQ1gsV0FBTyxFQUFFLE9BQUYsQ0FBVSxnQkFBVixFQUE0QixVQUFVLENBQVYsRUFBYSxDQUFiLEVBQWdCO0FBQ2pELFVBQUksQ0FBQyxFQUFFLGNBQUYsQ0FBaUIsQ0FBakIsQ0FBTCxFQUNFLE9BQU8sQ0FBUDtBQUNGLGFBQU8sRUFBRSxDQUFGLENBQVA7QUFDRCxLQUpNLENBQVA7QUFLRCxHQWxjWTs7O0FBb2NiOzs7QUFHQSxNQXZjYSxnQkF1Y1IsRUF2Y1EsRUF1Y0osQ0F2Y0ksRUF1Y0Q7QUFDVixXQUFPLEdBQUcsSUFBSCxDQUFRLENBQVIsQ0FBUDtBQUNELEdBemNZO0FBMmNiLFFBM2NhLGtCQTJjTixFQTNjTSxFQTJjRixHQTNjRSxFQTJjRyxJQTNjSCxFQTJjUztBQUNwQixRQUFJLENBQUMsRUFBTCxFQUFTO0FBQ1QsUUFBSSxDQUFDLElBQUwsRUFBVztBQUNULFNBQUcsSUFBSCxDQUFRLEdBQVI7QUFDQTtBQUNEO0FBQ0QsWUFBUSxLQUFLLE1BQWI7QUFDRSxXQUFLLENBQUw7QUFBUSxXQUFHLElBQUgsQ0FBUSxHQUFSLEVBQWM7QUFDdEIsV0FBSyxDQUFMO0FBQVEsV0FBRyxJQUFILENBQVEsR0FBUixFQUFhLEtBQUssQ0FBTCxDQUFiLEVBQXVCO0FBQy9CLFdBQUssQ0FBTDtBQUFRLFdBQUcsSUFBSCxDQUFRLEdBQVIsRUFBYSxLQUFLLENBQUwsQ0FBYixFQUFzQixLQUFLLENBQUwsQ0FBdEIsRUFBZ0M7QUFDeEMsV0FBSyxDQUFMO0FBQVEsV0FBRyxJQUFILENBQVEsR0FBUixFQUFhLEtBQUssQ0FBTCxDQUFiLEVBQXNCLEtBQUssQ0FBTCxDQUF0QixFQUErQixLQUFLLENBQUwsQ0FBL0IsRUFBeUM7QUFDakQ7QUFBUyxXQUFHLEtBQUgsQ0FBUyxHQUFULEVBQWMsSUFBZDtBQUxYO0FBT0QsR0F4ZFk7OztBQTBkYixVQTFkYTs7QUE0ZGIsS0E1ZGEsZUE0ZFQsQ0E1ZFMsRUE0ZE47QUFDTCxXQUFPLE1BQU0sSUFBTixJQUFjLE1BQU0sU0FBM0I7QUFDRCxHQTlkWTtBQWdlYixZQWhlYSxzQkFnZUYsQ0FoZUUsRUFnZUM7QUFDWixXQUFPLE1BQU0sSUFBTixJQUFjLE1BQU0sU0FBcEIsSUFBaUMsTUFBTSxFQUE5QztBQUNEO0FBbGVZLEM7Ozs7O0FDdlBmOzs7O0FBQ0E7Ozs7QUFDQTs7Ozs7O0FBRUEsSUFBSSxPQUFPLE1BQVAsSUFBaUIsV0FBckIsRUFBa0M7QUFDaEMsU0FBTyxTQUFQLEdBQW1CO0FBQ2pCLGVBQVcsbUJBRE07QUFFakIsZUFBVyxtQkFGTTtBQUdqQixlQUFXO0FBSE0sR0FBbkI7QUFLRCxDLENBcEJEOzs7Ozs7Ozs7Ozs7QUFzQkEsT0FBTyxPQUFQLEdBQWlCO0FBQ2YsZ0NBRGU7QUFFZixnQ0FGZTtBQUdmO0FBSGUsQ0FBakIiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbigpe2Z1bmN0aW9uIHIoZSxuLHQpe2Z1bmN0aW9uIG8oaSxmKXtpZighbltpXSl7aWYoIWVbaV0pe3ZhciBjPVwiZnVuY3Rpb25cIj09dHlwZW9mIHJlcXVpcmUmJnJlcXVpcmU7aWYoIWYmJmMpcmV0dXJuIGMoaSwhMCk7aWYodSlyZXR1cm4gdShpLCEwKTt2YXIgYT1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK2krXCInXCIpO3Rocm93IGEuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixhfXZhciBwPW5baV09e2V4cG9ydHM6e319O2VbaV1bMF0uY2FsbChwLmV4cG9ydHMsZnVuY3Rpb24ocil7dmFyIG49ZVtpXVsxXVtyXTtyZXR1cm4gbyhufHxyKX0scCxwLmV4cG9ydHMscixlLG4sdCl9cmV0dXJuIG5baV0uZXhwb3J0c31mb3IodmFyIHU9XCJmdW5jdGlvblwiPT10eXBlb2YgcmVxdWlyZSYmcmVxdWlyZSxpPTA7aTx0Lmxlbmd0aDtpKyspbyh0W2ldKTtyZXR1cm4gb31yZXR1cm4gcn0pKCkiLCIvKipcclxuICogRXZlbnRzLlxyXG4gKiBodHRwczovL2dpdGh1Yi5jb20vUm9iZXJ0b1ByZXZhdG8vRGF0YUVudHJ5XHJcbiAqXHJcbiAqIENvcHlyaWdodCAyMDE5LCBSb2JlcnRvIFByZXZhdG9cclxuICogaHR0cHM6Ly9yb2JlcnRvcHJldmF0by5naXRodWIuaW9cclxuICpcclxuICogTGljZW5zZWQgdW5kZXIgdGhlIE1JVCBsaWNlbnNlOlxyXG4gKiBodHRwOi8vd3d3Lm9wZW5zb3VyY2Uub3JnL2xpY2Vuc2VzL01JVFxyXG4gKi9cclxuaW1wb3J0IF8gZnJvbSBcIi4uLy4uL3NjcmlwdHMvdXRpbHNcIjtcclxuXHJcbnZhciBhcnJheSA9IFtdO1xyXG52YXIgcHVzaCA9IGFycmF5LnB1c2g7XHJcbnZhciBzbGljZSA9IGFycmF5LnNsaWNlO1xyXG52YXIgc3BsaWNlID0gYXJyYXkuc3BsaWNlO1xyXG5cclxuLy8gUmVndWxhciBleHByZXNzaW9uIHVzZWQgdG8gc3BsaXQgZXZlbnQgc3RyaW5ncy5cclxuY29uc3QgZXZlbnRTcGxpdHRlciA9IC9cXHMrLztcclxuXHJcbnZhciBldmVudHNBcGkgPSBmdW5jdGlvbiAob2JqLCBhY3Rpb24sIG5hbWUsIHJlc3QpIHtcclxuICBpZiAoIW5hbWUpIHJldHVybiB0cnVlO1xyXG5cclxuICAvLyBIYW5kbGUgZXZlbnQgbWFwcy5cclxuICBpZiAodHlwZW9mIG5hbWUgPT09IFwib2JqZWN0XCIpIHtcclxuICAgIGZvciAodmFyIGtleSBpbiBuYW1lKSB7XHJcbiAgICAgIG9ialthY3Rpb25dLmFwcGx5KG9iaiwgW2tleSwgbmFtZVtrZXldXS5jb25jYXQocmVzdCkpO1xyXG4gICAgfVxyXG4gICAgcmV0dXJuIGZhbHNlO1xyXG4gIH1cclxuXHJcbiAgLy8gSGFuZGxlIHNwYWNlIHNlcGFyYXRlZCBldmVudCBuYW1lcy5cclxuICBpZiAoZXZlbnRTcGxpdHRlci50ZXN0KG5hbWUpKSB7XHJcbiAgICB2YXIgbmFtZXMgPSBuYW1lLnNwbGl0KGV2ZW50U3BsaXR0ZXIpO1xyXG4gICAgZm9yICh2YXIgaSA9IDAsIGwgPSBuYW1lcy5sZW5ndGg7IGkgPCBsOyBpKyspIHtcclxuICAgICAgb2JqW2FjdGlvbl0uYXBwbHkob2JqLCBbbmFtZXNbaV1dLmNvbmNhdChyZXN0KSk7XHJcbiAgICB9XHJcbiAgICByZXR1cm4gZmFsc2U7XHJcbiAgfVxyXG5cclxuICByZXR1cm4gdHJ1ZTtcclxufVxyXG5cclxudmFyIHRyaWdnZXJFdmVudHMgPSBmdW5jdGlvbiAoZXZlbnRzLCBhcmdzKSB7XHJcbiAgdmFyIGV2LCBpID0gLTEsIGwgPSBldmVudHMubGVuZ3RoLCBhMSA9IGFyZ3NbMF0sIGEyID0gYXJnc1sxXSwgYTMgPSBhcmdzWzJdO1xyXG4gIHN3aXRjaCAoYXJncy5sZW5ndGgpIHtcclxuICAgIGNhc2UgMDogd2hpbGUgKCsraSA8IGwpIChldiA9IGV2ZW50c1tpXSkuY2FsbGJhY2suY2FsbChldi5jdHgpOyByZXR1cm47XHJcbiAgICBjYXNlIDE6IHdoaWxlICgrK2kgPCBsKSAoZXYgPSBldmVudHNbaV0pLmNhbGxiYWNrLmNhbGwoZXYuY3R4LCBhMSk7IHJldHVybjtcclxuICAgIGNhc2UgMjogd2hpbGUgKCsraSA8IGwpIChldiA9IGV2ZW50c1tpXSkuY2FsbGJhY2suY2FsbChldi5jdHgsIGExLCBhMik7IHJldHVybjtcclxuICAgIGNhc2UgMzogd2hpbGUgKCsraSA8IGwpIChldiA9IGV2ZW50c1tpXSkuY2FsbGJhY2suY2FsbChldi5jdHgsIGExLCBhMiwgYTMpOyByZXR1cm47XHJcbiAgICBkZWZhdWx0OiB3aGlsZSAoKytpIDwgbCkgKGV2ID0gZXZlbnRzW2ldKS5jYWxsYmFjay5hcHBseShldi5jdHgsIGFyZ3MpO1xyXG4gIH1cclxufVxyXG5cclxuLy9cclxuLy8gQmFzZSBjbGFzcyBmb3IgZXZlbnRzIGVtaXR0ZXJzXHJcbi8vXHJcbmV4cG9ydCBkZWZhdWx0IGNsYXNzIEV2ZW50c0VtaXR0ZXIge1xyXG5cclxuICAvLyBCaW5kIGFuIGV2ZW50IHRvIGEgYGNhbGxiYWNrYCBmdW5jdGlvbi4gUGFzc2luZyBgXCJhbGxcImAgd2lsbCBiaW5kXHJcbiAgLy8gdGhlIGNhbGxiYWNrIHRvIGFsbCBldmVudHMgZmlyZWQuXHJcbiAgb24obmFtZSwgY2FsbGJhY2ssIGNvbnRleHQpIHtcclxuICAgIGlmICghZXZlbnRzQXBpKHRoaXMsIFwib25cIiwgbmFtZSwgW2NhbGxiYWNrLCBjb250ZXh0XSkgfHwgIWNhbGxiYWNrKSByZXR1cm4gdGhpcztcclxuICAgIHRoaXMuX2V2ZW50cyB8fCAodGhpcy5fZXZlbnRzID0ge30pO1xyXG4gICAgdmFyIGV2ZW50cyA9IHRoaXMuX2V2ZW50c1tuYW1lXSB8fCAodGhpcy5fZXZlbnRzW25hbWVdID0gW10pO1xyXG4gICAgZXZlbnRzLnB1c2goeyBjYWxsYmFjazogY2FsbGJhY2ssIGNvbnRleHQ6IGNvbnRleHQsIGN0eDogY29udGV4dCB8fCB0aGlzIH0pO1xyXG4gICAgcmV0dXJuIHRoaXM7XHJcbiAgfVxyXG5cclxuICAvLyBCaW5kIGFuIGV2ZW50IHRvIG9ubHkgYmUgdHJpZ2dlcmVkIGEgc2luZ2xlIHRpbWUuIEFmdGVyIHRoZSBmaXJzdCB0aW1lXHJcbiAgLy8gdGhlIGNhbGxiYWNrIGlzIGludm9rZWQsIGl0IHdpbGwgYmUgcmVtb3ZlZC5cclxuICBvbmNlKG5hbWUsIGNhbGxiYWNrLCBjb250ZXh0KSB7XHJcbiAgICBpZiAoIWV2ZW50c0FwaSh0aGlzLCBcIm9uY2VcIiwgbmFtZSwgW2NhbGxiYWNrLCBjb250ZXh0XSkgfHwgIWNhbGxiYWNrKSByZXR1cm4gdGhpcztcclxuICAgIHZhciBzZWxmID0gdGhpcztcclxuICAgIHZhciBvbmNlID0gXy5vbmNlKGZ1bmN0aW9uICgpIHtcclxuICAgICAgc2VsZi5vZmYobmFtZSwgb25jZSk7XHJcbiAgICAgIGNhbGxiYWNrLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XHJcbiAgICB9KTtcclxuICAgIG9uY2UuX2NhbGxiYWNrID0gY2FsbGJhY2s7XHJcbiAgICByZXR1cm4gdGhpcy5vbihuYW1lLCBvbmNlLCBjb250ZXh0KTtcclxuICB9XHJcblxyXG4gIC8vIFJlbW92ZSBvbmUgb3IgbWFueSBjYWxsYmFja3MuXHJcbiAgb2ZmKG5hbWUsIGNhbGxiYWNrLCBjb250ZXh0KSB7XHJcbiAgICB2YXIgcmV0YWluLCBldiwgZXZlbnRzLCBuYW1lcywgaSwgbCwgaiwgaztcclxuICAgIGlmICghdGhpcy5fZXZlbnRzIHx8ICFldmVudHNBcGkodGhpcywgXCJvZmZcIiwgbmFtZSwgW2NhbGxiYWNrLCBjb250ZXh0XSkpIHJldHVybiB0aGlzO1xyXG4gICAgaWYgKCFuYW1lICYmICFjYWxsYmFjayAmJiAhY29udGV4dCkge1xyXG4gICAgICB0aGlzLl9ldmVudHMgPSB7fTtcclxuICAgICAgcmV0dXJuIHRoaXM7XHJcbiAgICB9XHJcblxyXG4gICAgbmFtZXMgPSBuYW1lID8gW25hbWVdIDogXy5rZXlzKHRoaXMuX2V2ZW50cyk7XHJcbiAgICBmb3IgKGkgPSAwLCBsID0gbmFtZXMubGVuZ3RoOyBpIDwgbDsgaSsrKSB7XHJcbiAgICAgIG5hbWUgPSBuYW1lc1tpXTtcclxuICAgICAgaWYgKGV2ZW50cyA9IHRoaXMuX2V2ZW50c1tuYW1lXSkge1xyXG4gICAgICAgIHRoaXMuX2V2ZW50c1tuYW1lXSA9IHJldGFpbiA9IFtdO1xyXG4gICAgICAgIGlmIChjYWxsYmFjayB8fCBjb250ZXh0KSB7XHJcbiAgICAgICAgICBmb3IgKGogPSAwLCBrID0gZXZlbnRzLmxlbmd0aDsgaiA8IGs7IGorKykge1xyXG4gICAgICAgICAgICBldiA9IGV2ZW50c1tqXTtcclxuICAgICAgICAgICAgaWYgKChjYWxsYmFjayAmJiBjYWxsYmFjayAhPT0gZXYuY2FsbGJhY2sgJiYgY2FsbGJhY2sgIT09IGV2LmNhbGxiYWNrLl9jYWxsYmFjaykgfHxcclxuICAgICAgICAgICAgKGNvbnRleHQgJiYgY29udGV4dCAhPT0gZXYuY29udGV4dCkpIHtcclxuICAgICAgICAgICAgICByZXRhaW4ucHVzaChldik7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKCFyZXRhaW4ubGVuZ3RoKSBkZWxldGUgdGhpcy5fZXZlbnRzW25hbWVdO1xyXG4gICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIHRoaXM7XHJcbiAgfVxyXG5cclxuICAvLyBUcmlnZ2VyIG9uZSBvciBtYW55IGV2ZW50cywgZmlyaW5nIGFsbCBib3VuZCBjYWxsYmFja3MuXHJcbiAgdHJpZ2dlcihuYW1lKSB7XHJcbiAgICBpZiAoIXRoaXMuX2V2ZW50cykgcmV0dXJuIHRoaXM7XHJcbiAgICB2YXIgYXJncyA9IHNsaWNlLmNhbGwoYXJndW1lbnRzLCAxKTtcclxuICAgIGlmICghZXZlbnRzQXBpKHRoaXMsIFwidHJpZ2dlclwiLCBuYW1lLCBhcmdzKSkgcmV0dXJuIHRoaXM7XHJcbiAgICB2YXIgZXZlbnRzID0gdGhpcy5fZXZlbnRzW25hbWVdO1xyXG4gICAgdmFyIGFsbEV2ZW50cyA9IHRoaXMuX2V2ZW50cy5hbGw7XHJcbiAgICBpZiAoZXZlbnRzKSB0cmlnZ2VyRXZlbnRzKGV2ZW50cywgYXJncyk7XHJcbiAgICBpZiAoYWxsRXZlbnRzKSB0cmlnZ2VyRXZlbnRzKGFsbEV2ZW50cywgYXJndW1lbnRzKTtcclxuICAgIHJldHVybiB0aGlzO1xyXG4gIH1cclxuXHJcbiAgLy8gVHJpZ2dlciBvbmUgb3IgbWFueSBldmVudHMsIGZpcmluZyBhbGwgYm91bmQgY2FsbGJhY2tzLlxyXG4gIGVtaXQobmFtZSkge1xyXG4gICAgcmV0dXJuIHRoaXMudHJpZ2dlcihuYW1lKTtcclxuICB9XHJcblxyXG4gIC8vIFRlbGwgdGhpcyBvYmplY3QgdG8gc3RvcCBsaXN0ZW5pbmcgdG8gZWl0aGVyIHNwZWNpZmljIGV2ZW50cywgb3JcclxuICAvLyB0byBldmVyeSBvYmplY3QgaXQncyBjdXJyZW50bHkgbGlzdGVuaW5nIHRvLlxyXG4gIHN0b3BMaXN0ZW5pbmcob2JqLCBuYW1lLCBjYWxsYmFjaykge1xyXG4gICAgdmFyIGxpc3RlbmVycyA9IHRoaXMuX2xpc3RlbmVycztcclxuICAgIGlmICghbGlzdGVuZXJzKSByZXR1cm4gdGhpcztcclxuICAgIHZhciBkZWxldGVMaXN0ZW5lciA9ICFuYW1lICYmICFjYWxsYmFjaztcclxuICAgIGlmICh0eXBlb2YgbmFtZSA9PT0gXCJvYmplY3RcIikgY2FsbGJhY2sgPSB0aGlzO1xyXG4gICAgaWYgKG9iaikgKGxpc3RlbmVycyA9IHt9KVtvYmouX2xpc3RlbmVySWRdID0gb2JqO1xyXG4gICAgZm9yICh2YXIgaWQgaW4gbGlzdGVuZXJzKSB7XHJcbiAgICAgIGxpc3RlbmVyc1tpZF0ub2ZmKG5hbWUsIGNhbGxiYWNrLCB0aGlzKTtcclxuICAgICAgaWYgKGRlbGV0ZUxpc3RlbmVyKSBkZWxldGUgdGhpcy5fbGlzdGVuZXJzW2lkXTtcclxuICAgIH1cclxuICAgIHJldHVybiB0aGlzO1xyXG4gIH1cclxuXHJcbiAgbGlzdGVuVG8ob2JqLCBuYW1lLCBjYWxsYmFjaykge1xyXG4gICAgLy8gc3VwcG9ydCBjYWxsaW5nIHRoZSBtZXRob2Qgd2l0aCBhbiBvYmplY3QgYXMgc2Vjb25kIHBhcmFtZXRlclxyXG4gICAgaWYgKGFyZ3VtZW50cy5sZW5ndGggPT0gMiAmJiB0eXBlb2YgbmFtZSA9PSBcIm9iamVjdFwiKSB7XHJcbiAgICAgIHZhciB4O1xyXG4gICAgICBmb3IgKHggaW4gbmFtZSkge1xyXG4gICAgICAgIHRoaXMubGlzdGVuVG8ob2JqLCB4LCBuYW1lW3hdKTtcclxuICAgICAgfVxyXG4gICAgICByZXR1cm4gdGhpcztcclxuICAgIH1cclxuXHJcbiAgICB2YXIgbGlzdGVuZXJzID0gdGhpcy5fbGlzdGVuZXJzIHx8ICh0aGlzLl9saXN0ZW5lcnMgPSB7fSk7XHJcbiAgICB2YXIgaWQgPSBvYmouX2xpc3RlbmVySWQgfHwgKG9iai5fbGlzdGVuZXJJZCA9IF8udW5pcXVlSWQoXCJsXCIpKTtcclxuICAgIGxpc3RlbmVyc1tpZF0gPSBvYmo7XHJcbiAgICBpZiAodHlwZW9mIG5hbWUgPT09IFwib2JqZWN0XCIpIGNhbGxiYWNrID0gdGhpcztcclxuICAgIG9iai5vbihuYW1lLCBjYWxsYmFjaywgdGhpcyk7XHJcbiAgICByZXR1cm4gdGhpcztcclxuICB9XHJcblxyXG4gIGxpc3RlblRvT25jZShvYmosIG5hbWUsIGNhbGxiYWNrKSB7XHJcbiAgICB2YXIgbGlzdGVuZXJzID0gdGhpcy5fbGlzdGVuZXJzIHx8ICh0aGlzLl9saXN0ZW5lcnMgPSB7fSk7XHJcbiAgICB2YXIgaWQgPSBvYmouX2xpc3RlbmVySWQgfHwgKG9iai5fbGlzdGVuZXJJZCA9IF8udW5pcXVlSWQoXCJsXCIpKTtcclxuICAgIGxpc3RlbmVyc1tpZF0gPSBvYmo7XHJcbiAgICBpZiAodHlwZW9mIG5hbWUgPT09IFwib2JqZWN0XCIpIGNhbGxiYWNrID0gdGhpcztcclxuICAgIG9iai5vbmNlKG5hbWUsIGNhbGxiYWNrLCB0aGlzKTtcclxuICAgIHJldHVybiB0aGlzO1xyXG4gIH1cclxufTtcclxuIiwiLyoqXHJcbiAqIFByb3h5IGZ1bmN0aW9ucyB0byByYWlzZSBleGNlcHRpb25zLlxyXG4gKiBodHRwczovL2dpdGh1Yi5jb20vUm9iZXJ0b1ByZXZhdG8vRGF0YUVudHJ5XHJcbiAqXHJcbiAqIENvcHlyaWdodCAyMDE5LCBSb2JlcnRvIFByZXZhdG9cclxuICogaHR0cHM6Ly9yb2JlcnRvcHJldmF0by5naXRodWIuaW9cclxuICpcclxuICogTGljZW5zZWQgdW5kZXIgdGhlIE1JVCBsaWNlbnNlOlxyXG4gKiBodHRwOi8vd3d3Lm9wZW5zb3VyY2Uub3JnL2xpY2Vuc2VzL01JVFxyXG4gKi9cclxuY29uc3QgTk9fUEFSQU0gPSBcIj8/P1wiXHJcblxyXG5mdW5jdGlvbiBBcmd1bWVudE51bGxFeGNlcHRpb24obmFtZSkge1xyXG4gIHRocm93IG5ldyBFcnJvcihcIlRoZSBwYXJhbWV0ZXIgY2Fubm90IGJlIG51bGw6IFwiICsgKG5hbWUgfHwgTk9fUEFSQU0pKVxyXG59XHJcblxyXG5mdW5jdGlvbiBBcmd1bWVudEV4Y2VwdGlvbihkZXRhaWxzKSB7XHJcbiAgdGhyb3cgbmV3IEVycm9yKFwiSW52YWxpZCBhcmd1bWVudDogXCIgKyAoZGV0YWlscyB8fCBOT19QQVJBTSkpXHJcbn1cclxuXHJcbmZ1bmN0aW9uIFR5cGVFeGNlcHRpb24obmFtZSwgZXhwZWN0ZWRUeXBlKSB7XHJcbiAgdGhyb3cgbmV3IEVycm9yKFwiRXhwZWN0ZWQgcGFyYW1ldGVyOiBcIiArIChuYW1lIHx8IE5PX1BBUkFNKSArIFwiIG9mIHR5cGU6IFwiICsgKHR5cGUgfHwgTk9fUEFSQU0pKVxyXG59XHJcblxyXG5mdW5jdGlvbiBPcGVyYXRpb25FeGNlcHRpb24oZGVzYykge1xyXG4gIHRocm93IG5ldyBFcnJvcihcIkludmFsaWQgb3BlcmF0aW9uOiBcIiArIGRlc2MpO1xyXG59XHJcblxyXG5leHBvcnQge1xyXG4gIEFyZ3VtZW50RXhjZXB0aW9uLFxyXG4gIEFyZ3VtZW50TnVsbEV4Y2VwdGlvbixcclxuICBUeXBlRXhjZXB0aW9uLFxyXG4gIE9wZXJhdGlvbkV4Y2VwdGlvblxyXG59XHJcbiIsIi8qKlxyXG4gKiBEYXRhRW50cnkgY2xhc3MuXHJcbiAqIGh0dHBzOi8vZ2l0aHViLmNvbS9Sb2JlcnRvUHJldmF0by9EYXRhRW50cnlcclxuICpcclxuICogQ29weXJpZ2h0IDIwMTksIFJvYmVydG8gUHJldmF0b1xyXG4gKiBodHRwczovL3JvYmVydG9wcmV2YXRvLmdpdGh1Yi5pb1xyXG4gKlxyXG4gKiBMaWNlbnNlZCB1bmRlciB0aGUgTUlUIGxpY2Vuc2U6XHJcbiAqIGh0dHA6Ly93d3cub3BlbnNvdXJjZS5vcmcvbGljZW5zZXMvTUlUXHJcbiAqL1xyXG5pbXBvcnQgXyBmcm9tIFwiLi4vLi4vc2NyaXB0cy91dGlsc1wiXHJcbmltcG9ydCB7IHJhaXNlIH0gZnJvbSBcIi4uLy4uL3NjcmlwdHMvcmFpc2VcIlxyXG5pbXBvcnQgRXZlbnRzRW1pdHRlciBmcm9tIFwiLi4vLi4vc2NyaXB0cy9jb21wb25lbnRzL2V2ZW50c1wiXHJcbmltcG9ydCBGb3JtYXR0ZXIgZnJvbSBcIi4vZm9ybWF0dGluZy9mb3JtYXR0ZXJcIlxyXG5pbXBvcnQgVmFsaWRhdG9yIGZyb20gXCIuL3ZhbGlkYXRpb24vdmFsaWRhdG9yXCJcclxuXHJcbmNvbnN0IFZFUlNJT04gPSBcIjIuMC41XCJcclxuXHJcbmNvbnN0IERFRkFVTFRTID0ge1xyXG4gIFxyXG4gIHVzZUltcGxpY2l0Q29uc3RyYWludHM6IHRydWUsIC8vIHdoZXRoZXIgdG8gZW5hYmxlIGltcGxpY2l0IGNvbnN0cmFpbnRzIGJ5IG1hdGNoIHdpdGggdmFsaWRhdG9yIG5hbWVzXHJcblxyXG4gIHVzZUltcGxpY2l0Rm9ybWF0OiB0cnVlLCAvLyB3aGV0aGVyIHRvIGVuYWJsZSBpbXBsaWNpdCBmb3JtYXR0aW5nIGJ5IG1hdGNoIHdpdGggdmFsaWRhdG9yIG5hbWVzXHJcblxyXG4gIGZvcm1hdHRlcjogRm9ybWF0dGVyLFxyXG5cclxuICB2YWxpZGF0b3I6IFZhbGlkYXRvcixcclxuXHJcbiAgbG9jYWxpemVyOiBudWxsLCAvLyB1c2VkIHRvIGxvY2FsaXplIGVycm9yIG1lc3NhZ2VzXHJcblxyXG4gIGJpbmRlcjogbnVsbCxcclxuXHJcbiAgdHJpZ2dlcnNEZWxheTogdW5kZWZpbmVkIC8vIGxldCBzcGVjaWZ5IGEgZGVsYXkgZm9yIHZhbGlkYXRpb24gdHJpZ2dlcnNcclxufVxyXG5cclxuY29uc3QgbGVuID0gXy5sZW47XHJcbmNvbnN0IGlzU3RyaW5nID0gXy5pc1N0cmluZztcclxuY29uc3QgaXNQbGFpbk9iamVjdCA9IF8uaXNQbGFpbk9iamVjdDtcclxuY29uc3QgaXNGdW5jdGlvbiA9IF8uaXNGdW5jdGlvbjtcclxuY29uc3QgaXNBcnJheSA9IF8uaXNBcnJheTtcclxuY29uc3QgZXh0ZW5kID0gXy5leHRlbmQ7XHJcbmNvbnN0IGVhY2ggPSBfLmVhY2g7XHJcbmNvbnN0IGZpbmQgPSBfLmZpbmQ7XHJcbmNvbnN0IHdoZXJlID0gXy53aGVyZTtcclxuY29uc3QgcGljayA9IF8ucGljaztcclxuY29uc3QgY29udGFpbnMgPSBfLmNvbnRhaW5zO1xyXG5jb25zdCBmbGF0dGVuID0gXy5mbGF0dGVuO1xyXG5jb25zdCBmaXJzdCA9IF8uZmlyc3Q7XHJcblxyXG5cclxuZnVuY3Rpb24gb2JqT3JJbnN0YW5jZSh2LCBkYXRhZW50cnkpIHtcclxuICBpZiAoIXYpIFxyXG4gICAgcmV0dXJuIG51bGw7XHJcbiAgXHJcbiAgaWYgKHYucHJvdG90eXBlKSB7XHJcbiAgICByZXR1cm4gbmV3IHYoZGF0YWVudHJ5KTtcclxuICB9XHJcbiAgcmV0dXJuIHY7XHJcbn1cclxuXHJcblxyXG5mdW5jdGlvbiB2YWxpZGF0ZUxvY2FsaXplcihvYmopIHtcclxuICBpZiAoIV8ucXVhY2tzKG9iaiwgW1widFwiLCBcImxvb2t1cFwiXSkpIHtcclxuICAgIHJhaXNlKDIyLCBcImludmFsaWQgYGxvY2FsaXplcmAgb3B0aW9uOiBpdCBtdXN0IGltcGxlbWVudCAndCcgYW5kICdsb29rdXAnIG1ldGhvZHMuXCIpXHJcbiAgfVxyXG59XHJcblxyXG5cclxuY2xhc3MgRGF0YUVudHJ5IGV4dGVuZHMgRXZlbnRzRW1pdHRlciB7XHJcblxyXG4gIHN0YXRpYyBnZXQgdmVyc2lvbigpIHtcclxuICAgIHJldHVybiBWRVJTSU9OO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQ3JlYXRlcyBhIG5ldyBpbnN0YW5jZSBvZiBEYXRhRW50cnkgd2l0aCB0aGUgZ2l2ZW4gb3B0aW9ucyBhbmQgc3RhdGljIHByb3BlcnRpZXMuXHJcbiAgICpcclxuICAgKiBAcGFyYW0gb3B0aW9uczogb3B0aW9ucyB0byB1c2UgZm9yIHRoaXMgaW5zdGFuY2Ugb2YgRGF0YUVudHJ5LlxyXG4gICAqIEBwYXJhbSBzdGF0aWNQcm9wZXJ0aWVzOiBwcm9wZXJ0aWVzIHRvIG92ZXJyaWRlIGluIHRoZSBpbnN0YW5jZSBvZiBEYXRhRW50cnkuXHJcbiAgICovXHJcbiAgY29uc3RydWN0b3Iob3B0aW9ucykge1xyXG4gICAgc3VwZXIoKTtcclxuICAgIGlmICghb3B0aW9ucykgcmFpc2UoOCwgXCJtaXNzaW5nIG9wdGlvbnNcIik7IC8vIG1pc3Npbmcgb3B0aW9uc1xyXG4gICAgaWYgKCFvcHRpb25zLnNjaGVtYSkgcmFpc2UoOCwgXCJtaXNzaW5nIHNjaGVtYVwiKTsgLy8gbWlzc2luZyBzY2hlbWFcclxuXHJcbiAgICB2YXIgc2VsZiA9IHRoaXMsIGJhc2VQcm9wZXJ0aWVzID0gRGF0YUVudHJ5LmJhc2VQcm9wZXJ0aWVzO1xyXG5cclxuICAgIGV4dGVuZChzZWxmLCBwaWNrKG9wdGlvbnMsIGJhc2VQcm9wZXJ0aWVzKSk7XHJcbiAgICBzZWxmLm9wdGlvbnMgPSBvcHRpb25zID0gZXh0ZW5kKHt9LCBEYXRhRW50cnkuZGVmYXVsdHMsIHBpY2sob3B0aW9ucywgYmFzZVByb3BlcnRpZXMsIDEpKTtcclxuXHJcbiAgICB2YXIgbWlzc2luZ1R5cGVzID0gW107XHJcbiAgICBlYWNoKFtcIm1hcmtlclwiLCBcImZvcm1hdHRlclwiLCBcImhhcnZlc3RlclwiXSwgbmFtZSA9PiB7XHJcbiAgICAgIGlmICghb3B0aW9uc1tuYW1lXSkgbWlzc2luZ1R5cGVzLnB1c2gobmFtZSk7XHJcbiAgICB9KTtcclxuICAgIGlmIChtaXNzaW5nVHlwZXMubGVuZ3RoKSB7XHJcbiAgICAgIHJhaXNlKDgsIFwibWlzc2luZyBvcHRpb25zOiBcIiArIG1pc3NpbmdUeXBlcy5qb2luKFwiLCBcIikpXHJcbiAgICB9XHJcblxyXG4gICAgY29uc3QgbG9jYWxpemVyID0gb3B0aW9ucy5sb2NhbGl6ZXI7XHJcbiAgICBpZiAobG9jYWxpemVyKVxyXG4gICAgICB2YWxpZGF0ZUxvY2FsaXplcihsb2NhbGl6ZXIpO1xyXG4gICAgc2VsZi5sb2NhbGl6ZXIgPSBsb2NhbGl6ZXI7XHJcblxyXG4gICAgZWFjaChbXHJcbiAgICAgIFwibWFya2VyXCIsIFxyXG4gICAgICBcImZvcm1hdHRlclwiLCBcclxuICAgICAgXCJoYXJ2ZXN0ZXJcIiwgXHJcbiAgICAgIFwidmFsaWRhdG9yXCIsXHJcbiAgICAgIFwiYmluZGVyXCJdLCBuYW1lID0+IHtcclxuICAgICAgc2VsZltuYW1lXSA9IG9iak9ySW5zdGFuY2Uob3B0aW9uc1tuYW1lXSwgc2VsZik7XHJcbiAgICB9KVxyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQ29uZmlndXJlcyBnbG9iYWwgZGVmYXVsdCBvcHRpb25zIGZvciB0aGUgRGF0YUVudHJ5LlxyXG4gICAqIFxyXG4gICAqIEBwYXJhbSB7b2JqZWN0fSBvcHRpb25zIFxyXG4gICAqL1xyXG4gIHN0YXRpYyBjb25maWd1cmUob3B0aW9ucykge1xyXG4gICAgZWFjaChvcHRpb25zLCAodiwgaykgPT4ge1xyXG4gICAgICBEYXRhRW50cnkuZGVmYXVsdHNba10gPSB2O1xyXG4gICAgfSk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBEaXNwb3NlcyBvZiB0aGlzIGRhdGFlbnRyeS5cclxuICAgKi9cclxuICBkaXNwb3NlKCkge1xyXG4gICAgdmFyIHNlbGYgPSB0aGlzO1xyXG4gICAgZWFjaChbXHJcbiAgICAgIFwiYmluZGVyXCIsIFxyXG4gICAgICBcIm1hcmtlclwiLCBcclxuICAgICAgXCJmb3JtYXR0ZXJcIiwgXHJcbiAgICAgIFwiaGFydmVzdGVyXCIsIFxyXG4gICAgICBcInZhbGlkYXRvclwiLFxyXG4gICAgICBcImNvbnRleHRcIl0sIG5hbWUgPT4ge1xyXG4gICAgICB2YXIgbyA9IHNlbGZbbmFtZV07XHJcbiAgICAgIGlmIChvICYmIG8uZGlzcG9zZSlcclxuICAgICAgICBvLmRpc3Bvc2UoKTtcclxuICAgICAgZGVsZXRlIHNlbGZbbmFtZV07XHJcbiAgICB9KVxyXG4gICAgZWFjaChbXCJ2YWxpZGF0aW9uQ29udGV4dFwiXSwgbmFtZSA9PiB7XHJcbiAgICAgIGRlbGV0ZSBzZWxmLm9wdGlvbnNbbmFtZV07XHJcbiAgICB9KVxyXG4gICAgZGVsZXRlIHNlbGYub3B0aW9ucztcclxuICAgIC8vIHJlbW92ZSBldmVudCBsaXN0ZW5lcnNcclxuICAgIHNlbGYub2ZmKCk7XHJcbiAgICBzZWxmLnN0b3BMaXN0ZW5pbmcoKTtcclxuICAgIHJldHVybiBzZWxmO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogVmFsaWRhdGVzIHRoZSBmaWVsZHMgZGVmaW5lZCBpbiB0aGUgc2NoZW1hIG9mIHRoaXMgRGF0YUVudHJ5OyBvciBzcGVjaWZpYyBmaWVsZHMgYnkgbmFtZS5cclxuICAgKiBcclxuICAgKiBAcGFyYW0gZmllbGRzXHJcbiAgICogQHBhcmFtIG9wdGlvbnNcclxuICAgKiBAcmV0dXJucyB7UHJvbWlzZX1cclxuICAgKi9cclxuICB2YWxpZGF0ZShmaWVsZHMsIG9wdGlvbnMpIHtcclxuICAgIHZhciBzZWxmID0gdGhpcztcclxuICAgIG9wdGlvbnMgPSBvcHRpb25zIHx8IHt9O1xyXG4gICAgaWYgKGZpZWxkcyAmJiBpc0Z1bmN0aW9uKGZpZWxkcykpIGZpZWxkcyA9IGZpZWxkcy5jYWxsKHNlbGYpO1xyXG4gICAgaWYgKGZpZWxkcyAmJiAhaXNBcnJheShmaWVsZHMpKSByYWlzZSg5LCBcInZhbGlkYXRlIGBmaWVsZHNgIGFyZ3VtZW50IG11c3QgYmUgYW4gYXJyYXkgb2Ygc3RyaW5nc1wiKTsgLy8gaW52YWxpZCBwYXJhbWV0ZXI6IGZpZWxkcyBtdXN0IGJlIGFuIGFycmF5IG9mIHN0cmluZ3NcclxuXHJcbiAgICB2YXIgc2NoZW1hID0gc2VsZi5zY2hlbWE7XHJcbiAgICBpZiAoIXNjaGVtYSkgcmFpc2UoMTEpO1xyXG5cclxuICAgIHJldHVybiBuZXcgUHJvbWlzZShmdW5jdGlvbiAocmVzb2x2ZSwgcmVqZWN0KSB7XHJcbiAgICAgIHZhciBjaGFpbiA9IFtdLCB2YWxpZGF0aW5nRmllbGRzID0gW107XHJcbiAgICAgIGZvciAodmFyIHggaW4gc2NoZW1hKSB7XHJcbiAgICAgICAgaWYgKGZpZWxkcyAmJiAhY29udGFpbnMoZmllbGRzLCB4KSkgY29udGludWU7XHJcbiAgICAgICAgdmFsaWRhdGluZ0ZpZWxkcy5wdXNoKHgpOyAvLyBuYW1lcyBvZiBmaWVsZHMgYmVpbmcgdmFsaWRhdGVkXHJcbiAgICAgIH1cclxuXHJcbiAgICAgIG9wdGlvbnMudmFsaWRhdGluZ0ZpZWxkcyA9IHZhbGlkYXRpbmdGaWVsZHM7IC8vIHNvIHdlIGRvbid0IHRyaWdnZXIgdmFsaWRhdGlvbiBmb3IgZmllbGRzIGJlaW5nIHZhbGlkYXRlZFxyXG5cclxuICAgICAgZWFjaCh2YWxpZGF0aW5nRmllbGRzLCBmaWVsZE5hbWUgPT4ge1xyXG4gICAgICAgIGNoYWluLnB1c2goc2VsZi52YWxpZGF0ZUZpZWxkKGZpZWxkTmFtZSwgb3B0aW9ucykpO1xyXG4gICAgICB9KVxyXG4gICAgICBcclxuXHJcbiAgICAgIFByb21pc2UuYWxsKGNoYWluKS50aGVuKGZ1bmN0aW9uIChhKSB7XHJcbiAgICAgICAgdmFyIGRhdGEgPSBmbGF0dGVuKGEpO1xyXG4gICAgICAgIHZhciBlcnJvcnMgPSB3aGVyZShkYXRhLCBmdW5jdGlvbiAobykgeyByZXR1cm4gbyAmJiBvLmVycm9yOyB9KTtcclxuICAgICAgICBpZiAobGVuKGVycm9ycykpIHtcclxuICAgICAgICAgIHNlbGYudHJpZ2dlcihcImZpcnN0OmVycm9yXCIsIGVycm9yc1swXSk7XHJcbiAgICAgICAgICBzZWxmLnRyaWdnZXIoXCJlcnJvcnNcIiwgZXJyb3JzKTtcclxuXHJcbiAgICAgICAgICAvL3Jlc29sdmUgd2l0aCBmYWlsdXJlIHZhbHVlXHJcbiAgICAgICAgICByZXNvbHZlLmNhbGwoc2VsZiwge1xyXG4gICAgICAgICAgICB2YWxpZDogZmFsc2UsXHJcbiAgICAgICAgICAgIGVycm9yczogZXJyb3JzXHJcbiAgICAgICAgICB9KTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgLy9hbGwgdGhlIHZhbGlkYXRpb24gcnVsZXMgcmV0dXJuZWQgc3VjY2Vzc1xyXG4gICAgICAgICAgcmVzb2x2ZS5jYWxsKHNlbGYsIHtcclxuICAgICAgICAgICAgdmFsaWQ6IHRydWUsXHJcbiAgICAgICAgICAgIHZhbHVlczogc2VsZi5oYXJ2ZXN0ZXIuZ2V0VmFsdWVzKClcclxuICAgICAgICAgIH0pO1xyXG4gICAgICAgIH1cclxuICAgICAgfSwgZnVuY3Rpb24gKGRhdGEpIHtcclxuICAgICAgICAvL2FuIGV4Y2VwdGlvbiBoYXBwZW4gd2hpbGUgcGVyZm9ybWluZyB2YWxpZGF0aW9uOyByZWplY3QgdGhlIHByb21pc2VcclxuICAgICAgICByZWplY3QuYXBwbHkoc2VsZiwgW2RhdGFdKTtcclxuICAgICAgfSk7XHJcbiAgICB9KTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFZhbGlkYXRlcyBvbmUgb3IgbW9yZSBmaWVsZHMsIGJ5IGEgc2luZ2xlIG5hbWVcclxuICAgKiBpdCByZXR1cm5zIGEgZGVmZXJyZWQgdGhhdCBjb21wbGV0ZXMgd2hlbiB2YWxpZGF0aW9uIGNvbXBsZXRlcyBmb3IgZWFjaCBmaWVsZCB3aXRoIHRoZSBnaXZlbiBuYW1lLlxyXG4gICAqIFxyXG4gICAqIEBwYXJhbSBmaWVsZE5hbWVcclxuICAgKiBAcGFyYW0gb3B0aW9uc1xyXG4gICAqIEByZXR1cm5zIHtQcm9taXNlfVxyXG4gICAqL1xyXG4gIHZhbGlkYXRlRmllbGQoZmllbGROYW1lLCBvcHRpb25zKSB7XHJcbiAgICAvLyBzZXQgb3B0aW9ucyB3aXRoIGRlZmF1bHQgdmFsdWVzXHJcbiAgICBvcHRpb25zID0gZXh0ZW5kKHtcclxuICAgICAgZGVwdGg6IDAsXHJcbiAgICAgIG9ubHlUb3VjaGVkOiBmYWxzZVxyXG4gICAgfSwgb3B0aW9ucyB8fCB7fSk7XHJcbiAgICB2YXIgc2VsZiA9IHRoaXMsIHNjaGVtYSA9IHNlbGYuc2NoZW1hO1xyXG5cclxuICAgIGlmICghZmllbGROYW1lKVxyXG4gICAgICByYWlzZSgxMik7XHJcblxyXG4gICAgaWYgKCFzY2hlbWEpXHJcbiAgICAgIHJhaXNlKDExKTtcclxuXHJcbiAgICB2YXIgZmllbGRTY2hlbWEgPSBzY2hlbWFbZmllbGROYW1lXTtcclxuICAgIGlmICghZmllbGRTY2hlbWEpXHJcbiAgICAgIC8vIENhbm5vdCB2YWxpZGF0ZSBmaWVsZCBiZWNhdXNlIHRoZSBzY2hlbWEgb2JqZWN0IGRvZXMgbm90IGNvbnRhaW4gaXRzIGRlZmluaXRpb24gXHJcbiAgICAgIC8vIG9yIGl0cyB2YWxpZGF0aW9uIGRlZmluaXRpb25cclxuICAgICAgcmFpc2UoMTMsIGZpZWxkTmFtZSk7XHJcblxyXG4gICAgLy8gbm9ybWFsaXplLCBpZiBhcnJheVxyXG4gICAgaWYgKGlzQXJyYXkoZmllbGRTY2hlbWEpKSB7XHJcbiAgICAgIHNjaGVtYVtmaWVsZE5hbWVdID0gZmllbGRTY2hlbWEgPSB7XHJcbiAgICAgICAgdmFsaWRhdGlvbjogZmllbGRTY2hlbWFcclxuICAgICAgfTtcclxuICAgIH0gZWxzZSBpZiAoIWZpZWxkU2NoZW1hLnZhbGlkYXRpb24pIHtcclxuICAgICAgcmFpc2UoMTMsIGZpZWxkTmFtZSk7XHJcbiAgICB9XHJcblxyXG4gICAgLy8gc3VwcG9ydCBmb3IgaGFydmVzdGVyIHJldHVybmluZyBtdWx0aXBsZSBmaWVsZHMgYnkgdGhlIHNhbWUgbmFtZVxyXG4gICAgLy8gdGhlIGhhcnZlc3RlciBjYW4gdGhlbiByZXR1cm4gb3RoZXIga2luZCBvZiBmaWVsZHMgKHN1Y2ggYXMgSFRNTCBub2RlcylcclxuICAgIHZhciBmaWVsZHMgPSBvcHRpb25zLmZpZWxkcyB8fCAodGhpcy5oYXJ2ZXN0ZXIuZ2V0RmllbGRzIFxyXG4gICAgICA/IHRoaXMuaGFydmVzdGVyLmdldEZpZWxkcyhmaWVsZE5hbWUpXHJcbiAgICAgIDogW2ZpZWxkTmFtZV0pO1xyXG4gICAgdmFyIHZhbGlkYXRvciA9IHNlbGYudmFsaWRhdG9yLFxyXG4gICAgICBtYXJrZXIgPSBzZWxmLm1hcmtlcixcclxuICAgICAgdmFsaWRhdGlvbiA9IHNlbGYuZ2V0RmllbGRWYWxpZGF0aW9uRGVmaW5pdGlvbihmaWVsZFNjaGVtYS52YWxpZGF0aW9uKSxcclxuICAgICAgY2hhaW4gPSBbXTtcclxuICAgIFxyXG4gICAgZWFjaChmaWVsZHMsIGZ1bmN0aW9uIChmaWVsZCkge1xyXG4gICAgICB2YXIgdmFsdWUgPSBzZWxmLmhhcnZlc3Rlci5nZXRWYWx1ZShmaWVsZCk7XHJcblxyXG4gICAgICAvLyBtYXJrIGZpZWxkIG5ldXRydW0gYmVmb3JlIHZhbGlkYXRpb25cclxuICAgICAgbWFya2VyLm1hcmtGaWVsZE5ldXRydW0oZmllbGQpO1xyXG4gICAgICBcclxuICAgICAgdmFyIHAgPSB2YWxpZGF0b3IudmFsaWRhdGUodmFsaWRhdGlvbiwgZmllbGQsIHZhbHVlKS50aGVuKGZ1bmN0aW9uIChkYXRhKSB7XHJcbiAgICAgICAgLy8gdGhlIHZhbGlkYXRpb24gcHJvY2VzcyBzdWNjZWVkZWQgKGRpZG4ndCBwcm9kdWNlIGFueSBleGNlcHRpb24pXHJcbiAgICAgICAgLy8gYnV0IHRoaXMgZG9lc24ndCBtZWFuIHRoYXQgdGhlIGZpZWxkIGlzIHZhbGlkOlxyXG4gICAgICAgIGZvciAodmFyIGogPSAwLCBxID0gbGVuKGRhdGEpOyBqIDwgcTsgaisrKSB7XHJcbiAgICAgICAgICB2YXIgbyA9IGRhdGFbal07XHJcbiAgICAgICAgICBpZiAoby5lcnJvcikge1xyXG4gICAgICAgICAgICAvLyBmaWVsZCBpbnZhbGlkXHJcbiAgICAgICAgICAgIG1hcmtlci5tYXJrRmllbGRJbnZhbGlkKGZpZWxkLCB7XHJcbiAgICAgICAgICAgICAgbWVzc2FnZTogby5tZXNzYWdlXHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAvLyBleGl0XHJcbiAgICAgICAgICAgIHJldHVybiBkYXRhO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICBcclxuICAgICAgICAvLyB0aGUgZmllbGQgaXMgdmFsaWQ7IGl0cyB2YWx1ZSBjYW4gYmUgZm9ybWF0dGVkO1xyXG4gICAgICAgIHNlbGYub25Hb29kVmFsaWRhdGlvbihmaWVsZFNjaGVtYSwgZmllbGQsIGZpZWxkTmFtZSwgdmFsdWUsIG9wdGlvbnMpO1xyXG5cclxuICAgICAgICBtYXJrZXIubWFya0ZpZWxkVmFsaWQoZmllbGQpO1xyXG4gICAgICAgIHJldHVybiBkYXRhO1xyXG4gICAgICB9LCBmdW5jdGlvbiAoYXJyKSB7XHJcbiAgICAgICAgLy8gdGhlIHZhbGlkYXRpb24gcHJvY2VzcyBmYWlsZWQgKGl0IHByb2R1Y2VkIGFuIGV4Y2VwdGlvbilcclxuICAgICAgICAvLyB0aGlzIHNob3VsZCBoYXBwZW4sIGZvciBleGFtcGxlLCB3aGVuIGEgdmFsaWRhdGlvbiBydWxlIHRoYXQgaW52b2x2ZXMgYW4gQWpheCByZXF1ZXN0IHJlY2VpdmVzIHN0YXR1cyA1MDAgZnJvbSB0aGUgc2VydmVyIHNpZGUuXHJcbiAgICAgICAgdmFyIGEgPSBmaXJzdChhcnIsIGZ1bmN0aW9uIChvKSB7XHJcbiAgICAgICAgICByZXR1cm4gby5lcnJvcjtcclxuICAgICAgICB9KTtcclxuICAgICAgICBtYXJrZXIubWFya0ZpZWxkSW52YWxpZChmaWVsZCwge1xyXG4gICAgICAgICAgbWVzc2FnZTogYS5tZXNzYWdlXHJcbiAgICAgICAgfSk7XHJcbiAgICAgIH0pO1xyXG5cclxuICAgICAgY2hhaW4ucHVzaChwKTtcclxuICAgIH0pO1xyXG4gICAgLy8gTkI6IHRoZSBjaGFpbiBjYW4gY29udGFpbiBtb3JlIHRoYW4gb25lIGVsZW1lbnQsIHdoZW4gYSBmaWVsZHNldCBjb250YWlucyBtdWx0aXBsZSBlbGVtZW50cyB3aXRoIHRoZSBzYW1lIG5hbWVcclxuICAgIC8vICh3aGljaCBpcyBwcm9wZXIgSFRNTCBhbmQgcmVsYXRpdmVseSBjb21tb24gc2NlbmFyaW8pXHJcbiAgICByZXR1cm4gbmV3IFByb21pc2UoZnVuY3Rpb24gKHJlc29sdmUsIHJlamVjdCkge1xyXG4gICAgICBQcm9taXNlLmFsbChjaGFpbikudGhlbihmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgcmVzb2x2ZShfLnRvQXJyYXkoYXJndW1lbnRzKSk7XHJcbiAgICAgIH0pO1xyXG4gICAgfSk7XHJcbiAgfVxyXG5cclxuICBvbkdvb2RWYWxpZGF0aW9uKGZpZWxkU2NoZW1hLCBmaWVsZCwgZmllbGROYW1lLCB2YWx1ZSwgb3B0aW9ucykge1xyXG4gICAgdGhpcy5mb3JtYXRBZnRlclZhbGlkYXRpb24oZmllbGRTY2hlbWEsIGZpZWxkLCBmaWVsZE5hbWUsIHZhbHVlKVxyXG4gICAgICAgIC5oYW5kbGVUcmlnZ2VycyhmaWVsZFNjaGVtYSwgZmllbGQsIGZpZWxkTmFtZSwgdmFsdWUsIG9wdGlvbnMpO1xyXG4gIH1cclxuXHJcbiAgZm9ybWF0QWZ0ZXJWYWxpZGF0aW9uKGZpZWxkU2NoZW1hLCBmaWVsZCwgZmllbGROYW1lLCB2YWx1ZSkge1xyXG4gICAgdmFyIHNlbGYgPSB0aGlzO1xyXG4gICAgdmFyIGZvcm1hdCA9IGZpZWxkU2NoZW1hLmZvcm1hdCwgdmFsaWRhdGlvbiA9IGZpZWxkU2NoZW1hLnZhbGlkYXRpb247XHJcbiAgICBpZiAoaXNGdW5jdGlvbihmb3JtYXQpKSBmb3JtYXQgPSBmb3JtYXQuY2FsbChzZWxmLCBmLCB2YWx1ZSk7XHJcbiAgICBcclxuICAgIHZhciBmb3JtYXR0ZWRWYWx1ZSA9IHZhbHVlO1xyXG4gICAgaWYgKGZvcm1hdCkge1xyXG4gICAgICBmb3JtYXR0ZWRWYWx1ZSA9IHNlbGYuZm9ybWF0dGVyLmZvcm1hdChmb3JtYXQsIGZpZWxkLCB2YWx1ZSk7XHJcbiAgICB9IGVsc2UgaWYgKHNlbGYub3B0aW9ucy51c2VJbXBsaWNpdEZvcm1hdCkge1xyXG4gICAgICAvLyBhcHBseSBmb3JtYXQgcnVsZXMgaW1wbGljaXRseSAoaW4gdGhpcyBjYXNlLCB0aGVyZSBhcmUgbm8gcGFyYW1ldGVycylcclxuICAgICAgdmFyIG1hdGNoaW5nRm9ybWF0UnVsZSA9IFtdO1xyXG4gICAgICBfLmVhY2godmFsaWRhdGlvbiwgcnVsZSA9PiB7XHJcbiAgICAgICAgdmFyIG5hbWUgPSBpc1N0cmluZyhydWxlKSA/IHJ1bGUgOiBydWxlLm5hbWU7XHJcbiAgICAgICAgaWYgKG5hbWUgJiYgc2VsZi5mb3JtYXR0ZXIucnVsZXNbbmFtZV0pXHJcbiAgICAgICAgICBtYXRjaGluZ0Zvcm1hdFJ1bGUucHVzaChuYW1lKTtcclxuICAgICAgfSlcclxuICAgICAgaWYgKG1hdGNoaW5nRm9ybWF0UnVsZS5sZW5ndGgpIHtcclxuICAgICAgICBmb3JtYXR0ZWRWYWx1ZSA9IHNlbGYuZm9ybWF0dGVyLmZvcm1hdChtYXRjaGluZ0Zvcm1hdFJ1bGUsIGZpZWxkLCB2YWx1ZSk7XHJcbiAgICAgIH1cclxuICAgIH1cclxuICAgIGlmIChmb3JtYXR0ZWRWYWx1ZSAhPT0gdmFsdWUpIHtcclxuICAgICAgLy8gdHJpZ2dlciBldmVudCB0byBcclxuICAgICAgc2VsZi50cmlnZ2VyKFwiZm9ybWF0XCIsIGZpZWxkLCBmaWVsZE5hbWUsIGZvcm1hdHRlZFZhbHVlKTtcclxuICAgICAgc2VsZi5oYXJ2ZXN0ZXIuc2V0VmFsdWUoZmllbGQsIGZvcm1hdHRlZFZhbHVlLCBzZWxmLCBmaWVsZE5hbWUpO1xyXG4gICAgfVxyXG4gICAgcmV0dXJuIHNlbGY7XHJcbiAgfVxyXG5cclxuICBoYW5kbGVUcmlnZ2VycyhmaWVsZFNjaGVtYSwgZmllbGQsIGZpZWxkTmFtZSwgdmFsdWUsIG9wdGlvbnMpIHtcclxuICAgIHZhciB0cmlnZ2VyID0gZmllbGRTY2hlbWEudHJpZ2dlcjtcclxuICAgIGlmICghdHJpZ2dlcikgcmV0dXJuIHRoaXM7XHJcblxyXG4gICAgLy8gZG9uJ3QgcmVwZWF0IHZhbGlkYXRpb24gZm9yIGZpZWxkcyBhbHJlYWR5IGJlaW5nIHZhbGlkYXRlZFxyXG4gICAgaWYgKG9wdGlvbnMpXHJcbiAgICAgIHRyaWdnZXIgPSBfLnJlamVjdCh0cmlnZ2VyLCBvID0+IHtcclxuICAgICAgICByZXR1cm4gbyA9PT0gZmllbGROYW1lIHx8IF8uY29udGFpbnMob3B0aW9ucy52YWxpZGF0aW5nRmllbGRzLCBvKTtcclxuICAgICAgfSlcclxuXHJcbiAgICBpZiAoIWxlbih0cmlnZ2VyKSlcclxuICAgICAgcmV0dXJuIHRoaXM7XHJcblxyXG4gICAgdmFyIHNlbGYgPSB0aGlzLCBcclxuICAgICAgICBkYXRhZW50cnlPcHRpb25zID0gc2VsZi5vcHRpb25zLFxyXG4gICAgICAgIHRyaWdnZXJzRGVsYXkgPSBkYXRhZW50cnlPcHRpb25zLnRyaWdnZXJzRGVsYXk7XHJcbiAgICAvLyBhdm9pZCByZWN1cnNpdmUgY2FsbHNcclxuICAgIGlmIChvcHRpb25zICYmIG9wdGlvbnMuZGVwdGggPiAwKSB7XHJcbiAgICAgIHJldHVybiBzZWxmO1xyXG4gICAgfVxyXG4gICAgdmFyIGRlcHRoID0gMTtcclxuXHJcbiAgICBpZiAoXy5pc051bWJlcih0cmlnZ2Vyc0RlbGF5KSkge1xyXG4gICAgICBzZXRUaW1lb3V0KCgpID0+IHtcclxuICAgICAgICBzZWxmLnZhbGlkYXRlKHRyaWdnZXIsIHtcclxuICAgICAgICAgIGRlcHRoOiBkZXB0aFxyXG4gICAgICAgIH0pO1xyXG4gICAgICB9LCB0cmlnZ2Vyc0RlbGF5KVxyXG4gICAgfSBlbHNlIHtcclxuICAgICAgc2VsZi52YWxpZGF0ZSh0cmlnZ2VyLCB7XHJcbiAgICAgICAgZGVwdGg6IGRlcHRoXHJcbiAgICAgIH0pO1xyXG4gICAgfVxyXG4gICAgcmV0dXJuIHNlbGY7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBHZXRzIGFuIGFycmF5IG9mIHZhbGlkYXRpb25zIHRvIGFwcGx5IG9uIGEgZmllbGQuXHJcbiAgICogaXQgc3VwcG9ydHMgdGhlIHVzZSBvZiBhcnJheXMgb3IgZnVuY3Rpb25zLCB3aGljaCByZXR1cm4gYXJyYXlzLlxyXG4gICAqIFxyXG4gICAqIEBwYXJhbSBzY2hlbWFcclxuICAgKiBAcmV0dXJucyB7QXJyYXl9XHJcbiAgICovXHJcbiAgZ2V0RmllbGRWYWxpZGF0aW9uRGVmaW5pdGlvbihzY2hlbWEpIHtcclxuICAgIHJldHVybiBpc0Z1bmN0aW9uKHNjaGVtYSkgPyBzY2hlbWEuY2FsbCh0aGlzLmNvbnRleHQgfHwgdGhpcykgOiBzY2hlbWE7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBHZXQgdGhlIHZhbHVlIG9mIHRoZSBnaXZlbiBmaWVsZC4gUHJveHkgZnVuY3Rpb24gdG8gaGFydmVzdGVyIGdldFZhbHVlIGZ1bmN0aW9uLlxyXG4gICAqIFxyXG4gICAqIEBwYXJhbSB7c3RyaW5nfSBmaWVsZCBcclxuICAgKi9cclxuICBnZXRGaWVsZFZhbHVlKGZpZWxkKSB7XHJcbiAgICByZXR1cm4gdGhpcy5oYXJ2ZXN0ZXIuZ2V0VmFsdWUoZmllbGQpO1xyXG4gIH1cclxufVxyXG5cclxuRGF0YUVudHJ5LlZhbGlkYXRvciA9IFZhbGlkYXRvcjtcclxuRGF0YUVudHJ5LkZvcm1hdHRlciA9IEZvcm1hdHRlcjtcclxuRGF0YUVudHJ5LmRlZmF1bHRzID0gREVGQVVMVFM7XHJcbkRhdGFFbnRyeS5iYXNlUHJvcGVydGllcyA9IFtcImVsZW1lbnRcIiwgXCJzY2hlbWFcIiwgXCJjb250ZXh0XCJdO1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgRGF0YUVudHJ5IiwiLyoqXHJcbiAqIERhdGFFbnRyeSBmb3JtYXR0ZXIgY2xhc3MuXHJcbiAqIGh0dHBzOi8vZ2l0aHViLmNvbS9Sb2JlcnRvUHJldmF0by9EYXRhRW50cnlcclxuICpcclxuICogQ29weXJpZ2h0IDIwMTksIFJvYmVydG8gUHJldmF0b1xyXG4gKiBodHRwczovL3JvYmVydG9wcmV2YXRvLmdpdGh1Yi5pb1xyXG4gKlxyXG4gKiBMaWNlbnNlZCB1bmRlciB0aGUgTUlUIGxpY2Vuc2U6XHJcbiAqIGh0dHA6Ly93d3cub3BlbnNvdXJjZS5vcmcvbGljZW5zZXMvTUlUXHJcbiAqL1xyXG5pbXBvcnQgXyBmcm9tIFwiLi4vLi4vLi4vc2NyaXB0cy91dGlsc1wiXHJcbmltcG9ydCB7IHJhaXNlIH0gZnJvbSBcIi4uLy4uLy4uL3NjcmlwdHMvcmFpc2VcIlxyXG5pbXBvcnQgeyBGb3JtYXR0aW5nUnVsZXMgfSBmcm9tIFwiLi9ydWxlc1wiXHJcblxyXG5cclxuY29uc3QgbGVuID0gXy5sZW47XHJcbmNvbnN0IG1hcCA9IF8ubWFwO1xyXG5jb25zdCB0b0FycmF5ID0gXy50b0FycmF5O1xyXG5jb25zdCB3cmFwID0gXy53cmFwO1xyXG5jb25zdCBlYWNoID0gXy5lYWNoO1xyXG5jb25zdCBpc1N0cmluZyA9IF8uaXNTdHJpbmc7XHJcbmNvbnN0IGlzRnVuY3Rpb24gPSBfLmlzRnVuY3Rpb247XHJcbmNvbnN0IGlzUGxhaW5PYmplY3QgPSBfLmlzUGxhaW5PYmplY3Q7XHJcbmNvbnN0IGV4dGVuZCA9IF8uZXh0ZW5kO1xyXG5cclxuXHJcbmZ1bmN0aW9uIG5vcm1hbGl6ZVJ1bGUoYSwgZXJyb3IpIHtcclxuICBpZiAoaXNTdHJpbmcoYSkpXHJcbiAgICByZXR1cm4geyBuYW1lOiBhIH07XHJcbiAgaWYgKGlzUGxhaW5PYmplY3QoYSkpIHtcclxuICAgIHZhciBuYW1lID0gYS5uYW1lO1xyXG4gICAgaWYgKCFuYW1lKSByYWlzZShlcnJvcik7XHJcbiAgICByZXR1cm4gYTtcclxuICB9XHJcbiAgcmFpc2UoMTQsIG5hbWUpO1xyXG59XHJcblxyXG5cclxuY2xhc3MgRm9ybWF0dGVyIHtcclxuXHJcbiAgLyoqXHJcbiAgICogQ3JlYXRlcyBhIG5ldyBpbnN0YW5jZSBvZiBWYWxpZGF0b3IgYXNzb2NpYXRlZCB3aXRoIHRoZSBnaXZlbiBkYXRhZW50cnkuXHJcbiAgICpcclxuICAgKiBAcGFyYW0gZGF0YWVudHJ5OiBpbnN0YW5jZSBvZiBEYXRhRW50cnkuXHJcbiAgICovXHJcbiAgY29uc3RydWN0b3IoZGF0YWVudHJ5KSB7XHJcbiAgICB2YXIgcnVsZXMgPSBfLmNsb25lKEZvcm1hdHRlci5SdWxlcyksIFxyXG4gICAgICBzZWxmID0gdGhpcyxcclxuICAgICAgb3B0aW9ucyA9IGRhdGFlbnRyeSA/IGRhdGFlbnRyeS5vcHRpb25zIDogbnVsbDtcclxuICAgIGlmIChvcHRpb25zICYmIG9wdGlvbnMuZm9ybWF0UnVsZXMpIHtcclxuICAgICAgZXh0ZW5kKHJ1bGVzLCBvcHRpb25zLmZvcm1hdFJ1bGVzKTtcclxuICAgIH1cclxuICAgIHNlbGYucnVsZXMgPSBydWxlc1xyXG4gICAgcmV0dXJuIHNlbGY7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBEaXNwb3NlcyBvZiB0aGlzIGZvcm1hdHRlci5cclxuICAgKi9cclxuICBkaXNwb3NlKCkge1xyXG4gICAgZGVsZXRlIHRoaXMucnVsZXM7XHJcbiAgICBkZWxldGUgdGhpcy5kYXRhZW50cnk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBBcHBsaWVzIGZvcm1hdHRpbmcgcnVsZXMgb24gdGhlIGdpdmVuIGZpZWxkLlxyXG4gICAqIFxyXG4gICAqIEBwYXJhbSBydWxlc1xyXG4gICAqIEBwYXJhbSBmaWVsZFxyXG4gICAqIEBwYXJhbSB2YWx1ZVxyXG4gICAqIEByZXR1cm5zIHtGb3JtYXR0ZXJ9XHJcbiAgICovXHJcbiAgZm9ybWF0KHJ1bGVzLCBmaWVsZCwgdmFsdWUsIHBhcmFtcykge1xyXG4gICAgdmFyIHNlbGYgPSB0aGlzO1xyXG4gICAgaWYgKGlzU3RyaW5nKHJ1bGVzKSkge1xyXG4gICAgICB2YXIgbmFtZSA9IHJ1bGVzLCBydWxlID0gc2VsZi5ydWxlc1tuYW1lXTtcclxuICAgICAgaWYgKHJ1bGUpXHJcbiAgICAgICAgcmV0dXJuIChydWxlLmZuIHx8IHJ1bGUpLmNhbGwoc2VsZiwgZmllbGQsIHZhbHVlLCBwYXJhbXMpO1xyXG4gICAgICBcclxuICAgICAgcmFpc2UoNCwgbmFtZSk7XHJcbiAgICB9XHJcbiAgICBmb3IgKHZhciBpID0gMCwgbCA9IGxlbihydWxlcyk7IGkgPCBsOyBpKyspIHtcclxuICAgICAgdmFyIGEgPSBub3JtYWxpemVSdWxlKHJ1bGVzW2ldLCAxNik7XHJcbiAgICAgIHZhciBydWxlRGVmaW5pdGlvbiA9IHNlbGYucnVsZXNbYS5uYW1lXTtcclxuXHJcbiAgICAgIGlmICghcnVsZURlZmluaXRpb24pXHJcbiAgICAgICAgcmFpc2UoNCwgbmFtZSk7XHJcblxyXG4gICAgICAvLyBjYWxsIHdpdGggdGhlIHdob2xlIG9iamVjdCB1c2VkIHRvIGNvbmZpZ3VyZSB0aGUgZm9ybWF0dGluZ1xyXG4gICAgICB2YWx1ZSA9IChydWxlRGVmaW5pdGlvbi5mbiB8fCBydWxlRGVmaW5pdGlvbikuY2FsbChzZWxmLCBmaWVsZCwgdmFsdWUsIF8ub21pdChhLCBcIm5hbWVcIikpO1xyXG4gICAgfVxyXG4gICAgcmV0dXJuIHZhbHVlO1xyXG4gIH1cclxufVxyXG5cclxuRm9ybWF0dGVyLlJ1bGVzID0gRm9ybWF0dGluZ1J1bGVzXHJcblxyXG5leHBvcnQgZGVmYXVsdCBGb3JtYXR0ZXIiLCIvKipcclxuICogRGF0YUVudHJ5IGJ1aWx0LWluIGZvcm1hdHRpbmcgcnVsZXMuXHJcbiAqIGh0dHBzOi8vZ2l0aHViLmNvbS9Sb2JlcnRvUHJldmF0by9EYXRhRW50cnlcclxuICpcclxuICogQ29weXJpZ2h0IDIwMTksIFJvYmVydG8gUHJldmF0b1xyXG4gKiBodHRwczovL3JvYmVydG9wcmV2YXRvLmdpdGh1Yi5pb1xyXG4gKlxyXG4gKiBMaWNlbnNlZCB1bmRlciB0aGUgTUlUIGxpY2Vuc2U6XHJcbiAqIGh0dHA6Ly93d3cub3BlbnNvdXJjZS5vcmcvbGljZW5zZXMvTUlUXHJcbiAqL1xyXG5pbXBvcnQgXyBmcm9tIFwiLi4vLi4vdXRpbHNcIlxyXG5cclxuXHJcbmNvbnN0IEZvcm1hdHRpbmdSdWxlcyA9IHtcclxuICB0cmltOiBmdW5jdGlvbiAoZmllbGQsIHZhbHVlKSB7XHJcbiAgICByZXR1cm4gdmFsdWUgPyB2YWx1ZS5yZXBsYWNlKC9eW1xcc10rfFtcXHNdKyQvZywgXCJcIikgOiB2YWx1ZTtcclxuICB9LFxyXG5cclxuICByZW1vdmVTcGFjZXM6IGZ1bmN0aW9uIChmaWVsZCwgdmFsdWUpIHtcclxuICAgIHJldHVybiB2YWx1ZSA/IHZhbHVlLnJlcGxhY2UocngsIFwiXCIpIDogdmFsdWU7XHJcbiAgfSxcclxuXHJcbiAgcmVtb3ZlTXVsdGlwbGVTcGFjZXM6IGZ1bmN0aW9uIChmaWVsZCwgdmFsdWUpIHtcclxuICAgIHJldHVybiB2YWx1ZSA/IHZhbHVlLnJlcGxhY2UoL1xcc3syLH0vZywgXCIgXCIpIDogdmFsdWU7XHJcbiAgfSxcclxuXHJcbiAgY2xlYW5TcGFjZXM6IGZ1bmN0aW9uIChmaWVsZCwgdmFsdWUpIHtcclxuICAgIGlmICghdmFsdWUpIHJldHVybiB2YWx1ZTtcclxuICAgIHJldHVybiB2YWx1ZS5yZXBsYWNlKC9eW1xcc10rfFtcXHNdKyQvZywgXCJcIikucmVwbGFjZSgvXFxzezIsfS9nLCBcIiBcIik7XHJcbiAgfSxcclxuXHJcbiAgaW50ZWdlcjogZnVuY3Rpb24gKGZpZWxkLCB2YWx1ZSkge1xyXG4gICAgaWYgKCF2YWx1ZSkgcmV0dXJuO1xyXG4gICAgLy9yZW1vdmUgbGVhZGluZyB6ZXJvc1xyXG4gICAgcmV0dXJuIHZhbHVlID8gdmFsdWUucmVwbGFjZSgvXjArLywgXCJcIikgOiB2YWx1ZTtcclxuICB9LFxyXG5cclxuICBcInplcm8tZmlsbFwiOiBmdW5jdGlvbiAoZmllbGQsIHZhbHVlLCBvcHRpb25zKSB7XHJcbiAgICBpZiAoIXZhbHVlKSByZXR1cm4gdmFsdWU7XHJcbiAgICB2YXIgbDtcclxuICAgIGlmIChfLmlzRW1wdHkob3B0aW9ucykpIHtcclxuICAgICAgdmFyIG1sID0gZmllbGQuZ2V0QXR0cmlidXRlKFwibWF4bGVuZ3RoXCIpO1xyXG4gICAgICBpZiAoIW1sKSB0aHJvdyBcIm1heGxlbmd0aCBpcyByZXF1aXJlZCBmb3IgdGhlIHplcm8tZmlsbCBmb3JtYXR0ZXJcIjtcclxuICAgICAgbCA9IHBhcnNlSW50KG1sKTtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIGlmICghKFwibGVuZ3RoXCIgaW4gb3B0aW9ucykpIHtcclxuICAgICAgICB0aHJvdyBcIm1pc3NpbmcgbGVuZ3RoIGluIG9wdGlvbnNcIjtcclxuICAgICAgfVxyXG4gICAgICBsID0gb3B0aW9ucy5sZW5ndGg7XHJcbiAgICB9XHJcbiAgICB2YXIgb3JpZ2luYWwgPSB2YWx1ZTtcclxuICAgIHdoaWxlICh2YWx1ZS5sZW5ndGggPCBsKSB7XHJcbiAgICAgIHZhbHVlID0gXCIwXCIgKyB2YWx1ZTtcclxuICAgIH1cclxuICAgIHJldHVybiB2YWx1ZTtcclxuICB9LFxyXG5cclxuICBcInplcm8tdW5maWxsXCI6IGZ1bmN0aW9uIChmaWVsZCwgdmFsdWUpIHtcclxuICAgIGlmICghdmFsdWUpIHJldHVybiB2YWx1ZTtcclxuICAgIGlmICgvXjArLy50ZXN0KHZhbHVlKSlcclxuICAgICAgdmFsdWUgPSB2YWx1ZS5yZXBsYWNlKC9eMCsvLCBcIlwiKTtcclxuICAgIHJldHVybiB2YWx1ZTtcclxuICB9XHJcbn07XHJcblxyXG5leHBvcnQgeyBGb3JtYXR0aW5nUnVsZXMgfSIsIi8qKlxyXG4gKiBEYXRhRW50cnkgYmFzZSB2YWxpZGF0aW9uIHJ1bGVzLlxyXG4gKiBodHRwczovL2dpdGh1Yi5jb20vUm9iZXJ0b1ByZXZhdG8vRGF0YUVudHJ5XHJcbiAqXHJcbiAqIENvcHlyaWdodCAyMDE5LCBSb2JlcnRvIFByZXZhdG9cclxuICogaHR0cHM6Ly9yb2JlcnRvcHJldmF0by5naXRodWIuaW9cclxuICpcclxuICogTGljZW5zZWQgdW5kZXIgdGhlIE1JVCBsaWNlbnNlOlxyXG4gKiBodHRwOi8vd3d3Lm9wZW5zb3VyY2Uub3JnL2xpY2Vuc2VzL01JVFxyXG4gKi9cclxuaW1wb3J0IF8gZnJvbSBcIi4uLy4uL3V0aWxzXCJcclxuXHJcbmNvbnN0IGxlbiA9IF8ubGVuO1xyXG5jb25zdCBpc1BsYWluT2JqZWN0ID0gXy5pc1BsYWluT2JqZWN0O1xyXG5jb25zdCBpc1N0cmluZyA9IF8uaXNTdHJpbmc7XHJcbmNvbnN0IGlzTnVtYmVyID0gXy5pc051bWJlcjtcclxuY29uc3QgaXNBcnJheSA9IF8uaXNBcnJheTtcclxuY29uc3QgaXNFbXB0eSA9IF8uaXNFbXB0eTtcclxuXHJcblxyXG5mdW5jdGlvbiBnZXRFcnJvcihtZXNzYWdlLCBhcmdzKSB7XHJcbiAgcmV0dXJuIHtcclxuICAgIGVycm9yOiB0cnVlLFxyXG4gICAgbWVzc2FnZTogbWVzc2FnZSxcclxuICAgIGZpZWxkOiBhcmdzWzBdLFxyXG4gICAgdmFsdWU6IGFyZ3NbMV0sXHJcbiAgICBwYXJhbXM6IF8udG9BcnJheShhcmdzKS5zcGxpY2UoMilcclxuICB9O1xyXG59XHJcblxyXG5cclxuY29uc3QgVmFsaWRhdGlvblJ1bGVzID0ge1xyXG5cclxuICBub25lOiBmdW5jdGlvbiAoKSB7XHJcbiAgICByZXR1cm4gdHJ1ZTtcclxuICB9LFxyXG5cclxuICBub3Q6IGZ1bmN0aW9uIChmaWVsZCwgdmFsdWUsIGZvcmNlZCwgcGFyYW1zKSB7XHJcbiAgICB2YXIgZXhjbHVkZSA9IHBhcmFtcztcclxuICAgIGlmIChfLmlzQXJyYXkoZXhjbHVkZSkpIHtcclxuICAgICAgaWYgKF8uYW55KGV4Y2x1ZGUsIHggPT4geCA9PT0gdmFsdWUpKSB7XHJcbiAgICAgICAgcmV0dXJuIGdldEVycm9yKFwiY2Fubm90QmVcIiwgYXJndW1lbnRzKTtcclxuICAgICAgfVxyXG4gICAgfVxyXG4gICAgaWYgKHZhbHVlID09PSBwYXJhbXMpIHtcclxuICAgICAgcmV0dXJuIGdldEVycm9yKFwiY2Fubm90QmVcIiwgYXJndW1lbnRzKTtcclxuICAgIH1cclxuICAgIHJldHVybiB0cnVlO1xyXG4gIH0sXHJcblxyXG4gIG5vU3BhY2VzOiBmdW5jdGlvbiAoZmllbGQsIHZhbHVlLCBmb3JjZWQpIHtcclxuICAgIGlmICghdmFsdWUpIHJldHVybiB0cnVlO1xyXG4gICAgaWYgKHZhbHVlLm1hdGNoKC9cXHMvKSkgXHJcbiAgICAgIHJldHVybiBnZXRFcnJvcihcInNwYWNlc0luVmFsdWVcIiwgYXJndW1lbnRzKTtcclxuICAgIHJldHVybiB0cnVlO1xyXG4gIH0sXHJcblxyXG4gIHJlbW90ZToge1xyXG4gICAgZGVmZXJyZWQ6IHRydWUsXHJcbiAgICBmbjogZnVuY3Rpb24gKGZpZWxkLCB2YWx1ZSwgZm9yY2VkLCBwcm9taXNlUHJvdmlkZXIpIHtcclxuICAgICAgaWYgKCFwcm9taXNlUHJvdmlkZXIpXHJcbiAgICAgICAgcmFpc2UoNyk7XHJcbiAgICAgIHJldHVybiBwcm9taXNlUHJvdmlkZXIuYXBwbHkoZmllbGQsIGFyZ3VtZW50cyk7XHJcbiAgICB9XHJcbiAgfSxcclxuXHJcbiAgcmVxdWlyZWQ6IGZ1bmN0aW9uIChmaWVsZCwgdmFsdWUsIGZvcmNlZCwgcGFyYW1zKSB7XHJcbiAgICBpZiAoaXNTdHJpbmcocGFyYW1zKSlcclxuICAgICAgcGFyYW1zID0geyBtZXNzYWdlOiBwYXJhbXMgfTtcclxuICAgIFxyXG4gICAgaWYgKCF2YWx1ZSB8fCAoaXNBcnJheSh2YWx1ZSkgJiYgaXNFbXB0eSh2YWx1ZSkpIHx8ICEhdmFsdWUudG9TdHJpbmcoKS5tYXRjaCgvXlxccyskLykpXHJcbiAgICAgIHJldHVybiBnZXRFcnJvcihcInJlcXVpcmVkXCIsIGFyZ3VtZW50cyk7XHJcbiAgICByZXR1cm4gdHJ1ZTtcclxuICB9LFxyXG5cclxuICBpbnRlZ2VyOiBmdW5jdGlvbiAoZmllbGQsIHZhbHVlLCBmb3JjZWQsIG9wdGlvbnMpIHtcclxuICAgIGlmICghdmFsdWUpIHJldHVybiB0cnVlO1xyXG4gICAgaWYgKCEvXlxcZCskLy50ZXN0KHZhbHVlKSlcclxuICAgICAgcmV0dXJuIGdldEVycm9yKFwibm90SW50ZWdlclwiLCBhcmd1bWVudHMpO1xyXG4gICAgaWYgKG9wdGlvbnMpIHtcclxuICAgICAgdmFyIGludFZhbCA9IHBhcnNlSW50KHZhbHVlKTtcclxuICAgICAgaWYgKGlzTnVtYmVyKG9wdGlvbnMubWluKSAmJiBpbnRWYWwgPCBvcHRpb25zLm1pbilcclxuICAgICAgICByZXR1cm4gZ2V0RXJyb3IoXCJtaW5WYWx1ZVwiLCBhcmd1bWVudHMpO1xyXG4gICAgICBpZiAoaXNOdW1iZXIob3B0aW9ucy5tYXgpICYmIGludFZhbCA+IG9wdGlvbnMubWF4KVxyXG4gICAgICAgIHJldHVybiBnZXRFcnJvcihcIm1heFZhbHVlXCIsIGFyZ3VtZW50cyk7XHJcbiAgICB9XHJcbiAgICByZXR1cm4gdHJ1ZTtcclxuICB9LFxyXG5cclxuICBlcXVhbDogZnVuY3Rpb24gKGZpZWxkLCB2YWx1ZSwgZm9yY2VkLCBleHBlY3RlZFZhbHVlKSB7XHJcbiAgICBpZiAodmFsdWUgIT09IGV4cGVjdGVkVmFsdWUpIHtcclxuICAgICAgcmV0dXJuIGdldEVycm9yKFwiZXhwZWN0ZWRWYWx1ZVwiLCBhcmd1bWVudHMpO1xyXG4gICAgfVxyXG4gICAgcmV0dXJuIHRydWU7XHJcbiAgfSxcclxuXHJcbiAgbGV0dGVyczogZnVuY3Rpb24gKGZpZWxkLCB2YWx1ZSwgZm9yY2VkKSB7XHJcbiAgICBpZiAoIXZhbHVlKSByZXR1cm4gdHJ1ZTtcclxuICAgIGlmICghL15bYS16QS1aXSskLy50ZXN0KHZhbHVlKSlcclxuICAgICAgcmV0dXJuIGdldEVycm9yKFwiY2FuQ29udGFpbk9ubHlMZXR0ZXJzXCIsIGFyZ3VtZW50cyk7XHJcbiAgICByZXR1cm4gdHJ1ZTtcclxuICB9LFxyXG5cclxuICBkaWdpdHM6IGZ1bmN0aW9uIChmaWVsZCwgdmFsdWUsIGZvcmNlZCkge1xyXG4gICAgaWYgKCF2YWx1ZSkgcmV0dXJuIHRydWU7XHJcbiAgICBpZiAoIS9eXFxkKyQvLnRlc3QodmFsdWUpKVxyXG4gICAgICByZXR1cm4gZ2V0RXJyb3IoXCJjYW5Db250YWluT25seURpZ2l0c1wiLCBhcmd1bWVudHMpO1xyXG4gICAgcmV0dXJuIHRydWU7XHJcbiAgfSxcclxuXHJcbiAgbWF4TGVuZ3RoOiBmdW5jdGlvbiAoZmllbGQsIHZhbHVlLCBmb3JjZWQsIGxpbWl0KSB7XHJcbiAgICBpZiAoIXZhbHVlKSByZXR1cm4gdHJ1ZTtcclxuXHJcbiAgICBpZiAoaXNQbGFpbk9iamVjdChsaW1pdCkpIHtcclxuICAgICAgbGltaXQgPSBsaW1pdC5sZW5ndGg7XHJcbiAgICB9XHJcbiAgICBpZiAoIWlzTnVtYmVyKGxpbWl0KSlcclxuICAgICAgdGhyb3cgXCJtYXhMZW5ndGggcnVsZSByZXF1aXJlcyBhIG51bWVyaWMgbGltaXQgKHVzZSBsZW5ndGggb3B0aW9uLCBvciBwYXJhbXM6IFtudW1dXCI7XHJcblxyXG4gICAgaWYgKGxlbih2YWx1ZSkgPiBsaW1pdClcclxuICAgICAgcmV0dXJuIGdldEVycm9yKFwibWF4TGVuZ3RoXCIsIGFyZ3VtZW50cyk7XHJcbiAgICByZXR1cm4gdHJ1ZTtcclxuICB9LFxyXG5cclxuICBtaW5MZW5ndGg6IGZ1bmN0aW9uIChmaWVsZCwgdmFsdWUsIGZvcmNlZCwgbGltaXQpIHtcclxuICAgIGlmICghdmFsdWUpIHJldHVybiBmYWxzZTtcclxuXHJcbiAgICBpZiAoaXNQbGFpbk9iamVjdChsaW1pdCkpIHtcclxuICAgICAgbGltaXQgPSBsaW1pdC5sZW5ndGg7XHJcbiAgICB9XHJcbiAgICBpZiAoIWlzTnVtYmVyKGxpbWl0KSlcclxuICAgICAgdGhyb3cgXCJtaW5MZW5ndGggcnVsZSByZXF1aXJlcyBhIG51bWVyaWMgbGltaXQgKHVzZSBsZW5ndGggb3B0aW9uLCBvciBwYXJhbXM6IFtudW1dXCI7XHJcbiAgICBcclxuICAgIGlmIChsZW4odmFsdWUpIDwgbGltaXQpXHJcbiAgICAgIHJldHVybiBnZXRFcnJvcihcIm1pbkxlbmd0aFwiLCBhcmd1bWVudHMpO1xyXG4gICAgcmV0dXJuIHRydWU7XHJcbiAgfSxcclxuXHJcbiAgbXVzdENoZWNrOiBmdW5jdGlvbiAoZmllbGQsIHZhbHVlLCBmb3JjZWQsIGxpbWl0KSB7XHJcbiAgICBpZiAoIWZpZWxkLmNoZWNrZWQpXHJcbiAgICAgIHJldHVybiBnZXRFcnJvcihcIm11c3RCZUNoZWNrZWRcIiwgYXJndW1lbnRzKTtcclxuICAgIHJldHVybiB0cnVlO1xyXG4gIH1cclxufTtcclxuXHJcbmV4cG9ydCB7IFZhbGlkYXRpb25SdWxlcywgZ2V0RXJyb3IgfSIsIi8qKlxyXG4gKiBEYXRhRW50cnkgdmFsaWRhdG9yIGNsYXNzLlxyXG4gKiBodHRwczovL2dpdGh1Yi5jb20vUm9iZXJ0b1ByZXZhdG8vRGF0YUVudHJ5XHJcbiAqXHJcbiAqIENvcHlyaWdodCAyMDE5LCBSb2JlcnRvIFByZXZhdG9cclxuICogaHR0cHM6Ly9yb2JlcnRvcHJldmF0by5naXRodWIuaW9cclxuICpcclxuICogTGljZW5zZWQgdW5kZXIgdGhlIE1JVCBsaWNlbnNlOlxyXG4gKiBodHRwOi8vd3d3Lm9wZW5zb3VyY2Uub3JnL2xpY2Vuc2VzL01JVFxyXG4gKi9cclxuXHJcbmltcG9ydCBfIGZyb20gXCIuLi8uLi8uLi9zY3JpcHRzL3V0aWxzXCJcclxuaW1wb3J0IHsgcmFpc2UgfSBmcm9tIFwiLi4vLi4vLi4vc2NyaXB0cy9yYWlzZVwiXHJcbmltcG9ydCB7IFZhbGlkYXRpb25SdWxlcywgZ2V0RXJyb3IgfSBmcm9tIFwiLi9ydWxlc1wiXHJcblxyXG5cclxuY29uc3QgbGVuID0gXy5sZW47XHJcbmNvbnN0IG1hcCA9IF8ubWFwO1xyXG5jb25zdCB0b0FycmF5ID0gXy50b0FycmF5O1xyXG5jb25zdCB3cmFwID0gXy53cmFwO1xyXG5jb25zdCBlYWNoID0gXy5lYWNoO1xyXG5jb25zdCBpc1N0cmluZyA9IF8uaXNTdHJpbmc7XHJcbmNvbnN0IGlzRnVuY3Rpb24gPSBfLmlzRnVuY3Rpb247XHJcbmNvbnN0IGlzUGxhaW5PYmplY3QgPSBfLmlzUGxhaW5PYmplY3Q7XHJcbmNvbnN0IGV4dGVuZCA9IF8uZXh0ZW5kO1xyXG5jb25zdCBmYWlsZWRWYWxpZGF0aW9uRXJyb3JLZXkgPSBcImZhaWxlZFZhbGlkYXRpb25cIjtcclxuXHJcblxyXG5mdW5jdGlvbiBydWxlUGFyYW1zKGFyZ3MsIGN1cnJlbnRGaWVsZFJ1bGUpIHtcclxuICBpZiAoIWN1cnJlbnRGaWVsZFJ1bGUucGFyYW1zKSB7XHJcbiAgICB2YXIgZXh0cmFQYXJhbXMgPSBfLm9taXQoY3VycmVudEZpZWxkUnVsZSwgW1wiZm5cIiwgXCJuYW1lXCJdKTtcclxuICAgIHJldHVybiBhcmdzLmNvbmNhdChbZXh0cmFQYXJhbXNdKTtcclxuICB9XHJcbiAgcmV0dXJuIGFyZ3MuY29uY2F0KGN1cnJlbnRGaWVsZFJ1bGUucGFyYW1zKTtcclxufVxyXG5cclxuXHJcbmNsYXNzIFZhbGlkYXRvciB7XHJcblxyXG4gIC8qKlxyXG4gICAqIENyZWF0ZXMgYSBuZXcgaW5zdGFuY2Ugb2YgVmFsaWRhdG9yIGFzc29jaWF0ZWQgd2l0aCB0aGUgZ2l2ZW4gZGF0YWVudHJ5LlxyXG4gICAqXHJcbiAgICogQHBhcmFtIGRhdGFlbnRyeTogaW5zdGFuY2Ugb2YgRGF0YUVudHJ5LlxyXG4gICAqL1xyXG4gIGNvbnN0cnVjdG9yKGRhdGFlbnRyeSkge1xyXG4gICAgdmFyIHJ1bGVzID0gXy5jbG9uZShWYWxpZGF0b3IuUnVsZXMpLCBcclxuICAgICAgc2VsZiA9IHRoaXMsXHJcbiAgICAgIG9wdGlvbnMgPSBkYXRhZW50cnkgPyBkYXRhZW50cnkub3B0aW9ucyA6IG51bGw7XHJcbiAgICBpZiAob3B0aW9ucyAmJiBvcHRpb25zLnJ1bGVzKSB7XHJcbiAgICAgIGV4dGVuZChydWxlcywgb3B0aW9ucy5ydWxlcyk7XHJcbiAgICB9XHJcbiAgICBzZWxmLmdldEVycm9yID0gZ2V0RXJyb3I7XHJcbiAgICBzZWxmLnJ1bGVzID0gcnVsZXNcclxuICAgIHNlbGYuZGF0YWVudHJ5ID0gZGF0YWVudHJ5IHx8IHt9O1xyXG4gICAgcmV0dXJuIHNlbGY7XHJcbiAgfVxyXG5cclxuICBkaXNwb3NlKCkge1xyXG4gICAgZGVsZXRlIHRoaXMucnVsZXM7XHJcbiAgICBkZWxldGUgdGhpcy5kYXRhZW50cnk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBFbnN1cmVzIHRoYXQgYSB2YWxpZGF0aW9uIHJ1bGUgaXMgZGVmaW5lZCBpbnNpZGUgdGhpcyB2YWxpZGF0b3IuXHJcbiAgICogXHJcbiAgICogQHBhcmFtIG5hbWVcclxuICAgKi9cclxuICBjaGVja1J1bGUobmFtZSkge1xyXG4gICAgaWYgKCF0aGlzLnJ1bGVzW25hbWVdKSB7XHJcbiAgICAgIHJhaXNlKDMsIFwibWlzc2luZyB2YWxpZGF0aW9uIHJ1bGU6IFwiICsgbmFtZSk7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICBub3JtYWxpemVSdWxlKHYpIHtcclxuICAgIGlmIChpc1BsYWluT2JqZWN0KHYpKSB7XHJcbiAgICAgIHJldHVybiB2O1xyXG4gICAgfVxyXG5cclxuICAgIGlmIChpc0Z1bmN0aW9uKHYpKSB7XHJcbiAgICAgIHJldHVybiB7IGZuOiB2IH07XHJcbiAgICB9XHJcbiAgICByYWlzZSgxNCwgXCJpbnZhbGlkIHZhbGlkYXRpb24gcnVsZSBkZWZpbml0aW9uXCIpXHJcbiAgfVxyXG5cclxuICBnZXRSdWxlKG8pIHtcclxuICAgIHZhciBzZWxmID0gdGhpcyxcclxuICAgICAgZGVmYXVsdHMgPSB7fSxcclxuICAgICAgcnVsZXMgPSBzZWxmLnJ1bGVzO1xyXG4gICAgXHJcbiAgICBpZiAoaXNTdHJpbmcobykpIHtcclxuICAgICAgc2VsZi5jaGVja1J1bGUobyk7XHJcbiAgICAgIHJldHVybiBleHRlbmQoeyBuYW1lOiBvIH0sIGRlZmF1bHRzLCBzZWxmLm5vcm1hbGl6ZVJ1bGUocnVsZXNbb10pKTtcclxuICAgIH1cclxuXHJcbiAgICBpZiAoaXNQbGFpbk9iamVjdChvKSkge1xyXG4gICAgICBpZiAoIW8ubmFtZSlcclxuICAgICAgICByYWlzZSg2LCBcIm1pc3NpbmcgbmFtZSBpbiB2YWxpZGF0aW9uIHJ1bGVcIik7XHJcbiAgICAgIHNlbGYuY2hlY2tSdWxlKG8ubmFtZSk7XHJcbiAgICAgIHJldHVybiBleHRlbmQoe30sIGRlZmF1bHRzLCBvLCBzZWxmLm5vcm1hbGl6ZVJ1bGUocnVsZXNbby5uYW1lXSkpO1xyXG4gICAgfVxyXG5cclxuICAgIHJhaXNlKDE0LCBcImludmFsaWQgdmFsaWRhdGlvbiBydWxlXCIpO1xyXG4gIH1cclxuXHJcbiAgZ2V0UnVsZXMoYSkge1xyXG4gICAgLy9nZXQgdmFsaWRhdG9ycyBieSBuYW1lLCBhY2NlcHRzIGFuIGFycmF5IG9mIG5hbWVzXHJcbiAgICB2YXIgdiA9IHsgZGlyZWN0OiBbXSwgZGVmZXJyZWQ6IFtdIH0sIHQgPSB0aGlzO1xyXG4gICAgZWFjaChhLCBmdW5jdGlvbiAodmFsKSB7XHJcbiAgICAgIHZhciB2YWxpZGF0b3IgPSB0LmdldFJ1bGUodmFsKTtcclxuICAgICAgaWYgKHZhbGlkYXRvci5kZWZlcnJlZCkge1xyXG4gICAgICAgIHYuZGVmZXJyZWQucHVzaCh2YWxpZGF0b3IpO1xyXG4gICAgICB9IGVsc2Uge1xyXG4gICAgICAgIHYuZGlyZWN0LnB1c2godmFsaWRhdG9yKTtcclxuICAgICAgfVxyXG4gICAgfSk7XHJcbiAgICByZXR1cm4gdjtcclxuICB9XHJcblxyXG4gIHZhbGlkYXRlKHJ1bGVzLCBmaWVsZCwgdmFsLCBmb3JjZWQpIHtcclxuICAgIHZhciBxdWV1ZSA9IHRoaXMuZ2V0VmFsaWRhdGlvbkNoYWluKHJ1bGVzKTtcclxuICAgIHJldHVybiB0aGlzLmNoYWluKHF1ZXVlLCBmaWVsZCwgdmFsLCBmb3JjZWQpO1xyXG4gIH1cclxuXHJcbiAgZ2V0VmFsaWRhdGlvbkNoYWluKGEpIHtcclxuICAgIHZhciB2ID0gdGhpcy5nZXRSdWxlcyhhKSwgY2hhaW4gPSBbXSwgc2VsZiA9IHRoaXM7XHJcbiAgICAvL2NsaWVudCBzaWRlIHZhbGlkYXRpb24gZmlyc3RcclxuICAgIGVhY2godi5kaXJlY3QsIGZ1bmN0aW9uIChyKSB7XHJcbiAgICAgIHIuZm4gPSBzZWxmLm1ha2VSdWxlRGVmZXJyZWQoci5mbik7XHJcbiAgICAgIGNoYWluLnB1c2gocik7XHJcbiAgICB9KTtcclxuICAgIC8vZGVmZXJyZWRzIGxhdGVyXHJcbiAgICBlYWNoKHYuZGVmZXJyZWQsIGZ1bmN0aW9uIChyKSB7XHJcbiAgICAgIGNoYWluLnB1c2gocik7XHJcbiAgICB9KTtcclxuICAgIHJldHVybiBjaGFpbjtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFdyYXBzIGEgc3luY2hyb25vdXMgZnVuY3Rpb24gaW50byBhIHByb21pc2UsIHNvIGl0IGNhbiBiZSBydW4gYXN5bmNocm9ub3VzbHkuXHJcbiAgICogXHJcbiAgICogQHBhcmFtIHtmdW5jdGlvbn0gZiBcclxuICAgKi9cclxuICBtYWtlUnVsZURlZmVycmVkKGYpIHtcclxuICAgIHZhciB2YWxpZGF0b3IgPSB0aGlzO1xyXG4gICAgcmV0dXJuIHdyYXAoZiwgZnVuY3Rpb24gKGZ1bmMpIHtcclxuICAgICAgdmFyIGFyZ3MgPSB0b0FycmF5KGFyZ3VtZW50cyk7XHJcbiAgICAgIHJldHVybiBuZXcgUHJvbWlzZShmdW5jdGlvbiAocmVzb2x2ZSwgcmVqZWN0KSB7XHJcbiAgICAgICAgdmFyIHJlc3VsdCA9IGZ1bmMuYXBwbHkodmFsaWRhdG9yLmRhdGFlbnRyeSwgYXJncy5zbGljZSgxLCBsZW4oYXJncykpKTtcclxuICAgICAgICAvL05COiB1c2luZyBOYXRpdmUgUHJvbWlzZSwgd2UgZG9uJ3Qgd2FudCB0byB0cmVhdCBhIGNvbW1vbiBzY2VuYXJpbyBsaWtlIGFuIGludmFsaWQgZmllbGQgYXMgYSByZWplY3Rpb25cclxuICAgICAgICByZXNvbHZlKHJlc3VsdCk7XHJcbiAgICAgIH0pO1xyXG4gICAgfSk7XHJcbiAgfVxyXG5cclxuICBsb2NhbGl6ZUVycm9yKGVycm9yLCBwYXJhbWV0ZXJzKSB7XHJcbiAgICB2YXIgZGF0YWVudHJ5ID0gdGhpcy5kYXRhZW50cnksXHJcbiAgICAgIGxvY2FsaXplciA9IGRhdGFlbnRyeSA/IGRhdGFlbnRyeS5sb2NhbGl6ZXIgOiBudWxsO1xyXG4gICAgcmV0dXJuIGxvY2FsaXplciAmJiBsb2NhbGl6ZXIubG9va3VwKGVycm9yKSA/IGxvY2FsaXplci50KGVycm9yLCBwYXJhbWV0ZXJzKSA6IGVycm9yO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogRXhlY3V0ZXMgYSBzZXJpZXMgb2YgZGVmZXJyZWQgdGhhdCBuZWVkIHRvIGJlIGV4ZWN1dGVkIG9uZSBhZnRlciB0aGUgb3RoZXIuXHJcbiAgICogcmV0dXJucyBhIGRlZmVycmVkIG9iamVjdCB0aGF0IGNvbXBsZXRlcyB3aGVuIGV2ZXJ5IHNpbmdsZSBkZWZlcnJlZCBjb21wbGV0ZXMsIG9yIGF0IHRoZSBmaXJzdCB0aGF0IGZhaWxzLlxyXG4gICAqIFxyXG4gICAqIEBwYXJhbSBxdWV1ZVxyXG4gICAqIEByZXR1cm5zIHtQcm9taXNlfVxyXG4gICAqL1xyXG4gIGNoYWluKHF1ZXVlKSB7XHJcbiAgICBpZiAoIWxlbihxdWV1ZSkpXHJcbiAgICAgIHJldHVybiBuZXcgUHJvbWlzZShmdW5jdGlvbiAocmVzb2x2ZSkgeyByZXNvbHZlKFtdKTsgfSk7XHJcbiAgICBcclxuICAgIC8vIG5vcm1hbGl6ZSBxdWV1ZVxyXG4gICAgcXVldWUgPSBtYXAocXVldWUsIGZ1bmN0aW9uIChvKSB7XHJcbiAgICAgIGlmIChpc0Z1bmN0aW9uKG8pKSB7XHJcbiAgICAgICAgcmV0dXJuIHsgZm46IG8sIHBhcmFtczogW10gfTtcclxuICAgICAgfVxyXG4gICAgICByZXR1cm4gbztcclxuICAgIH0pO1xyXG4gICAgdmFyIGkgPSAwLFxyXG4gICAgICBjdXJyZW50RmllbGRSdWxlID0gcXVldWVbaV0sXHJcbiAgICAgIGEgPSBbXSxcclxuICAgICAgdmFsaWRhdG9yID0gdGhpcyxcclxuICAgICAgYXJncyA9IHRvQXJyYXkoYXJndW1lbnRzKS5zbGljZSgxLCBsZW4oYXJndW1lbnRzKSksXHJcbiAgICAgIGZ1bGxBcmdzID0gcnVsZVBhcmFtcyhhcmdzLCBjdXJyZW50RmllbGRSdWxlKTtcclxuICAgIFxyXG4gICAgcmV0dXJuIG5ldyBQcm9taXNlKGZ1bmN0aW9uIChyZXNvbHZlLCByZWplY3QpIHtcclxuICAgICAgZnVuY3Rpb24gc3VjY2VzcyhkYXRhKSB7XHJcbiAgICAgICAgLy8gc3VwcG9ydCBzcGVjaWZpYyBlcnJvciBtZXNzYWdlcyBmb3IgdmFsaWRhdGlvbiBydWxlIGRlZmluaXRpb24gaW4gc2NoZW1hXHJcbiAgICAgICAgaWYgKGRhdGEuZXJyb3IpIHtcclxuICAgICAgICAgIHZhciBydWxlTWVzc2FnZSA9IGN1cnJlbnRGaWVsZFJ1bGUubWVzc2FnZTtcclxuICAgICAgICAgIGlmIChydWxlTWVzc2FnZSlcclxuICAgICAgICAgICAgZGF0YS5tZXNzYWdlID0gaXNGdW5jdGlvbihydWxlTWVzc2FnZSkgPyBydWxlTWVzc2FnZS5hcHBseSh2YWxpZGF0b3IuZGF0YWVudHJ5LCBhcmdzKSA6IHJ1bGVNZXNzYWdlO1xyXG4gICAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgIHZhciBlcnJvcktleSA9IGRhdGEubWVzc2FnZTtcclxuICAgICAgICAgICAgdmFyIGxvY2FsaXplZE1lc3NhZ2UgPSB2YWxpZGF0b3IubG9jYWxpemVFcnJvcihlcnJvcktleSwgcnVsZVBhcmFtcyhbXSwgY3VycmVudEZpZWxkUnVsZSkpO1xyXG4gICAgICAgICAgICBpZiAobG9jYWxpemVkTWVzc2FnZSAhPSBlcnJvcktleSkge1xyXG4gICAgICAgICAgICAgIGRhdGEuZXJyb3JLZXkgPSBlcnJvcktleTtcclxuICAgICAgICAgICAgICBkYXRhLm1lc3NhZ2UgPSBsb2NhbGl6ZWRNZXNzYWdlO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgaWYgKGN1cnJlbnRGaWVsZFJ1bGUub25FcnJvcilcclxuICAgICAgICAgICAgY3VycmVudEZpZWxkUnVsZS5vbkVycm9yLmFwcGx5KHZhbGlkYXRvci5kYXRhZW50cnksIGFyZ3MpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgYS5wdXNoKGRhdGEpO1xyXG4gICAgICAgIGlmIChkYXRhLmVycm9yKSB7XHJcbiAgICAgICAgICAvLyBjb21tb24gdmFsaWRhdGlvbiBlcnJvcjogcmVzb2x2ZSB0aGUgY2hhaW5cclxuICAgICAgICAgIHJldHVybiByZXNvbHZlKGEpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBuZXh0KCk7IC8vIGdvIHRvIG5leHQgcHJvbWlzZVxyXG4gICAgICB9XHJcbiAgICAgIGZ1bmN0aW9uIGZhaWx1cmUoZGF0YSkge1xyXG4gICAgICAgIC8vIE5COiB0aGlzIGNhbGxiYWNrIHdpbGwgYmUgY2FsbGVkIGlmIGFuIGV4Y2VwdGlvbiBoYXBwZW4gZHVyaW5nIHZhbGlkYXRpb24uXHJcbiAgICAgICAgYS5wdXNoKHtcclxuICAgICAgICAgIGVycm9yOiB0cnVlLFxyXG4gICAgICAgICAgZXJyb3JLZXk6IGZhaWxlZFZhbGlkYXRpb25FcnJvcktleSxcclxuICAgICAgICAgIG1lc3NhZ2U6IHZhbGlkYXRvci5sb2NhbGl6ZUVycm9yKGZhaWxlZFZhbGlkYXRpb25FcnJvcktleSwgcnVsZVBhcmFtcyhbXSwgY3VycmVudEZpZWxkUnVsZSkpXHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgcmVqZWN0KGEpOy8vIHJlamVjdCB0aGUgdmFsaWRhdGlvbiBjaGFpblxyXG4gICAgICB9XHJcbiAgICAgIGZ1bmN0aW9uIG5leHQoKSB7XHJcbiAgICAgICAgaSsrO1xyXG4gICAgICAgIGlmIChpID09IGxlbihxdWV1ZSkpIHtcclxuICAgICAgICAgIC8vIGV2ZXJ5IHNpbmdsZSBwcm9taXNlIGNvbXBsZXRlZCBwcm9wZXJseVxyXG4gICAgICAgICAgcmVzb2x2ZShhKTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgY3VycmVudEZpZWxkUnVsZSA9IHF1ZXVlW2ldO1xyXG4gICAgICAgICAgZnVsbEFyZ3MgPSBydWxlUGFyYW1zKGFyZ3MsIGN1cnJlbnRGaWVsZFJ1bGUpO1xyXG4gICAgICAgICAgY3VycmVudEZpZWxkUnVsZS5mbi5hcHBseSh2YWxpZGF0b3IuZGF0YWVudHJ5LCBmdWxsQXJncykudGhlbihzdWNjZXNzLCBmYWlsdXJlKTtcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgICAgY3VycmVudEZpZWxkUnVsZS5mbi5hcHBseSh2YWxpZGF0b3IuZGF0YWVudHJ5LCBmdWxsQXJncykudGhlbihzdWNjZXNzLCBmYWlsdXJlKTtcclxuICAgIH0pO1xyXG4gIH1cclxufVxyXG5cclxuVmFsaWRhdG9yLmdldEVycm9yID0gZ2V0RXJyb3I7XHJcblZhbGlkYXRvci5SdWxlcyA9IFZhbGlkYXRpb25SdWxlcztcclxuXHJcbmV4cG9ydCBkZWZhdWx0IFZhbGlkYXRvciIsIi8qKlxyXG4gKiBEYXRhRW50cnkgcmFpc2UgZnVuY3Rpb24uXHJcbiAqIFRoaXMgZnVuY3Rpb24gaXMgdXNlZCB0byByYWlzZSBleGNlcHRpb25zIHRoYXQgaW5jbHVkZSBhIGxpbmsgdG8gdGhlIEdpdEh1YiB3aWtpLFxyXG4gKiBwcm92aWRpbmcgZnVydGhlciBpbmZvcm1hdGlvbiBhbmQgZGV0YWlscy5cclxuICogaHR0cHM6Ly9naXRodWIuY29tL1JvYmVydG9QcmV2YXRvL0RhdGFFbnRyeVxyXG4gKlxyXG4gKiBDb3B5cmlnaHQgMjAxOSwgUm9iZXJ0byBQcmV2YXRvXHJcbiAqIGh0dHBzOi8vcm9iZXJ0b3ByZXZhdG8uZ2l0aHViLmlvXHJcbiAqXHJcbiAqIExpY2Vuc2VkIHVuZGVyIHRoZSBNSVQgbGljZW5zZTpcclxuICogaHR0cDovL3d3dy5vcGVuc291cmNlLm9yZy9saWNlbnNlcy9NSVRcclxuICovXHJcblxyXG5jb25zdCByYWlzZVNldHRpbmdzID0ge1xyXG4gIHdyaXRlVG9Db25zb2xlOiB0cnVlXHJcbn07XHJcblxyXG4vKipcclxuICogUmFpc2VzIGFuIGV4Y2VwdGlvbiwgb2ZmZXJpbmcgYSBsaW5rIHRvIHRoZSBHaXRIdWIgd2lraS5cclxuICogaHR0cHM6Ly9naXRodWIuY29tL1JvYmVydG9QcmV2YXRvL0RhdGFFbnRyeS93aWtpL0Vycm9yc1xyXG4gKi9cclxuZnVuY3Rpb24gcmFpc2UoZXJyLCBkZXRhaWwpIHtcclxuICB2YXIgbWVzc2FnZSA9IChkZXRhaWwgPyBkZXRhaWwgOiBcIkVycm9yXCIpICsgXCIuIEZvciBmdXJ0aGVyIGRldGFpbHM6IGh0dHBzOi8vZ2l0aHViLmNvbS9Sb2JlcnRvUHJldmF0by9EYXRhRW50cnkvd2lraS9FcnJvcnMjXCIgKyBlcnI7XHJcbiAgaWYgKHJhaXNlU2V0dGluZ3Mud3JpdGVUb0NvbnNvbGUgJiYgdHlwZW9mIGNvbnNvbGUgIT0gXCJ1bmRlZmluZWRcIikge1xyXG4gICAgY29uc29sZS5lcnJvcihtZXNzYWdlKTtcclxuICB9XHJcbiAgdGhyb3cgbmV3IEVycm9yKG1lc3NhZ2UpO1xyXG59XHJcblxyXG5leHBvcnQgeyByYWlzZSwgcmFpc2VTZXR0aW5ncyB9IiwiLyoqXHJcbiAqIEdlbmVyaWMgdXRpbGl0aWVzIHRvIHdvcmsgd2l0aCBvYmplY3RzIGFuZCBmdW5jdGlvbnMuXHJcbiAqIGh0dHBzOi8vZ2l0aHViLmNvbS9Sb2JlcnRvUHJldmF0by9EYXRhRW50cnlcclxuICpcclxuICogQ29weXJpZ2h0IDIwMTksIFJvYmVydG8gUHJldmF0b1xyXG4gKiBodHRwczovL3JvYmVydG9wcmV2YXRvLmdpdGh1Yi5pb1xyXG4gKlxyXG4gKiBMaWNlbnNlZCB1bmRlciB0aGUgTUlUIGxpY2Vuc2U6XHJcbiAqIGh0dHA6Ly93d3cub3BlbnNvdXJjZS5vcmcvbGljZW5zZXMvTUlUXHJcbiAqL1xyXG4vLyBcclxuY29uc3QgT0JKRUNUID0gXCJvYmplY3RcIixcclxuICBTVFJJTkcgPSBcInN0cmluZ1wiLFxyXG4gIE5VTUJFUiA9IFwibnVtYmVyXCIsXHJcbiAgRlVOQ1RJT04gPSBcImZ1bmN0aW9uXCIsXHJcbiAgUkVQID0gXCJyZXBsYWNlXCI7XHJcblxyXG5pbXBvcnQge1xyXG4gIEFyZ3VtZW50RXhjZXB0aW9uLFxyXG4gIEFyZ3VtZW50TnVsbEV4Y2VwdGlvblxyXG59IGZyb20gXCIuLi9zY3JpcHRzL2V4Y2VwdGlvbnNcIlxyXG5cclxuLyoqXHJcbiogUmV0dXJucyB0aGUgbGVuZ2h0IG9mIHRoZSBnaXZlbiB2YXJpYWJsZS5cclxuKiBIYW5kbGVzIGFycmF5LCBvYmplY3Qga2V5cywgc3RyaW5nIGFuZCBhbnkgb3RoZXIgb2JqZWN0IHdpdGggbGVuZ3RoIHByb3BlcnR5LlxyXG4qIFxyXG4qIEBwYXJhbSB7Kn0gbyBcclxuKi9cclxuZnVuY3Rpb24gbGVuKG8pIHtcclxuICBpZiAoIW8pIHJldHVybiAwO1xyXG4gIGlmIChpc1N0cmluZyhvKSlcclxuICAgIHJldHVybiBvLmxlbmd0aDtcclxuICBpZiAoaXNQbGFpbk9iamVjdChvKSkge1xyXG4gICAgdmFyIGkgPSAwO1xyXG4gICAgZm9yIChsZXQgeCBpbiBvKSB7XHJcbiAgICAgIGkrKztcclxuICAgIH1cclxuICAgIHJldHVybiBpO1xyXG4gIH1cclxuICByZXR1cm4gXCJsZW5ndGhcIiBpbiBvID8gby5sZW5ndGggOiB1bmRlZmluZWQ7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIG1hcChhLCBmbikge1xyXG4gIGlmICghYSB8fCAhbGVuKGEpKSB7XHJcbiAgICBpZiAoaXNQbGFpbk9iamVjdChhKSkge1xyXG4gICAgICB2YXIgeCwgYiA9IFtdO1xyXG4gICAgICBmb3IgKHggaW4gYSkge1xyXG4gICAgICAgIGIucHVzaChmbih4LCBhW3hdKSk7XHJcbiAgICAgIH1cclxuICAgICAgcmV0dXJuIGI7XHJcbiAgICB9XHJcbiAgfTtcclxuICB2YXIgYiA9IFtdO1xyXG4gIGZvciAodmFyIGkgPSAwLCBsID0gbGVuKGEpOyBpIDwgbDsgaSsrKVxyXG4gICAgYi5wdXNoKGZuKGFbaV0pKTtcclxuICByZXR1cm4gYjtcclxufVxyXG5cclxuZnVuY3Rpb24gZWFjaChhLCBmbikge1xyXG4gIGlmIChpc1BsYWluT2JqZWN0KGEpKSB7XHJcbiAgICBmb3IgKHZhciB4IGluIGEpXHJcbiAgICAgIGZuKGFbeF0sIHgpO1xyXG4gICAgcmV0dXJuIGE7XHJcbiAgfVxyXG4gIGlmICghYSB8fCAhbGVuKGEpKSByZXR1cm4gYTtcclxuICBmb3IgKHZhciBpID0gMCwgbCA9IGxlbihhKTsgaSA8IGw7IGkrKylcclxuICAgIGZuKGFbaV0sIGkpO1xyXG59XHJcblxyXG5mdW5jdGlvbiBleGVjKGZuLCBqKSB7XHJcbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBqOyBpKyspXHJcbiAgICBmbihpKTtcclxufVxyXG5cclxuZnVuY3Rpb24gaXNTdHJpbmcocykge1xyXG4gIHJldHVybiB0eXBlb2YgcyA9PSBTVFJJTkc7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIGlzTnVtYmVyKG8pIHtcclxuICAvLyBpbiBKYXZhU2NyaXB0IE5hTiAoTm90IGEgTnVtYmVyKSBpZiBvZiB0eXBlIFwibnVtYmVyXCIgKGN1cmlvdXMuLilcclxuICAvLyBIb3dldmVyLCB3aGVuIGNoZWNraW5nIGlmIHNvbWV0aGluZyBpcyBhIG51bWJlciBpdCdzIGRlc2lyYWJsZSB0byByZXR1cm5cclxuICAvLyBmYWxzZSBpZiBpdCBpcyBOYU4hXHJcbiAgaWYgKGlzTmFOKG8pKSB7XHJcbiAgICByZXR1cm4gZmFsc2U7XHJcbiAgfVxyXG4gIHJldHVybiB0eXBlb2YgbyA9PSBOVU1CRVI7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIGlzRnVuY3Rpb24obykge1xyXG4gIHJldHVybiB0eXBlb2YgbyA9PSBGVU5DVElPTjtcclxufVxyXG5cclxuZnVuY3Rpb24gaXNPYmplY3Qobykge1xyXG4gIHJldHVybiB0eXBlb2YgbyA9PSBPQkpFQ1Q7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIGlzQXJyYXkobykge1xyXG4gIHJldHVybiBvIGluc3RhbmNlb2YgQXJyYXk7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIGlzRGF0ZShvKSB7XHJcbiAgcmV0dXJuIG8gaW5zdGFuY2VvZiBEYXRlO1xyXG59XHJcblxyXG5mdW5jdGlvbiBpc1JlZ0V4cChvKSB7XHJcbiAgcmV0dXJuIG8gaW5zdGFuY2VvZiBSZWdFeHA7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIGlzUGxhaW5PYmplY3Qobykge1xyXG4gIHJldHVybiB0eXBlb2YgbyA9PSBPQkpFQ1QgJiYgbyAhPT0gbnVsbCAmJiBvLmNvbnN0cnVjdG9yID09IE9iamVjdDtcclxufVxyXG5cclxuZnVuY3Rpb24gaXNFbXB0eShvKSB7XHJcbiAgaWYgKCFvKSByZXR1cm4gdHJ1ZTtcclxuICBpZiAoaXNBcnJheShvKSkge1xyXG4gICAgcmV0dXJuIG8ubGVuZ3RoID09IDA7XHJcbiAgfVxyXG4gIGlmIChpc1BsYWluT2JqZWN0KG8pKSB7XHJcbiAgICB2YXIgeDtcclxuICAgIGZvciAoeCBpbiBvKSB7XHJcbiAgICAgIHJldHVybiBmYWxzZTtcclxuICAgIH1cclxuICAgIHJldHVybiB0cnVlO1xyXG4gIH1cclxuICBpZiAoaXNTdHJpbmcobykpIHtcclxuICAgIHJldHVybiBvID09PSBcIlwiO1xyXG4gIH1cclxuICBpZiAoaXNOdW1iZXIobykpIHtcclxuICAgIHJldHVybiBvID09PSAwO1xyXG4gIH1cclxuICB0aHJvdyBuZXcgRXJyb3IoXCJpbnZhbGlkIGFyZ3VtZW50XCIpO1xyXG59XHJcblxyXG5mdW5jdGlvbiBoYXNPd25Qcm9wZXJ0eShvLCBuKSB7XHJcbiAgcmV0dXJuIG8gJiYgby5oYXNPd25Qcm9wZXJ0eShuKTtcclxufVxyXG5cclxuZnVuY3Rpb24gdXBwZXIocykge1xyXG4gIHJldHVybiBzLnRvVXBwZXJDYXNlKCk7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIGxvd2VyKHMpIHtcclxuICByZXR1cm4gcy50b0xvd2VyQ2FzZSgpO1xyXG59XHJcblxyXG5mdW5jdGlvbiBmaXJzdChhLCBmbikge1xyXG4gIGlmICghZm4pIHtcclxuICAgIHJldHVybiBhID8gYVswXSA6IHVuZGVmaW5lZDtcclxuICB9XHJcbiAgZm9yICh2YXIgaSA9IDAsIGwgPSBsZW4oYSk7IGkgPCBsOyBpKyspIHtcclxuICAgIGlmIChmbihhW2ldKSkgcmV0dXJuIGFbaV07XHJcbiAgfVxyXG59XHJcblxyXG5mdW5jdGlvbiB0b0FycmF5KGEpIHtcclxuICBpZiAoaXNBcnJheShhKSkgcmV0dXJuIGE7XHJcbiAgaWYgKHR5cGVvZiBhID09IE9CSkVDVCAmJiBsZW4oYSkpXHJcbiAgICByZXR1cm4gbWFwKGEsIGZ1bmN0aW9uIChvKSB7IHJldHVybiBvOyB9KTtcclxuICByZXR1cm4gQXJyYXkucHJvdG90eXBlLnNsaWNlLmNhbGwoYXJndW1lbnRzKTtcclxufVxyXG5cclxuZnVuY3Rpb24gZmxhdHRlbihhKSB7XHJcbiAgaWYgKGlzQXJyYXkoYSkpXHJcbiAgICByZXR1cm4gW10uY29uY2F0LmFwcGx5KFtdLCBtYXAoYSwgZmxhdHRlbikpO1xyXG4gIHJldHVybiBhO1xyXG59XHJcblxyXG52YXIgX2lkID0gLTE7XHJcbmZ1bmN0aW9uIHVuaXF1ZUlkKG5hbWUpIHtcclxuICBfaWQrKztcclxuICByZXR1cm4gKG5hbWUgfHwgXCJpZFwiKSArIF9pZDtcclxufVxyXG5cclxuZnVuY3Rpb24gcmVzZXRTZWVkKCkge1xyXG4gIF9pZCA9IC0xO1xyXG59XHJcblxyXG5mdW5jdGlvbiBrZXlzKG8pIHtcclxuICBpZiAoIW8pIHJldHVybiBbXTtcclxuICB2YXIgeCwgYSA9IFtdO1xyXG4gIGZvciAoeCBpbiBvKSB7XHJcbiAgICBhLnB1c2goeCk7XHJcbiAgfVxyXG4gIHJldHVybiBhO1xyXG59XHJcblxyXG5mdW5jdGlvbiB2YWx1ZXMobykge1xyXG4gIGlmICghbykgcmV0dXJuIFtdO1xyXG4gIHZhciB4LCBhID0gW107XHJcbiAgZm9yICh4IGluIG8pIHtcclxuICAgIGEucHVzaChvW3hdKTtcclxuICB9XHJcbiAgcmV0dXJuIGE7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIG1pbnVzKG8sIHByb3BzKSB7XHJcbiAgaWYgKCFvKSByZXR1cm4gbztcclxuICBpZiAoIXByb3BzKSBwcm9wcyA9IFtdO1xyXG4gIHZhciBhID0ge30sIHg7XHJcbiAgZm9yICh4IGluIG8pIHtcclxuICAgIGlmIChwcm9wcy5pbmRleE9mKHgpID09IC0xKSB7XHJcbiAgICAgIGFbeF0gPSBvW3hdO1xyXG4gICAgfVxyXG4gIH1cclxuICByZXR1cm4gYTtcclxufVxyXG5cclxuZnVuY3Rpb24gaXNVbmQoeCkge1xyXG4gIHJldHVybiB0eXBlb2YgeCA9PT0gXCJ1bmRlZmluZWRcIjtcclxufVxyXG5cclxuLyoqXHJcbiAqIERlZXAgY2xvbmVzIGFuIGl0ZW0gKGV4Y2VwdCBmdW5jdGlvbiB0eXBlcykuXHJcbiAqL1xyXG5mdW5jdGlvbiBjbG9uZShvKSB7XHJcbiAgdmFyIHgsIGE7XHJcbiAgaWYgKG8gPT09IG51bGwpIHJldHVybiBudWxsO1xyXG4gIGlmIChvID09PSB1bmRlZmluZWQpIHJldHVybiB1bmRlZmluZWQ7XHJcbiAgaWYgKGlzT2JqZWN0KG8pKSB7XHJcbiAgICBpZiAoaXNBcnJheShvKSkge1xyXG4gICAgICBhID0gW107XHJcbiAgICAgIGZvciAodmFyIGkgPSAwLCBsID0gby5sZW5ndGg7IGkgPCBsOyBpKyspIHtcclxuICAgICAgICBhW2ldID0gY2xvbmUob1tpXSk7XHJcbiAgICAgIH1cclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIGEgPSB7fTtcclxuICAgICAgdmFyIHY7XHJcbiAgICAgIGZvciAoeCBpbiBvKSB7XHJcbiAgICAgICAgdiA9IG9beF07XHJcbiAgICAgICAgaWYgKHYgPT09IG51bGwgfHwgdiA9PT0gdW5kZWZpbmVkKSB7XHJcbiAgICAgICAgICBhW3hdID0gdjtcclxuICAgICAgICAgIGNvbnRpbnVlO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAoaXNPYmplY3QodikpIHtcclxuICAgICAgICAgIGlmIChpc0RhdGUodikpIHtcclxuICAgICAgICAgICAgYVt4XSA9IG5ldyBEYXRlKHYuZ2V0VGltZSgpKTtcclxuICAgICAgICAgIH0gZWxzZSBpZiAoaXNSZWdFeHAodikpIHtcclxuICAgICAgICAgICAgYVt4XSA9IG5ldyBSZWdFeHAodi5zb3VyY2UsIHYuZmxhZ3MpO1xyXG4gICAgICAgICAgfSBlbHNlIGlmIChpc0FycmF5KHYpKSB7XHJcbiAgICAgICAgICAgIGFbeF0gPSBbXTtcclxuICAgICAgICAgICAgZm9yICh2YXIgaSA9IDAsIGwgPSB2Lmxlbmd0aDsgaSA8IGw7IGkrKykge1xyXG4gICAgICAgICAgICAgIGFbeF1baV0gPSBjbG9uZSh2W2ldKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgYVt4XSA9IGNsb25lKHYpO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICBhW3hdID0gdjtcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgIH1cclxuICB9IGVsc2Uge1xyXG4gICAgYSA9IG87XHJcbiAgfVxyXG4gIHJldHVybiBhO1xyXG59XHJcblxyXG5leHBvcnQgZGVmYXVsdCB7XHJcbiAgZXh0ZW5kKCkge1xyXG4gICAgdmFyIGFyZ3MgPSBhcmd1bWVudHM7XHJcbiAgICBpZiAoIWxlbihhcmdzKSkgcmV0dXJuO1xyXG4gICAgaWYgKGxlbihhcmdzKSA9PSAxKSByZXR1cm4gYXJnc1swXTtcclxuICAgIHZhciBhID0gYXJnc1swXSwgYiwgeDtcclxuICAgIGZvciAodmFyIGkgPSAxLCBsID0gbGVuKGFyZ3MpOyBpIDwgbDsgaSsrKSB7XHJcbiAgICAgIGIgPSBhcmdzW2ldO1xyXG4gICAgICBpZiAoIWIpIGNvbnRpbnVlO1xyXG4gICAgICBmb3IgKHggaW4gYikge1xyXG4gICAgICAgIGFbeF0gPSBiW3hdO1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgICByZXR1cm4gYTtcclxuICB9LFxyXG5cclxuICBzdHJpbmdBcmdzKGEpIHtcclxuICAgIGlmICghYSB8fCBpc1VuZChhLmxlbmd0aCkpIHRocm93IG5ldyBFcnJvcihcImV4cGVjdGVkIGFycmF5IGFyZ3VtZW50XCIpO1xyXG4gICAgaWYgKCFhLmxlbmd0aCkgcmV0dXJuIFtdO1xyXG4gICAgdmFyIGwgPSBhLmxlbmd0aDtcclxuICAgIGlmIChsID09PSAxKSB7XHJcbiAgICAgIHZhciBmaXJzdCA9IGFbMF07XHJcbiAgICAgIGlmIChpc1N0cmluZyhmaXJzdCkgJiYgZmlyc3QuaW5kZXhPZihcIiBcIikgPiAtMSkge1xyXG4gICAgICAgIHJldHVybiBmaXJzdC5zcGxpdCgvXFxzKy9nKTtcclxuICAgICAgfVxyXG4gICAgfVxyXG4gICAgcmV0dXJuIGE7XHJcbiAgfSxcclxuXHJcbiAgdW5pcXVlSWQsXHJcblxyXG4gIHJlc2V0U2VlZCxcclxuXHJcbiAgZmxhdHRlbixcclxuXHJcbiAgZWFjaCxcclxuXHJcbiAgZXhlYyxcclxuXHJcbiAga2V5cyxcclxuXHJcbiAgdmFsdWVzLFxyXG5cclxuICBtaW51cyxcclxuXHJcbiAgbWFwLFxyXG5cclxuICBmaXJzdCxcclxuXHJcbiAgdG9BcnJheSxcclxuXHJcbiAgaXNBcnJheSxcclxuXHJcbiAgaXNEYXRlLFxyXG5cclxuICBpc1N0cmluZyxcclxuXHJcbiAgaXNOdW1iZXIsXHJcblxyXG4gIGlzT2JqZWN0LFxyXG5cclxuICBpc1BsYWluT2JqZWN0LFxyXG5cclxuICBpc0VtcHR5LFxyXG5cclxuICBpc0Z1bmN0aW9uLFxyXG5cclxuICBoYXM6IGhhc093blByb3BlcnR5LFxyXG5cclxuICBpc051bGxPckVtcHR5U3RyaW5nKHYpIHtcclxuICAgIHJldHVybiB2ID09PSBudWxsIHx8IHYgPT09IHVuZGVmaW5lZCB8fCB2ID09PSBcIlwiO1xyXG4gIH0sXHJcblxyXG4gIGxvd2VyLFxyXG5cclxuICB1cHBlcixcclxuXHJcbiAgLyoqXHJcbiAgICogRHVjayB0eXBpbmc6IGNoZWNrcyBpZiBhbiBvYmplY3QgXCJRdWFja3MgbGlrZSBhIFByb21pc2VcIlxyXG4gICAqXHJcbiAgICogQHBhcmFtIHtQcm9taXNlfSBvO1xyXG4gICAqL1xyXG4gIHF1YWNrc0xpa2VQcm9taXNlKG8pIHtcclxuICAgIGlmIChvICYmIHR5cGVvZiBvLnRoZW4gPT0gRlVOQ1RJT04pIHtcclxuICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICB9XHJcbiAgICByZXR1cm4gZmFsc2U7XHJcbiAgfSxcclxuXHJcbiAgLyoqXHJcbiAgICogUmV0dXJucyB0aGUgc3VtIG9mIHZhbHVlcyBpbnNpZGUgYW4gYXJyYXksIGV2ZW50dWFsbHkgYnkgcHJlZGljYXRlLlxyXG4gICAqL1xyXG4gIHN1bShhLCBmbikge1xyXG4gICAgaWYgKCFhKSByZXR1cm47XHJcbiAgICB2YXIgYiwgbCA9IGxlbihhKTtcclxuICAgIGlmICghbCkgcmV0dXJuO1xyXG4gICAgZm9yICh2YXIgaSA9IDAsIGwgPSBsZW4oYSk7IGkgPCBsOyBpKyspIHtcclxuICAgICAgdmFyIHYgPSBmbiA/IGZuKGFbaV0pIDogYVtpXTtcclxuICAgICAgaWYgKGlzVW5kKGIpKSB7XHJcbiAgICAgICAgYiA9IHY7XHJcbiAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgYiArPSB2O1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgICByZXR1cm4gYjtcclxuICB9LFxyXG5cclxuICAvKipcclxuICAgKiBSZXR1cm5zIHRoZSBtYXhpbXVtIHZhbHVlIGluc2lkZSBhbiBhcnJheSwgYnkgcHJlZGljYXRlLlxyXG4gICAqL1xyXG4gIG1heChhLCBmbikge1xyXG4gICAgdmFyIG8gPSAtSW5maW5pdHk7XHJcbiAgICBmb3IgKHZhciBpID0gMCwgbCA9IGxlbihhKTsgaSA8IGw7IGkrKykge1xyXG4gICAgICB2YXIgdiA9IGZuID8gZm4oYVtpXSkgOiBhW2ldO1xyXG4gICAgICBpZiAodiA+IG8pXHJcbiAgICAgICAgbyA9IHY7XHJcbiAgICB9XHJcbiAgICByZXR1cm4gbztcclxuICB9LFxyXG5cclxuICAvKipcclxuICAgKiBSZXR1cm5zIHRoZSBtaW5pbXVtIHZhbHVlIGluc2lkZSBhbiBhcnJheSwgYnkgcHJlZGljYXRlLlxyXG4gICAqL1xyXG4gIG1pbihhLCBmbikge1xyXG4gICAgdmFyIG8gPSBJbmZpbml0eTtcclxuICAgIGZvciAodmFyIGkgPSAwLCBsID0gbGVuKGEpOyBpIDwgbDsgaSsrKSB7XHJcbiAgICAgIHZhciB2ID0gZm4gPyBmbihhW2ldKSA6IGFbaV07XHJcbiAgICAgIGlmICh2IDwgbylcclxuICAgICAgICBvID0gdjtcclxuICAgIH1cclxuICAgIHJldHVybiBvO1xyXG4gIH0sXHJcblxyXG4gIC8qKlxyXG4gICAqIFJldHVybnMgdGhlIGl0ZW0gd2l0aCB0aGUgbWF4aW11bSB2YWx1ZSBpbnNpZGUgYW4gYXJyYXksIGJ5IHByZWRpY2F0ZS5cclxuICAgKi9cclxuICB3aXRoTWF4KGEsIGZuKSB7XHJcbiAgICB2YXIgbztcclxuICAgIGZvciAodmFyIGkgPSAwLCBsID0gbGVuKGEpOyBpIDwgbDsgaSsrKSB7XHJcbiAgICAgIGlmICghbykge1xyXG4gICAgICAgIG8gPSBhW2ldO1xyXG4gICAgICAgIGNvbnRpbnVlO1xyXG4gICAgICB9XHJcbiAgICAgIHZhciB2ID0gZm4oYVtpXSk7XHJcbiAgICAgIGlmICh2ID4gZm4obykpXHJcbiAgICAgICAgbyA9IGFbaV07XHJcbiAgICB9XHJcbiAgICByZXR1cm4gbztcclxuICB9LFxyXG5cclxuICAvKipcclxuICAgKiBSZXR1cm5zIHRoZSBpdGVtIHdpdGggdGhlIG1pbmltdW0gdmFsdWUgaW5zaWRlIGFuIGFycmF5LCBieSBwcmVkaWNhdGUuXHJcbiAgICovXHJcbiAgd2l0aE1pbihhLCBmbikge1xyXG4gICAgdmFyIG87XHJcbiAgICBmb3IgKHZhciBpID0gMCwgbCA9IGxlbihhKTsgaSA8IGw7IGkrKykge1xyXG4gICAgICBpZiAoIW8pIHtcclxuICAgICAgICBvID0gYVtpXTtcclxuICAgICAgICBjb250aW51ZTtcclxuICAgICAgfVxyXG4gICAgICB2YXIgdiA9IGZuKGFbaV0pO1xyXG4gICAgICBpZiAodiA8IGZuKG8pKVxyXG4gICAgICAgIG8gPSBhW2ldO1xyXG4gICAgfVxyXG4gICAgcmV0dXJuIG87XHJcbiAgfSxcclxuXHJcbiAgaW5kZXhPZihhLCBvKSB7XHJcbiAgICByZXR1cm4gYS5pbmRleE9mKG8pO1xyXG4gIH0sXHJcblxyXG4gIGNvbnRhaW5zKGEsIG8pIHtcclxuICAgIGlmICghYSkgcmV0dXJuIGZhbHNlO1xyXG4gICAgcmV0dXJuIGEuaW5kZXhPZihvKSA+IC0xO1xyXG4gIH0sXHJcblxyXG4gIC8qKlxyXG4gICAqIFJldHVybnMgYSB2YWx1ZSBpbmRpY2F0aW5nIHdoZXRoZXIgYW55IG9iamVjdCBpbnNpZGUgYW4gYXJyYXksIG9yIGFueVxyXG4gICAqIGtleS12YWx1ZSBwYWlyIGluc2lkZSBhbiBvYmplY3QsIHJlc3BlY3QgYSBnaXZlbiBwcmVkaWNhdGUuXHJcbiAgICpcclxuICAgKiBAcGFyYW0gYTogaW5wdXQgYXJyYXkgb3Igb2JqZWN0XHJcbiAgICogQHBhcmFtIGZuOiBwcmVkaWNhdGUgdG8gdGVzdCBpdGVtcyBvciBrZXktdmFsdWUgcGFpcnNcclxuICAgKi9cclxuICBhbnkoYSwgZm4pIHtcclxuICAgIGlmIChpc1BsYWluT2JqZWN0KGEpKSB7XHJcbiAgICAgIHZhciB4O1xyXG4gICAgICBmb3IgKHggaW4gYSkge1xyXG4gICAgICAgIGlmIChmbih4LCBhW3hdKSlcclxuICAgICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgICB9XHJcbiAgICAgIHJldHVybiBmYWxzZTtcclxuICAgIH1cclxuICAgIGZvciAodmFyIGkgPSAwLCBsID0gbGVuKGEpOyBpIDwgbDsgaSsrKSB7XHJcbiAgICAgIGlmIChmbihhW2ldKSlcclxuICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgIH1cclxuICAgIHJldHVybiBmYWxzZTtcclxuICB9LFxyXG5cclxuICAvKipcclxuICAgKiBSZXR1cm5zIGEgdmFsdWUgaW5kaWNhdGluZyB3aGV0aGVyIGFsbCBvYmplY3QgaW5zaWRlIGFuIGFycmF5LCBvciBhbnlcclxuICAgKiBrZXktdmFsdWUgcGFpciBpbnNpZGUgYW4gb2JqZWN0LCByZXNwZWN0IGEgZ2l2ZW4gcHJlZGljYXRlLlxyXG4gICAqXHJcbiAgICogQHBhcmFtIGE6IGlucHV0IGFycmF5IG9yIG9iamVjdFxyXG4gICAqIEBwYXJhbSBmbjogcHJlZGljYXRlIHRvIHRlc3QgaXRlbXMgb3Iga2V5LXZhbHVlIHBhaXJzXHJcbiAgICovXHJcbiAgYWxsKGEsIGZuKSB7XHJcbiAgICBpZiAoaXNQbGFpbk9iamVjdChhKSkge1xyXG4gICAgICB2YXIgeDtcclxuICAgICAgZm9yICh4IGluIGEpIHtcclxuICAgICAgICBpZiAoIWZuKHgsIGFbeF0pKVxyXG4gICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICB9XHJcbiAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgfVxyXG4gICAgZm9yICh2YXIgaSA9IDAsIGwgPSBsZW4oYSk7IGkgPCBsOyBpKyspIHtcclxuICAgICAgaWYgKCFmbihhW2ldKSlcclxuICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICB9XHJcbiAgICByZXR1cm4gdHJ1ZTtcclxuICB9LFxyXG5cclxuICAvKipcclxuICAgKiBGaW5kcyB0aGUgZmlyc3QgaXRlbSBvciBwcm9wZXJ0eSB0aGF0IHJlc3BlY3RzIGEgZ2l2ZW4gcHJlZGljYXRlLlxyXG4gICAqL1xyXG4gIGZpbmQoYSwgZm4pIHtcclxuICAgIGlmICghYSkgcmV0dXJuIG51bGw7XHJcbiAgICBpZiAoaXNBcnJheShhKSkge1xyXG4gICAgICBpZiAoIWEgfHwgIWxlbihhKSkgcmV0dXJuO1xyXG4gICAgICBmb3IgKHZhciBpID0gMCwgbCA9IGxlbihhKTsgaSA8IGw7IGkrKykge1xyXG4gICAgICAgIGlmIChmbihhW2ldKSlcclxuICAgICAgICAgIHJldHVybiBhW2ldO1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgICBpZiAoaXNQbGFpbk9iamVjdChhKSkge1xyXG4gICAgICB2YXIgeDtcclxuICAgICAgZm9yICh4IGluIGEpIHtcclxuICAgICAgICBpZiAoZm4oYVt4XSwgeCkpXHJcbiAgICAgICAgICByZXR1cm4gYVt4XTtcclxuICAgICAgfVxyXG4gICAgfVxyXG4gICAgcmV0dXJuO1xyXG4gIH0sXHJcblxyXG4gIHdoZXJlKGEsIGZuKSB7XHJcbiAgICBpZiAoIWEgfHwgIWxlbihhKSkgcmV0dXJuIFtdO1xyXG4gICAgdmFyIGIgPSBbXTtcclxuICAgIGZvciAodmFyIGkgPSAwLCBsID0gbGVuKGEpOyBpIDwgbDsgaSsrKSB7XHJcbiAgICAgIGlmIChmbihhW2ldKSlcclxuICAgICAgICBiLnB1c2goYVtpXSk7XHJcbiAgICB9XHJcbiAgICByZXR1cm4gYjtcclxuICB9LFxyXG5cclxuICByZW1vdmVJdGVtKGEsIG8pIHtcclxuICAgIHZhciB4ID0gLTE7XHJcbiAgICBmb3IgKHZhciBpID0gMCwgbCA9IGxlbihhKTsgaSA8IGw7IGkrKykge1xyXG4gICAgICBpZiAoYVtpXSA9PT0gbykge1xyXG4gICAgICAgIHggPSBpO1xyXG4gICAgICAgIGJyZWFrO1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgICBhLnNwbGljZSh4LCAxKTtcclxuICB9LFxyXG5cclxuICByZW1vdmVJdGVtcyhhLCBiKSB7XHJcbiAgICBlYWNoKGIsIHRvUmVtb3ZlID0+IHtcclxuICAgICAgdGhpcy5yZW1vdmVJdGVtKGEsIHRvUmVtb3ZlKTtcclxuICAgIH0pO1xyXG4gIH0sXHJcblxyXG4gIHJlamVjdChhLCBmbikge1xyXG4gICAgaWYgKCFhIHx8ICFsZW4oYSkpIHJldHVybiBbXTtcclxuICAgIHZhciBiID0gW107XHJcbiAgICBmb3IgKHZhciBpID0gMCwgbCA9IGxlbihhKTsgaSA8IGw7IGkrKykge1xyXG4gICAgICBpZiAoIWZuKGFbaV0pKVxyXG4gICAgICAgIGIucHVzaChhW2ldKTtcclxuICAgIH1cclxuICAgIHJldHVybiBiO1xyXG4gIH0sXHJcblxyXG4gIHBpY2sobywgYXJyLCBleGNsdWRlKSB7XHJcbiAgICB2YXIgYSA9IHt9O1xyXG4gICAgaWYgKGV4Y2x1ZGUpIHtcclxuICAgICAgZm9yICh2YXIgeCBpbiBvKSB7XHJcbiAgICAgICAgaWYgKGFyci5pbmRleE9mKHgpID09IC0xKVxyXG4gICAgICAgICAgYVt4XSA9IG9beF07XHJcbiAgICAgIH1cclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIGZvciAodmFyIGkgPSAwLCBsID0gbGVuKGFycik7IGkgPCBsOyBpKyspIHtcclxuICAgICAgICB2YXIgcCA9IGFycltpXTtcclxuICAgICAgICBpZiAoaGFzT3duUHJvcGVydHkobywgcCkpXHJcbiAgICAgICAgICBhW3BdID0gb1twXTtcclxuICAgICAgfVxyXG4gICAgfVxyXG4gICAgcmV0dXJuIGE7XHJcbiAgfSxcclxuXHJcbiAgb21pdChhLCBhcnIpIHtcclxuICAgIHJldHVybiB0aGlzLnBpY2soYSwgYXJyLCAxKTtcclxuICB9LFxyXG5cclxuICAvKipcclxuICAgKiBSZXF1aXJlcyBhbiBvYmplY3QgdG8gYmUgZGVmaW5lZCBhbmQgdG8gaGF2ZSB0aGUgZ2l2ZW4gcHJvcGVydGllcy5cclxuICAgKlxyXG4gICAqIEBwYXJhbSB7T2JqZWN0fSBvOiBvYmplY3QgdG8gdmFsaWRhdGVcclxuICAgKiBAcGFyYW0ge1N0cmluZ1tdfSBwcm9wczogbGlzdCBvZiBwcm9wZXJ0aWVzIHRvIHJlcXVpcmVcclxuICAgKiBAcGFyYW0ge3N0cmluZ30gW25hbWU9b3B0aW9uc106XHJcbiAgICovXHJcbiAgcmVxdWlyZShvLCBwcm9wcywgbmFtZSkge1xyXG4gICAgaWYgKCFuYW1lKSBuYW1lID0gXCJvcHRpb25zXCI7XHJcbiAgICB2YXIgZXJyb3IgPSBcIlwiO1xyXG4gICAgaWYgKG8pIHtcclxuICAgICAgdGhpcy5lYWNoKHByb3BzLCB4ID0+IHtcclxuICAgICAgICBpZiAoIWhhc093blByb3BlcnR5KG8sIHgpKSB7XHJcbiAgICAgICAgICBlcnJvciArPSBcIm1pc3NpbmcgJ1wiICsgeCArIFwiJyBpbiBcIiArIG5hbWU7XHJcbiAgICAgICAgfVxyXG4gICAgICB9KTtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIGVycm9yID0gXCJtaXNzaW5nIFwiICsgbmFtZTtcclxuICAgIH1cclxuICAgIGlmIChlcnJvcilcclxuICAgICAgdGhyb3cgbmV3IEVycm9yKGVycm9yKTtcclxuICB9LFxyXG5cclxuICB3cmFwKGZuLCBjYWxsYmFjaywgY29udGV4dCkge1xyXG4gICAgdmFyIHdyYXBwZXIgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgIHJldHVybiBjYWxsYmFjay5hcHBseSh0aGlzLCBbZm5dLmNvbmNhdCh0b0FycmF5KGFyZ3VtZW50cykpKTtcclxuICAgIH07XHJcbiAgICB3cmFwcGVyLmJpbmQoY29udGV4dCB8fCB0aGlzKTtcclxuICAgIHJldHVybiB3cmFwcGVyO1xyXG4gIH0sXHJcblxyXG4gIHVud3JhcChvKSB7XHJcbiAgICByZXR1cm4gaXNGdW5jdGlvbihvKSA/IHVud3JhcChvKCkpIDogbztcclxuICB9LFxyXG5cclxuICBkZWZlcihmbikge1xyXG4gICAgc2V0VGltZW91dChmbiwgMCk7XHJcbiAgfSxcclxuXHJcbiAgLyoqXHJcbiAgICogUmV0dXJucyBhIG5ldyBmdW5jdGlvbiB0aGF0IGNhbiBiZSBpbnZva2VkIGF0IG1vc3QgbiB0aW1lcy5cclxuICAgKi9cclxuICBhdE1vc3QobiwgZm4sIGNvbnRleHQpIHtcclxuICAgIHZhciBtID0gbiwgcmVzdWx0O1xyXG4gICAgZnVuY3Rpb24gYSgpIHtcclxuICAgICAgaWYgKG4gPiAwKSB7XHJcbiAgICAgICAgbi0tO1xyXG4gICAgICAgIHJlc3VsdCA9IGZuLmFwcGx5KGNvbnRleHQgfHwgdGhpcywgYXJndW1lbnRzKTtcclxuICAgICAgfVxyXG4gICAgICByZXR1cm4gcmVzdWx0O1xyXG4gICAgfVxyXG4gICAgcmV0dXJuIGE7XHJcbiAgfSxcclxuXHJcbiAgaXNVbmQsXHJcblxyXG4gIC8qKlxyXG4gICAqIFJldHVybnMgYSBuZXcgZnVuY3Rpb24gdGhhdCBjYW4gYmUgaW52b2tlZCBhdCBtb3N0IG9uY2UuXHJcbiAgICovXHJcbiAgb25jZShmbiwgY29udGV4dCkge1xyXG4gICAgcmV0dXJuIHRoaXMuYXRNb3N0KDEsIGZuLCBjb250ZXh0KTtcclxuICB9LFxyXG5cclxuICAvKipcclxuICAgKiBSZXR1cm5zIGEgbmV3IGZ1bmN0aW9uIHRoYXQgaXMgZXhlY3V0ZWQgYWx3YXlzIHBhc3NpbmcgdGhlIGdpdmVuIGFyZ3VtZW50cyB0byBpdC5cclxuICAgKiBQeXRob24tZmFzaGlvbi5cclxuICAqL1xyXG4gIHBhcnRpYWwoZm4pIHtcclxuICAgIHZhciBzZWxmID0gdGhpcztcclxuICAgIHZhciBhcmdzID0gc2VsZi50b0FycmF5KGFyZ3VtZW50cyk7XHJcbiAgICBhcmdzLnNoaWZ0KCk7XHJcbiAgICByZXR1cm4gZnVuY3Rpb24gcGFydGlhbCgpIHtcclxuICAgICAgdmFyIGJhcmdzID0gc2VsZi50b0FycmF5KGFyZ3VtZW50cyk7XHJcbiAgICAgIHJldHVybiBmbi5hcHBseSh7fSwgYXJncy5jb25jYXQoYmFyZ3MpKTtcclxuICAgIH07XHJcbiAgfSxcclxuXHJcbiAgY2xvbmUsXHJcblxyXG4gIC8qKlxyXG4gICAqIFJldHVybnMgYSBuZXcgZnVuY3Rpb24gdGhhdCBjYW4gYmUgZmlyZWQgb25seSBvbmNlIGV2ZXJ5IG4gbWlsbGlzZWNvbmRzLlxyXG4gICAqIFRoZSBmdW5jdGlvbiBpcyBmaXJlZCBhZnRlciB0aGUgdGltZW91dCwgYW5kIGFzIGxhdGUgYXMgcG9zc2libGUuXHJcbiAgICpcclxuICAgKiBAcGFyYW0gZm46IGZ1bmN0aW9uXHJcbiAgICogQHBhcmFtIG1zOiBtaWxsaXNlY29uZHNcclxuICAgKiBAcGFyYW0ge2FueX0gY29udGV4dDogZnVuY3Rpb24gY29udGV4dC5cclxuICAgKi9cclxuICBkZWJvdW5jZShmbiwgbXMsIGNvbnRleHQpIHtcclxuICAgIHZhciBpdDtcclxuICAgIGZ1bmN0aW9uIGQoKSB7XHJcbiAgICAgIGlmIChpdCkge1xyXG4gICAgICAgIGNsZWFyVGltZW91dChpdCk7XHJcbiAgICAgIH1cclxuICAgICAgdmFyIGFyZ3MgPSBhcmd1bWVudHMubGVuZ3RoID8gdG9BcnJheShhcmd1bWVudHMpIDogdW5kZWZpbmVkO1xyXG4gICAgICBpdCA9IHNldFRpbWVvdXQoKCkgPT4ge1xyXG4gICAgICAgIGl0ID0gbnVsbDtcclxuICAgICAgICBmbi5hcHBseShjb250ZXh0LCBhcmdzKTtcclxuICAgICAgfSwgbXMpO1xyXG4gICAgfVxyXG4gICAgcmV0dXJuIGQ7XHJcbiAgfSxcclxuXHJcbiAgLyoqXHJcbiAgICogRWRpdHMgdGhlIGl0ZW1zIG9mIGFuIGFycmF5IGJ5IHVzaW5nIGEgZ2l2ZW4gZnVuY3Rpb24uXHJcbiAgICpcclxuICAgKiBAcGFyYW0ge2FycmF5fSBhOiBhcnJheSBvZiBpdGVtcy5cclxuICAgKiBAcGFyYW0ge2Z1bmN0aW9ufSBmbjogZWRpdGluZyBmdW5jdGlvbi5cclxuICAgKi9cclxuICByZWFjaChhLCBmbikge1xyXG4gICAgaWYgKCFpc0FycmF5KGEpKSB0aHJvdyBuZXcgRXJyb3IoXCJleHBlY3RlZCBhcnJheVwiKTtcclxuICAgIHZhciBpdGVtO1xyXG4gICAgZm9yICh2YXIgaSA9IDAsIGwgPSBhLmxlbmd0aDsgaSA8IGw7IGkrKykge1xyXG4gICAgICBpdGVtID0gYVtpXTtcclxuICAgICAgaWYgKGlzQXJyYXkoaXRlbSkpIHtcclxuICAgICAgICB0aGlzLnJlYWNoKGl0ZW0sIGZuKTtcclxuICAgICAgfSBlbHNlIHtcclxuICAgICAgICBhW2ldID0gZm4oaXRlbSk7XHJcbiAgICAgIH1cclxuICAgIH1cclxuICAgIHJldHVybiBhO1xyXG4gIH0sXHJcblxyXG4gIC8qKlxyXG4gICAqIFJldHVybnMgYSB2YWx1ZSBpbmRpY2F0aW5nIHdoZXRoZXIgdGhlIGdpdmVuIG9iamVjdCBpbXBsZW1lbnRzIGFsbCBnaXZlbiBtZXRob2RzLlxyXG4gICAqL1xyXG4gIHF1YWNrcyhvLCBtZXRob2RzKSB7XHJcbiAgICBpZiAoIW8pIHJldHVybiBmYWxzZTtcclxuICAgIGlmICghbWV0aG9kcykgdGhyb3cgXCJtaXNzaW5nIG1ldGhvZHMgbGlzdFwiO1xyXG4gICAgaWYgKGlzU3RyaW5nKG1ldGhvZHMpKSB7XHJcbiAgICAgIG1ldGhvZHMgPSB0b0FycmF5KGFyZ3VtZW50cykuc2xpY2UoMSwgYXJndW1lbnRzLmxlbmd0aCk7XHJcbiAgICB9XHJcbiAgICBmb3IgKHZhciBpID0gMCwgbCA9IG1ldGhvZHMubGVuZ3RoOyBpIDwgbDsgaSsrKSB7XHJcbiAgICAgIGlmICghaXNGdW5jdGlvbihvW21ldGhvZHNbaV1dKSkge1xyXG4gICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgfVxyXG4gICAgfVxyXG4gICAgcmV0dXJuIHRydWU7XHJcbiAgfSxcclxuXHJcbiAgLyoqXHJcbiAgICogUmVwbGFjZXMgdmFsdWVzIGluIHN0cmluZ3MsIHVzaW5nIG11c3RhY2hlcy5cclxuICAgKi9cclxuICBmb3JtYXQocywgbykge1xyXG4gICAgcmV0dXJuIHMucmVwbGFjZSgvXFx7XFx7KC4rPylcXH1cXH0vZywgZnVuY3Rpb24gKHMsIGEpIHtcclxuICAgICAgaWYgKCFvLmhhc093blByb3BlcnR5KGEpKVxyXG4gICAgICAgIHJldHVybiBzO1xyXG4gICAgICByZXR1cm4gb1thXTtcclxuICAgIH0pO1xyXG4gIH0sXHJcblxyXG4gIC8qKlxyXG4gICAqIFByb3h5IGZ1bmN0aW9uIHRvIGZuIGJpbmQuXHJcbiAgICovXHJcbiAgYmluZChmbiwgbykge1xyXG4gICAgcmV0dXJuIGZuLmJpbmQobyk7XHJcbiAgfSxcclxuXHJcbiAgaWZjYWxsKGZuLCBjdHgsIGFyZ3MpIHtcclxuICAgIGlmICghZm4pIHJldHVybjtcclxuICAgIGlmICghYXJncykge1xyXG4gICAgICBmbi5jYWxsKGN0eCk7XHJcbiAgICAgIHJldHVybjtcclxuICAgIH1cclxuICAgIHN3aXRjaCAoYXJncy5sZW5ndGgpIHtcclxuICAgICAgY2FzZSAwOiBmbi5jYWxsKGN0eCk7IHJldHVybjtcclxuICAgICAgY2FzZSAxOiBmbi5jYWxsKGN0eCwgYXJnc1swXSk7IHJldHVybjtcclxuICAgICAgY2FzZSAyOiBmbi5jYWxsKGN0eCwgYXJnc1swXSwgYXJnc1sxXSk7IHJldHVybjtcclxuICAgICAgY2FzZSAzOiBmbi5jYWxsKGN0eCwgYXJnc1swXSwgYXJnc1sxXSwgYXJnc1syXSk7IHJldHVybjtcclxuICAgICAgZGVmYXVsdDogZm4uYXBwbHkoY3R4LCBhcmdzKTtcclxuICAgIH1cclxuICB9LFxyXG5cclxuICBsZW4sXHJcblxyXG4gIG5pbCh2KSB7XHJcbiAgICByZXR1cm4gdiA9PT0gbnVsbCB8fCB2ID09PSB1bmRlZmluZWQ7XHJcbiAgfSxcclxuXHJcbiAgbmlsT3JFbXB0eSh2KSB7XHJcbiAgICByZXR1cm4gdiA9PT0gbnVsbCB8fCB2ID09PSB1bmRlZmluZWQgfHwgdiA9PT0gXCJcIjtcclxuICB9XHJcbn07XHJcbiIsIi8qKlxyXG4gKiBDb3JlIERhdGFFbnRyeSBjbGFzc2VzLlxyXG4gKiBodHRwczovL2dpdGh1Yi5jb20vUm9iZXJ0b1ByZXZhdG8vRGF0YUVudHJ5XHJcbiAqXHJcbiAqIENvcHlyaWdodCAyMDE5LCBSb2JlcnRvIFByZXZhdG9cclxuICogaHR0cHM6Ly9yb2JlcnRvcHJldmF0by5naXRodWIuaW9cclxuICpcclxuICogTGljZW5zZWQgdW5kZXIgdGhlIE1JVCBsaWNlbnNlOlxyXG4gKiBodHRwOi8vd3d3Lm9wZW5zb3VyY2Uub3JnL2xpY2Vuc2VzL01JVFxyXG4gKi9cclxuaW1wb3J0IERhdGFFbnRyeSBmcm9tIFwiLi4vY29kZS9zY3JpcHRzL2Zvcm1zL2RhdGFlbnRyeVwiXHJcbmltcG9ydCBWYWxpZGF0b3IgZnJvbSBcIi4uL2NvZGUvc2NyaXB0cy9mb3Jtcy92YWxpZGF0aW9uL3ZhbGlkYXRvclwiXHJcbmltcG9ydCBGb3JtYXR0ZXIgZnJvbSBcIi4uL2NvZGUvc2NyaXB0cy9mb3Jtcy9mb3JtYXR0aW5nL2Zvcm1hdHRlclwiXHJcblxyXG5pZiAodHlwZW9mIHdpbmRvdyAhPSBcInVuZGVmaW5lZFwiKSB7XHJcbiAgd2luZG93LkRhdGFFbnRyeSA9IHtcclxuICAgIERhdGFFbnRyeTogRGF0YUVudHJ5LFxyXG4gICAgVmFsaWRhdG9yOiBWYWxpZGF0b3IsXHJcbiAgICBGb3JtYXR0ZXI6IEZvcm1hdHRlclxyXG4gIH07XHJcbn1cclxuXHJcbm1vZHVsZS5leHBvcnRzID0ge1xyXG4gIERhdGFFbnRyeSxcclxuICBWYWxpZGF0b3IsXHJcbiAgRm9ybWF0dGVyXHJcbn0iXX0=
