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

},{"../../scripts/utils":11}],2:[function(require,module,exports){
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

},{"../../scripts/components/events":1,"../../scripts/raise":10,"../../scripts/utils":11,"./formatting/formatter":5,"./validation/validator":9}],4:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }(); /**
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      * Decorator class editing context objects.
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

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function setInObject(obj, name, value) {
  if (_utils2.default.isFunction(obj[name])) {
    // setter style (e.g. Knockout)
    obj[name](value);
  } else {
    // simply set
    obj[name] = value;
  }
}

var ContextDecorator = function () {

  /**
   * Creates a new instance of ContextDecorator associated with the given dataentry.
   *
   * @param dataentry: instance of DataEntry.
   */
  function ContextDecorator(dataentry) {
    _classCallCheck(this, ContextDecorator);

    if (!dataentry) (0, _raise.raise)(17, "missing context for ContextDecorator (constructor parameter)");

    var options = dataentry.options || {};
    var obj = options.validationTarget;
    if (!obj) {
      // default to a new object
      obj = {};
    }
    delete options.validationTarget;
    dataentry.validationTarget = obj;

    if (obj === dataentry.context) (0, _raise.raise)(21, "invalid context for ContextDecorator: cannot be the same as dataentry context");

    this.target = obj;
  }

  _createClass(ContextDecorator, [{
    key: "markFieldNeutrum",
    value: function markFieldNeutrum(name) {
      setInObject(this.target, name, undefined);
    }
  }, {
    key: "markFieldInvalid",
    value: function markFieldInvalid(name, error) {
      setInObject(this.target, name, { valid: false, error: error });
    }
  }, {
    key: "markFieldValid",
    value: function markFieldValid(name) {
      setInObject(this.target, name, { valid: true });
    }
  }, {
    key: "markFieldInfo",
    value: function markFieldInfo(name, message) {
      setInObject(this.target, name, { valid: true, info: message });
    }

    /**
     * Disposes of this decorator.
     */

  }, {
    key: "dispose",
    value: function dispose() {
      this.target = null;
      return this;
    }
  }]);

  return ContextDecorator;
}();

exports.default = ContextDecorator;

},{"../../../scripts/raise":10,"../../../scripts/utils":11}],5:[function(require,module,exports){
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

},{"../../../scripts/raise":10,"../../../scripts/utils":11,"./rules":6}],6:[function(require,module,exports){
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

},{"../../utils":11}],7:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }(); /**
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      * Harvester class operating on context objects.
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

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function getFromObject(obj, name) {
  if (_utils2.default.isFunction(obj[name])) {
    // getter style (e.g. Knockout)
    return obj[name]();
  }
  // simply get
  return obj[name];
}

function setInObject(obj, name, value) {
  if (_utils2.default.isFunction(obj[name])) {
    // setter style (e.g. Knockout)
    obj[name](value);
  } else {
    // simply set
    obj[name] = value;
  }
}

var ContextHarvester = function () {

  /**
   * Creates a new instance of ContextHarvester associated with the given dataentry.
   *
   * @param dataentry: instance of DataEntry.
   */
  function ContextHarvester(dataentry) {
    _classCallCheck(this, ContextHarvester);

    if (!dataentry) (0, _raise.raise)(17, "missing context for ContextHarvester (constructor parameter)");

    var options = dataentry.options || {};
    var obj = options.sourceObject || dataentry.context;
    if (!obj) (0, _raise.raise)(18, "missing 'context' or 'sourceObject' for ContextHarvester");

    this.dataentry = dataentry;
    this.source = obj;
  }

  _createClass(ContextHarvester, [{
    key: "dispose",
    value: function dispose() {
      this.dataentry = null;
      this.source = null;
      return this;
    }
  }, {
    key: "getValues",
    value: function getValues() {
      var self = this,
          schema = self.dataentry.schema,
          keys = _utils2.default.keys(schema),
          values = {};

      for (var x in schema) {
        values[x] = getFromObject(this.source, x);
      }

      return values;
    }
  }, {
    key: "setValue",
    value: function setValue(name, value) {
      setInObject(this.source, name, value);
    }
  }, {
    key: "getValue",
    value: function getValue(name) {
      return getFromObject(this.source, name);
    }
  }]);

  return ContextHarvester;
}();

exports.default = ContextHarvester;

},{"../../../scripts/raise":10,"../../../scripts/utils":11}],8:[function(require,module,exports){
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

},{"../../utils":11}],9:[function(require,module,exports){
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

},{"../../../scripts/raise":10,"../../../scripts/utils":11,"./rules":8}],10:[function(require,module,exports){
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

},{}],11:[function(require,module,exports){
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

},{"../scripts/exceptions":2}],12:[function(require,module,exports){
"use strict";

var _dataentry = require("../code/scripts/forms/dataentry");

var _dataentry2 = _interopRequireDefault(_dataentry);

var _validator = require("../code/scripts/forms/validation/validator");

var _validator2 = _interopRequireDefault(_validator);

var _formatter = require("../code/scripts/forms/formatting/formatter");

var _formatter2 = _interopRequireDefault(_formatter);

var _contextharvester = require("../code/scripts/forms/harvesting/contextharvester");

var _contextharvester2 = _interopRequireDefault(_contextharvester);

var _contextdecorator = require("../code/scripts/forms/decoration/contextdecorator");

var _contextdecorator2 = _interopRequireDefault(_contextdecorator);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

_dataentry2.default.configure({
  marker: _contextdecorator2.default,
  harvester: _contextharvester2.default
}); /**
     * DataEntry with built-in context classes.
     * https://github.com/RobertoPrevato/DataEntry
     *
     * Copyright 2019, Roberto Prevato
     * https://robertoprevato.github.io
     *
     * Licensed under the MIT license:
     * http://www.opensource.org/licenses/MIT
     */


if (typeof window != "undefined") {
  window.DataEntry = {
    DataEntry: _dataentry2.default,
    Validator: _validator2.default,
    Formatter: _formatter2.default,
    ContextHarvester: _contextharvester2.default,
    ContextDecorator: _contextdecorator2.default
  };
}

module.exports = {
  DataEntry: _dataentry2.default,
  Validator: _validator2.default,
  Formatter: _formatter2.default,
  ContextHarvester: _contextharvester2.default,
  ContextDecorator: _contextdecorator2.default
};

},{"../code/scripts/forms/dataentry":3,"../code/scripts/forms/decoration/contextdecorator":4,"../code/scripts/forms/formatting/formatter":5,"../code/scripts/forms/harvesting/contextharvester":7,"../code/scripts/forms/validation/validator":9}]},{},[12])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJjb2RlL3NjcmlwdHMvY29tcG9uZW50cy9ldmVudHMuanMiLCJjb2RlL3NjcmlwdHMvZXhjZXB0aW9ucy5qcyIsImNvZGUvc2NyaXB0cy9mb3Jtcy9kYXRhZW50cnkuanMiLCJjb2RlL3NjcmlwdHMvZm9ybXMvZGVjb3JhdGlvbi9jb250ZXh0ZGVjb3JhdG9yLmpzIiwiY29kZS9zY3JpcHRzL2Zvcm1zL2Zvcm1hdHRpbmcvZm9ybWF0dGVyLmpzIiwiY29kZS9zY3JpcHRzL2Zvcm1zL2Zvcm1hdHRpbmcvcnVsZXMuanMiLCJjb2RlL3NjcmlwdHMvZm9ybXMvaGFydmVzdGluZy9jb250ZXh0aGFydmVzdGVyLmpzIiwiY29kZS9zY3JpcHRzL2Zvcm1zL3ZhbGlkYXRpb24vcnVsZXMuanMiLCJjb2RlL3NjcmlwdHMvZm9ybXMvdmFsaWRhdGlvbi92YWxpZGF0b3IuanMiLCJjb2RlL3NjcmlwdHMvcmFpc2UuanMiLCJjb2RlL3NjcmlwdHMvdXRpbHMuanMiLCJkaXN0cmlidXRpb25maWxlcy9kYXRhZW50cnktY29udGV4dC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7Ozs7OzhRQ0FBOzs7Ozs7Ozs7Ozs7QUFVQTs7Ozs7Ozs7QUFFQSxJQUFJLFFBQVEsRUFBWjtBQUNBLElBQUksT0FBTyxNQUFNLElBQWpCO0FBQ0EsSUFBSSxRQUFRLE1BQU0sS0FBbEI7QUFDQSxJQUFJLFNBQVMsTUFBTSxNQUFuQjs7QUFFQTtBQUNBLElBQU0sZ0JBQWdCLEtBQXRCOztBQUVBLElBQUksWUFBWSxTQUFaLFNBQVksQ0FBVSxHQUFWLEVBQWUsTUFBZixFQUF1QixJQUF2QixFQUE2QixJQUE3QixFQUFtQztBQUNqRCxNQUFJLENBQUMsSUFBTCxFQUFXLE9BQU8sSUFBUDs7QUFFWDtBQUNBLE1BQUksUUFBTyxJQUFQLHlDQUFPLElBQVAsT0FBZ0IsUUFBcEIsRUFBOEI7QUFDNUIsU0FBSyxJ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akIsc0JBQWtCO0FBTEQsR0FBbkI7QUFPRDs7QUFFRCxPQUFPLE9BQVAsR0FBaUI7QUFDZixnQ0FEZTtBQUVmLGdDQUZlO0FBR2YsZ0NBSGU7QUFJZiw4Q0FKZTtBQUtmO0FBTGUsQ0FBakIiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbigpe2Z1bmN0aW9uIHIoZSxuLHQpe2Z1bmN0aW9uIG8oaSxmKXtpZighbltpXSl7aWYoIWVbaV0pe3ZhciBjPVwiZnVuY3Rpb25cIj09dHlwZW9mIHJlcXVpcmUmJnJlcXVpcmU7aWYoIWYmJmMpcmV0dXJuIGMoaSwhMCk7aWYodSlyZXR1cm4gdShpLCEwKTt2YXIgYT1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK2krXCInXCIpO3Rocm93IGEuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixhfXZhciBwPW5baV09e2V4cG9ydHM6e319O2VbaV1bMF0uY2FsbChwLmV4cG9ydHMsZnVuY3Rpb24ocil7dmFyIG49ZVtpXVsxXVtyXTtyZXR1cm4gbyhufHxyKX0scCxwLmV4cG9ydHMscixlLG4sdCl9cmV0dXJuIG5baV0uZXhwb3J0c31mb3IodmFyIHU9XCJmdW5jdGlvblwiPT10eXBlb2YgcmVxdWlyZSYmcmVxdWlyZSxpPTA7aTx0Lmxlbmd0aDtpKyspbyh0W2ldKTtyZXR1cm4gb31yZXR1cm4gcn0pKCkiLCIvKipcclxuICogRXZlbnRzLlxyXG4gKiBodHRwczovL2dpdGh1Yi5jb20vUm9iZXJ0b1ByZXZhdG8vRGF0YUVudHJ5XHJcbiAqXHJcbiAqIENvcHlyaWdodCAyMDE5LCBSb2JlcnRvIFByZXZhdG9cclxuICogaHR0cHM6Ly9yb2JlcnRvcHJldmF0by5naXRodWIuaW9cclxuICpcclxuICogTGljZW5zZWQgdW5kZXIgdGhlIE1JVCBsaWNlbnNlOlxyXG4gKiBodHRwOi8vd3d3Lm9wZW5zb3VyY2Uub3JnL2xpY2Vuc2VzL01JVFxyXG4gKi9cclxuaW1wb3J0IF8gZnJvbSBcIi4uLy4uL3NjcmlwdHMvdXRpbHNcIjtcclxuXHJcbnZhciBhcnJheSA9IFtdO1xyXG52YXIgcHVzaCA9IGFycmF5LnB1c2g7XHJcbnZhciBzbGljZSA9IGFycmF5LnNsaWNlO1xyXG52YXIgc3BsaWNlID0gYXJyYXkuc3BsaWNlO1xyXG5cclxuLy8gUmVndWxhciBleHByZXNzaW9uIHVzZWQgdG8gc3BsaXQgZXZlbnQgc3RyaW5ncy5cclxuY29uc3QgZXZlbnRTcGxpdHRlciA9IC9cXHMrLztcclxuXHJcbnZhciBldmVudHNBcGkgPSBmdW5jdGlvbiAob2JqLCBhY3Rpb24sIG5hbWUsIHJlc3QpIHtcclxuICBpZiAoIW5hbWUpIHJldHVybiB0cnVlO1xyXG5cclxuICAvLyBIYW5kbGUgZXZlbnQgbWFwcy5cclxuICBpZiAodHlwZW9mIG5hbWUgPT09IFwib2JqZWN0XCIpIHtcclxuICAgIGZvciAodmFyIGtleSBpbiBuYW1lKSB7XHJcbiAgICAgIG9ialthY3Rpb25dLmFwcGx5KG9iaiwgW2tleSwgbmFtZVtrZXldXS5jb25jYXQocmVzdCkpO1xyXG4gICAgfVxyXG4gICAgcmV0dXJuIGZhbHNlO1xyXG4gIH1cclxuXHJcbiAgLy8gSGFuZGxlIHNwYWNlIHNlcGFyYXRlZCBldmVudCBuYW1lcy5cclxuICBpZiAoZXZlbnRTcGxpdHRlci50ZXN0KG5hbWUpKSB7XHJcbiAgICB2YXIgbmFtZXMgPSBuYW1lLnNwbGl0KGV2ZW50U3BsaXR0ZXIpO1xyXG4gICAgZm9yICh2YXIgaSA9IDAsIGwgPSBuYW1lcy5sZW5ndGg7IGkgPCBsOyBpKyspIHtcclxuICAgICAgb2JqW2FjdGlvbl0uYXBwbHkob2JqLCBbbmFtZXNbaV1dLmNvbmNhdChyZXN0KSk7XHJcbiAgICB9XHJcbiAgICByZXR1cm4gZmFsc2U7XHJcbiAgfVxyXG5cclxuICByZXR1cm4gdHJ1ZTtcclxufVxyXG5cclxudmFyIHRyaWdnZXJFdmVudHMgPSBmdW5jdGlvbiAoZXZlbnRzLCBhcmdzKSB7XHJcbiAgdmFyIGV2LCBpID0gLTEsIGwgPSBldmVudHMubGVuZ3RoLCBhMSA9IGFyZ3NbMF0sIGEyID0gYXJnc1sxXSwgYTMgPSBhcmdzWzJdO1xyXG4gIHN3aXRjaCAoYXJncy5sZW5ndGgpIHtcclxuICAgIGNhc2UgMDogd2hpbGUgKCsraSA8IGwpIChldiA9IGV2ZW50c1tpXSkuY2FsbGJhY2suY2FsbChldi5jdHgpOyByZXR1cm47XHJcbiAgICBjYXNlIDE6IHdoaWxlICgrK2kgPCBsKSAoZXYgPSBldmVudHNbaV0pLmNhbGxiYWNrLmNhbGwoZXYuY3R4LCBhMSk7IHJldHVybjtcclxuICAgIGNhc2UgMjogd2hpbGUgKCsraSA8IGwpIChldiA9IGV2ZW50c1tpXSkuY2FsbGJhY2suY2FsbChldi5jdHgsIGExLCBhMik7IHJldHVybjtcclxuICAgIGNhc2UgMzogd2hpbGUgKCsraSA8IGwpIChldiA9IGV2ZW50c1tpXSkuY2FsbGJhY2suY2FsbChldi5jdHgsIGExLCBhMiwgYTMpOyByZXR1cm47XHJcbiAgICBkZWZhdWx0OiB3aGlsZSAoKytpIDwgbCkgKGV2ID0gZXZlbnRzW2ldKS5jYWxsYmFjay5hcHBseShldi5jdHgsIGFyZ3MpO1xyXG4gIH1cclxufVxyXG5cclxuLy9cclxuLy8gQmFzZSBjbGFzcyBmb3IgZXZlbnRzIGVtaXR0ZXJzXHJcbi8vXHJcbmV4cG9ydCBkZWZhdWx0IGNsYXNzIEV2ZW50c0VtaXR0ZXIge1xyXG5cclxuICAvLyBCaW5kIGFuIGV2ZW50IHRvIGEgYGNhbGxiYWNrYCBmdW5jdGlvbi4gUGFzc2luZyBgXCJhbGxcImAgd2lsbCBiaW5kXHJcbiAgLy8gdGhlIGNhbGxiYWNrIHRvIGFsbCBldmVudHMgZmlyZWQuXHJcbiAgb24obmFtZSwgY2FsbGJhY2ssIGNvbnRleHQpIHtcclxuICAgIGlmICghZXZlbnRzQXBpKHRoaXMsIFwib25cIiwgbmFtZSwgW2NhbGxiYWNrLCBjb250ZXh0XSkgfHwgIWNhbGxiYWNrKSByZXR1cm4gdGhpcztcclxuICAgIHRoaXMuX2V2ZW50cyB8fCAodGhpcy5fZXZlbnRzID0ge30pO1xyXG4gICAgdmFyIGV2ZW50cyA9IHRoaXMuX2V2ZW50c1tuYW1lXSB8fCAodGhpcy5fZXZlbnRzW25hbWVdID0gW10pO1xyXG4gICAgZXZlbnRzLnB1c2goeyBjYWxsYmFjazogY2FsbGJhY2ssIGNvbnRleHQ6IGNvbnRleHQsIGN0eDogY29udGV4dCB8fCB0aGlzIH0pO1xyXG4gICAgcmV0dXJuIHRoaXM7XHJcbiAgfVxyXG5cclxuICAvLyBCaW5kIGFuIGV2ZW50IHRvIG9ubHkgYmUgdHJpZ2dlcmVkIGEgc2luZ2xlIHRpbWUuIEFmdGVyIHRoZSBmaXJzdCB0aW1lXHJcbiAgLy8gdGhlIGNhbGxiYWNrIGlzIGludm9rZWQsIGl0IHdpbGwgYmUgcmVtb3ZlZC5cclxuICBvbmNlKG5hbWUsIGNhbGxiYWNrLCBjb250ZXh0KSB7XHJcbiAgICBpZiAoIWV2ZW50c0FwaSh0aGlzLCBcIm9uY2VcIiwgbmFtZSwgW2NhbGxiYWNrLCBjb250ZXh0XSkgfHwgIWNhbGxiYWNrKSByZXR1cm4gdGhpcztcclxuICAgIHZhciBzZWxmID0gdGhpcztcclxuICAgIHZhciBvbmNlID0gXy5vbmNlKGZ1bmN0aW9uICgpIHtcclxuICAgICAgc2VsZi5vZmYobmFtZSwgb25jZSk7XHJcbiAgICAgIGNhbGxiYWNrLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XHJcbiAgICB9KTtcclxuICAgIG9uY2UuX2NhbGxiYWNrID0gY2FsbGJhY2s7XHJcbiAgICByZXR1cm4gdGhpcy5vbihuYW1lLCBvbmNlLCBjb250ZXh0KTtcclxuICB9XHJcblxyXG4gIC8vIFJlbW92ZSBvbmUgb3IgbWFueSBjYWxsYmFja3MuXHJcbiAgb2ZmKG5hbWUsIGNhbGxiYWNrLCBjb250ZXh0KSB7XHJcbiAgICB2YXIgcmV0YWluLCBldiwgZXZlbnRzLCBuYW1lcywgaSwgbCwgaiwgaztcclxuICAgIGlmICghdGhpcy5fZXZlbnRzIHx8ICFldmVudHNBcGkodGhpcywgXCJvZmZcIiwgbmFtZSwgW2NhbGxiYWNrLCBjb250ZXh0XSkpIHJldHVybiB0aGlzO1xyXG4gICAgaWYgKCFuYW1lICYmICFjYWxsYmFjayAmJiAhY29udGV4dCkge1xyXG4gICAgICB0aGlzLl9ldmVudHMgPSB7fTtcclxuICAgICAgcmV0dXJuIHRoaXM7XHJcbiAgICB9XHJcblxyXG4gICAgbmFtZXMgPSBuYW1lID8gW25hbWVdIDogXy5rZXlzKHRoaXMuX2V2ZW50cyk7XHJcbiAgICBmb3IgKGkgPSAwLCBsID0gbmFtZXMubGVuZ3RoOyBpIDwgbDsgaSsrKSB7XHJcbiAgICAgIG5hbWUgPSBuYW1lc1tpXTtcclxuICAgICAgaWYgKGV2ZW50cyA9IHRoaXMuX2V2ZW50c1tuYW1lXSkge1xyXG4gICAgICAgIHRoaXMuX2V2ZW50c1tuYW1lXSA9IHJldGFpbiA9IFtdO1xyXG4gICAgICAgIGlmIChjYWxsYmFjayB8fCBjb250ZXh0KSB7XHJcbiAgICAgICAgICBmb3IgKGogPSAwLCBrID0gZXZlbnRzLmxlbmd0aDsgaiA8IGs7IGorKykge1xyXG4gICAgICAgICAgICBldiA9IGV2ZW50c1tqXTtcclxuICAgICAgICAgICAgaWYgKChjYWxsYmFjayAmJiBjYWxsYmFjayAhPT0gZXYuY2FsbGJhY2sgJiYgY2FsbGJhY2sgIT09IGV2LmNhbGxiYWNrLl9jYWxsYmFjaykgfHxcclxuICAgICAgICAgICAgKGNvbnRleHQgJiYgY29udGV4dCAhPT0gZXYuY29udGV4dCkpIHtcclxuICAgICAgICAgICAgICByZXRhaW4ucHVzaChldik7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKCFyZXRhaW4ubGVuZ3RoKSBkZWxldGUgdGhpcy5fZXZlbnRzW25hbWVdO1xyXG4gICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIHRoaXM7XHJcbiAgfVxyXG5cclxuICAvLyBUcmlnZ2VyIG9uZSBvciBtYW55IGV2ZW50cywgZmlyaW5nIGFsbCBib3VuZCBjYWxsYmFja3MuXHJcbiAgdHJpZ2dlcihuYW1lKSB7XHJcbiAgICBpZiAoIXRoaXMuX2V2ZW50cykgcmV0dXJuIHRoaXM7XHJcbiAgICB2YXIgYXJncyA9IHNsaWNlLmNhbGwoYXJndW1lbnRzLCAxKTtcclxuICAgIGlmICghZXZlbnRzQXBpKHRoaXMsIFwidHJpZ2dlclwiLCBuYW1lLCBhcmdzKSkgcmV0dXJuIHRoaXM7XHJcbiAgICB2YXIgZXZlbnRzID0gdGhpcy5fZXZlbnRzW25hbWVdO1xyXG4gICAgdmFyIGFsbEV2ZW50cyA9IHRoaXMuX2V2ZW50cy5hbGw7XHJcbiAgICBpZiAoZXZlbnRzKSB0cmlnZ2VyRXZlbnRzKGV2ZW50cywgYXJncyk7XHJcbiAgICBpZiAoYWxsRXZlbnRzKSB0cmlnZ2VyRXZlbnRzKGFsbEV2ZW50cywgYXJndW1lbnRzKTtcclxuICAgIHJldHVybiB0aGlzO1xyXG4gIH1cclxuXHJcbiAgLy8gVHJpZ2dlciBvbmUgb3IgbWFueSBldmVudHMsIGZpcmluZyBhbGwgYm91bmQgY2FsbGJhY2tzLlxyXG4gIGVtaXQobmFtZSkge1xyXG4gICAgcmV0dXJuIHRoaXMudHJpZ2dlcihuYW1lKTtcclxuICB9XHJcblxyXG4gIC8vIFRlbGwgdGhpcyBvYmplY3QgdG8gc3RvcCBsaXN0ZW5pbmcgdG8gZWl0aGVyIHNwZWNpZmljIGV2ZW50cywgb3JcclxuICAvLyB0byBldmVyeSBvYmplY3QgaXQncyBjdXJyZW50bHkgbGlzdGVuaW5nIHRvLlxyXG4gIHN0b3BMaXN0ZW5pbmcob2JqLCBuYW1lLCBjYWxsYmFjaykge1xyXG4gICAgdmFyIGxpc3RlbmVycyA9IHRoaXMuX2xpc3RlbmVycztcclxuICAgIGlmICghbGlzdGVuZXJzKSByZXR1cm4gdGhpcztcclxuICAgIHZhciBkZWxldGVMaXN0ZW5lciA9ICFuYW1lICYmICFjYWxsYmFjaztcclxuICAgIGlmICh0eXBlb2YgbmFtZSA9PT0gXCJvYmplY3RcIikgY2FsbGJhY2sgPSB0aGlzO1xyXG4gICAgaWYgKG9iaikgKGxpc3RlbmVycyA9IHt9KVtvYmouX2xpc3RlbmVySWRdID0gb2JqO1xyXG4gICAgZm9yICh2YXIgaWQgaW4gbGlzdGVuZXJzKSB7XHJcbiAgICAgIGxpc3RlbmVyc1tpZF0ub2ZmKG5hbWUsIGNhbGxiYWNrLCB0aGlzKTtcclxuICAgICAgaWYgKGRlbGV0ZUxpc3RlbmVyKSBkZWxldGUgdGhpcy5fbGlzdGVuZXJzW2lkXTtcclxuICAgIH1cclxuICAgIHJldHVybiB0aGlzO1xyXG4gIH1cclxuXHJcbiAgbGlzdGVuVG8ob2JqLCBuYW1lLCBjYWxsYmFjaykge1xyXG4gICAgLy8gc3VwcG9ydCBjYWxsaW5nIHRoZSBtZXRob2Qgd2l0aCBhbiBvYmplY3QgYXMgc2Vjb25kIHBhcmFtZXRlclxyXG4gICAgaWYgKGFyZ3VtZW50cy5sZW5ndGggPT0gMiAmJiB0eXBlb2YgbmFtZSA9PSBcIm9iamVjdFwiKSB7XHJcbiAgICAgIHZhciB4O1xyXG4gICAgICBmb3IgKHggaW4gbmFtZSkge1xyXG4gICAgICAgIHRoaXMubGlzdGVuVG8ob2JqLCB4LCBuYW1lW3hdKTtcclxuICAgICAgfVxyXG4gICAgICByZXR1cm4gdGhpcztcclxuICAgIH1cclxuXHJcbiAgICB2YXIgbGlzdGVuZXJzID0gdGhpcy5fbGlzdGVuZXJzIHx8ICh0aGlzLl9saXN0ZW5lcnMgPSB7fSk7XHJcbiAgICB2YXIgaWQgPSBvYmouX2xpc3RlbmVySWQgfHwgKG9iai5fbGlzdGVuZXJJZCA9IF8udW5pcXVlSWQoXCJsXCIpKTtcclxuICAgIGxpc3RlbmVyc1tpZF0gPSBvYmo7XHJcbiAgICBpZiAodHlwZW9mIG5hbWUgPT09IFwib2JqZWN0XCIpIGNhbGxiYWNrID0gdGhpcztcclxuICAgIG9iai5vbihuYW1lLCBjYWxsYmFjaywgdGhpcyk7XHJcbiAgICByZXR1cm4gdGhpcztcclxuICB9XHJcblxyXG4gIGxpc3RlblRvT25jZShvYmosIG5hbWUsIGNhbGxiYWNrKSB7XHJcbiAgICB2YXIgbGlzdGVuZXJzID0gdGhpcy5fbGlzdGVuZXJzIHx8ICh0aGlzLl9saXN0ZW5lcnMgPSB7fSk7XHJcbiAgICB2YXIgaWQgPSBvYmouX2xpc3RlbmVySWQgfHwgKG9iai5fbGlzdGVuZXJJZCA9IF8udW5pcXVlSWQoXCJsXCIpKTtcclxuICAgIGxpc3RlbmVyc1tpZF0gPSBvYmo7XHJcbiAgICBpZiAodHlwZW9mIG5hbWUgPT09IFwib2JqZWN0XCIpIGNhbGxiYWNrID0gdGhpcztcclxuICAgIG9iai5vbmNlKG5hbWUsIGNhbGxiYWNrLCB0aGlzKTtcclxuICAgIHJldHVybiB0aGlzO1xyXG4gIH1cclxufTtcclxuIiwiLyoqXHJcbiAqIFByb3h5IGZ1bmN0aW9ucyB0byByYWlzZSBleGNlcHRpb25zLlxyXG4gKiBodHRwczovL2dpdGh1Yi5jb20vUm9iZXJ0b1ByZXZhdG8vRGF0YUVudHJ5XHJcbiAqXHJcbiAqIENvcHlyaWdodCAyMDE5LCBSb2JlcnRvIFByZXZhdG9cclxuICogaHR0cHM6Ly9yb2JlcnRvcHJldmF0by5naXRodWIuaW9cclxuICpcclxuICogTGljZW5zZWQgdW5kZXIgdGhlIE1JVCBsaWNlbnNlOlxyXG4gKiBodHRwOi8vd3d3Lm9wZW5zb3VyY2Uub3JnL2xpY2Vuc2VzL01JVFxyXG4gKi9cclxuY29uc3QgTk9fUEFSQU0gPSBcIj8/P1wiXHJcblxyXG5mdW5jdGlvbiBBcmd1bWVudE51bGxFeGNlcHRpb24obmFtZSkge1xyXG4gIHRocm93IG5ldyBFcnJvcihcIlRoZSBwYXJhbWV0ZXIgY2Fubm90IGJlIG51bGw6IFwiICsgKG5hbWUgfHwgTk9fUEFSQU0pKVxyXG59XHJcblxyXG5mdW5jdGlvbiBBcmd1bWVudEV4Y2VwdGlvbihkZXRhaWxzKSB7XHJcbiAgdGhyb3cgbmV3IEVycm9yKFwiSW52YWxpZCBhcmd1bWVudDogXCIgKyAoZGV0YWlscyB8fCBOT19QQVJBTSkpXHJcbn1cclxuXHJcbmZ1bmN0aW9uIFR5cGVFeGNlcHRpb24obmFtZSwgZXhwZWN0ZWRUeXBlKSB7XHJcbiAgdGhyb3cgbmV3IEVycm9yKFwiRXhwZWN0ZWQgcGFyYW1ldGVyOiBcIiArIChuYW1lIHx8IE5PX1BBUkFNKSArIFwiIG9mIHR5cGU6IFwiICsgKHR5cGUgfHwgTk9fUEFSQU0pKVxyXG59XHJcblxyXG5mdW5jdGlvbiBPcGVyYXRpb25FeGNlcHRpb24oZGVzYykge1xyXG4gIHRocm93IG5ldyBFcnJvcihcIkludmFsaWQgb3BlcmF0aW9uOiBcIiArIGRlc2MpO1xyXG59XHJcblxyXG5leHBvcnQge1xyXG4gIEFyZ3VtZW50RXhjZXB0aW9uLFxyXG4gIEFyZ3VtZW50TnVsbEV4Y2VwdGlvbixcclxuICBUeXBlRXhjZXB0aW9uLFxyXG4gIE9wZXJhdGlvbkV4Y2VwdGlvblxyXG59XHJcbiIsIi8qKlxyXG4gKiBEYXRhRW50cnkgY2xhc3MuXHJcbiAqIGh0dHBzOi8vZ2l0aHViLmNvbS9Sb2JlcnRvUHJldmF0by9EYXRhRW50cnlcclxuICpcclxuICogQ29weXJpZ2h0IDIwMTksIFJvYmVydG8gUHJldmF0b1xyXG4gKiBodHRwczovL3JvYmVydG9wcmV2YXRvLmdpdGh1Yi5pb1xyXG4gKlxyXG4gKiBMaWNlbnNlZCB1bmRlciB0aGUgTUlUIGxpY2Vuc2U6XHJcbiAqIGh0dHA6Ly93d3cub3BlbnNvdXJjZS5vcmcvbGljZW5zZXMvTUlUXHJcbiAqL1xyXG5pbXBvcnQgXyBmcm9tIFwiLi4vLi4vc2NyaXB0cy91dGlsc1wiXHJcbmltcG9ydCB7IHJhaXNlIH0gZnJvbSBcIi4uLy4uL3NjcmlwdHMvcmFpc2VcIlxyXG5pbXBvcnQgRXZlbnRzRW1pdHRlciBmcm9tIFwiLi4vLi4vc2NyaXB0cy9jb21wb25lbnRzL2V2ZW50c1wiXHJcbmltcG9ydCBGb3JtYXR0ZXIgZnJvbSBcIi4vZm9ybWF0dGluZy9mb3JtYXR0ZXJcIlxyXG5pbXBvcnQgVmFsaWRhdG9yIGZyb20gXCIuL3ZhbGlkYXRpb24vdmFsaWRhdG9yXCJcclxuXHJcbmNvbnN0IFZFUlNJT04gPSBcIjIuMC41XCJcclxuXHJcbmNvbnN0IERFRkFVTFRTID0ge1xyXG4gIFxyXG4gIHVzZUltcGxpY2l0Q29uc3RyYWludHM6IHRydWUsIC8vIHdoZXRoZXIgdG8gZW5hYmxlIGltcGxpY2l0IGNvbnN0cmFpbnRzIGJ5IG1hdGNoIHdpdGggdmFsaWRhdG9yIG5hbWVzXHJcblxyXG4gIHVzZUltcGxpY2l0Rm9ybWF0OiB0cnVlLCAvLyB3aGV0aGVyIHRvIGVuYWJsZSBpbXBsaWNpdCBmb3JtYXR0aW5nIGJ5IG1hdGNoIHdpdGggdmFsaWRhdG9yIG5hbWVzXHJcblxyXG4gIGZvcm1hdHRlcjogRm9ybWF0dGVyLFxyXG5cclxuICB2YWxpZGF0b3I6IFZhbGlkYXRvcixcclxuXHJcbiAgbG9jYWxpemVyOiBudWxsLCAvLyB1c2VkIHRvIGxvY2FsaXplIGVycm9yIG1lc3NhZ2VzXHJcblxyXG4gIGJpbmRlcjogbnVsbCxcclxuXHJcbiAgdHJpZ2dlcnNEZWxheTogdW5kZWZpbmVkIC8vIGxldCBzcGVjaWZ5IGEgZGVsYXkgZm9yIHZhbGlkYXRpb24gdHJpZ2dlcnNcclxufVxyXG5cclxuY29uc3QgbGVuID0gXy5sZW47XHJcbmNvbnN0IGlzU3RyaW5nID0gXy5pc1N0cmluZztcclxuY29uc3QgaXNQbGFpbk9iamVjdCA9IF8uaXNQbGFpbk9iamVjdDtcclxuY29uc3QgaXNGdW5jdGlvbiA9IF8uaXNGdW5jdGlvbjtcclxuY29uc3QgaXNBcnJheSA9IF8uaXNBcnJheTtcclxuY29uc3QgZXh0ZW5kID0gXy5leHRlbmQ7XHJcbmNvbnN0IGVhY2ggPSBfLmVhY2g7XHJcbmNvbnN0IGZpbmQgPSBfLmZpbmQ7XHJcbmNvbnN0IHdoZXJlID0gXy53aGVyZTtcclxuY29uc3QgcGljayA9IF8ucGljaztcclxuY29uc3QgY29udGFpbnMgPSBfLmNvbnRhaW5zO1xyXG5jb25zdCBmbGF0dGVuID0gXy5mbGF0dGVuO1xyXG5jb25zdCBmaXJzdCA9IF8uZmlyc3Q7XHJcblxyXG5cclxuZnVuY3Rpb24gb2JqT3JJbnN0YW5jZSh2LCBkYXRhZW50cnkpIHtcclxuICBpZiAoIXYpIFxyXG4gICAgcmV0dXJuIG51bGw7XHJcbiAgXHJcbiAgaWYgKHYucHJvdG90eXBlKSB7XHJcbiAgICByZXR1cm4gbmV3IHYoZGF0YWVudHJ5KTtcclxuICB9XHJcbiAgcmV0dXJuIHY7XHJcbn1cclxuXHJcblxyXG5mdW5jdGlvbiB2YWxpZGF0ZUxvY2FsaXplcihvYmopIHtcclxuICBpZiAoIV8ucXVhY2tzKG9iaiwgW1widFwiLCBcImxvb2t1cFwiXSkpIHtcclxuICAgIHJhaXNlKDIyLCBcImludmFsaWQgYGxvY2FsaXplcmAgb3B0aW9uOiBpdCBtdXN0IGltcGxlbWVudCAndCcgYW5kICdsb29rdXAnIG1ldGhvZHMuXCIpXHJcbiAgfVxyXG59XHJcblxyXG5cclxuY2xhc3MgRGF0YUVudHJ5IGV4dGVuZHMgRXZlbnRzRW1pdHRlciB7XHJcblxyXG4gIHN0YXRpYyBnZXQgdmVyc2lvbigpIHtcclxuICAgIHJldHVybiBWRVJTSU9OO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQ3JlYXRlcyBhIG5ldyBpbnN0YW5jZSBvZiBEYXRhRW50cnkgd2l0aCB0aGUgZ2l2ZW4gb3B0aW9ucyBhbmQgc3RhdGljIHByb3BlcnRpZXMuXHJcbiAgICpcclxuICAgKiBAcGFyYW0gb3B0aW9uczogb3B0aW9ucyB0byB1c2UgZm9yIHRoaXMgaW5zdGFuY2Ugb2YgRGF0YUVudHJ5LlxyXG4gICAqIEBwYXJhbSBzdGF0aWNQcm9wZXJ0aWVzOiBwcm9wZXJ0aWVzIHRvIG92ZXJyaWRlIGluIHRoZSBpbnN0YW5jZSBvZiBEYXRhRW50cnkuXHJcbiAgICovXHJcbiAgY29uc3RydWN0b3Iob3B0aW9ucykge1xyXG4gICAgc3VwZXIoKTtcclxuICAgIGlmICghb3B0aW9ucykgcmFpc2UoOCwgXCJtaXNzaW5nIG9wdGlvbnNcIik7IC8vIG1pc3Npbmcgb3B0aW9uc1xyXG4gICAgaWYgKCFvcHRpb25zLnNjaGVtYSkgcmFpc2UoOCwgXCJtaXNzaW5nIHNjaGVtYVwiKTsgLy8gbWlzc2luZyBzY2hlbWFcclxuXHJcbiAgICB2YXIgc2VsZiA9IHRoaXMsIGJhc2VQcm9wZXJ0aWVzID0gRGF0YUVudHJ5LmJhc2VQcm9wZXJ0aWVzO1xyXG5cclxuICAgIGV4dGVuZChzZWxmLCBwaWNrKG9wdGlvbnMsIGJhc2VQcm9wZXJ0aWVzKSk7XHJcbiAgICBzZWxmLm9wdGlvbnMgPSBvcHRpb25zID0gZXh0ZW5kKHt9LCBEYXRhRW50cnkuZGVmYXVsdHMsIHBpY2sob3B0aW9ucywgYmFzZVByb3BlcnRpZXMsIDEpKTtcclxuXHJcbiAgICB2YXIgbWlzc2luZ1R5cGVzID0gW107XHJcbiAgICBlYWNoKFtcIm1hcmtlclwiLCBcImZvcm1hdHRlclwiLCBcImhhcnZlc3RlclwiXSwgbmFtZSA9PiB7XHJcbiAgICAgIGlmICghb3B0aW9uc1tuYW1lXSkgbWlzc2luZ1R5cGVzLnB1c2gobmFtZSk7XHJcbiAgICB9KTtcclxuICAgIGlmIChtaXNzaW5nVHlwZXMubGVuZ3RoKSB7XHJcbiAgICAgIHJhaXNlKDgsIFwibWlzc2luZyBvcHRpb25zOiBcIiArIG1pc3NpbmdUeXBlcy5qb2luKFwiLCBcIikpXHJcbiAgICB9XHJcblxyXG4gICAgY29uc3QgbG9jYWxpemVyID0gb3B0aW9ucy5sb2NhbGl6ZXI7XHJcbiAgICBpZiAobG9jYWxpemVyKVxyXG4gICAgICB2YWxpZGF0ZUxvY2FsaXplcihsb2NhbGl6ZXIpO1xyXG4gICAgc2VsZi5sb2NhbGl6ZXIgPSBsb2NhbGl6ZXI7XHJcblxyXG4gICAgZWFjaChbXHJcbiAgICAgIFwibWFya2VyXCIsIFxyXG4gICAgICBcImZvcm1hdHRlclwiLCBcclxuICAgICAgXCJoYXJ2ZXN0ZXJcIiwgXHJcbiAgICAgIFwidmFsaWRhdG9yXCIsXHJcbiAgICAgIFwiYmluZGVyXCJdLCBuYW1lID0+IHtcclxuICAgICAgc2VsZltuYW1lXSA9IG9iak9ySW5zdGFuY2Uob3B0aW9uc1tuYW1lXSwgc2VsZik7XHJcbiAgICB9KVxyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQ29uZmlndXJlcyBnbG9iYWwgZGVmYXVsdCBvcHRpb25zIGZvciB0aGUgRGF0YUVudHJ5LlxyXG4gICAqIFxyXG4gICAqIEBwYXJhbSB7b2JqZWN0fSBvcHRpb25zIFxyXG4gICAqL1xyXG4gIHN0YXRpYyBjb25maWd1cmUob3B0aW9ucykge1xyXG4gICAgZWFjaChvcHRpb25zLCAodiwgaykgPT4ge1xyXG4gICAgICBEYXRhRW50cnkuZGVmYXVsdHNba10gPSB2O1xyXG4gICAgfSk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBEaXNwb3NlcyBvZiB0aGlzIGRhdGFlbnRyeS5cclxuICAgKi9cclxuICBkaXNwb3NlKCkge1xyXG4gICAgdmFyIHNlbGYgPSB0aGlzO1xyXG4gICAgZWFjaChbXHJcbiAgICAgIFwiYmluZGVyXCIsIFxyXG4gICAgICBcIm1hcmtlclwiLCBcclxuICAgICAgXCJmb3JtYXR0ZXJcIiwgXHJcbiAgICAgIFwiaGFydmVzdGVyXCIsIFxyXG4gICAgICBcInZhbGlkYXRvclwiLFxyXG4gICAgICBcImNvbnRleHRcIl0sIG5hbWUgPT4ge1xyXG4gICAgICB2YXIgbyA9IHNlbGZbbmFtZV07XHJcbiAgICAgIGlmIChvICYmIG8uZGlzcG9zZSlcclxuICAgICAgICBvLmRpc3Bvc2UoKTtcclxuICAgICAgZGVsZXRlIHNlbGZbbmFtZV07XHJcbiAgICB9KVxyXG4gICAgZWFjaChbXCJ2YWxpZGF0aW9uQ29udGV4dFwiXSwgbmFtZSA9PiB7XHJcbiAgICAgIGRlbGV0ZSBzZWxmLm9wdGlvbnNbbmFtZV07XHJcbiAgICB9KVxyXG4gICAgZGVsZXRlIHNlbGYub3B0aW9ucztcclxuICAgIC8vIHJlbW92ZSBldmVudCBsaXN0ZW5lcnNcclxuICAgIHNlbGYub2ZmKCk7XHJcbiAgICBzZWxmLnN0b3BMaXN0ZW5pbmcoKTtcclxuICAgIHJldHVybiBzZWxmO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogVmFsaWRhdGVzIHRoZSBmaWVsZHMgZGVmaW5lZCBpbiB0aGUgc2NoZW1hIG9mIHRoaXMgRGF0YUVudHJ5OyBvciBzcGVjaWZpYyBmaWVsZHMgYnkgbmFtZS5cclxuICAgKiBcclxuICAgKiBAcGFyYW0gZmllbGRzXHJcbiAgICogQHBhcmFtIG9wdGlvbnNcclxuICAgKiBAcmV0dXJucyB7UHJvbWlzZX1cclxuICAgKi9cclxuICB2YWxpZGF0ZShmaWVsZHMsIG9wdGlvbnMpIHtcclxuICAgIHZhciBzZWxmID0gdGhpcztcclxuICAgIG9wdGlvbnMgPSBvcHRpb25zIHx8IHt9O1xyXG4gICAgaWYgKGZpZWxkcyAmJiBpc0Z1bmN0aW9uKGZpZWxkcykpIGZpZWxkcyA9IGZpZWxkcy5jYWxsKHNlbGYpO1xyXG4gICAgaWYgKGZpZWxkcyAmJiAhaXNBcnJheShmaWVsZHMpKSByYWlzZSg5LCBcInZhbGlkYXRlIGBmaWVsZHNgIGFyZ3VtZW50IG11c3QgYmUgYW4gYXJyYXkgb2Ygc3RyaW5nc1wiKTsgLy8gaW52YWxpZCBwYXJhbWV0ZXI6IGZpZWxkcyBtdXN0IGJlIGFuIGFycmF5IG9mIHN0cmluZ3NcclxuXHJcbiAgICB2YXIgc2NoZW1hID0gc2VsZi5zY2hlbWE7XHJcbiAgICBpZiAoIXNjaGVtYSkgcmFpc2UoMTEpO1xyXG5cclxuICAgIHJldHVybiBuZXcgUHJvbWlzZShmdW5jdGlvbiAocmVzb2x2ZSwgcmVqZWN0KSB7XHJcbiAgICAgIHZhciBjaGFpbiA9IFtdLCB2YWxpZGF0aW5nRmllbGRzID0gW107XHJcbiAgICAgIGZvciAodmFyIHggaW4gc2NoZW1hKSB7XHJcbiAgICAgICAgaWYgKGZpZWxkcyAmJiAhY29udGFpbnMoZmllbGRzLCB4KSkgY29udGludWU7XHJcbiAgICAgICAgdmFsaWRhdGluZ0ZpZWxkcy5wdXNoKHgpOyAvLyBuYW1lcyBvZiBmaWVsZHMgYmVpbmcgdmFsaWRhdGVkXHJcbiAgICAgIH1cclxuXHJcbiAgICAgIG9wdGlvbnMudmFsaWRhdGluZ0ZpZWxkcyA9IHZhbGlkYXRpbmdGaWVsZHM7IC8vIHNvIHdlIGRvbid0IHRyaWdnZXIgdmFsaWRhdGlvbiBmb3IgZmllbGRzIGJlaW5nIHZhbGlkYXRlZFxyXG5cclxuICAgICAgZWFjaCh2YWxpZGF0aW5nRmllbGRzLCBmaWVsZE5hbWUgPT4ge1xyXG4gICAgICAgIGNoYWluLnB1c2goc2VsZi52YWxpZGF0ZUZpZWxkKGZpZWxkTmFtZSwgb3B0aW9ucykpO1xyXG4gICAgICB9KVxyXG4gICAgICBcclxuXHJcbiAgICAgIFByb21pc2UuYWxsKGNoYWluKS50aGVuKGZ1bmN0aW9uIChhKSB7XHJcbiAgICAgICAgdmFyIGRhdGEgPSBmbGF0dGVuKGEpO1xyXG4gICAgICAgIHZhciBlcnJvcnMgPSB3aGVyZShkYXRhLCBmdW5jdGlvbiAobykgeyByZXR1cm4gbyAmJiBvLmVycm9yOyB9KTtcclxuICAgICAgICBpZiAobGVuKGVycm9ycykpIHtcclxuICAgICAgICAgIHNlbGYudHJpZ2dlcihcImZpcnN0OmVycm9yXCIsIGVycm9yc1swXSk7XHJcbiAgICAgICAgICBzZWxmLnRyaWdnZXIoXCJlcnJvcnNcIiwgZXJyb3JzKTtcclxuXHJcbiAgICAgICAgICAvL3Jlc29sdmUgd2l0aCBmYWlsdXJlIHZhbHVlXHJcbiAgICAgICAgICByZXNvbHZlLmNhbGwoc2VsZiwge1xyXG4gICAgICAgICAgICB2YWxpZDogZmFsc2UsXHJcbiAgICAgICAgICAgIGVycm9yczogZXJyb3JzXHJcbiAgICAgICAgICB9KTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgLy9hbGwgdGhlIHZhbGlkYXRpb24gcnVsZXMgcmV0dXJuZWQgc3VjY2Vzc1xyXG4gICAgICAgICAgcmVzb2x2ZS5jYWxsKHNlbGYsIHtcclxuICAgICAgICAgICAgdmFsaWQ6IHRydWUsXHJcbiAgICAgICAgICAgIHZhbHVlczogc2VsZi5oYXJ2ZXN0ZXIuZ2V0VmFsdWVzKClcclxuICAgICAgICAgIH0pO1xyXG4gICAgICAgIH1cclxuICAgICAgfSwgZnVuY3Rpb24gKGRhdGEpIHtcclxuICAgICAgICAvL2FuIGV4Y2VwdGlvbiBoYXBwZW4gd2hpbGUgcGVyZm9ybWluZyB2YWxpZGF0aW9uOyByZWplY3QgdGhlIHByb21pc2VcclxuICAgICAgICByZWplY3QuYXBwbHkoc2VsZiwgW2RhdGFdKTtcclxuICAgICAgfSk7XHJcbiAgICB9KTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFZhbGlkYXRlcyBvbmUgb3IgbW9yZSBmaWVsZHMsIGJ5IGEgc2luZ2xlIG5hbWVcclxuICAgKiBpdCByZXR1cm5zIGEgZGVmZXJyZWQgdGhhdCBjb21wbGV0ZXMgd2hlbiB2YWxpZGF0aW9uIGNvbXBsZXRlcyBmb3IgZWFjaCBmaWVsZCB3aXRoIHRoZSBnaXZlbiBuYW1lLlxyXG4gICAqIFxyXG4gICAqIEBwYXJhbSBmaWVsZE5hbWVcclxuICAgKiBAcGFyYW0gb3B0aW9uc1xyXG4gICAqIEByZXR1cm5zIHtQcm9taXNlfVxyXG4gICAqL1xyXG4gIHZhbGlkYXRlRmllbGQoZmllbGROYW1lLCBvcHRpb25zKSB7XHJcbiAgICAvLyBzZXQgb3B0aW9ucyB3aXRoIGRlZmF1bHQgdmFsdWVzXHJcbiAgICBvcHRpb25zID0gZXh0ZW5kKHtcclxuICAgICAgZGVwdGg6IDAsXHJcbiAgICAgIG9ubHlUb3VjaGVkOiBmYWxzZVxyXG4gICAgfSwgb3B0aW9ucyB8fCB7fSk7XHJcbiAgICB2YXIgc2VsZiA9IHRoaXMsIHNjaGVtYSA9IHNlbGYuc2NoZW1hO1xyXG5cclxuICAgIGlmICghZmllbGROYW1lKVxyXG4gICAgICByYWlzZSgxMik7XHJcblxyXG4gICAgaWYgKCFzY2hlbWEpXHJcbiAgICAgIHJhaXNlKDExKTtcclxuXHJcbiAgICB2YXIgZmllbGRTY2hlbWEgPSBzY2hlbWFbZmllbGROYW1lXTtcclxuICAgIGlmICghZmllbGRTY2hlbWEpXHJcbiAgICAgIC8vIENhbm5vdCB2YWxpZGF0ZSBmaWVsZCBiZWNhdXNlIHRoZSBzY2hlbWEgb2JqZWN0IGRvZXMgbm90IGNvbnRhaW4gaXRzIGRlZmluaXRpb24gXHJcbiAgICAgIC8vIG9yIGl0cyB2YWxpZGF0aW9uIGRlZmluaXRpb25cclxuICAgICAgcmFpc2UoMTMsIGZpZWxkTmFtZSk7XHJcblxyXG4gICAgLy8gbm9ybWFsaXplLCBpZiBhcnJheVxyXG4gICAgaWYgKGlzQXJyYXkoZmllbGRTY2hlbWEpKSB7XHJcbiAgICAgIHNjaGVtYVtmaWVsZE5hbWVdID0gZmllbGRTY2hlbWEgPSB7XHJcbiAgICAgICAgdmFsaWRhdGlvbjogZmllbGRTY2hlbWFcclxuICAgICAgfTtcclxuICAgIH0gZWxzZSBpZiAoIWZpZWxkU2NoZW1hLnZhbGlkYXRpb24pIHtcclxuICAgICAgcmFpc2UoMTMsIGZpZWxkTmFtZSk7XHJcbiAgICB9XHJcblxyXG4gICAgLy8gc3VwcG9ydCBmb3IgaGFydmVzdGVyIHJldHVybmluZyBtdWx0aXBsZSBmaWVsZHMgYnkgdGhlIHNhbWUgbmFtZVxyXG4gICAgLy8gdGhlIGhhcnZlc3RlciBjYW4gdGhlbiByZXR1cm4gb3RoZXIga2luZCBvZiBmaWVsZHMgKHN1Y2ggYXMgSFRNTCBub2RlcylcclxuICAgIHZhciBmaWVsZHMgPSBvcHRpb25zLmZpZWxkcyB8fCAodGhpcy5oYXJ2ZXN0ZXIuZ2V0RmllbGRzIFxyXG4gICAgICA/IHRoaXMuaGFydmVzdGVyLmdldEZpZWxkcyhmaWVsZE5hbWUpXHJcbiAgICAgIDogW2ZpZWxkTmFtZV0pO1xyXG4gICAgdmFyIHZhbGlkYXRvciA9IHNlbGYudmFsaWRhdG9yLFxyXG4gICAgICBtYXJrZXIgPSBzZWxmLm1hcmtlcixcclxuICAgICAgdmFsaWRhdGlvbiA9IHNlbGYuZ2V0RmllbGRWYWxpZGF0aW9uRGVmaW5pdGlvbihmaWVsZFNjaGVtYS52YWxpZGF0aW9uKSxcclxuICAgICAgY2hhaW4gPSBbXTtcclxuICAgIFxyXG4gICAgZWFjaChmaWVsZHMsIGZ1bmN0aW9uIChmaWVsZCkge1xyXG4gICAgICB2YXIgdmFsdWUgPSBzZWxmLmhhcnZlc3Rlci5nZXRWYWx1ZShmaWVsZCk7XHJcblxyXG4gICAgICAvLyBtYXJrIGZpZWxkIG5ldXRydW0gYmVmb3JlIHZhbGlkYXRpb25cclxuICAgICAgbWFya2VyLm1hcmtGaWVsZE5ldXRydW0oZmllbGQpO1xyXG4gICAgICBcclxuICAgICAgdmFyIHAgPSB2YWxpZGF0b3IudmFsaWRhdGUodmFsaWRhdGlvbiwgZmllbGQsIHZhbHVlKS50aGVuKGZ1bmN0aW9uIChkYXRhKSB7XHJcbiAgICAgICAgLy8gdGhlIHZhbGlkYXRpb24gcHJvY2VzcyBzdWNjZWVkZWQgKGRpZG4ndCBwcm9kdWNlIGFueSBleGNlcHRpb24pXHJcbiAgICAgICAgLy8gYnV0IHRoaXMgZG9lc24ndCBtZWFuIHRoYXQgdGhlIGZpZWxkIGlzIHZhbGlkOlxyXG4gICAgICAgIGZvciAodmFyIGogPSAwLCBxID0gbGVuKGRhdGEpOyBqIDwgcTsgaisrKSB7XHJcbiAgICAgICAgICB2YXIgbyA9IGRhdGFbal07XHJcbiAgICAgICAgICBpZiAoby5lcnJvcikge1xyXG4gICAgICAgICAgICAvLyBmaWVsZCBpbnZhbGlkXHJcbiAgICAgICAgICAgIG1hcmtlci5tYXJrRmllbGRJbnZhbGlkKGZpZWxkLCB7XHJcbiAgICAgICAgICAgICAgbWVzc2FnZTogby5tZXNzYWdlXHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAvLyBleGl0XHJcbiAgICAgICAgICAgIHJldHVybiBkYXRhO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICBcclxuICAgICAgICAvLyB0aGUgZmllbGQgaXMgdmFsaWQ7IGl0cyB2YWx1ZSBjYW4gYmUgZm9ybWF0dGVkO1xyXG4gICAgICAgIHNlbGYub25Hb29kVmFsaWRhdGlvbihmaWVsZFNjaGVtYSwgZmllbGQsIGZpZWxkTmFtZSwgdmFsdWUsIG9wdGlvbnMpO1xyXG5cclxuICAgICAgICBtYXJrZXIubWFya0ZpZWxkVmFsaWQoZmllbGQpO1xyXG4gICAgICAgIHJldHVybiBkYXRhO1xyXG4gICAgICB9LCBmdW5jdGlvbiAoYXJyKSB7XHJcbiAgICAgICAgLy8gdGhlIHZhbGlkYXRpb24gcHJvY2VzcyBmYWlsZWQgKGl0IHByb2R1Y2VkIGFuIGV4Y2VwdGlvbilcclxuICAgICAgICAvLyB0aGlzIHNob3VsZCBoYXBwZW4sIGZvciBleGFtcGxlLCB3aGVuIGEgdmFsaWRhdGlvbiBydWxlIHRoYXQgaW52b2x2ZXMgYW4gQWpheCByZXF1ZXN0IHJlY2VpdmVzIHN0YXR1cyA1MDAgZnJvbSB0aGUgc2VydmVyIHNpZGUuXHJcbiAgICAgICAgdmFyIGEgPSBmaXJzdChhcnIsIGZ1bmN0aW9uIChvKSB7XHJcbiAgICAgICAgICByZXR1cm4gby5lcnJvcjtcclxuICAgICAgICB9KTtcclxuICAgICAgICBtYXJrZXIubWFya0ZpZWxkSW52YWxpZChmaWVsZCwge1xyXG4gICAgICAgICAgbWVzc2FnZTogYS5tZXNzYWdlXHJcbiAgICAgICAgfSk7XHJcbiAgICAgIH0pO1xyXG5cclxuICAgICAgY2hhaW4ucHVzaChwKTtcclxuICAgIH0pO1xyXG4gICAgLy8gTkI6IHRoZSBjaGFpbiBjYW4gY29udGFpbiBtb3JlIHRoYW4gb25lIGVsZW1lbnQsIHdoZW4gYSBmaWVsZHNldCBjb250YWlucyBtdWx0aXBsZSBlbGVtZW50cyB3aXRoIHRoZSBzYW1lIG5hbWVcclxuICAgIC8vICh3aGljaCBpcyBwcm9wZXIgSFRNTCBhbmQgcmVsYXRpdmVseSBjb21tb24gc2NlbmFyaW8pXHJcbiAgICByZXR1cm4gbmV3IFByb21pc2UoZnVuY3Rpb24gKHJlc29sdmUsIHJlamVjdCkge1xyXG4gICAgICBQcm9taXNlLmFsbChjaGFpbikudGhlbihmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgcmVzb2x2ZShfLnRvQXJyYXkoYXJndW1lbnRzKSk7XHJcbiAgICAgIH0pO1xyXG4gICAgfSk7XHJcbiAgfVxyXG5cclxuICBvbkdvb2RWYWxpZGF0aW9uKGZpZWxkU2NoZW1hLCBmaWVsZCwgZmllbGROYW1lLCB2YWx1ZSwgb3B0aW9ucykge1xyXG4gICAgdGhpcy5mb3JtYXRBZnRlclZhbGlkYXRpb24oZmllbGRTY2hlbWEsIGZpZWxkLCBmaWVsZE5hbWUsIHZhbHVlKVxyXG4gICAgICAgIC5oYW5kbGVUcmlnZ2VycyhmaWVsZFNjaGVtYSwgZmllbGQsIGZpZWxkTmFtZSwgdmFsdWUsIG9wdGlvbnMpO1xyXG4gIH1cclxuXHJcbiAgZm9ybWF0QWZ0ZXJWYWxpZGF0aW9uKGZpZWxkU2NoZW1hLCBmaWVsZCwgZmllbGROYW1lLCB2YWx1ZSkge1xyXG4gICAgdmFyIHNlbGYgPSB0aGlzO1xyXG4gICAgdmFyIGZvcm1hdCA9IGZpZWxkU2NoZW1hLmZvcm1hdCwgdmFsaWRhdGlvbiA9IGZpZWxkU2NoZW1hLnZhbGlkYXRpb247XHJcbiAgICBpZiAoaXNGdW5jdGlvbihmb3JtYXQpKSBmb3JtYXQgPSBmb3JtYXQuY2FsbChzZWxmLCBmLCB2YWx1ZSk7XHJcbiAgICBcclxuICAgIHZhciBmb3JtYXR0ZWRWYWx1ZSA9IHZhbHVlO1xyXG4gICAgaWYgKGZvcm1hdCkge1xyXG4gICAgICBmb3JtYXR0ZWRWYWx1ZSA9IHNlbGYuZm9ybWF0dGVyLmZvcm1hdChmb3JtYXQsIGZpZWxkLCB2YWx1ZSk7XHJcbiAgICB9IGVsc2UgaWYgKHNlbGYub3B0aW9ucy51c2VJbXBsaWNpdEZvcm1hdCkge1xyXG4gICAgICAvLyBhcHBseSBmb3JtYXQgcnVsZXMgaW1wbGljaXRseSAoaW4gdGhpcyBjYXNlLCB0aGVyZSBhcmUgbm8gcGFyYW1ldGVycylcclxuICAgICAgdmFyIG1hdGNoaW5nRm9ybWF0UnVsZSA9IFtdO1xyXG4gICAgICBfLmVhY2godmFsaWRhdGlvbiwgcnVsZSA9PiB7XHJcbiAgICAgICAgdmFyIG5hbWUgPSBpc1N0cmluZyhydWxlKSA/IHJ1bGUgOiBydWxlLm5hbWU7XHJcbiAgICAgICAgaWYgKG5hbWUgJiYgc2VsZi5mb3JtYXR0ZXIucnVsZXNbbmFtZV0pXHJcbiAgICAgICAgICBtYXRjaGluZ0Zvcm1hdFJ1bGUucHVzaChuYW1lKTtcclxuICAgICAgfSlcclxuICAgICAgaWYgKG1hdGNoaW5nRm9ybWF0UnVsZS5sZW5ndGgpIHtcclxuICAgICAgICBmb3JtYXR0ZWRWYWx1ZSA9IHNlbGYuZm9ybWF0dGVyLmZvcm1hdChtYXRjaGluZ0Zvcm1hdFJ1bGUsIGZpZWxkLCB2YWx1ZSk7XHJcbiAgICAgIH1cclxuICAgIH1cclxuICAgIGlmIChmb3JtYXR0ZWRWYWx1ZSAhPT0gdmFsdWUpIHtcclxuICAgICAgLy8gdHJpZ2dlciBldmVudCB0byBcclxuICAgICAgc2VsZi50cmlnZ2VyKFwiZm9ybWF0XCIsIGZpZWxkLCBmaWVsZE5hbWUsIGZvcm1hdHRlZFZhbHVlKTtcclxuICAgICAgc2VsZi5oYXJ2ZXN0ZXIuc2V0VmFsdWUoZmllbGQsIGZvcm1hdHRlZFZhbHVlLCBzZWxmLCBmaWVsZE5hbWUpO1xyXG4gICAgfVxyXG4gICAgcmV0dXJuIHNlbGY7XHJcbiAgfVxyXG5cclxuICBoYW5kbGVUcmlnZ2VycyhmaWVsZFNjaGVtYSwgZmllbGQsIGZpZWxkTmFtZSwgdmFsdWUsIG9wdGlvbnMpIHtcclxuICAgIHZhciB0cmlnZ2VyID0gZmllbGRTY2hlbWEudHJpZ2dlcjtcclxuICAgIGlmICghdHJpZ2dlcikgcmV0dXJuIHRoaXM7XHJcblxyXG4gICAgLy8gZG9uJ3QgcmVwZWF0IHZhbGlkYXRpb24gZm9yIGZpZWxkcyBhbHJlYWR5IGJlaW5nIHZhbGlkYXRlZFxyXG4gICAgaWYgKG9wdGlvbnMpXHJcbiAgICAgIHRyaWdnZXIgPSBfLnJlamVjdCh0cmlnZ2VyLCBvID0+IHtcclxuICAgICAgICByZXR1cm4gbyA9PT0gZmllbGROYW1lIHx8IF8uY29udGFpbnMob3B0aW9ucy52YWxpZGF0aW5nRmllbGRzLCBvKTtcclxuICAgICAgfSlcclxuXHJcbiAgICBpZiAoIWxlbih0cmlnZ2VyKSlcclxuICAgICAgcmV0dXJuIHRoaXM7XHJcblxyXG4gICAgdmFyIHNlbGYgPSB0aGlzLCBcclxuICAgICAgICBkYXRhZW50cnlPcHRpb25zID0gc2VsZi5vcHRpb25zLFxyXG4gICAgICAgIHRyaWdnZXJzRGVsYXkgPSBkYXRhZW50cnlPcHRpb25zLnRyaWdnZXJzRGVsYXk7XHJcbiAgICAvLyBhdm9pZCByZWN1cnNpdmUgY2FsbHNcclxuICAgIGlmIChvcHRpb25zICYmIG9wdGlvbnMuZGVwdGggPiAwKSB7XHJcbiAgICAgIHJldHVybiBzZWxmO1xyXG4gICAgfVxyXG4gICAgdmFyIGRlcHRoID0gMTtcclxuXHJcbiAgICBpZiAoXy5pc051bWJlcih0cmlnZ2Vyc0RlbGF5KSkge1xyXG4gICAgICBzZXRUaW1lb3V0KCgpID0+IHtcclxuICAgICAgICBzZWxmLnZhbGlkYXRlKHRyaWdnZXIsIHtcclxuICAgICAgICAgIGRlcHRoOiBkZXB0aFxyXG4gICAgICAgIH0pO1xyXG4gICAgICB9LCB0cmlnZ2Vyc0RlbGF5KVxyXG4gICAgfSBlbHNlIHtcclxuICAgICAgc2VsZi52YWxpZGF0ZSh0cmlnZ2VyLCB7XHJcbiAgICAgICAgZGVwdGg6IGRlcHRoXHJcbiAgICAgIH0pO1xyXG4gICAgfVxyXG4gICAgcmV0dXJuIHNlbGY7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBHZXRzIGFuIGFycmF5IG9mIHZhbGlkYXRpb25zIHRvIGFwcGx5IG9uIGEgZmllbGQuXHJcbiAgICogaXQgc3VwcG9ydHMgdGhlIHVzZSBvZiBhcnJheXMgb3IgZnVuY3Rpb25zLCB3aGljaCByZXR1cm4gYXJyYXlzLlxyXG4gICAqIFxyXG4gICAqIEBwYXJhbSBzY2hlbWFcclxuICAgKiBAcmV0dXJucyB7QXJyYXl9XHJcbiAgICovXHJcbiAgZ2V0RmllbGRWYWxpZGF0aW9uRGVmaW5pdGlvbihzY2hlbWEpIHtcclxuICAgIHJldHVybiBpc0Z1bmN0aW9uKHNjaGVtYSkgPyBzY2hlbWEuY2FsbCh0aGlzLmNvbnRleHQgfHwgdGhpcykgOiBzY2hlbWE7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBHZXQgdGhlIHZhbHVlIG9mIHRoZSBnaXZlbiBmaWVsZC4gUHJveHkgZnVuY3Rpb24gdG8gaGFydmVzdGVyIGdldFZhbHVlIGZ1bmN0aW9uLlxyXG4gICAqIFxyXG4gICAqIEBwYXJhbSB7c3RyaW5nfSBmaWVsZCBcclxuICAgKi9cclxuICBnZXRGaWVsZFZhbHVlKGZpZWxkKSB7XHJcbiAgICByZXR1cm4gdGhpcy5oYXJ2ZXN0ZXIuZ2V0VmFsdWUoZmllbGQpO1xyXG4gIH1cclxufVxyXG5cclxuRGF0YUVudHJ5LlZhbGlkYXRvciA9IFZhbGlkYXRvcjtcclxuRGF0YUVudHJ5LkZvcm1hdHRlciA9IEZvcm1hdHRlcjtcclxuRGF0YUVudHJ5LmRlZmF1bHRzID0gREVGQVVMVFM7XHJcbkRhdGFFbnRyeS5iYXNlUHJvcGVydGllcyA9IFtcImVsZW1lbnRcIiwgXCJzY2hlbWFcIiwgXCJjb250ZXh0XCJdO1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgRGF0YUVudHJ5IiwiLyoqXHJcbiAqIERlY29yYXRvciBjbGFzcyBlZGl0aW5nIGNvbnRleHQgb2JqZWN0cy5cclxuICogaHR0cHM6Ly9naXRodWIuY29tL1JvYmVydG9QcmV2YXRvL0RhdGFFbnRyeVxyXG4gKlxyXG4gKiBDb3B5cmlnaHQgMjAxOSwgUm9iZXJ0byBQcmV2YXRvXHJcbiAqIGh0dHBzOi8vcm9iZXJ0b3ByZXZhdG8uZ2l0aHViLmlvXHJcbiAqXHJcbiAqIExpY2Vuc2VkIHVuZGVyIHRoZSBNSVQgbGljZW5zZTpcclxuICogaHR0cDovL3d3dy5vcGVuc291cmNlLm9yZy9saWNlbnNlcy9NSVRcclxuICovXHJcbmltcG9ydCBfIGZyb20gXCIuLi8uLi8uLi9zY3JpcHRzL3V0aWxzXCJcclxuaW1wb3J0IHsgcmFpc2UgfSBmcm9tIFwiLi4vLi4vLi4vc2NyaXB0cy9yYWlzZVwiXHJcblxyXG5cclxuZnVuY3Rpb24gc2V0SW5PYmplY3Qob2JqLCBuYW1lLCB2YWx1ZSkge1xyXG4gIGlmIChfLmlzRnVuY3Rpb24ob2JqW25hbWVdKSkge1xyXG4gICAgLy8gc2V0dGVyIHN0eWxlIChlLmcuIEtub2Nrb3V0KVxyXG4gICAgb2JqW25hbWVdKHZhbHVlKTtcclxuICB9IGVsc2Uge1xyXG4gICAgLy8gc2ltcGx5IHNldFxyXG4gICAgb2JqW25hbWVdID0gdmFsdWU7XHJcbiAgfVxyXG59XHJcblxyXG5cclxuY2xhc3MgQ29udGV4dERlY29yYXRvciB7XHJcblxyXG4gIC8qKlxyXG4gICAqIENyZWF0ZXMgYSBuZXcgaW5zdGFuY2Ugb2YgQ29udGV4dERlY29yYXRvciBhc3NvY2lhdGVkIHdpdGggdGhlIGdpdmVuIGRhdGFlbnRyeS5cclxuICAgKlxyXG4gICAqIEBwYXJhbSBkYXRhZW50cnk6IGluc3RhbmNlIG9mIERhdGFFbnRyeS5cclxuICAgKi9cclxuICBjb25zdHJ1Y3RvcihkYXRhZW50cnkpIHtcclxuICAgIGlmICghZGF0YWVudHJ5KVxyXG4gICAgICByYWlzZSgxNywgXCJtaXNzaW5nIGNvbnRleHQgZm9yIENvbnRleHREZWNvcmF0b3IgKGNvbnN0cnVjdG9yIHBhcmFtZXRlcilcIilcclxuICAgIFxyXG4gICAgdmFyIG9wdGlvbnMgPSBkYXRhZW50cnkub3B0aW9ucyB8fCB7fTtcclxuICAgIHZhciBvYmogPSBvcHRpb25zLnZhbGlkYXRpb25UYXJnZXQ7XHJcbiAgICBpZiAoIW9iaikge1xyXG4gICAgICAvLyBkZWZhdWx0IHRvIGEgbmV3IG9iamVjdFxyXG4gICAgICBvYmogPSB7fTtcclxuICAgIH1cclxuICAgIGRlbGV0ZSBvcHRpb25zLnZhbGlkYXRpb25UYXJnZXQ7XHJcbiAgICBkYXRhZW50cnkudmFsaWRhdGlvblRhcmdldCA9IG9iajtcclxuXHJcbiAgICBpZiAob2JqID09PSBkYXRhZW50cnkuY29udGV4dClcclxuICAgICAgcmFpc2UoMjEsIFwiaW52YWxpZCBjb250ZXh0IGZvciBDb250ZXh0RGVjb3JhdG9yOiBjYW5ub3QgYmUgdGhlIHNhbWUgYXMgZGF0YWVudHJ5IGNvbnRleHRcIilcclxuXHJcbiAgICB0aGlzLnRhcmdldCA9IG9iajtcclxuICB9XHJcblxyXG4gIG1hcmtGaWVsZE5ldXRydW0obmFtZSkge1xyXG4gICAgc2V0SW5PYmplY3QodGhpcy50YXJnZXQsIG5hbWUsIHVuZGVmaW5lZCk7XHJcbiAgfVxyXG5cclxuICBtYXJrRmllbGRJbnZhbGlkKG5hbWUsIGVycm9yKSB7XHJcbiAgICBzZXRJbk9iamVjdCh0aGlzLnRhcmdldCwgbmFtZSwgeyB2YWxpZDogZmFsc2UsIGVycm9yOiBlcnJvciB9KTtcclxuICB9XHJcblxyXG4gIG1hcmtGaWVsZFZhbGlkKG5hbWUpIHtcclxuICAgIHNldEluT2JqZWN0KHRoaXMudGFyZ2V0LCBuYW1lLCB7IHZhbGlkOiB0cnVlIH0pO1xyXG4gIH1cclxuXHJcbiAgbWFya0ZpZWxkSW5mbyhuYW1lLCBtZXNzYWdlKSB7XHJcbiAgICBzZXRJbk9iamVjdCh0aGlzLnRhcmdldCwgbmFtZSwgeyB2YWxpZDogdHJ1ZSwgaW5mbzogbWVzc2FnZSB9KTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIERpc3Bvc2VzIG9mIHRoaXMgZGVjb3JhdG9yLlxyXG4gICAqL1xyXG4gIGRpc3Bvc2UoKSB7XHJcbiAgICB0aGlzLnRhcmdldCA9IG51bGw7XHJcbiAgICByZXR1cm4gdGhpcztcclxuICB9XHJcbn1cclxuXHJcbmV4cG9ydCBkZWZhdWx0IENvbnRleHREZWNvcmF0b3IiLCIvKipcclxuICogRGF0YUVudHJ5IGZvcm1hdHRlciBjbGFzcy5cclxuICogaHR0cHM6Ly9naXRodWIuY29tL1JvYmVydG9QcmV2YXRvL0RhdGFFbnRyeVxyXG4gKlxyXG4gKiBDb3B5cmlnaHQgMjAxOSwgUm9iZXJ0byBQcmV2YXRvXHJcbiAqIGh0dHBzOi8vcm9iZXJ0b3ByZXZhdG8uZ2l0aHViLmlvXHJcbiAqXHJcbiAqIExpY2Vuc2VkIHVuZGVyIHRoZSBNSVQgbGljZW5zZTpcclxuICogaHR0cDovL3d3dy5vcGVuc291cmNlLm9yZy9saWNlbnNlcy9NSVRcclxuICovXHJcbmltcG9ydCBfIGZyb20gXCIuLi8uLi8uLi9zY3JpcHRzL3V0aWxzXCJcclxuaW1wb3J0IHsgcmFpc2UgfSBmcm9tIFwiLi4vLi4vLi4vc2NyaXB0cy9yYWlzZVwiXHJcbmltcG9ydCB7IEZvcm1hdHRpbmdSdWxlcyB9IGZyb20gXCIuL3J1bGVzXCJcclxuXHJcblxyXG5jb25zdCBsZW4gPSBfLmxlbjtcclxuY29uc3QgbWFwID0gXy5tYXA7XHJcbmNvbnN0IHRvQXJyYXkgPSBfLnRvQXJyYXk7XHJcbmNvbnN0IHdyYXAgPSBfLndyYXA7XHJcbmNvbnN0IGVhY2ggPSBfLmVhY2g7XHJcbmNvbnN0IGlzU3RyaW5nID0gXy5pc1N0cmluZztcclxuY29uc3QgaXNGdW5jdGlvbiA9IF8uaXNGdW5jdGlvbjtcclxuY29uc3QgaXNQbGFpbk9iamVjdCA9IF8uaXNQbGFpbk9iamVjdDtcclxuY29uc3QgZXh0ZW5kID0gXy5leHRlbmQ7XHJcblxyXG5cclxuZnVuY3Rpb24gbm9ybWFsaXplUnVsZShhLCBlcnJvcikge1xyXG4gIGlmIChpc1N0cmluZyhhKSlcclxuICAgIHJldHVybiB7IG5hbWU6IGEgfTtcclxuICBpZiAoaXNQbGFpbk9iamVjdChhKSkge1xyXG4gICAgdmFyIG5hbWUgPSBhLm5hbWU7XHJcbiAgICBpZiAoIW5hbWUpIHJhaXNlKGVycm9yKTtcclxuICAgIHJldHVybiBhO1xyXG4gIH1cclxuICByYWlzZSgxNCwgbmFtZSk7XHJcbn1cclxuXHJcblxyXG5jbGFzcyBGb3JtYXR0ZXIge1xyXG5cclxuICAvKipcclxuICAgKiBDcmVhdGVzIGEgbmV3IGluc3RhbmNlIG9mIFZhbGlkYXRvciBhc3NvY2lhdGVkIHdpdGggdGhlIGdpdmVuIGRhdGFlbnRyeS5cclxuICAgKlxyXG4gICAqIEBwYXJhbSBkYXRhZW50cnk6IGluc3RhbmNlIG9mIERhdGFFbnRyeS5cclxuICAgKi9cclxuICBjb25zdHJ1Y3RvcihkYXRhZW50cnkpIHtcclxuICAgIHZhciBydWxlcyA9IF8uY2xvbmUoRm9ybWF0dGVyLlJ1bGVzKSwgXHJcbiAgICAgIHNlbGYgPSB0aGlzLFxyXG4gICAgICBvcHRpb25zID0gZGF0YWVudHJ5ID8gZGF0YWVudHJ5Lm9wdGlvbnMgOiBudWxsO1xyXG4gICAgaWYgKG9wdGlvbnMgJiYgb3B0aW9ucy5mb3JtYXRSdWxlcykge1xyXG4gICAgICBleHRlbmQocnVsZXMsIG9wdGlvbnMuZm9ybWF0UnVsZXMpO1xyXG4gICAgfVxyXG4gICAgc2VsZi5ydWxlcyA9IHJ1bGVzXHJcbiAgICByZXR1cm4gc2VsZjtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIERpc3Bvc2VzIG9mIHRoaXMgZm9ybWF0dGVyLlxyXG4gICAqL1xyXG4gIGRpc3Bvc2UoKSB7XHJcbiAgICBkZWxldGUgdGhpcy5ydWxlcztcclxuICAgIGRlbGV0ZSB0aGlzLmRhdGFlbnRyeTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEFwcGxpZXMgZm9ybWF0dGluZyBydWxlcyBvbiB0aGUgZ2l2ZW4gZmllbGQuXHJcbiAgICogXHJcbiAgICogQHBhcmFtIHJ1bGVzXHJcbiAgICogQHBhcmFtIGZpZWxkXHJcbiAgICogQHBhcmFtIHZhbHVlXHJcbiAgICogQHJldHVybnMge0Zvcm1hdHRlcn1cclxuICAgKi9cclxuICBmb3JtYXQocnVsZXMsIGZpZWxkLCB2YWx1ZSwgcGFyYW1zKSB7XHJcbiAgICB2YXIgc2VsZiA9IHRoaXM7XHJcbiAgICBpZiAoaXNTdHJpbmcocnVsZXMpKSB7XHJcbiAgICAgIHZhciBuYW1lID0gcnVsZXMsIHJ1bGUgPSBzZWxmLnJ1bGVzW25hbWVdO1xyXG4gICAgICBpZiAocnVsZSlcclxuICAgICAgICByZXR1cm4gKHJ1bGUuZm4gfHwgcnVsZSkuY2FsbChzZWxmLCBmaWVsZCwgdmFsdWUsIHBhcmFtcyk7XHJcbiAgICAgIFxyXG4gICAgICByYWlzZSg0LCBuYW1lKTtcclxuICAgIH1cclxuICAgIGZvciAodmFyIGkgPSAwLCBsID0gbGVuKHJ1bGVzKTsgaSA8IGw7IGkrKykge1xyXG4gICAgICB2YXIgYSA9IG5vcm1hbGl6ZVJ1bGUocnVsZXNbaV0sIDE2KTtcclxuICAgICAgdmFyIHJ1bGVEZWZpbml0aW9uID0gc2VsZi5ydWxlc1thLm5hbWVdO1xyXG5cclxuICAgICAgaWYgKCFydWxlRGVmaW5pdGlvbilcclxuICAgICAgICByYWlzZSg0LCBuYW1lKTtcclxuXHJcbiAgICAgIC8vIGNhbGwgd2l0aCB0aGUgd2hvbGUgb2JqZWN0IHVzZWQgdG8gY29uZmlndXJlIHRoZSBmb3JtYXR0aW5nXHJcbiAgICAgIHZhbHVlID0gKHJ1bGVEZWZpbml0aW9uLmZuIHx8IHJ1bGVEZWZpbml0aW9uKS5jYWxsKHNlbGYsIGZpZWxkLCB2YWx1ZSwgXy5vbWl0KGEsIFwibmFtZVwiKSk7XHJcbiAgICB9XHJcbiAgICByZXR1cm4gdmFsdWU7XHJcbiAgfVxyXG59XHJcblxyXG5Gb3JtYXR0ZXIuUnVsZXMgPSBGb3JtYXR0aW5nUnVsZXNcclxuXHJcbmV4cG9ydCBkZWZhdWx0IEZvcm1hdHRlciIsIi8qKlxyXG4gKiBEYXRhRW50cnkgYnVpbHQtaW4gZm9ybWF0dGluZyBydWxlcy5cclxuICogaHR0cHM6Ly9naXRodWIuY29tL1JvYmVydG9QcmV2YXRvL0RhdGFFbnRyeVxyXG4gKlxyXG4gKiBDb3B5cmlnaHQgMjAxOSwgUm9iZXJ0byBQcmV2YXRvXHJcbiAqIGh0dHBzOi8vcm9iZXJ0b3ByZXZhdG8uZ2l0aHViLmlvXHJcbiAqXHJcbiAqIExpY2Vuc2VkIHVuZGVyIHRoZSBNSVQgbGljZW5zZTpcclxuICogaHR0cDovL3d3dy5vcGVuc291cmNlLm9yZy9saWNlbnNlcy9NSVRcclxuICovXHJcbmltcG9ydCBfIGZyb20gXCIuLi8uLi91dGlsc1wiXHJcblxyXG5cclxuY29uc3QgRm9ybWF0dGluZ1J1bGVzID0ge1xyXG4gIHRyaW06IGZ1bmN0aW9uIChmaWVsZCwgdmFsdWUpIHtcclxuICAgIHJldHVybiB2YWx1ZSA/IHZhbHVlLnJlcGxhY2UoL15bXFxzXSt8W1xcc10rJC9nLCBcIlwiKSA6IHZhbHVlO1xyXG4gIH0sXHJcblxyXG4gIHJlbW92ZVNwYWNlczogZnVuY3Rpb24gKGZpZWxkLCB2YWx1ZSkge1xyXG4gICAgcmV0dXJuIHZhbHVlID8gdmFsdWUucmVwbGFjZShyeCwgXCJcIikgOiB2YWx1ZTtcclxuICB9LFxyXG5cclxuICByZW1vdmVNdWx0aXBsZVNwYWNlczogZnVuY3Rpb24gKGZpZWxkLCB2YWx1ZSkge1xyXG4gICAgcmV0dXJuIHZhbHVlID8gdmFsdWUucmVwbGFjZSgvXFxzezIsfS9nLCBcIiBcIikgOiB2YWx1ZTtcclxuICB9LFxyXG5cclxuICBjbGVhblNwYWNlczogZnVuY3Rpb24gKGZpZWxkLCB2YWx1ZSkge1xyXG4gICAgaWYgKCF2YWx1ZSkgcmV0dXJuIHZhbHVlO1xyXG4gICAgcmV0dXJuIHZhbHVlLnJlcGxhY2UoL15bXFxzXSt8W1xcc10rJC9nLCBcIlwiKS5yZXBsYWNlKC9cXHN7Mix9L2csIFwiIFwiKTtcclxuICB9LFxyXG5cclxuICBpbnRlZ2VyOiBmdW5jdGlvbiAoZmllbGQsIHZhbHVlKSB7XHJcbiAgICBpZiAoIXZhbHVlKSByZXR1cm47XHJcbiAgICAvL3JlbW92ZSBsZWFkaW5nIHplcm9zXHJcbiAgICByZXR1cm4gdmFsdWUgPyB2YWx1ZS5yZXBsYWNlKC9eMCsvLCBcIlwiKSA6IHZhbHVlO1xyXG4gIH0sXHJcblxyXG4gIFwiemVyby1maWxsXCI6IGZ1bmN0aW9uIChmaWVsZCwgdmFsdWUsIG9wdGlvbnMpIHtcclxuICAgIGlmICghdmFsdWUpIHJldHVybiB2YWx1ZTtcclxuICAgIHZhciBsO1xyXG4gICAgaWYgKF8uaXNFbXB0eShvcHRpb25zKSkge1xyXG4gICAgICB2YXIgbWwgPSBmaWVsZC5nZXRBdHRyaWJ1dGUoXCJtYXhsZW5ndGhcIik7XHJcbiAgICAgIGlmICghbWwpIHRocm93IFwibWF4bGVuZ3RoIGlzIHJlcXVpcmVkIGZvciB0aGUgemVyby1maWxsIGZvcm1hdHRlclwiO1xyXG4gICAgICBsID0gcGFyc2VJbnQobWwpO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgaWYgKCEoXCJsZW5ndGhcIiBpbiBvcHRpb25zKSkge1xyXG4gICAgICAgIHRocm93IFwibWlzc2luZyBsZW5ndGggaW4gb3B0aW9uc1wiO1xyXG4gICAgICB9XHJcbiAgICAgIGwgPSBvcHRpb25zLmxlbmd0aDtcclxuICAgIH1cclxuICAgIHZhciBvcmlnaW5hbCA9IHZhbHVlO1xyXG4gICAgd2hpbGUgKHZhbHVlLmxlbmd0aCA8IGwpIHtcclxuICAgICAgdmFsdWUgPSBcIjBcIiArIHZhbHVlO1xyXG4gICAgfVxyXG4gICAgcmV0dXJuIHZhbHVlO1xyXG4gIH0sXHJcblxyXG4gIFwiemVyby11bmZpbGxcIjogZnVuY3Rpb24gKGZpZWxkLCB2YWx1ZSkge1xyXG4gICAgaWYgKCF2YWx1ZSkgcmV0dXJuIHZhbHVlO1xyXG4gICAgaWYgKC9eMCsvLnRlc3QodmFsdWUpKVxyXG4gICAgICB2YWx1ZSA9IHZhbHVlLnJlcGxhY2UoL14wKy8sIFwiXCIpO1xyXG4gICAgcmV0dXJuIHZhbHVlO1xyXG4gIH1cclxufTtcclxuXHJcbmV4cG9ydCB7IEZvcm1hdHRpbmdSdWxlcyB9IiwiLyoqXHJcbiAqIEhhcnZlc3RlciBjbGFzcyBvcGVyYXRpbmcgb24gY29udGV4dCBvYmplY3RzLlxyXG4gKiBodHRwczovL2dpdGh1Yi5jb20vUm9iZXJ0b1ByZXZhdG8vRGF0YUVudHJ5XHJcbiAqXHJcbiAqIENvcHlyaWdodCAyMDE5LCBSb2JlcnRvIFByZXZhdG9cclxuICogaHR0cHM6Ly9yb2JlcnRvcHJldmF0by5naXRodWIuaW9cclxuICpcclxuICogTGljZW5zZWQgdW5kZXIgdGhlIE1JVCBsaWNlbnNlOlxyXG4gKiBodHRwOi8vd3d3Lm9wZW5zb3VyY2Uub3JnL2xpY2Vuc2VzL01JVFxyXG4gKi9cclxuaW1wb3J0IF8gZnJvbSBcIi4uLy4uLy4uL3NjcmlwdHMvdXRpbHNcIlxyXG5pbXBvcnQgeyByYWlzZSB9IGZyb20gXCIuLi8uLi8uLi9zY3JpcHRzL3JhaXNlXCJcclxuXHJcblxyXG5mdW5jdGlvbiBnZXRGcm9tT2JqZWN0KG9iaiwgbmFtZSkge1xyXG4gIGlmIChfLmlzRnVuY3Rpb24ob2JqW25hbWVdKSkge1xyXG4gICAgLy8gZ2V0dGVyIHN0eWxlIChlLmcuIEtub2Nrb3V0KVxyXG4gICAgcmV0dXJuIG9ialtuYW1lXSgpO1xyXG4gIH1cclxuICAvLyBzaW1wbHkgZ2V0XHJcbiAgcmV0dXJuIG9ialtuYW1lXTtcclxufVxyXG5cclxuXHJcbmZ1bmN0aW9uIHNldEluT2JqZWN0KG9iaiwgbmFtZSwgdmFsdWUpIHtcclxuICBpZiAoXy5pc0Z1bmN0aW9uKG9ialtuYW1lXSkpIHtcclxuICAgIC8vIHNldHRlciBzdHlsZSAoZS5nLiBLbm9ja291dClcclxuICAgIG9ialtuYW1lXSh2YWx1ZSk7XHJcbiAgfSBlbHNlIHtcclxuICAgIC8vIHNpbXBseSBzZXRcclxuICAgIG9ialtuYW1lXSA9IHZhbHVlO1xyXG4gIH1cclxufVxyXG5cclxuXHJcbmNsYXNzIENvbnRleHRIYXJ2ZXN0ZXIge1xyXG5cclxuICAvKipcclxuICAgKiBDcmVhdGVzIGEgbmV3IGluc3RhbmNlIG9mIENvbnRleHRIYXJ2ZXN0ZXIgYXNzb2NpYXRlZCB3aXRoIHRoZSBnaXZlbiBkYXRhZW50cnkuXHJcbiAgICpcclxuICAgKiBAcGFyYW0gZGF0YWVudHJ5OiBpbnN0YW5jZSBvZiBEYXRhRW50cnkuXHJcbiAgICovXHJcbiAgY29uc3RydWN0b3IoZGF0YWVudHJ5KSB7XHJcbiAgICBpZiAoIWRhdGFlbnRyeSlcclxuICAgICAgcmFpc2UoMTcsIFwibWlzc2luZyBjb250ZXh0IGZvciBDb250ZXh0SGFydmVzdGVyIChjb25zdHJ1Y3RvciBwYXJhbWV0ZXIpXCIpXHJcbiAgICBcclxuICAgIHZhciBvcHRpb25zID0gZGF0YWVudHJ5Lm9wdGlvbnMgfHwge307XHJcbiAgICB2YXIgb2JqID0gb3B0aW9ucy5zb3VyY2VPYmplY3QgfHwgZGF0YWVudHJ5LmNvbnRleHQ7XHJcbiAgICBpZiAoIW9iailcclxuICAgICAgcmFpc2UoMTgsIFwibWlzc2luZyAnY29udGV4dCcgb3IgJ3NvdXJjZU9iamVjdCcgZm9yIENvbnRleHRIYXJ2ZXN0ZXJcIilcclxuXHJcbiAgICB0aGlzLmRhdGFlbnRyeSA9IGRhdGFlbnRyeTtcclxuICAgIHRoaXMuc291cmNlID0gb2JqO1xyXG4gIH1cclxuXHJcbiAgZGlzcG9zZSgpIHtcclxuICAgIHRoaXMuZGF0YWVudHJ5ID0gbnVsbDtcclxuICAgIHRoaXMuc291cmNlID0gbnVsbDtcclxuICAgIHJldHVybiB0aGlzO1xyXG4gIH1cclxuXHJcbiAgZ2V0VmFsdWVzKCkge1xyXG4gICAgdmFyIHNlbGYgPSB0aGlzLFxyXG4gICAgICBzY2hlbWEgPSBzZWxmLmRhdGFlbnRyeS5zY2hlbWEsXHJcbiAgICAgIGtleXMgPSBfLmtleXMoc2NoZW1hKSxcclxuICAgICAgdmFsdWVzID0ge307XHJcbiAgICBcclxuICAgIGZvciAobGV0IHggaW4gc2NoZW1hKSB7XHJcbiAgICAgIHZhbHVlc1t4XSA9IGdldEZyb21PYmplY3QodGhpcy5zb3VyY2UsIHgpO1xyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiB2YWx1ZXM7XHJcbiAgfVxyXG5cclxuICBzZXRWYWx1ZShuYW1lLCB2YWx1ZSkge1xyXG4gICAgc2V0SW5PYmplY3QodGhpcy5zb3VyY2UsIG5hbWUsIHZhbHVlKTtcclxuICB9XHJcblxyXG4gIGdldFZhbHVlKG5hbWUpIHtcclxuICAgIHJldHVybiBnZXRGcm9tT2JqZWN0KHRoaXMuc291cmNlLCBuYW1lKTtcclxuICB9XHJcbn1cclxuXHJcbmV4cG9ydCBkZWZhdWx0IENvbnRleHRIYXJ2ZXN0ZXIiLCIvKipcclxuICogRGF0YUVudHJ5IGJhc2UgdmFsaWRhdGlvbiBydWxlcy5cclxuICogaHR0cHM6Ly9naXRodWIuY29tL1JvYmVydG9QcmV2YXRvL0RhdGFFbnRyeVxyXG4gKlxyXG4gKiBDb3B5cmlnaHQgMjAxOSwgUm9iZXJ0byBQcmV2YXRvXHJcbiAqIGh0dHBzOi8vcm9iZXJ0b3ByZXZhdG8uZ2l0aHViLmlvXHJcbiAqXHJcbiAqIExpY2Vuc2VkIHVuZGVyIHRoZSBNSVQgbGljZW5zZTpcclxuICogaHR0cDovL3d3dy5vcGVuc291cmNlLm9yZy9saWNlbnNlcy9NSVRcclxuICovXHJcbmltcG9ydCBfIGZyb20gXCIuLi8uLi91dGlsc1wiXHJcblxyXG5jb25zdCBsZW4gPSBfLmxlbjtcclxuY29uc3QgaXNQbGFpbk9iamVjdCA9IF8uaXNQbGFpbk9iamVjdDtcclxuY29uc3QgaXNTdHJpbmcgPSBfLmlzU3RyaW5nO1xyXG5jb25zdCBpc051bWJlciA9IF8uaXNOdW1iZXI7XHJcbmNvbnN0IGlzQXJyYXkgPSBfLmlzQXJyYXk7XHJcbmNvbnN0IGlzRW1wdHkgPSBfLmlzRW1wdHk7XHJcblxyXG5cclxuZnVuY3Rpb24gZ2V0RXJyb3IobWVzc2FnZSwgYXJncykge1xyXG4gIHJldHVybiB7XHJcbiAgICBlcnJvcjogdHJ1ZSxcclxuICAgIG1lc3NhZ2U6IG1lc3NhZ2UsXHJcbiAgICBmaWVsZDogYXJnc1swXSxcclxuICAgIHZhbHVlOiBhcmdzWzFdLFxyXG4gICAgcGFyYW1zOiBfLnRvQXJyYXkoYXJncykuc3BsaWNlKDIpXHJcbiAgfTtcclxufVxyXG5cclxuXHJcbmNvbnN0IFZhbGlkYXRpb25SdWxlcyA9IHtcclxuXHJcbiAgbm9uZTogZnVuY3Rpb24gKCkge1xyXG4gICAgcmV0dXJuIHRydWU7XHJcbiAgfSxcclxuXHJcbiAgbm90OiBmdW5jdGlvbiAoZmllbGQsIHZhbHVlLCBmb3JjZWQsIHBhcmFtcykge1xyXG4gICAgdmFyIGV4Y2x1ZGUgPSBwYXJhbXM7XHJcbiAgICBpZiAoXy5pc0FycmF5KGV4Y2x1ZGUpKSB7XHJcbiAgICAgIGlmIChfLmFueShleGNsdWRlLCB4ID0+IHggPT09IHZhbHVlKSkge1xyXG4gICAgICAgIHJldHVybiBnZXRFcnJvcihcImNhbm5vdEJlXCIsIGFyZ3VtZW50cyk7XHJcbiAgICAgIH1cclxuICAgIH1cclxuICAgIGlmICh2YWx1ZSA9PT0gcGFyYW1zKSB7XHJcbiAgICAgIHJldHVybiBnZXRFcnJvcihcImNhbm5vdEJlXCIsIGFyZ3VtZW50cyk7XHJcbiAgICB9XHJcbiAgICByZXR1cm4gdHJ1ZTtcclxuICB9LFxyXG5cclxuICBub1NwYWNlczogZnVuY3Rpb24gKGZpZWxkLCB2YWx1ZSwgZm9yY2VkKSB7XHJcbiAgICBpZiAoIXZhbHVlKSByZXR1cm4gdHJ1ZTtcclxuICAgIGlmICh2YWx1ZS5tYXRjaCgvXFxzLykpIFxyXG4gICAgICByZXR1cm4gZ2V0RXJyb3IoXCJzcGFjZXNJblZhbHVlXCIsIGFyZ3VtZW50cyk7XHJcbiAgICByZXR1cm4gdHJ1ZTtcclxuICB9LFxyXG5cclxuICByZW1vdGU6IHtcclxuICAgIGRlZmVycmVkOiB0cnVlLFxyXG4gICAgZm46IGZ1bmN0aW9uIChmaWVsZCwgdmFsdWUsIGZvcmNlZCwgcHJvbWlzZVByb3ZpZGVyKSB7XHJcbiAgICAgIGlmICghcHJvbWlzZVByb3ZpZGVyKVxyXG4gICAgICAgIHJhaXNlKDcpO1xyXG4gICAgICByZXR1cm4gcHJvbWlzZVByb3ZpZGVyLmFwcGx5KGZpZWxkLCBhcmd1bWVudHMpO1xyXG4gICAgfVxyXG4gIH0sXHJcblxyXG4gIHJlcXVpcmVkOiBmdW5jdGlvbiAoZmllbGQsIHZhbHVlLCBmb3JjZWQsIHBhcmFtcykge1xyXG4gICAgaWYgKGlzU3RyaW5nKHBhcmFtcykpXHJcbiAgICAgIHBhcmFtcyA9IHsgbWVzc2FnZTogcGFyYW1zIH07XHJcbiAgICBcclxuICAgIGlmICghdmFsdWUgfHwgKGlzQXJyYXkodmFsdWUpICYmIGlzRW1wdHkodmFsdWUpKSB8fCAhIXZhbHVlLnRvU3RyaW5nKCkubWF0Y2goL15cXHMrJC8pKVxyXG4gICAgICByZXR1cm4gZ2V0RXJyb3IoXCJyZXF1aXJlZFwiLCBhcmd1bWVudHMpO1xyXG4gICAgcmV0dXJuIHRydWU7XHJcbiAgfSxcclxuXHJcbiAgaW50ZWdlcjogZnVuY3Rpb24gKGZpZWxkLCB2YWx1ZSwgZm9yY2VkLCBvcHRpb25zKSB7XHJcbiAgICBpZiAoIXZhbHVlKSByZXR1cm4gdHJ1ZTtcclxuICAgIGlmICghL15cXGQrJC8udGVzdCh2YWx1ZSkpXHJcbiAgICAgIHJldHVybiBnZXRFcnJvcihcIm5vdEludGVnZXJcIiwgYXJndW1lbnRzKTtcclxuICAgIGlmIChvcHRpb25zKSB7XHJcbiAgICAgIHZhciBpbnRWYWwgPSBwYXJzZUludCh2YWx1ZSk7XHJcbiAgICAgIGlmIChpc051bWJlcihvcHRpb25zLm1pbikgJiYgaW50VmFsIDwgb3B0aW9ucy5taW4pXHJcbiAgICAgICAgcmV0dXJuIGdldEVycm9yKFwibWluVmFsdWVcIiwgYXJndW1lbnRzKTtcclxuICAgICAgaWYgKGlzTnVtYmVyKG9wdGlvbnMubWF4KSAmJiBpbnRWYWwgPiBvcHRpb25zLm1heClcclxuICAgICAgICByZXR1cm4gZ2V0RXJyb3IoXCJtYXhWYWx1ZVwiLCBhcmd1bWVudHMpO1xyXG4gICAgfVxyXG4gICAgcmV0dXJuIHRydWU7XHJcbiAgfSxcclxuXHJcbiAgZXF1YWw6IGZ1bmN0aW9uIChmaWVsZCwgdmFsdWUsIGZvcmNlZCwgZXhwZWN0ZWRWYWx1ZSkge1xyXG4gICAgaWYgKHZhbHVlICE9PSBleHBlY3RlZFZhbHVlKSB7XHJcbiAgICAgIHJldHVybiBnZXRFcnJvcihcImV4cGVjdGVkVmFsdWVcIiwgYXJndW1lbnRzKTtcclxuICAgIH1cclxuICAgIHJldHVybiB0cnVlO1xyXG4gIH0sXHJcblxyXG4gIGxldHRlcnM6IGZ1bmN0aW9uIChmaWVsZCwgdmFsdWUsIGZvcmNlZCkge1xyXG4gICAgaWYgKCF2YWx1ZSkgcmV0dXJuIHRydWU7XHJcbiAgICBpZiAoIS9eW2EtekEtWl0rJC8udGVzdCh2YWx1ZSkpXHJcbiAgICAgIHJldHVybiBnZXRFcnJvcihcImNhbkNvbnRhaW5Pbmx5TGV0dGVyc1wiLCBhcmd1bWVudHMpO1xyXG4gICAgcmV0dXJuIHRydWU7XHJcbiAgfSxcclxuXHJcbiAgZGlnaXRzOiBmdW5jdGlvbiAoZmllbGQsIHZhbHVlLCBmb3JjZWQpIHtcclxuICAgIGlmICghdmFsdWUpIHJldHVybiB0cnVlO1xyXG4gICAgaWYgKCEvXlxcZCskLy50ZXN0KHZhbHVlKSlcclxuICAgICAgcmV0dXJuIGdldEVycm9yKFwiY2FuQ29udGFpbk9ubHlEaWdpdHNcIiwgYXJndW1lbnRzKTtcclxuICAgIHJldHVybiB0cnVlO1xyXG4gIH0sXHJcblxyXG4gIG1heExlbmd0aDogZnVuY3Rpb24gKGZpZWxkLCB2YWx1ZSwgZm9yY2VkLCBsaW1pdCkge1xyXG4gICAgaWYgKCF2YWx1ZSkgcmV0dXJuIHRydWU7XHJcblxyXG4gICAgaWYgKGlzUGxhaW5PYmplY3QobGltaXQpKSB7XHJcbiAgICAgIGxpbWl0ID0gbGltaXQubGVuZ3RoO1xyXG4gICAgfVxyXG4gICAgaWYgKCFpc051bWJlcihsaW1pdCkpXHJcbiAgICAgIHRocm93IFwibWF4TGVuZ3RoIHJ1bGUgcmVxdWlyZXMgYSBudW1lcmljIGxpbWl0ICh1c2UgbGVuZ3RoIG9wdGlvbiwgb3IgcGFyYW1zOiBbbnVtXVwiO1xyXG5cclxuICAgIGlmIChsZW4odmFsdWUpID4gbGltaXQpXHJcbiAgICAgIHJldHVybiBnZXRFcnJvcihcIm1heExlbmd0aFwiLCBhcmd1bWVudHMpO1xyXG4gICAgcmV0dXJuIHRydWU7XHJcbiAgfSxcclxuXHJcbiAgbWluTGVuZ3RoOiBmdW5jdGlvbiAoZmllbGQsIHZhbHVlLCBmb3JjZWQsIGxpbWl0KSB7XHJcbiAgICBpZiAoIXZhbHVlKSByZXR1cm4gZmFsc2U7XHJcblxyXG4gICAgaWYgKGlzUGxhaW5PYmplY3QobGltaXQpKSB7XHJcbiAgICAgIGxpbWl0ID0gbGltaXQubGVuZ3RoO1xyXG4gICAgfVxyXG4gICAgaWYgKCFpc051bWJlcihsaW1pdCkpXHJcbiAgICAgIHRocm93IFwibWluTGVuZ3RoIHJ1bGUgcmVxdWlyZXMgYSBudW1lcmljIGxpbWl0ICh1c2UgbGVuZ3RoIG9wdGlvbiwgb3IgcGFyYW1zOiBbbnVtXVwiO1xyXG4gICAgXHJcbiAgICBpZiAobGVuKHZhbHVlKSA8IGxpbWl0KVxyXG4gICAgICByZXR1cm4gZ2V0RXJyb3IoXCJtaW5MZW5ndGhcIiwgYXJndW1lbnRzKTtcclxuICAgIHJldHVybiB0cnVlO1xyXG4gIH0sXHJcblxyXG4gIG11c3RDaGVjazogZnVuY3Rpb24gKGZpZWxkLCB2YWx1ZSwgZm9yY2VkLCBsaW1pdCkge1xyXG4gICAgaWYgKCFmaWVsZC5jaGVja2VkKVxyXG4gICAgICByZXR1cm4gZ2V0RXJyb3IoXCJtdXN0QmVDaGVja2VkXCIsIGFyZ3VtZW50cyk7XHJcbiAgICByZXR1cm4gdHJ1ZTtcclxuICB9XHJcbn07XHJcblxyXG5leHBvcnQgeyBWYWxpZGF0aW9uUnVsZXMsIGdldEVycm9yIH0iLCIvKipcclxuICogRGF0YUVudHJ5IHZhbGlkYXRvciBjbGFzcy5cclxuICogaHR0cHM6Ly9naXRodWIuY29tL1JvYmVydG9QcmV2YXRvL0RhdGFFbnRyeVxyXG4gKlxyXG4gKiBDb3B5cmlnaHQgMjAxOSwgUm9iZXJ0byBQcmV2YXRvXHJcbiAqIGh0dHBzOi8vcm9iZXJ0b3ByZXZhdG8uZ2l0aHViLmlvXHJcbiAqXHJcbiAqIExpY2Vuc2VkIHVuZGVyIHRoZSBNSVQgbGljZW5zZTpcclxuICogaHR0cDovL3d3dy5vcGVuc291cmNlLm9yZy9saWNlbnNlcy9NSVRcclxuICovXHJcblxyXG5pbXBvcnQgXyBmcm9tIFwiLi4vLi4vLi4vc2NyaXB0cy91dGlsc1wiXHJcbmltcG9ydCB7IHJhaXNlIH0gZnJvbSBcIi4uLy4uLy4uL3NjcmlwdHMvcmFpc2VcIlxyXG5pbXBvcnQgeyBWYWxpZGF0aW9uUnVsZXMsIGdldEVycm9yIH0gZnJvbSBcIi4vcnVsZXNcIlxyXG5cclxuXHJcbmNvbnN0IGxlbiA9IF8ubGVuO1xyXG5jb25zdCBtYXAgPSBfLm1hcDtcclxuY29uc3QgdG9BcnJheSA9IF8udG9BcnJheTtcclxuY29uc3Qgd3JhcCA9IF8ud3JhcDtcclxuY29uc3QgZWFjaCA9IF8uZWFjaDtcclxuY29uc3QgaXNTdHJpbmcgPSBfLmlzU3RyaW5nO1xyXG5jb25zdCBpc0Z1bmN0aW9uID0gXy5pc0Z1bmN0aW9uO1xyXG5jb25zdCBpc1BsYWluT2JqZWN0ID0gXy5pc1BsYWluT2JqZWN0O1xyXG5jb25zdCBleHRlbmQgPSBfLmV4dGVuZDtcclxuY29uc3QgZmFpbGVkVmFsaWRhdGlvbkVycm9yS2V5ID0gXCJmYWlsZWRWYWxpZGF0aW9uXCI7XHJcblxyXG5cclxuZnVuY3Rpb24gcnVsZVBhcmFtcyhhcmdzLCBjdXJyZW50RmllbGRSdWxlKSB7XHJcbiAgaWYgKCFjdXJyZW50RmllbGRSdWxlLnBhcmFtcykge1xyXG4gICAgdmFyIGV4dHJhUGFyYW1zID0gXy5vbWl0KGN1cnJlbnRGaWVsZFJ1bGUsIFtcImZuXCIsIFwibmFtZVwiXSk7XHJcbiAgICByZXR1cm4gYXJncy5jb25jYXQoW2V4dHJhUGFyYW1zXSk7XHJcbiAgfVxyXG4gIHJldHVybiBhcmdzLmNvbmNhdChjdXJyZW50RmllbGRSdWxlLnBhcmFtcyk7XHJcbn1cclxuXHJcblxyXG5jbGFzcyBWYWxpZGF0b3Ige1xyXG5cclxuICAvKipcclxuICAgKiBDcmVhdGVzIGEgbmV3IGluc3RhbmNlIG9mIFZhbGlkYXRvciBhc3NvY2lhdGVkIHdpdGggdGhlIGdpdmVuIGRhdGFlbnRyeS5cclxuICAgKlxyXG4gICAqIEBwYXJhbSBkYXRhZW50cnk6IGluc3RhbmNlIG9mIERhdGFFbnRyeS5cclxuICAgKi9cclxuICBjb25zdHJ1Y3RvcihkYXRhZW50cnkpIHtcclxuICAgIHZhciBydWxlcyA9IF8uY2xvbmUoVmFsaWRhdG9yLlJ1bGVzKSwgXHJcbiAgICAgIHNlbGYgPSB0aGlzLFxyXG4gICAgICBvcHRpb25zID0gZGF0YWVudHJ5ID8gZGF0YWVudHJ5Lm9wdGlvbnMgOiBudWxsO1xyXG4gICAgaWYgKG9wdGlvbnMgJiYgb3B0aW9ucy5ydWxlcykge1xyXG4gICAgICBleHRlbmQocnVsZXMsIG9wdGlvbnMucnVsZXMpO1xyXG4gICAgfVxyXG4gICAgc2VsZi5nZXRFcnJvciA9IGdldEVycm9yO1xyXG4gICAgc2VsZi5ydWxlcyA9IHJ1bGVzXHJcbiAgICBzZWxmLmRhdGFlbnRyeSA9IGRhdGFlbnRyeSB8fCB7fTtcclxuICAgIHJldHVybiBzZWxmO1xyXG4gIH1cclxuXHJcbiAgZGlzcG9zZSgpIHtcclxuICAgIGRlbGV0ZSB0aGlzLnJ1bGVzO1xyXG4gICAgZGVsZXRlIHRoaXMuZGF0YWVudHJ5O1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogRW5zdXJlcyB0aGF0IGEgdmFsaWRhdGlvbiBydWxlIGlzIGRlZmluZWQgaW5zaWRlIHRoaXMgdmFsaWRhdG9yLlxyXG4gICAqIFxyXG4gICAqIEBwYXJhbSBuYW1lXHJcbiAgICovXHJcbiAgY2hlY2tSdWxlKG5hbWUpIHtcclxuICAgIGlmICghdGhpcy5ydWxlc1tuYW1lXSkge1xyXG4gICAgICByYWlzZSgzLCBcIm1pc3NpbmcgdmFsaWRhdGlvbiBydWxlOiBcIiArIG5hbWUpO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgbm9ybWFsaXplUnVsZSh2KSB7XHJcbiAgICBpZiAoaXNQbGFpbk9iamVjdCh2KSkge1xyXG4gICAgICByZXR1cm4gdjtcclxuICAgIH1cclxuXHJcbiAgICBpZiAoaXNGdW5jdGlvbih2KSkge1xyXG4gICAgICByZXR1cm4geyBmbjogdiB9O1xyXG4gICAgfVxyXG4gICAgcmFpc2UoMTQsIFwiaW52YWxpZCB2YWxpZGF0aW9uIHJ1bGUgZGVmaW5pdGlvblwiKVxyXG4gIH1cclxuXHJcbiAgZ2V0UnVsZShvKSB7XHJcbiAgICB2YXIgc2VsZiA9IHRoaXMsXHJcbiAgICAgIGRlZmF1bHRzID0ge30sXHJcbiAgICAgIHJ1bGVzID0gc2VsZi5ydWxlcztcclxuICAgIFxyXG4gICAgaWYgKGlzU3RyaW5nKG8pKSB7XHJcbiAgICAgIHNlbGYuY2hlY2tSdWxlKG8pO1xyXG4gICAgICByZXR1cm4gZXh0ZW5kKHsgbmFtZTogbyB9LCBkZWZhdWx0cywgc2VsZi5ub3JtYWxpemVSdWxlKHJ1bGVzW29dKSk7XHJcbiAgICB9XHJcblxyXG4gICAgaWYgKGlzUGxhaW5PYmplY3QobykpIHtcclxuICAgICAgaWYgKCFvLm5hbWUpXHJcbiAgICAgICAgcmFpc2UoNiwgXCJtaXNzaW5nIG5hbWUgaW4gdmFsaWRhdGlvbiBydWxlXCIpO1xyXG4gICAgICBzZWxmLmNoZWNrUnVsZShvLm5hbWUpO1xyXG4gICAgICByZXR1cm4gZXh0ZW5kKHt9LCBkZWZhdWx0cywgbywgc2VsZi5ub3JtYWxpemVSdWxlKHJ1bGVzW28ubmFtZV0pKTtcclxuICAgIH1cclxuXHJcbiAgICByYWlzZSgxNCwgXCJpbnZhbGlkIHZhbGlkYXRpb24gcnVsZVwiKTtcclxuICB9XHJcblxyXG4gIGdldFJ1bGVzKGEpIHtcclxuICAgIC8vZ2V0IHZhbGlkYXRvcnMgYnkgbmFtZSwgYWNjZXB0cyBhbiBhcnJheSBvZiBuYW1lc1xyXG4gICAgdmFyIHYgPSB7IGRpcmVjdDogW10sIGRlZmVycmVkOiBbXSB9LCB0ID0gdGhpcztcclxuICAgIGVhY2goYSwgZnVuY3Rpb24gKHZhbCkge1xyXG4gICAgICB2YXIgdmFsaWRhdG9yID0gdC5nZXRSdWxlKHZhbCk7XHJcbiAgICAgIGlmICh2YWxpZGF0b3IuZGVmZXJyZWQpIHtcclxuICAgICAgICB2LmRlZmVycmVkLnB1c2godmFsaWRhdG9yKTtcclxuICAgICAgfSBlbHNlIHtcclxuICAgICAgICB2LmRpcmVjdC5wdXNoKHZhbGlkYXRvcik7XHJcbiAgICAgIH1cclxuICAgIH0pO1xyXG4gICAgcmV0dXJuIHY7XHJcbiAgfVxyXG5cclxuICB2YWxpZGF0ZShydWxlcywgZmllbGQsIHZhbCwgZm9yY2VkKSB7XHJcbiAgICB2YXIgcXVldWUgPSB0aGlzLmdldFZhbGlkYXRpb25DaGFpbihydWxlcyk7XHJcbiAgICByZXR1cm4gdGhpcy5jaGFpbihxdWV1ZSwgZmllbGQsIHZhbCwgZm9yY2VkKTtcclxuICB9XHJcblxyXG4gIGdldFZhbGlkYXRpb25DaGFpbihhKSB7XHJcbiAgICB2YXIgdiA9IHRoaXMuZ2V0UnVsZXMoYSksIGNoYWluID0gW10sIHNlbGYgPSB0aGlzO1xyXG4gICAgLy9jbGllbnQgc2lkZSB2YWxpZGF0aW9uIGZpcnN0XHJcbiAgICBlYWNoKHYuZGlyZWN0LCBmdW5jdGlvbiAocikge1xyXG4gICAgICByLmZuID0gc2VsZi5tYWtlUnVsZURlZmVycmVkKHIuZm4pO1xyXG4gICAgICBjaGFpbi5wdXNoKHIpO1xyXG4gICAgfSk7XHJcbiAgICAvL2RlZmVycmVkcyBsYXRlclxyXG4gICAgZWFjaCh2LmRlZmVycmVkLCBmdW5jdGlvbiAocikge1xyXG4gICAgICBjaGFpbi5wdXNoKHIpO1xyXG4gICAgfSk7XHJcbiAgICByZXR1cm4gY2hhaW47XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBXcmFwcyBhIHN5bmNocm9ub3VzIGZ1bmN0aW9uIGludG8gYSBwcm9taXNlLCBzbyBpdCBjYW4gYmUgcnVuIGFzeW5jaHJvbm91c2x5LlxyXG4gICAqIFxyXG4gICAqIEBwYXJhbSB7ZnVuY3Rpb259IGYgXHJcbiAgICovXHJcbiAgbWFrZVJ1bGVEZWZlcnJlZChmKSB7XHJcbiAgICB2YXIgdmFsaWRhdG9yID0gdGhpcztcclxuICAgIHJldHVybiB3cmFwKGYsIGZ1bmN0aW9uIChmdW5jKSB7XHJcbiAgICAgIHZhciBhcmdzID0gdG9BcnJheShhcmd1bWVudHMpO1xyXG4gICAgICByZXR1cm4gbmV3IFByb21pc2UoZnVuY3Rpb24gKHJlc29sdmUsIHJlamVjdCkge1xyXG4gICAgICAgIHZhciByZXN1bHQgPSBmdW5jLmFwcGx5KHZhbGlkYXRvci5kYXRhZW50cnksIGFyZ3Muc2xpY2UoMSwgbGVuKGFyZ3MpKSk7XHJcbiAgICAgICAgLy9OQjogdXNpbmcgTmF0aXZlIFByb21pc2UsIHdlIGRvbid0IHdhbnQgdG8gdHJlYXQgYSBjb21tb24gc2NlbmFyaW8gbGlrZSBhbiBpbnZhbGlkIGZpZWxkIGFzIGEgcmVqZWN0aW9uXHJcbiAgICAgICAgcmVzb2x2ZShyZXN1bHQpO1xyXG4gICAgICB9KTtcclxuICAgIH0pO1xyXG4gIH1cclxuXHJcbiAgbG9jYWxpemVFcnJvcihlcnJvciwgcGFyYW1ldGVycykge1xyXG4gICAgdmFyIGRhdGFlbnRyeSA9IHRoaXMuZGF0YWVudHJ5LFxyXG4gICAgICBsb2NhbGl6ZXIgPSBkYXRhZW50cnkgPyBkYXRhZW50cnkubG9jYWxpemVyIDogbnVsbDtcclxuICAgIHJldHVybiBsb2NhbGl6ZXIgJiYgbG9jYWxpemVyLmxvb2t1cChlcnJvcikgPyBsb2NhbGl6ZXIudChlcnJvciwgcGFyYW1ldGVycykgOiBlcnJvcjtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEV4ZWN1dGVzIGEgc2VyaWVzIG9mIGRlZmVycmVkIHRoYXQgbmVlZCB0byBiZSBleGVjdXRlZCBvbmUgYWZ0ZXIgdGhlIG90aGVyLlxyXG4gICAqIHJldHVybnMgYSBkZWZlcnJlZCBvYmplY3QgdGhhdCBjb21wbGV0ZXMgd2hlbiBldmVyeSBzaW5nbGUgZGVmZXJyZWQgY29tcGxldGVzLCBvciBhdCB0aGUgZmlyc3QgdGhhdCBmYWlscy5cclxuICAgKiBcclxuICAgKiBAcGFyYW0gcXVldWVcclxuICAgKiBAcmV0dXJucyB7UHJvbWlzZX1cclxuICAgKi9cclxuICBjaGFpbihxdWV1ZSkge1xyXG4gICAgaWYgKCFsZW4ocXVldWUpKVxyXG4gICAgICByZXR1cm4gbmV3IFByb21pc2UoZnVuY3Rpb24gKHJlc29sdmUpIHsgcmVzb2x2ZShbXSk7IH0pO1xyXG4gICAgXHJcbiAgICAvLyBub3JtYWxpemUgcXVldWVcclxuICAgIHF1ZXVlID0gbWFwKHF1ZXVlLCBmdW5jdGlvbiAobykge1xyXG4gICAgICBpZiAoaXNGdW5jdGlvbihvKSkge1xyXG4gICAgICAgIHJldHVybiB7IGZuOiBvLCBwYXJhbXM6IFtdIH07XHJcbiAgICAgIH1cclxuICAgICAgcmV0dXJuIG87XHJcbiAgICB9KTtcclxuICAgIHZhciBpID0gMCxcclxuICAgICAgY3VycmVudEZpZWxkUnVsZSA9IHF1ZXVlW2ldLFxyXG4gICAgICBhID0gW10sXHJcbiAgICAgIHZhbGlkYXRvciA9IHRoaXMsXHJcbiAgICAgIGFyZ3MgPSB0b0FycmF5KGFyZ3VtZW50cykuc2xpY2UoMSwgbGVuKGFyZ3VtZW50cykpLFxyXG4gICAgICBmdWxsQXJncyA9IHJ1bGVQYXJhbXMoYXJncywgY3VycmVudEZpZWxkUnVsZSk7XHJcbiAgICBcclxuICAgIHJldHVybiBuZXcgUHJvbWlzZShmdW5jdGlvbiAocmVzb2x2ZSwgcmVqZWN0KSB7XHJcbiAgICAgIGZ1bmN0aW9uIHN1Y2Nlc3MoZGF0YSkge1xyXG4gICAgICAgIC8vIHN1cHBvcnQgc3BlY2lmaWMgZXJyb3IgbWVzc2FnZXMgZm9yIHZhbGlkYXRpb24gcnVsZSBkZWZpbml0aW9uIGluIHNjaGVtYVxyXG4gICAgICAgIGlmIChkYXRhLmVycm9yKSB7XHJcbiAgICAgICAgICB2YXIgcnVsZU1lc3NhZ2UgPSBjdXJyZW50RmllbGRSdWxlLm1lc3NhZ2U7XHJcbiAgICAgICAgICBpZiAocnVsZU1lc3NhZ2UpXHJcbiAgICAgICAgICAgIGRhdGEubWVzc2FnZSA9IGlzRnVuY3Rpb24ocnVsZU1lc3NhZ2UpID8gcnVsZU1lc3NhZ2UuYXBwbHkodmFsaWRhdG9yLmRhdGFlbnRyeSwgYXJncykgOiBydWxlTWVzc2FnZTtcclxuICAgICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICB2YXIgZXJyb3JLZXkgPSBkYXRhLm1lc3NhZ2U7XHJcbiAgICAgICAgICAgIHZhciBsb2NhbGl6ZWRNZXNzYWdlID0gdmFsaWRhdG9yLmxvY2FsaXplRXJyb3IoZXJyb3JLZXksIHJ1bGVQYXJhbXMoW10sIGN1cnJlbnRGaWVsZFJ1bGUpKTtcclxuICAgICAgICAgICAgaWYgKGxvY2FsaXplZE1lc3NhZ2UgIT0gZXJyb3JLZXkpIHtcclxuICAgICAgICAgICAgICBkYXRhLmVycm9yS2V5ID0gZXJyb3JLZXk7XHJcbiAgICAgICAgICAgICAgZGF0YS5tZXNzYWdlID0gbG9jYWxpemVkTWVzc2FnZTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgfVxyXG5cclxuICAgICAgICAgIGlmIChjdXJyZW50RmllbGRSdWxlLm9uRXJyb3IpXHJcbiAgICAgICAgICAgIGN1cnJlbnRGaWVsZFJ1bGUub25FcnJvci5hcHBseSh2YWxpZGF0b3IuZGF0YWVudHJ5LCBhcmdzKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGEucHVzaChkYXRhKTtcclxuICAgICAgICBpZiAoZGF0YS5lcnJvcikge1xyXG4gICAgICAgICAgLy8gY29tbW9uIHZhbGlkYXRpb24gZXJyb3I6IHJlc29sdmUgdGhlIGNoYWluXHJcbiAgICAgICAgICByZXR1cm4gcmVzb2x2ZShhKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgbmV4dCgpOyAvLyBnbyB0byBuZXh0IHByb21pc2VcclxuICAgICAgfVxyXG4gICAgICBmdW5jdGlvbiBmYWlsdXJlKGRhdGEpIHtcclxuICAgICAgICAvLyBOQjogdGhpcyBjYWxsYmFjayB3aWxsIGJlIGNhbGxlZCBpZiBhbiBleGNlcHRpb24gaGFwcGVuIGR1cmluZyB2YWxpZGF0aW9uLlxyXG4gICAgICAgIGEucHVzaCh7XHJcbiAgICAgICAgICBlcnJvcjogdHJ1ZSxcclxuICAgICAgICAgIGVycm9yS2V5OiBmYWlsZWRWYWxpZGF0aW9uRXJyb3JLZXksXHJcbiAgICAgICAgICBtZXNzYWdlOiB2YWxpZGF0b3IubG9jYWxpemVFcnJvcihmYWlsZWRWYWxpZGF0aW9uRXJyb3JLZXksIHJ1bGVQYXJhbXMoW10sIGN1cnJlbnRGaWVsZFJ1bGUpKVxyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIHJlamVjdChhKTsvLyByZWplY3QgdGhlIHZhbGlkYXRpb24gY2hhaW5cclxuICAgICAgfVxyXG4gICAgICBmdW5jdGlvbiBuZXh0KCkge1xyXG4gICAgICAgIGkrKztcclxuICAgICAgICBpZiAoaSA9PSBsZW4ocXVldWUpKSB7XHJcbiAgICAgICAgICAvLyBldmVyeSBzaW5nbGUgcHJvbWlzZSBjb21wbGV0ZWQgcHJvcGVybHlcclxuICAgICAgICAgIHJlc29sdmUoYSk7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgIGN1cnJlbnRGaWVsZFJ1bGUgPSBxdWV1ZVtpXTtcclxuICAgICAgICAgIGZ1bGxBcmdzID0gcnVsZVBhcmFtcyhhcmdzLCBjdXJyZW50RmllbGRSdWxlKTtcclxuICAgICAgICAgIGN1cnJlbnRGaWVsZFJ1bGUuZm4uYXBwbHkodmFsaWRhdG9yLmRhdGFlbnRyeSwgZnVsbEFyZ3MpLnRoZW4oc3VjY2VzcywgZmFpbHVyZSk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICAgIGN1cnJlbnRGaWVsZFJ1bGUuZm4uYXBwbHkodmFsaWRhdG9yLmRhdGFlbnRyeSwgZnVsbEFyZ3MpLnRoZW4oc3VjY2VzcywgZmFpbHVyZSk7XHJcbiAgICB9KTtcclxuICB9XHJcbn1cclxuXHJcblZhbGlkYXRvci5nZXRFcnJvciA9IGdldEVycm9yO1xyXG5WYWxpZGF0b3IuUnVsZXMgPSBWYWxpZGF0aW9uUnVsZXM7XHJcblxyXG5leHBvcnQgZGVmYXVsdCBWYWxpZGF0b3IiLCIvKipcclxuICogRGF0YUVudHJ5IHJhaXNlIGZ1bmN0aW9uLlxyXG4gKiBUaGlzIGZ1bmN0aW9uIGlzIHVzZWQgdG8gcmFpc2UgZXhjZXB0aW9ucyB0aGF0IGluY2x1ZGUgYSBsaW5rIHRvIHRoZSBHaXRIdWIgd2lraSxcclxuICogcHJvdmlkaW5nIGZ1cnRoZXIgaW5mb3JtYXRpb24gYW5kIGRldGFpbHMuXHJcbiAqIGh0dHBzOi8vZ2l0aHViLmNvbS9Sb2JlcnRvUHJldmF0by9EYXRhRW50cnlcclxuICpcclxuICogQ29weXJpZ2h0IDIwMTksIFJvYmVydG8gUHJldmF0b1xyXG4gKiBodHRwczovL3JvYmVydG9wcmV2YXRvLmdpdGh1Yi5pb1xyXG4gKlxyXG4gKiBMaWNlbnNlZCB1bmRlciB0aGUgTUlUIGxpY2Vuc2U6XHJcbiAqIGh0dHA6Ly93d3cub3BlbnNvdXJjZS5vcmcvbGljZW5zZXMvTUlUXHJcbiAqL1xyXG5cclxuY29uc3QgcmFpc2VTZXR0aW5ncyA9IHtcclxuICB3cml0ZVRvQ29uc29sZTogdHJ1ZVxyXG59O1xyXG5cclxuLyoqXHJcbiAqIFJhaXNlcyBhbiBleGNlcHRpb24sIG9mZmVyaW5nIGEgbGluayB0byB0aGUgR2l0SHViIHdpa2kuXHJcbiAqIGh0dHBzOi8vZ2l0aHViLmNvbS9Sb2JlcnRvUHJldmF0by9EYXRhRW50cnkvd2lraS9FcnJvcnNcclxuICovXHJcbmZ1bmN0aW9uIHJhaXNlKGVyciwgZGV0YWlsKSB7XHJcbiAgdmFyIG1lc3NhZ2UgPSAoZGV0YWlsID8gZGV0YWlsIDogXCJFcnJvclwiKSArIFwiLiBGb3IgZnVydGhlciBkZXRhaWxzOiBodHRwczovL2dpdGh1Yi5jb20vUm9iZXJ0b1ByZXZhdG8vRGF0YUVudHJ5L3dpa2kvRXJyb3JzI1wiICsgZXJyO1xyXG4gIGlmIChyYWlzZVNldHRpbmdzLndyaXRlVG9Db25zb2xlICYmIHR5cGVvZiBjb25zb2xlICE9IFwidW5kZWZpbmVkXCIpIHtcclxuICAgIGNvbnNvbGUuZXJyb3IobWVzc2FnZSk7XHJcbiAgfVxyXG4gIHRocm93IG5ldyBFcnJvcihtZXNzYWdlKTtcclxufVxyXG5cclxuZXhwb3J0IHsgcmFpc2UsIHJhaXNlU2V0dGluZ3MgfSIsIi8qKlxyXG4gKiBHZW5lcmljIHV0aWxpdGllcyB0byB3b3JrIHdpdGggb2JqZWN0cyBhbmQgZnVuY3Rpb25zLlxyXG4gKiBodHRwczovL2dpdGh1Yi5jb20vUm9iZXJ0b1ByZXZhdG8vRGF0YUVudHJ5XHJcbiAqXHJcbiAqIENvcHlyaWdodCAyMDE5LCBSb2JlcnRvIFByZXZhdG9cclxuICogaHR0cHM6Ly9yb2JlcnRvcHJldmF0by5naXRodWIuaW9cclxuICpcclxuICogTGljZW5zZWQgdW5kZXIgdGhlIE1JVCBsaWNlbnNlOlxyXG4gKiBodHRwOi8vd3d3Lm9wZW5zb3VyY2Uub3JnL2xpY2Vuc2VzL01JVFxyXG4gKi9cclxuLy8gXHJcbmNvbnN0IE9CSkVDVCA9IFwib2JqZWN0XCIsXHJcbiAgU1RSSU5HID0gXCJzdHJpbmdcIixcclxuICBOVU1CRVIgPSBcIm51bWJlclwiLFxyXG4gIEZVTkNUSU9OID0gXCJmdW5jdGlvblwiLFxyXG4gIFJFUCA9IFwicmVwbGFjZVwiO1xyXG5cclxuaW1wb3J0IHtcclxuICBBcmd1bWVudEV4Y2VwdGlvbixcclxuICBBcmd1bWVudE51bGxFeGNlcHRpb25cclxufSBmcm9tIFwiLi4vc2NyaXB0cy9leGNlcHRpb25zXCJcclxuXHJcbi8qKlxyXG4qIFJldHVybnMgdGhlIGxlbmdodCBvZiB0aGUgZ2l2ZW4gdmFyaWFibGUuXHJcbiogSGFuZGxlcyBhcnJheSwgb2JqZWN0IGtleXMsIHN0cmluZyBhbmQgYW55IG90aGVyIG9iamVjdCB3aXRoIGxlbmd0aCBwcm9wZXJ0eS5cclxuKiBcclxuKiBAcGFyYW0geyp9IG8gXHJcbiovXHJcbmZ1bmN0aW9uIGxlbihvKSB7XHJcbiAgaWYgKCFvKSByZXR1cm4gMDtcclxuICBpZiAoaXNTdHJpbmcobykpXHJcbiAgICByZXR1cm4gby5sZW5ndGg7XHJcbiAgaWYgKGlzUGxhaW5PYmplY3QobykpIHtcclxuICAgIHZhciBpID0gMDtcclxuICAgIGZvciAobGV0IHggaW4gbykge1xyXG4gICAgICBpKys7XHJcbiAgICB9XHJcbiAgICByZXR1cm4gaTtcclxuICB9XHJcbiAgcmV0dXJuIFwibGVuZ3RoXCIgaW4gbyA/IG8ubGVuZ3RoIDogdW5kZWZpbmVkO1xyXG59XHJcblxyXG5mdW5jdGlvbiBtYXAoYSwgZm4pIHtcclxuICBpZiAoIWEgfHwgIWxlbihhKSkge1xyXG4gICAgaWYgKGlzUGxhaW5PYmplY3QoYSkpIHtcclxuICAgICAgdmFyIHgsIGIgPSBbXTtcclxuICAgICAgZm9yICh4IGluIGEpIHtcclxuICAgICAgICBiLnB1c2goZm4oeCwgYVt4XSkpO1xyXG4gICAgICB9XHJcbiAgICAgIHJldHVybiBiO1xyXG4gICAgfVxyXG4gIH07XHJcbiAgdmFyIGIgPSBbXTtcclxuICBmb3IgKHZhciBpID0gMCwgbCA9IGxlbihhKTsgaSA8IGw7IGkrKylcclxuICAgIGIucHVzaChmbihhW2ldKSk7XHJcbiAgcmV0dXJuIGI7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIGVhY2goYSwgZm4pIHtcclxuICBpZiAoaXNQbGFpbk9iamVjdChhKSkge1xyXG4gICAgZm9yICh2YXIgeCBpbiBhKVxyXG4gICAgICBmbihhW3hdLCB4KTtcclxuICAgIHJldHVybiBhO1xyXG4gIH1cclxuICBpZiAoIWEgfHwgIWxlbihhKSkgcmV0dXJuIGE7XHJcbiAgZm9yICh2YXIgaSA9IDAsIGwgPSBsZW4oYSk7IGkgPCBsOyBpKyspXHJcbiAgICBmbihhW2ldLCBpKTtcclxufVxyXG5cclxuZnVuY3Rpb24gZXhlYyhmbiwgaikge1xyXG4gIGZvciAodmFyIGkgPSAwOyBpIDwgajsgaSsrKVxyXG4gICAgZm4oaSk7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIGlzU3RyaW5nKHMpIHtcclxuICByZXR1cm4gdHlwZW9mIHMgPT0gU1RSSU5HO1xyXG59XHJcblxyXG5mdW5jdGlvbiBpc051bWJlcihvKSB7XHJcbiAgLy8gaW4gSmF2YVNjcmlwdCBOYU4gKE5vdCBhIE51bWJlcikgaWYgb2YgdHlwZSBcIm51bWJlclwiIChjdXJpb3VzLi4pXHJcbiAgLy8gSG93ZXZlciwgd2hlbiBjaGVja2luZyBpZiBzb21ldGhpbmcgaXMgYSBudW1iZXIgaXQncyBkZXNpcmFibGUgdG8gcmV0dXJuXHJcbiAgLy8gZmFsc2UgaWYgaXQgaXMgTmFOIVxyXG4gIGlmIChpc05hTihvKSkge1xyXG4gICAgcmV0dXJuIGZhbHNlO1xyXG4gIH1cclxuICByZXR1cm4gdHlwZW9mIG8gPT0gTlVNQkVSO1xyXG59XHJcblxyXG5mdW5jdGlvbiBpc0Z1bmN0aW9uKG8pIHtcclxuICByZXR1cm4gdHlwZW9mIG8gPT0gRlVOQ1RJT047XHJcbn1cclxuXHJcbmZ1bmN0aW9uIGlzT2JqZWN0KG8pIHtcclxuICByZXR1cm4gdHlwZW9mIG8gPT0gT0JKRUNUO1xyXG59XHJcblxyXG5mdW5jdGlvbiBpc0FycmF5KG8pIHtcclxuICByZXR1cm4gbyBpbnN0YW5jZW9mIEFycmF5O1xyXG59XHJcblxyXG5mdW5jdGlvbiBpc0RhdGUobykge1xyXG4gIHJldHVybiBvIGluc3RhbmNlb2YgRGF0ZTtcclxufVxyXG5cclxuZnVuY3Rpb24gaXNSZWdFeHAobykge1xyXG4gIHJldHVybiBvIGluc3RhbmNlb2YgUmVnRXhwO1xyXG59XHJcblxyXG5mdW5jdGlvbiBpc1BsYWluT2JqZWN0KG8pIHtcclxuICByZXR1cm4gdHlwZW9mIG8gPT0gT0JKRUNUICYmIG8gIT09IG51bGwgJiYgby5jb25zdHJ1Y3RvciA9PSBPYmplY3Q7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIGlzRW1wdHkobykge1xyXG4gIGlmICghbykgcmV0dXJuIHRydWU7XHJcbiAgaWYgKGlzQXJyYXkobykpIHtcclxuICAgIHJldHVybiBvLmxlbmd0aCA9PSAwO1xyXG4gIH1cclxuICBpZiAoaXNQbGFpbk9iamVjdChvKSkge1xyXG4gICAgdmFyIHg7XHJcbiAgICBmb3IgKHggaW4gbykge1xyXG4gICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICB9XHJcbiAgICByZXR1cm4gdHJ1ZTtcclxuICB9XHJcbiAgaWYgKGlzU3RyaW5nKG8pKSB7XHJcbiAgICByZXR1cm4gbyA9PT0gXCJcIjtcclxuICB9XHJcbiAgaWYgKGlzTnVtYmVyKG8pKSB7XHJcbiAgICByZXR1cm4gbyA9PT0gMDtcclxuICB9XHJcbiAgdGhyb3cgbmV3IEVycm9yKFwiaW52YWxpZCBhcmd1bWVudFwiKTtcclxufVxyXG5cclxuZnVuY3Rpb24gaGFzT3duUHJvcGVydHkobywgbikge1xyXG4gIHJldHVybiBvICYmIG8uaGFzT3duUHJvcGVydHkobik7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIHVwcGVyKHMpIHtcclxuICByZXR1cm4gcy50b1VwcGVyQ2FzZSgpO1xyXG59XHJcblxyXG5mdW5jdGlvbiBsb3dlcihzKSB7XHJcbiAgcmV0dXJuIHMudG9Mb3dlckNhc2UoKTtcclxufVxyXG5cclxuZnVuY3Rpb24gZmlyc3QoYSwgZm4pIHtcclxuICBpZiAoIWZuKSB7XHJcbiAgICByZXR1cm4gYSA/IGFbMF0gOiB1bmRlZmluZWQ7XHJcbiAgfVxyXG4gIGZvciAodmFyIGkgPSAwLCBsID0gbGVuKGEpOyBpIDwgbDsgaSsrKSB7XHJcbiAgICBpZiAoZm4oYVtpXSkpIHJldHVybiBhW2ldO1xyXG4gIH1cclxufVxyXG5cclxuZnVuY3Rpb24gdG9BcnJheShhKSB7XHJcbiAgaWYgKGlzQXJyYXkoYSkpIHJldHVybiBhO1xyXG4gIGlmICh0eXBlb2YgYSA9PSBPQkpFQ1QgJiYgbGVuKGEpKVxyXG4gICAgcmV0dXJuIG1hcChhLCBmdW5jdGlvbiAobykgeyByZXR1cm4gbzsgfSk7XHJcbiAgcmV0dXJuIEFycmF5LnByb3RvdHlwZS5zbGljZS5jYWxsKGFyZ3VtZW50cyk7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIGZsYXR0ZW4oYSkge1xyXG4gIGlmIChpc0FycmF5KGEpKVxyXG4gICAgcmV0dXJuIFtdLmNvbmNhdC5hcHBseShbXSwgbWFwKGEsIGZsYXR0ZW4pKTtcclxuICByZXR1cm4gYTtcclxufVxyXG5cclxudmFyIF9pZCA9IC0xO1xyXG5mdW5jdGlvbiB1bmlxdWVJZChuYW1lKSB7XHJcbiAgX2lkKys7XHJcbiAgcmV0dXJuIChuYW1lIHx8IFwiaWRcIikgKyBfaWQ7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIHJlc2V0U2VlZCgpIHtcclxuICBfaWQgPSAtMTtcclxufVxyXG5cclxuZnVuY3Rpb24ga2V5cyhvKSB7XHJcbiAgaWYgKCFvKSByZXR1cm4gW107XHJcbiAgdmFyIHgsIGEgPSBbXTtcclxuICBmb3IgKHggaW4gbykge1xyXG4gICAgYS5wdXNoKHgpO1xyXG4gIH1cclxuICByZXR1cm4gYTtcclxufVxyXG5cclxuZnVuY3Rpb24gdmFsdWVzKG8pIHtcclxuICBpZiAoIW8pIHJldHVybiBbXTtcclxuICB2YXIgeCwgYSA9IFtdO1xyXG4gIGZvciAoeCBpbiBvKSB7XHJcbiAgICBhLnB1c2gob1t4XSk7XHJcbiAgfVxyXG4gIHJldHVybiBhO1xyXG59XHJcblxyXG5mdW5jdGlvbiBtaW51cyhvLCBwcm9wcykge1xyXG4gIGlmICghbykgcmV0dXJuIG87XHJcbiAgaWYgKCFwcm9wcykgcHJvcHMgPSBbXTtcclxuICB2YXIgYSA9IHt9LCB4O1xyXG4gIGZvciAoeCBpbiBvKSB7XHJcbiAgICBpZiAocHJvcHMuaW5kZXhPZih4KSA9PSAtMSkge1xyXG4gICAgICBhW3hdID0gb1t4XTtcclxuICAgIH1cclxuICB9XHJcbiAgcmV0dXJuIGE7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIGlzVW5kKHgpIHtcclxuICByZXR1cm4gdHlwZW9mIHggPT09IFwidW5kZWZpbmVkXCI7XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBEZWVwIGNsb25lcyBhbiBpdGVtIChleGNlcHQgZnVuY3Rpb24gdHlwZXMpLlxyXG4gKi9cclxuZnVuY3Rpb24gY2xvbmUobykge1xyXG4gIHZhciB4LCBhO1xyXG4gIGlmIChvID09PSBudWxsKSByZXR1cm4gbnVsbDtcclxuICBpZiAobyA9PT0gdW5kZWZpbmVkKSByZXR1cm4gdW5kZWZpbmVkO1xyXG4gIGlmIChpc09iamVjdChvKSkge1xyXG4gICAgaWYgKGlzQXJyYXkobykpIHtcclxuICAgICAgYSA9IFtdO1xyXG4gICAgICBmb3IgKHZhciBpID0gMCwgbCA9IG8ubGVuZ3RoOyBpIDwgbDsgaSsrKSB7XHJcbiAgICAgICAgYVtpXSA9IGNsb25lKG9baV0pO1xyXG4gICAgICB9XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICBhID0ge307XHJcbiAgICAgIHZhciB2O1xyXG4gICAgICBmb3IgKHggaW4gbykge1xyXG4gICAgICAgIHYgPSBvW3hdO1xyXG4gICAgICAgIGlmICh2ID09PSBudWxsIHx8IHYgPT09IHVuZGVmaW5lZCkge1xyXG4gICAgICAgICAgYVt4XSA9IHY7XHJcbiAgICAgICAgICBjb250aW51ZTtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKGlzT2JqZWN0KHYpKSB7XHJcbiAgICAgICAgICBpZiAoaXNEYXRlKHYpKSB7XHJcbiAgICAgICAgICAgIGFbeF0gPSBuZXcgRGF0ZSh2LmdldFRpbWUoKSk7XHJcbiAgICAgICAgICB9IGVsc2UgaWYgKGlzUmVnRXhwKHYpKSB7XHJcbiAgICAgICAgICAgIGFbeF0gPSBuZXcgUmVnRXhwKHYuc291cmNlLCB2LmZsYWdzKTtcclxuICAgICAgICAgIH0gZWxzZSBpZiAoaXNBcnJheSh2KSkge1xyXG4gICAgICAgICAgICBhW3hdID0gW107XHJcbiAgICAgICAgICAgIGZvciAodmFyIGkgPSAwLCBsID0gdi5sZW5ndGg7IGkgPCBsOyBpKyspIHtcclxuICAgICAgICAgICAgICBhW3hdW2ldID0gY2xvbmUodltpXSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIGFbeF0gPSBjbG9uZSh2KTtcclxuICAgICAgICAgIH1cclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgYVt4XSA9IHY7XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgfSBlbHNlIHtcclxuICAgIGEgPSBvO1xyXG4gIH1cclxuICByZXR1cm4gYTtcclxufVxyXG5cclxuZXhwb3J0IGRlZmF1bHQge1xyXG4gIGV4dGVuZCgpIHtcclxuICAgIHZhciBhcmdzID0gYXJndW1lbnRzO1xyXG4gICAgaWYgKCFsZW4oYXJncykpIHJldHVybjtcclxuICAgIGlmIChsZW4oYXJncykgPT0gMSkgcmV0dXJuIGFyZ3NbMF07XHJcbiAgICB2YXIgYSA9IGFyZ3NbMF0sIGIsIHg7XHJcbiAgICBmb3IgKHZhciBpID0gMSwgbCA9IGxlbihhcmdzKTsgaSA8IGw7IGkrKykge1xyXG4gICAgICBiID0gYXJnc1tpXTtcclxuICAgICAgaWYgKCFiKSBjb250aW51ZTtcclxuICAgICAgZm9yICh4IGluIGIpIHtcclxuICAgICAgICBhW3hdID0gYlt4XTtcclxuICAgICAgfVxyXG4gICAgfVxyXG4gICAgcmV0dXJuIGE7XHJcbiAgfSxcclxuXHJcbiAgc3RyaW5nQXJncyhhKSB7XHJcbiAgICBpZiAoIWEgfHwgaXNVbmQoYS5sZW5ndGgpKSB0aHJvdyBuZXcgRXJyb3IoXCJleHBlY3RlZCBhcnJheSBhcmd1bWVudFwiKTtcclxuICAgIGlmICghYS5sZW5ndGgpIHJldHVybiBbXTtcclxuICAgIHZhciBsID0gYS5sZW5ndGg7XHJcbiAgICBpZiAobCA9PT0gMSkge1xyXG4gICAgICB2YXIgZmlyc3QgPSBhWzBdO1xyXG4gICAgICBpZiAoaXNTdHJpbmcoZmlyc3QpICYmIGZpcnN0LmluZGV4T2YoXCIgXCIpID4gLTEpIHtcclxuICAgICAgICByZXR1cm4gZmlyc3Quc3BsaXQoL1xccysvZyk7XHJcbiAgICAgIH1cclxuICAgIH1cclxuICAgIHJldHVybiBhO1xyXG4gIH0sXHJcblxyXG4gIHVuaXF1ZUlkLFxyXG5cclxuICByZXNldFNlZWQsXHJcblxyXG4gIGZsYXR0ZW4sXHJcblxyXG4gIGVhY2gsXHJcblxyXG4gIGV4ZWMsXHJcblxyXG4gIGtleXMsXHJcblxyXG4gIHZhbHVlcyxcclxuXHJcbiAgbWludXMsXHJcblxyXG4gIG1hcCxcclxuXHJcbiAgZmlyc3QsXHJcblxyXG4gIHRvQXJyYXksXHJcblxyXG4gIGlzQXJyYXksXHJcblxyXG4gIGlzRGF0ZSxcclxuXHJcbiAgaXNTdHJpbmcsXHJcblxyXG4gIGlzTnVtYmVyLFxyXG5cclxuICBpc09iamVjdCxcclxuXHJcbiAgaXNQbGFpbk9iamVjdCxcclxuXHJcbiAgaXNFbXB0eSxcclxuXHJcbiAgaXNGdW5jdGlvbixcclxuXHJcbiAgaGFzOiBoYXNPd25Qcm9wZXJ0eSxcclxuXHJcbiAgaXNOdWxsT3JFbXB0eVN0cmluZyh2KSB7XHJcbiAgICByZXR1cm4gdiA9PT0gbnVsbCB8fCB2ID09PSB1bmRlZmluZWQgfHwgdiA9PT0gXCJcIjtcclxuICB9LFxyXG5cclxuICBsb3dlcixcclxuXHJcbiAgdXBwZXIsXHJcblxyXG4gIC8qKlxyXG4gICAqIER1Y2sgdHlwaW5nOiBjaGVja3MgaWYgYW4gb2JqZWN0IFwiUXVhY2tzIGxpa2UgYSBQcm9taXNlXCJcclxuICAgKlxyXG4gICAqIEBwYXJhbSB7UHJvbWlzZX0gbztcclxuICAgKi9cclxuICBxdWFja3NMaWtlUHJvbWlzZShvKSB7XHJcbiAgICBpZiAobyAmJiB0eXBlb2Ygby50aGVuID09IEZVTkNUSU9OKSB7XHJcbiAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgfVxyXG4gICAgcmV0dXJuIGZhbHNlO1xyXG4gIH0sXHJcblxyXG4gIC8qKlxyXG4gICAqIFJldHVybnMgdGhlIHN1bSBvZiB2YWx1ZXMgaW5zaWRlIGFuIGFycmF5LCBldmVudHVhbGx5IGJ5IHByZWRpY2F0ZS5cclxuICAgKi9cclxuICBzdW0oYSwgZm4pIHtcclxuICAgIGlmICghYSkgcmV0dXJuO1xyXG4gICAgdmFyIGIsIGwgPSBsZW4oYSk7XHJcbiAgICBpZiAoIWwpIHJldHVybjtcclxuICAgIGZvciAodmFyIGkgPSAwLCBsID0gbGVuKGEpOyBpIDwgbDsgaSsrKSB7XHJcbiAgICAgIHZhciB2ID0gZm4gPyBmbihhW2ldKSA6IGFbaV07XHJcbiAgICAgIGlmIChpc1VuZChiKSkge1xyXG4gICAgICAgIGIgPSB2O1xyXG4gICAgICB9IGVsc2Uge1xyXG4gICAgICAgIGIgKz0gdjtcclxuICAgICAgfVxyXG4gICAgfVxyXG4gICAgcmV0dXJuIGI7XHJcbiAgfSxcclxuXHJcbiAgLyoqXHJcbiAgICogUmV0dXJucyB0aGUgbWF4aW11bSB2YWx1ZSBpbnNpZGUgYW4gYXJyYXksIGJ5IHByZWRpY2F0ZS5cclxuICAgKi9cclxuICBtYXgoYSwgZm4pIHtcclxuICAgIHZhciBvID0gLUluZmluaXR5O1xyXG4gICAgZm9yICh2YXIgaSA9IDAsIGwgPSBsZW4oYSk7IGkgPCBsOyBpKyspIHtcclxuICAgICAgdmFyIHYgPSBmbiA/IGZuKGFbaV0pIDogYVtpXTtcclxuICAgICAgaWYgKHYgPiBvKVxyXG4gICAgICAgIG8gPSB2O1xyXG4gICAgfVxyXG4gICAgcmV0dXJuIG87XHJcbiAgfSxcclxuXHJcbiAgLyoqXHJcbiAgICogUmV0dXJucyB0aGUgbWluaW11bSB2YWx1ZSBpbnNpZGUgYW4gYXJyYXksIGJ5IHByZWRpY2F0ZS5cclxuICAgKi9cclxuICBtaW4oYSwgZm4pIHtcclxuICAgIHZhciBvID0gSW5maW5pdHk7XHJcbiAgICBmb3IgKHZhciBpID0gMCwgbCA9IGxlbihhKTsgaSA8IGw7IGkrKykge1xyXG4gICAgICB2YXIgdiA9IGZuID8gZm4oYVtpXSkgOiBhW2ldO1xyXG4gICAgICBpZiAodiA8IG8pXHJcbiAgICAgICAgbyA9IHY7XHJcbiAgICB9XHJcbiAgICByZXR1cm4gbztcclxuICB9LFxyXG5cclxuICAvKipcclxuICAgKiBSZXR1cm5zIHRoZSBpdGVtIHdpdGggdGhlIG1heGltdW0gdmFsdWUgaW5zaWRlIGFuIGFycmF5LCBieSBwcmVkaWNhdGUuXHJcbiAgICovXHJcbiAgd2l0aE1heChhLCBmbikge1xyXG4gICAgdmFyIG87XHJcbiAgICBmb3IgKHZhciBpID0gMCwgbCA9IGxlbihhKTsgaSA8IGw7IGkrKykge1xyXG4gICAgICBpZiAoIW8pIHtcclxuICAgICAgICBvID0gYVtpXTtcclxuICAgICAgICBjb250aW51ZTtcclxuICAgICAgfVxyXG4gICAgICB2YXIgdiA9IGZuKGFbaV0pO1xyXG4gICAgICBpZiAodiA+IGZuKG8pKVxyXG4gICAgICAgIG8gPSBhW2ldO1xyXG4gICAgfVxyXG4gICAgcmV0dXJuIG87XHJcbiAgfSxcclxuXHJcbiAgLyoqXHJcbiAgICogUmV0dXJucyB0aGUgaXRlbSB3aXRoIHRoZSBtaW5pbXVtIHZhbHVlIGluc2lkZSBhbiBhcnJheSwgYnkgcHJlZGljYXRlLlxyXG4gICAqL1xyXG4gIHdpdGhNaW4oYSwgZm4pIHtcclxuICAgIHZhciBvO1xyXG4gICAgZm9yICh2YXIgaSA9IDAsIGwgPSBsZW4oYSk7IGkgPCBsOyBpKyspIHtcclxuICAgICAgaWYgKCFvKSB7XHJcbiAgICAgICAgbyA9IGFbaV07XHJcbiAgICAgICAgY29udGludWU7XHJcbiAgICAgIH1cclxuICAgICAgdmFyIHYgPSBmbihhW2ldKTtcclxuICAgICAgaWYgKHYgPCBmbihvKSlcclxuICAgICAgICBvID0gYVtpXTtcclxuICAgIH1cclxuICAgIHJldHVybiBvO1xyXG4gIH0sXHJcblxyXG4gIGluZGV4T2YoYSwgbykge1xyXG4gICAgcmV0dXJuIGEuaW5kZXhPZihvKTtcclxuICB9LFxyXG5cclxuICBjb250YWlucyhhLCBvKSB7XHJcbiAgICBpZiAoIWEpIHJldHVybiBmYWxzZTtcclxuICAgIHJldHVybiBhLmluZGV4T2YobykgPiAtMTtcclxuICB9LFxyXG5cclxuICAvKipcclxuICAgKiBSZXR1cm5zIGEgdmFsdWUgaW5kaWNhdGluZyB3aGV0aGVyIGFueSBvYmplY3QgaW5zaWRlIGFuIGFycmF5LCBvciBhbnlcclxuICAgKiBrZXktdmFsdWUgcGFpciBpbnNpZGUgYW4gb2JqZWN0LCByZXNwZWN0IGEgZ2l2ZW4gcHJlZGljYXRlLlxyXG4gICAqXHJcbiAgICogQHBhcmFtIGE6IGlucHV0IGFycmF5IG9yIG9iamVjdFxyXG4gICAqIEBwYXJhbSBmbjogcHJlZGljYXRlIHRvIHRlc3QgaXRlbXMgb3Iga2V5LXZhbHVlIHBhaXJzXHJcbiAgICovXHJcbiAgYW55KGEsIGZuKSB7XHJcbiAgICBpZiAoaXNQbGFpbk9iamVjdChhKSkge1xyXG4gICAgICB2YXIgeDtcclxuICAgICAgZm9yICh4IGluIGEpIHtcclxuICAgICAgICBpZiAoZm4oeCwgYVt4XSkpXHJcbiAgICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgICAgfVxyXG4gICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICB9XHJcbiAgICBmb3IgKHZhciBpID0gMCwgbCA9IGxlbihhKTsgaSA8IGw7IGkrKykge1xyXG4gICAgICBpZiAoZm4oYVtpXSkpXHJcbiAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICB9XHJcbiAgICByZXR1cm4gZmFsc2U7XHJcbiAgfSxcclxuXHJcbiAgLyoqXHJcbiAgICogUmV0dXJucyBhIHZhbHVlIGluZGljYXRpbmcgd2hldGhlciBhbGwgb2JqZWN0IGluc2lkZSBhbiBhcnJheSwgb3IgYW55XHJcbiAgICoga2V5LXZhbHVlIHBhaXIgaW5zaWRlIGFuIG9iamVjdCwgcmVzcGVjdCBhIGdpdmVuIHByZWRpY2F0ZS5cclxuICAgKlxyXG4gICAqIEBwYXJhbSBhOiBpbnB1dCBhcnJheSBvciBvYmplY3RcclxuICAgKiBAcGFyYW0gZm46IHByZWRpY2F0ZSB0byB0ZXN0IGl0ZW1zIG9yIGtleS12YWx1ZSBwYWlyc1xyXG4gICAqL1xyXG4gIGFsbChhLCBmbikge1xyXG4gICAgaWYgKGlzUGxhaW5PYmplY3QoYSkpIHtcclxuICAgICAgdmFyIHg7XHJcbiAgICAgIGZvciAoeCBpbiBhKSB7XHJcbiAgICAgICAgaWYgKCFmbih4LCBhW3hdKSlcclxuICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgfVxyXG4gICAgICByZXR1cm4gdHJ1ZTtcclxuICAgIH1cclxuICAgIGZvciAodmFyIGkgPSAwLCBsID0gbGVuKGEpOyBpIDwgbDsgaSsrKSB7XHJcbiAgICAgIGlmICghZm4oYVtpXSkpXHJcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgfVxyXG4gICAgcmV0dXJuIHRydWU7XHJcbiAgfSxcclxuXHJcbiAgLyoqXHJcbiAgICogRmluZHMgdGhlIGZpcnN0IGl0ZW0gb3IgcHJvcGVydHkgdGhhdCByZXNwZWN0cyBhIGdpdmVuIHByZWRpY2F0ZS5cclxuICAgKi9cclxuICBmaW5kKGEsIGZuKSB7XHJcbiAgICBpZiAoIWEpIHJldHVybiBudWxsO1xyXG4gICAgaWYgKGlzQXJyYXkoYSkpIHtcclxuICAgICAgaWYgKCFhIHx8ICFsZW4oYSkpIHJldHVybjtcclxuICAgICAgZm9yICh2YXIgaSA9IDAsIGwgPSBsZW4oYSk7IGkgPCBsOyBpKyspIHtcclxuICAgICAgICBpZiAoZm4oYVtpXSkpXHJcbiAgICAgICAgICByZXR1cm4gYVtpXTtcclxuICAgICAgfVxyXG4gICAgfVxyXG4gICAgaWYgKGlzUGxhaW5PYmplY3QoYSkpIHtcclxuICAgICAgdmFyIHg7XHJcbiAgICAgIGZvciAoeCBpbiBhKSB7XHJcbiAgICAgICAgaWYgKGZuKGFbeF0sIHgpKVxyXG4gICAgICAgICAgcmV0dXJuIGFbeF07XHJcbiAgICAgIH1cclxuICAgIH1cclxuICAgIHJldHVybjtcclxuICB9LFxyXG5cclxuICB3aGVyZShhLCBmbikge1xyXG4gICAgaWYgKCFhIHx8ICFsZW4oYSkpIHJldHVybiBbXTtcclxuICAgIHZhciBiID0gW107XHJcbiAgICBmb3IgKHZhciBpID0gMCwgbCA9IGxlbihhKTsgaSA8IGw7IGkrKykge1xyXG4gICAgICBpZiAoZm4oYVtpXSkpXHJcbiAgICAgICAgYi5wdXNoKGFbaV0pO1xyXG4gICAgfVxyXG4gICAgcmV0dXJuIGI7XHJcbiAgfSxcclxuXHJcbiAgcmVtb3ZlSXRlbShhLCBvKSB7XHJcbiAgICB2YXIgeCA9IC0xO1xyXG4gICAgZm9yICh2YXIgaSA9IDAsIGwgPSBsZW4oYSk7IGkgPCBsOyBpKyspIHtcclxuICAgICAgaWYgKGFbaV0gPT09IG8pIHtcclxuICAgICAgICB4ID0gaTtcclxuICAgICAgICBicmVhaztcclxuICAgICAgfVxyXG4gICAgfVxyXG4gICAgYS5zcGxpY2UoeCwgMSk7XHJcbiAgfSxcclxuXHJcbiAgcmVtb3ZlSXRlbXMoYSwgYikge1xyXG4gICAgZWFjaChiLCB0b1JlbW92ZSA9PiB7XHJcbiAgICAgIHRoaXMucmVtb3ZlSXRlbShhLCB0b1JlbW92ZSk7XHJcbiAgICB9KTtcclxuICB9LFxyXG5cclxuICByZWplY3QoYSwgZm4pIHtcclxuICAgIGlmICghYSB8fCAhbGVuKGEpKSByZXR1cm4gW107XHJcbiAgICB2YXIgYiA9IFtdO1xyXG4gICAgZm9yICh2YXIgaSA9IDAsIGwgPSBsZW4oYSk7IGkgPCBsOyBpKyspIHtcclxuICAgICAgaWYgKCFmbihhW2ldKSlcclxuICAgICAgICBiLnB1c2goYVtpXSk7XHJcbiAgICB9XHJcbiAgICByZXR1cm4gYjtcclxuICB9LFxyXG5cclxuICBwaWNrKG8sIGFyciwgZXhjbHVkZSkge1xyXG4gICAgdmFyIGEgPSB7fTtcclxuICAgIGlmIChleGNsdWRlKSB7XHJcbiAgICAgIGZvciAodmFyIHggaW4gbykge1xyXG4gICAgICAgIGlmIChhcnIuaW5kZXhPZih4KSA9PSAtMSlcclxuICAgICAgICAgIGFbeF0gPSBvW3hdO1xyXG4gICAgICB9XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICBmb3IgKHZhciBpID0gMCwgbCA9IGxlbihhcnIpOyBpIDwgbDsgaSsrKSB7XHJcbiAgICAgICAgdmFyIHAgPSBhcnJbaV07XHJcbiAgICAgICAgaWYgKGhhc093blByb3BlcnR5KG8sIHApKVxyXG4gICAgICAgICAgYVtwXSA9IG9bcF07XHJcbiAgICAgIH1cclxuICAgIH1cclxuICAgIHJldHVybiBhO1xyXG4gIH0sXHJcblxyXG4gIG9taXQoYSwgYXJyKSB7XHJcbiAgICByZXR1cm4gdGhpcy5waWNrKGEsIGFyciwgMSk7XHJcbiAgfSxcclxuXHJcbiAgLyoqXHJcbiAgICogUmVxdWlyZXMgYW4gb2JqZWN0IHRvIGJlIGRlZmluZWQgYW5kIHRvIGhhdmUgdGhlIGdpdmVuIHByb3BlcnRpZXMuXHJcbiAgICpcclxuICAgKiBAcGFyYW0ge09iamVjdH0gbzogb2JqZWN0IHRvIHZhbGlkYXRlXHJcbiAgICogQHBhcmFtIHtTdHJpbmdbXX0gcHJvcHM6IGxpc3Qgb2YgcHJvcGVydGllcyB0byByZXF1aXJlXHJcbiAgICogQHBhcmFtIHtzdHJpbmd9IFtuYW1lPW9wdGlvbnNdOlxyXG4gICAqL1xyXG4gIHJlcXVpcmUobywgcHJvcHMsIG5hbWUpIHtcclxuICAgIGlmICghbmFtZSkgbmFtZSA9IFwib3B0aW9uc1wiO1xyXG4gICAgdmFyIGVycm9yID0gXCJcIjtcclxuICAgIGlmIChvKSB7XHJcbiAgICAgIHRoaXMuZWFjaChwcm9wcywgeCA9PiB7XHJcbiAgICAgICAgaWYgKCFoYXNPd25Qcm9wZXJ0eShvLCB4KSkge1xyXG4gICAgICAgICAgZXJyb3IgKz0gXCJtaXNzaW5nICdcIiArIHggKyBcIicgaW4gXCIgKyBuYW1lO1xyXG4gICAgICAgIH1cclxuICAgICAgfSk7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICBlcnJvciA9IFwibWlzc2luZyBcIiArIG5hbWU7XHJcbiAgICB9XHJcbiAgICBpZiAoZXJyb3IpXHJcbiAgICAgIHRocm93IG5ldyBFcnJvcihlcnJvcik7XHJcbiAgfSxcclxuXHJcbiAgd3JhcChmbiwgY2FsbGJhY2ssIGNvbnRleHQpIHtcclxuICAgIHZhciB3cmFwcGVyID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICByZXR1cm4gY2FsbGJhY2suYXBwbHkodGhpcywgW2ZuXS5jb25jYXQodG9BcnJheShhcmd1bWVudHMpKSk7XHJcbiAgICB9O1xyXG4gICAgd3JhcHBlci5iaW5kKGNvbnRleHQgfHwgdGhpcyk7XHJcbiAgICByZXR1cm4gd3JhcHBlcjtcclxuICB9LFxyXG5cclxuICB1bndyYXAobykge1xyXG4gICAgcmV0dXJuIGlzRnVuY3Rpb24obykgPyB1bndyYXAobygpKSA6IG87XHJcbiAgfSxcclxuXHJcbiAgZGVmZXIoZm4pIHtcclxuICAgIHNldFRpbWVvdXQoZm4sIDApO1xyXG4gIH0sXHJcblxyXG4gIC8qKlxyXG4gICAqIFJldHVybnMgYSBuZXcgZnVuY3Rpb24gdGhhdCBjYW4gYmUgaW52b2tlZCBhdCBtb3N0IG4gdGltZXMuXHJcbiAgICovXHJcbiAgYXRNb3N0KG4sIGZuLCBjb250ZXh0KSB7XHJcbiAgICB2YXIgbSA9IG4sIHJlc3VsdDtcclxuICAgIGZ1bmN0aW9uIGEoKSB7XHJcbiAgICAgIGlmIChuID4gMCkge1xyXG4gICAgICAgIG4tLTtcclxuICAgICAgICByZXN1bHQgPSBmbi5hcHBseShjb250ZXh0IHx8IHRoaXMsIGFyZ3VtZW50cyk7XHJcbiAgICAgIH1cclxuICAgICAgcmV0dXJuIHJlc3VsdDtcclxuICAgIH1cclxuICAgIHJldHVybiBhO1xyXG4gIH0sXHJcblxyXG4gIGlzVW5kLFxyXG5cclxuICAvKipcclxuICAgKiBSZXR1cm5zIGEgbmV3IGZ1bmN0aW9uIHRoYXQgY2FuIGJlIGludm9rZWQgYXQgbW9zdCBvbmNlLlxyXG4gICAqL1xyXG4gIG9uY2UoZm4sIGNvbnRleHQpIHtcclxuICAgIHJldHVybiB0aGlzLmF0TW9zdCgxLCBmbiwgY29udGV4dCk7XHJcbiAgfSxcclxuXHJcbiAgLyoqXHJcbiAgICogUmV0dXJucyBhIG5ldyBmdW5jdGlvbiB0aGF0IGlzIGV4ZWN1dGVkIGFsd2F5cyBwYXNzaW5nIHRoZSBnaXZlbiBhcmd1bWVudHMgdG8gaXQuXHJcbiAgICogUHl0aG9uLWZhc2hpb24uXHJcbiAgKi9cclxuICBwYXJ0aWFsKGZuKSB7XHJcbiAgICB2YXIgc2VsZiA9IHRoaXM7XHJcbiAgICB2YXIgYXJncyA9IHNlbGYudG9BcnJheShhcmd1bWVudHMpO1xyXG4gICAgYXJncy5zaGlmdCgpO1xyXG4gICAgcmV0dXJuIGZ1bmN0aW9uIHBhcnRpYWwoKSB7XHJcbiAgICAgIHZhciBiYXJncyA9IHNlbGYudG9BcnJheShhcmd1bWVudHMpO1xyXG4gICAgICByZXR1cm4gZm4uYXBwbHkoe30sIGFyZ3MuY29uY2F0KGJhcmdzKSk7XHJcbiAgICB9O1xyXG4gIH0sXHJcblxyXG4gIGNsb25lLFxyXG5cclxuICAvKipcclxuICAgKiBSZXR1cm5zIGEgbmV3IGZ1bmN0aW9uIHRoYXQgY2FuIGJlIGZpcmVkIG9ubHkgb25jZSBldmVyeSBuIG1pbGxpc2Vjb25kcy5cclxuICAgKiBUaGUgZnVuY3Rpb24gaXMgZmlyZWQgYWZ0ZXIgdGhlIHRpbWVvdXQsIGFuZCBhcyBsYXRlIGFzIHBvc3NpYmxlLlxyXG4gICAqXHJcbiAgICogQHBhcmFtIGZuOiBmdW5jdGlvblxyXG4gICAqIEBwYXJhbSBtczogbWlsbGlzZWNvbmRzXHJcbiAgICogQHBhcmFtIHthbnl9IGNvbnRleHQ6IGZ1bmN0aW9uIGNvbnRleHQuXHJcbiAgICovXHJcbiAgZGVib3VuY2UoZm4sIG1zLCBjb250ZXh0KSB7XHJcbiAgICB2YXIgaXQ7XHJcbiAgICBmdW5jdGlvbiBkKCkge1xyXG4gICAgICBpZiAoaXQpIHtcclxuICAgICAgICBjbGVhclRpbWVvdXQoaXQpO1xyXG4gICAgICB9XHJcbiAgICAgIHZhciBhcmdzID0gYXJndW1lbnRzLmxlbmd0aCA/IHRvQXJyYXkoYXJndW1lbnRzKSA6IHVuZGVmaW5lZDtcclxuICAgICAgaXQgPSBzZXRUaW1lb3V0KCgpID0+IHtcclxuICAgICAgICBpdCA9IG51bGw7XHJcbiAgICAgICAgZm4uYXBwbHkoY29udGV4dCwgYXJncyk7XHJcbiAgICAgIH0sIG1zKTtcclxuICAgIH1cclxuICAgIHJldHVybiBkO1xyXG4gIH0sXHJcblxyXG4gIC8qKlxyXG4gICAqIEVkaXRzIHRoZSBpdGVtcyBvZiBhbiBhcnJheSBieSB1c2luZyBhIGdpdmVuIGZ1bmN0aW9uLlxyXG4gICAqXHJcbiAgICogQHBhcmFtIHthcnJheX0gYTogYXJyYXkgb2YgaXRlbXMuXHJcbiAgICogQHBhcmFtIHtmdW5jdGlvbn0gZm46IGVkaXRpbmcgZnVuY3Rpb24uXHJcbiAgICovXHJcbiAgcmVhY2goYSwgZm4pIHtcclxuICAgIGlmICghaXNBcnJheShhKSkgdGhyb3cgbmV3IEVycm9yKFwiZXhwZWN0ZWQgYXJyYXlcIik7XHJcbiAgICB2YXIgaXRlbTtcclxuICAgIGZvciAodmFyIGkgPSAwLCBsID0gYS5sZW5ndGg7IGkgPCBsOyBpKyspIHtcclxuICAgICAgaXRlbSA9IGFbaV07XHJcbiAgICAgIGlmIChpc0FycmF5KGl0ZW0pKSB7XHJcbiAgICAgICAgdGhpcy5yZWFjaChpdGVtLCBmbik7XHJcbiAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgYVtpXSA9IGZuKGl0ZW0pO1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgICByZXR1cm4gYTtcclxuICB9LFxyXG5cclxuICAvKipcclxuICAgKiBSZXR1cm5zIGEgdmFsdWUgaW5kaWNhdGluZyB3aGV0aGVyIHRoZSBnaXZlbiBvYmplY3QgaW1wbGVtZW50cyBhbGwgZ2l2ZW4gbWV0aG9kcy5cclxuICAgKi9cclxuICBxdWFja3MobywgbWV0aG9kcykge1xyXG4gICAgaWYgKCFvKSByZXR1cm4gZmFsc2U7XHJcbiAgICBpZiAoIW1ldGhvZHMpIHRocm93IFwibWlzc2luZyBtZXRob2RzIGxpc3RcIjtcclxuICAgIGlmIChpc1N0cmluZyhtZXRob2RzKSkge1xyXG4gICAgICBtZXRob2RzID0gdG9BcnJheShhcmd1bWVudHMpLnNsaWNlKDEsIGFyZ3VtZW50cy5sZW5ndGgpO1xyXG4gICAgfVxyXG4gICAgZm9yICh2YXIgaSA9IDAsIGwgPSBtZXRob2RzLmxlbmd0aDsgaSA8IGw7IGkrKykge1xyXG4gICAgICBpZiAoIWlzRnVuY3Rpb24ob1ttZXRob2RzW2ldXSkpIHtcclxuICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgIH1cclxuICAgIH1cclxuICAgIHJldHVybiB0cnVlO1xyXG4gIH0sXHJcblxyXG4gIC8qKlxyXG4gICAqIFJlcGxhY2VzIHZhbHVlcyBpbiBzdHJpbmdzLCB1c2luZyBtdXN0YWNoZXMuXHJcbiAgICovXHJcbiAgZm9ybWF0KHMsIG8pIHtcclxuICAgIHJldHVybiBzLnJlcGxhY2UoL1xce1xceyguKz8pXFx9XFx9L2csIGZ1bmN0aW9uIChzLCBhKSB7XHJcbiAgICAgIGlmICghby5oYXNPd25Qcm9wZXJ0eShhKSlcclxuICAgICAgICByZXR1cm4gcztcclxuICAgICAgcmV0dXJuIG9bYV07XHJcbiAgICB9KTtcclxuICB9LFxyXG5cclxuICAvKipcclxuICAgKiBQcm94eSBmdW5jdGlvbiB0byBmbiBiaW5kLlxyXG4gICAqL1xyXG4gIGJpbmQoZm4sIG8pIHtcclxuICAgIHJldHVybiBmbi5iaW5kKG8pO1xyXG4gIH0sXHJcblxyXG4gIGlmY2FsbChmbiwgY3R4LCBhcmdzKSB7XHJcbiAgICBpZiAoIWZuKSByZXR1cm47XHJcbiAgICBpZiAoIWFyZ3MpIHtcclxuICAgICAgZm4uY2FsbChjdHgpO1xyXG4gICAgICByZXR1cm47XHJcbiAgICB9XHJcbiAgICBzd2l0Y2ggKGFyZ3MubGVuZ3RoKSB7XHJcbiAgICAgIGNhc2UgMDogZm4uY2FsbChjdHgpOyByZXR1cm47XHJcbiAgICAgIGNhc2UgMTogZm4uY2FsbChjdHgsIGFyZ3NbMF0pOyByZXR1cm47XHJcbiAgICAgIGNhc2UgMjogZm4uY2FsbChjdHgsIGFyZ3NbMF0sIGFyZ3NbMV0pOyByZXR1cm47XHJcbiAgICAgIGNhc2UgMzogZm4uY2FsbChjdHgsIGFyZ3NbMF0sIGFyZ3NbMV0sIGFyZ3NbMl0pOyByZXR1cm47XHJcbiAgICAgIGRlZmF1bHQ6IGZuLmFwcGx5KGN0eCwgYXJncyk7XHJcbiAgICB9XHJcbiAgfSxcclxuXHJcbiAgbGVuLFxyXG5cclxuICBuaWwodikge1xyXG4gICAgcmV0dXJuIHYgPT09IG51bGwgfHwgdiA9PT0gdW5kZWZpbmVkO1xyXG4gIH0sXHJcblxyXG4gIG5pbE9yRW1wdHkodikge1xyXG4gICAgcmV0dXJuIHYgPT09IG51bGwgfHwgdiA9PT0gdW5kZWZpbmVkIHx8IHYgPT09IFwiXCI7XHJcbiAgfVxyXG59O1xyXG4iLCIvKipcclxuICogRGF0YUVudHJ5IHdpdGggYnVpbHQtaW4gY29udGV4dCBjbGFzc2VzLlxyXG4gKiBodHRwczovL2dpdGh1Yi5jb20vUm9iZXJ0b1ByZXZhdG8vRGF0YUVudHJ5XHJcbiAqXHJcbiAqIENvcHlyaWdodCAyMDE5LCBSb2JlcnRvIFByZXZhdG9cclxuICogaHR0cHM6Ly9yb2JlcnRvcHJldmF0by5naXRodWIuaW9cclxuICpcclxuICogTGljZW5zZWQgdW5kZXIgdGhlIE1JVCBsaWNlbnNlOlxyXG4gKiBodHRwOi8vd3d3Lm9wZW5zb3VyY2Uub3JnL2xpY2Vuc2VzL01JVFxyXG4gKi9cclxuaW1wb3J0IERhdGFFbnRyeSBmcm9tIFwiLi4vY29kZS9zY3JpcHRzL2Zvcm1zL2RhdGFlbnRyeVwiXHJcbmltcG9ydCBWYWxpZGF0b3IgZnJvbSBcIi4uL2NvZGUvc2NyaXB0cy9mb3Jtcy92YWxpZGF0aW9uL3ZhbGlkYXRvclwiXHJcbmltcG9ydCBGb3JtYXR0ZXIgZnJvbSBcIi4uL2NvZGUvc2NyaXB0cy9mb3Jtcy9mb3JtYXR0aW5nL2Zvcm1hdHRlclwiXHJcbmltcG9ydCBDb250ZXh0SGFydmVzdGVyIGZyb20gXCIuLi9jb2RlL3NjcmlwdHMvZm9ybXMvaGFydmVzdGluZy9jb250ZXh0aGFydmVzdGVyXCJcclxuaW1wb3J0IENvbnRleHREZWNvcmF0b3IgZnJvbSBcIi4uL2NvZGUvc2NyaXB0cy9mb3Jtcy9kZWNvcmF0aW9uL2NvbnRleHRkZWNvcmF0b3JcIlxyXG5cclxuRGF0YUVudHJ5LmNvbmZpZ3VyZSh7XHJcbiAgbWFya2VyOiBDb250ZXh0RGVjb3JhdG9yLFxyXG4gIGhhcnZlc3RlcjogQ29udGV4dEhhcnZlc3RlclxyXG59KVxyXG5cclxuaWYgKHR5cGVvZiB3aW5kb3cgIT0gXCJ1bmRlZmluZWRcIikge1xyXG4gIHdpbmRvdy5EYXRhRW50cnkgPSB7XHJcbiAgICBEYXRhRW50cnk6IERhdGFFbnRyeSxcclxuICAgIFZhbGlkYXRvcjogVmFsaWRhdG9yLFxyXG4gICAgRm9ybWF0dGVyOiBGb3JtYXR0ZXIsXHJcbiAgICBDb250ZXh0SGFydmVzdGVyOiBDb250ZXh0SGFydmVzdGVyLFxyXG4gICAgQ29udGV4dERlY29yYXRvcjogQ29udGV4dERlY29yYXRvclxyXG4gIH07XHJcbn1cclxuXHJcbm1vZHVsZS5leHBvcnRzID0ge1xyXG4gIERhdGFFbnRyeSxcclxuICBWYWxpZGF0b3IsXHJcbiAgRm9ybWF0dGVyLFxyXG4gIENvbnRleHRIYXJ2ZXN0ZXIsXHJcbiAgQ29udGV4dERlY29yYXRvclxyXG59Il19
