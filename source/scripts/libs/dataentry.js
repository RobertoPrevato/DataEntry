/*!
 * DataEntry v1.0.1, forms validation library that implements Promise based validation of fields and forms,
 * automatic decoration of fields, localized error messages.
 * https://github.com/RobertoPrevato/DataEntry
 *
 * Copyright 2016, Roberto Prevato
 * http://ugrose.com
 *
 * Licensed under the MIT license:
 * http://www.opensource.org/licenses/MIT
 */
;(function(factory) {
  if (typeof module !== "undefined" && module.exports) {
    // Node/CommonJS
    module.exports = factory(this);
  } else if (typeof define === "function" && define.amd) {
    // AMD
    var global = this;
    define("dataentry", function(){ return factory(global);});
  } else {
    // Browser globals
    this.Forms = factory(this);
  }
}(function(global) {

  var Forms = {};
  Forms.Version = "1.0.1";

  /**
   * Raises an exception, offering a link to the GitHub wiki
   */
  var raise = function (err, detail) {
    throw "Error: " + err + (detail ? " `" + detail + "`" : "" ) + " https://github.com/RobertoPrevato/DataEntry/wiki/Errors#" + err;
  }

  if (!global["Promise"])
    raise(1);

  var I;
  //if I.js is defined; use it.
  //https://github.com/RobertoPrevato/I.js
  if (global["I"]) I = global.I;
  //if i18n is defined; use it.
  //https://github.com/fnando/i18n-js
  else if (global["I18n"]) I = global.I18n;
  else raise(2);

  var OBJECT = "object",
    STRING = "string",
    NUMBER = "number",
    FUNCTION = "function",
    LEN = "length",
    REP = "replace";
  
  var undefined, _schema_ = "schema";
  function isString(s) {
    return typeof s == STRING;
  }
  function isNumber(o) {
    return typeof o == NUMBER;
  }
  function isFunction(o) {
    return typeof o == FUNCTION;
  }
  function isObject(o) {
    return typeof o == OBJECT;
  }
  var isArray = function (o) {
    return o instanceof Array;
  };
  function isPlainObject(o) {
    return typeof o == OBJECT && o.constructor == Object;
  }
  function hasOwnProperty(o, n) {
    return o && o.hasOwnProperty(n);
  }
  function toUpper(s) {
    return s.toUpperCase();
  }
  function toLower(s) {
    return s.toLowerCase();
  }
  function first(a, fn) {
    for (var i = 0, l = a[LEN]; i < l; i++) {
      if (fn(a[i])) return a[i];
    }
  }
  function isElement(o){
    return (
      typeof HTMLElement === OBJECT ? o instanceof HTMLElement : //DOM2
      o && typeof o === OBJECT && o !== null && o.nodeType === 1 && typeof o.nodeName === STRING
    );
  }
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
  //utility functions
  Forms.Utils = {};

  //localize
  function localize(n, o) {
    return I.t(n, o);
  }
  function localizeError(n, o) {
    return I.t("errors." + n, o);
  }

  //string utility functions
  var S = Forms.Utils.String = {
    format: function (s) {
      var args = Array.prototype.slice.call(arguments, 1);
      return s[REP](/{(\d+)}/g, function (match, i) {
        return typeof args[i] != "undefined" ? args[i] : match;
      });
    },
    trim: function (s) {
      return isString(s) ? s[REP](/^[\s]+|[\s]+$/g, '') : s;
    },
    removeMultipleSpaces: function (s) {
      return isString(s) ? s[REP](/\s{2,}/g, ' ') : s;
    },
    removeLeadingSpaces: function (s) {
      return isString(s) ? s[REP](/^\s+|\s+$/, '') : s;
    },
    hyphenize: function (s) {
      if (!s) return "";
      while (/[A-Z]/.test(s))
        s = s[REP](/([a-z]?)([A-Z])/g, function (a, b, c) { return b + (b ? "-" : "") + c.toLowerCase(); });
      return s;
    }
  };
  //DOM operations
  function modClass(el, n, add) {
    if (n.search(/\s/) > -1) {
      n = n.split(/\s/g);
      for (var i = 0, l = n[LEN]; i < l; i ++) {
        modClass(el, n[i], add);
      }
    } else if (typeof n == STRING) {
      el.classList[add ? "add" : "remove"](n);
    }
    return el;
  }
  function addClass(el, n) {
    return modClass(el, n, 1);
  }
  function removeClass(el, n) {
    return modClass(el, n, 0);
  }
  function hasClass(el, n) {
    return el && el.classList.contains(n);
  }
  function attr(el, n) {
    return el.getAttribute(n);
  }
  function attrName(el) {
    return attr(el, "name");
  }
  function nameSelector(el) {
    return  "[name='" + attrName(el) + "']";
  }
  function setValue(el, v) {
    if (el.value != v) {
      el.value = v;
      el.dispatchEvent(new Event("change"), { forced: true });
    }
  }
  function getValue(el) {
    var isInput = /input/i.test(el.tagName);
    if (isInput) {
      switch (attr(el, "type")) {
        case "radio":
        case "checkbox":
          return el.checked;
      }
    }
    return el.value;
  }
  function isRadioButton(el) {
    return el && /^input$/i.test(el.tagName) && /^(radio)$/i.test(el.type);
  }
  function isSelectable(el) {
    return el && (/^select$/i.test(el.tagName) || isRadioButton(el));
  }
  function next(el) {
    return el.nextElementSibling;
  }
  function nextWithClass(el, n) {
    var a = el.nextElementSibling;
    return hasClass(a, n) ? a : undefined;
  }
  function prev(el) {
    return el.previousElementSibling;
  }
  function find(el, selector) {
    return el.querySelectorAll(selector);
  }
  function findFirst(el, selector) {
    return el.querySelectorAll(selector)[0];
  }
  function isHidden(el) {
    var style = window.getComputedStyle(el);
    return (style.display == "none" || style.visibility == "hidden");
  }
  function createElement(tag) {
    return document.createElement(tag);
  }
  function removeElement(a) {
    if (!a) return;
    a.parentElement.removeChild(a);
  }
  function after(a, b) {
    a.parentNode.insertBefore(b, a.nextSibling);
  }
  function append(a, b) {
    a.appendChild(b);
  }
  function toArray(a) {
    if (typeof a == OBJECT && a[LEN])
      return map(a, function (o) { return o; });
    return Array.prototype.slice.call(arguments);
  }
  function flatten(a) {
    if (isArray(a))
      return [].concat.apply([], map(a, flatten));
    return a;
  }
  function each(a, fn) {
    if (isPlainObject(a)) {
      for (var x in a)
        fn(a[x], x);
      return a;
    }
    if (!a || !a[LEN]) return a;
    for (var i = 0, l = a[LEN]; i < l; i++)
      fn(a[i], i);
  }
  function map(a, fn) {
    if (!a || !a[LEN]) return a;
    var b = [];
    for (var i = 0, l = a[LEN]; i < l; i++)
      b.push(fn(a[i]));
    return b;
  }
  function contains(a, o) {
    return a.indexOf(o) > -1;
  }
  function any(a, fn) {
    for (var i = 0, l = a[LEN]; i < l; i++) {
      if (fn(a[i]))
        return true;
    }
    return false;
  }
  function where(a, fn) {
    if (!a || !a.length) return [];
    var b = [];
    for (var i = 0, l = a[LEN]; i < l; i++) {
      if (fn(a[i]))
        b.push(a[i]);
    }
    return b;
  }
  function pick(o, arr, exclude) {
    var a = {};
    if (exclude) {
      for (var x in o) {
        if (arr.indexOf(x) == -1)
          a[x] = o[x];
      }
    } else {
      for (var i = 0, l = arr[LEN]; i < l; i++) {
        var p = arr[i];
        if (hasOwnProperty(o, p))
          a[p] = o[p];
      }
    }
    return a;
  }
  function extend() {
    var args = arguments;
    if (!args[LEN]) return;
    if (args[LEN] == 1) return args[0];
    var a = args[0], b, x;
    for (var i = 1, l = args[LEN]; i < l; i++) {
      b = args[i];
      if (!b) continue;
      for (x in b) {
        a[x] = b[x];
      }
    }
    return a;
  }
  function wrap(fn, callback, context) {
    var wrapper = function () {
      return callback.apply(this, [fn].concat(toArray(arguments)));
    };
    wrapper.bind(context || this);
    return wrapper;
  }
  function unwrap(o) {
    return isFunction(o) ? unwrap(o()) : o;
  }
  function defer(fn) {
    setTimeout(fn, 0);
  }
  //end of utility functions

  //
  // Harvesters are value getters that implement a common interface with a function: getValues; which returns the form values in form of dictionary
  //
  var Harvesting = Forms.Harvesting = {};

  /**
   * Creates an instance of DomHarvester: an harvester that gets values from input elements by their name property; matching the name in model schema and html name attributes.
   * @type {Function}
   */
  var DomHarvester = Harvesting.DomHarvester = function (dataentry) {
    return this.initialize(dataentry);
  };
  extend(DomHarvester.prototype, {

    /**
     * Applies initialization logic to this DomHarvester.
     * @param dataentry
     * @returns {DomHarvester}
     */
    initialize: function (dataentry) {
      var self = this;
      self.dataentry = dataentry;
      self.element = dataentry.element;
      return self;
    },

    /**
     * Disposes of this DomHarvester.
     */
    dispose: function () {
      var self = this;
      self.dataentry = self.element = null;
      return self;
    },

    /**
     * Gets all the values for the prope
     * @returns {*}
     */
    getValues: function () {
      var self = this;
      //base function that returns values from this form
      //override it for other implementations in derived classes of Form.BaseView or in specific views
      return self.getValuesFromElement(self.element);
    },

    /**
     * Gets all the values from all input with a specified name, in form of key-value pair dictionary.
     * Elements with class 'ug-silent' are discarded.
     * @param el
     * @returns {{}}
     */
    getValuesFromElement: function (el) {
      var o = {}, self = this;
      if (!el) el = self.element;
      //get all inputs
      var inputs = find(el, "input,select,textarea");
      for (var i = 0, l = inputs[LEN]; i < l; i++) {
        var input = inputs[i], name = attrName(input);
        if (name && !self.isSilent(input)) {
          o[name] = self.getValueFromElement(input);
        }
      }
      return o;
    },

    /**
     * Returns a value indicating whether an element should be discarded from value harvesting, or not.
     * @param el
     * @returns {*}
     */
    isSilent: function (el) {
      return hasClass(el, "ug-silent");
    },

    /**
     * Gets a value from an element.
     * @param input
     * @returns {*}
     */
    getValueFromElement: function (input) {
      if (isNumber(input[LEN]) && !isElement(input)) {
        if (!input[LEN]) return;
        if (input[LEN] > 1) {
          if (isRadioButton(input[0])) {
            var checked = first(input, function (o) {
              return o.checked;
            });
            return checked ? checked.value : undefined;
          } else {
            var v = [];
            each(input, function (o) {
              v.push(getValue(o));
            });
            return v;
          }
        }
        input = input[0];
      }
      var self = this, name = attrName(input);
      if (name && !self.isSilent(input)) {
        return getValue(input);
      }
    },

    /**
     * Gets a value from a given field, eventually looking for the first element with the given name.
     * @param name
     * @param field
     * @returns {*}
     */
    getFieldValue: function (name, field) {
      if (!name) raise(12);
      return this.getValueFromElement(field ? field : find(this.element, '[name="' + name + '"]'));
    }
  });

  /**
   * Creates an instance of ContextHarvester: an harvester that gets values from an object, matching the name in model schema with a property on a given context.
   * @type {Function}
   */
  var ContextHarvester = Harvesting.ContextHarvester = function (dataentry) {
    return this.initialize(dataentry);
  };
  extend(ContextHarvester.prototype, {
    /**
     * Applies initialization logic to this ContextHarvester.
     * @param dataentry
     * @returns {ContextHarvester}
     */
    initialize: function (dataentry) {
      if (!dataentry.context || !dataentry.context.dataentryObjectGetter)
        raise(15);
      var self = this;
      self.dataentry = dataentry;
      return self;
    },

    /**
     * Disposes of this ContextHarvester.
     */
    dispose: function () {
      var self = this;
      self.dataentry = self.element = null;
      return self;
    },

    /**
     * Gets the values from the context.
     * @returns {*}
     */
    getValues: function () {
      //base function that returns values from this context
      return this.getValuesFromContext(this.getContext());
    },

    /**
     * Gets the object from which values should be read.
     * @returns {*}
     */
    //returns the object from which to read the values
    getContext: function () {
      var ctx = this.dataentry.context.dataentryObjectGetter();
      return unwrap(ctx);
    },

    /**
     * Gets all values from the context.
     * @param context
     * @returns {{}}
     */
    getValuesFromContext: function (context) {
      var o = {}, schema = this.dataentry.schema, x;
      for (x in schema) {
        if (hasOwnProperty(context, x)) {
          var val = unwrap(context[x]);
          o[x] = val;
        }
      }
      return o;
    },

    /**
     * Gets the value for the property with the given name.
     * @param name
     * @returns {*}
     */
    getFieldValue: function (name) {
      var context = this.getContext();
      if (hasOwnProperty(context, name))
        return unwrap(context[name])
      return null;
    }
  });

  //
  // Marking of fields valid, invalid, touched
  //
  var Marking = Forms.Marking = {};
  
  //support for chosen js when marking fields invalid or valid
  function checkChosen(element) {
    //fix for chosen selects
    if (!element) return;
    if (/select/i.test(element.tagName) && isHidden(element) && hasClass(element, "chosen-select")) {
      //replace the element with the chosen element
      return next(element);
    }
    return element;
  }
  //when a field relates to a group, then it make sense to display information only on the first element of the group.
  //a common case for this situation are radio buttons: if a value coming from a group of radio buttons is required,
  //then it makes sense to display information only on the first one
  function checkGroup(element) {
    if (isRadioButton(element)) {
      //return only the first radio that appears in the DOM
      return find(this.dataentry.element, nameSelector(element))[0];
    }
    return element;
  }
  function checkElement(element) {
    var re = checkGroup.call(this, element);
    re = checkChosen.call(this, re);
    return re;
  }

  var markingUtils = Marking.Utils = {
    checkElement: checkElement,

    checkGroup: checkGroup,

    checkChosen: checkChosen,
  };

  function getDataentryElement(o) {
    return o instanceof DataEntry ? o.element : o.dataentry.element;
  }

  /**
   * Creates an instance of DOM marker: the simplest marker possible, displaying information by injecting or removing
   * simple elements inside the DOM
   * @type {Function}
   */
  var DomMarker = Marking.DomMarker = function (dataentry) {
    return this.initialize(dataentry);
  };
  extend(DomMarker.prototype, markingUtils, {

    /**
     * Applies initialization logic to this DomMarker
     * @param dataentry
     * @returns {DomMarker}
     */
    initialize: function (dataentry) {
      this.dataentry = dataentry;
      this.markStyle = dataentry.options.markStyle;
      return this;
    },

    /**
     * Disposes of this DomMarker
     * @returns {DomMarker}
     */
    dispose: function () {
      this.dataentry = null;
      return this;
    },

    /**
     * Gets an element to display validation information about the given field.
     * @param f
     * @param create
     * @returns {*}
     */
    getMessageElement: function (f, create) {
      var self = this;
      if (self.markStyle == "tooltips") {
        var c = "ug-validation-wrapper",
          l = nextWithClass(f, c);
        if (l)
          return l;
        return create ? self.getTooltipElement(f, create) : null;
      }
      var c = "ug-message-element",
        l = nextWithClass(f, c);
      if (l)
        return l;
      if (!create)
        return null;
      l = createElement("span");
      addClass(l, c);
      return l;
    },

    /**
     * Gets the options to display a message on the given field.
     * @param f
     * @returns {*}
     */
    getOptions: function (f) {
      var fs = this.dataentry.schema[f.name],
        defaults = this.defaults,
        messageOptions = fs ? fs.message : "right";
      if (isString(messageOptions))
        messageOptions = { position: messageOptions };
      return extend({}, defaults, messageOptions);
    },

    /**
     * The defaults parameters to display a message element.
     */
    defaults: {
      position: "right"
    },

    /**
     * Gets an element that can be styled as tooltip
     * @param f
     * @param create
     * @returns {*}
     */
    getTooltipElement: function (f, create) {
      var divtag = "div",
        o = this.getOptions(f);
        wrapper = createElement(divtag),
        tooltip = createElement(divtag),
        arrow = createElement(divtag),
        p = createElement("p");
      addClass(wrapper, "ug-validation-wrapper");
      addClass(tooltip, "tooltip validation-tooltip in " + o.position);
      addClass(arrow, "tooltip-arrow");
      addClass(p, "tooltip-inner");
      append(wrapper, tooltip);
      append(tooltip, arrow);
      append(tooltip, p);
      return wrapper;
    },

    /**
     * Sets the text to display in the marker element.
     * @param marker element
     * @param message
     */
    setElementText: function (el, message) {
      var textContent = "textContent";
      if (this.markStyle == "tooltips") {
        findFirst(el, ".tooltip-inner")[textContent] = message;
        return;
      }
      el[textContent] = message;
    },

    /**
     * Removes the element used to display information for the given field.
     * @param f
     * @returns {DomMarker}
     */
    removeMessageElement: function (f) {
      var self = this;
      self.checkElement.call(self, f);
      var l = self.getMessageElement(f, false);
      if (l)
        removeElement(l);
      return self;
    },

    /**
     * Marks the field in neuter state (no success/no error)
     * @param f
     * @returns {DomMarker|*}
     */
    markFieldNeutrum: function (f) {
      var self = this;
      f = checkElement.call(self, f);
      removeClass(f, "ug-field-invalid ug-field-valid");
      return self.removeMessageElement(f);
    },

    /**
     * Marks the given field in valid state
     * @param f
     * @returns {DomMarker|*}
     */
    markFieldValid: function (f) {
      var self = this;
      f = checkElement.call(self, f);
      addClass(removeClass(f, "ug-field-invalid"), "ug-field-valid");
      return self.removeMessageElement(f);
    },

    /**
     * Displays information about the given field
     * @param f
     * @param options
     * @returns {DomMarker}
     */
    markFieldInfo: function (f, options) {
      var self = this;
      f = checkElement.call(self, f);
      var l = self.getMessageElement(f, true);
      self.setElementText(addClass(l, "ug-info"), options.message);
      after(f, l);
      return self;
    },

    /**
     * Marks the given field in invalid state
     * @param f
     * @param options
     * @returns {DomMarker}
     */
    markFieldInvalid: function (f, options) {
      var self = this;
      f = checkElement.call(self, f);
      var l = self.getMessageElement(f, true);
      self.setElementText(addClass(l, "ug-error"), options.message);
      after(f, l);
      return self;
    },

    /**
     * Marks the given field as `touched` by the user
     * @param f
     * @returns {DomMarker}
     */
    markFieldTouched: function (f) {
      f = checkElement.call(this, f);
      addClass(f, "ug-touched");
      return this;
    },

    /**
     * Removes all the marker elements
     */
    removeElements: function () {
      var selector = this.markStyle == "tooltips"
        ? ".ug-validation-wrapper"
        : ".ug-message-element";
      each(find(this.dataentry.element, selector), removeElement);
      return this;
    }
    
  });

  //
  // Formatting rules and functions
  //
  var Formatting = Forms.Formatting = {

    SetValue: setValue,

    //formatting rules to apply on blur, after successful validation
    Rules: {
      trim: {
        fn: function (field, value) {
          var rx = /^[\s]+|[\s]+$/g;
          if (value.match(rx)) {
            setValue(field, value[REP](rx, ""));
          }
        }
      },

      removeSpaces: {
        fn: function (field, value) {
          var rx = /\s/g;
          if (value.match(rx)) {
            setValue(field, value[REP](rx, ""));
          }
        }
      },

      removeMultipleSpaces: {
        fn: function (field, value) {
          var rx = /\s{2,}/g;
          if (value.match(rx)) {
            setValue(field, value[REP](rx, " "));
          }
        }
      },

      cleanSpaces: {
        fn: function (field, value) {
          if (!value) return;
          var v = S.trim(S.removeMultipleSpaces(value));
          if (v != value) {
            setValue(field, v);
          }
        }
      },

      integer: {
        fn: function (field, value) {
          if (!value) return;
          //remove leading zeros
          if (/^0+/.test(value))
            setValue(field, value[REP](/^0+/, ""));
        }
      }
    },
    //formatting rules to apply on focus, before editing a value
    PreRules: {
      integer: {
        fn: function (field, value) {
          if (/^0+$/.test(value))
            //if the value consists of only zeros, empty automatically the field (some users get confused when imputting numbers in a field with 0)
            setValue(field, "");
        }
      }
    }
  };
  
  /**
   * Creates an instance of formatter
   * @type {Function}
   */
  var Formatter = Forms.Formatting.Formatter = function (dataentry) {
    return this.initialize(dataentry);
  };
  extend(Formatter.prototype, {

    /**
     * Applies initialization logic to this formatter
     */
    initialize: function (dataentry) {
      var rules = Formatting.Rules, self = this;
      self.rules = rules
      self.dataentry = dataentry;
      self.marker = dataentry.marker;
      return self;
    },

    /**
     * Disposes of this formatter.
     */
    dispose: function () {
      var self = this;
      self.rules = self.dataentry = self.marker = null;
      return self;
    },

    /**
     * Applies formatting rules on the given field.
     * @param rules
     * @param view
     * @param field
     * @param value
     * @returns {Formatter}
     */
    format: function (rules, view, field, value, params) {
      var self = this;
      if (isString(rules)) {
        var name = rules;
        if (self.rules[name])
          self.rules[name].fn.call(view, field, value, params);
        else
          raise(4, name);
        return self;
      }
      for (var i = 0, l = rules[LEN]; i < l; i++) {
        var a = normalizeRule(rules[i], 16);
        self.format(a.name, view, field, value, a.params);
      }
      return self;
    },

    /**
     * Default function to mark a field as formatted.
     * @param el
     * @param text
     * @returns {Formatter}
     */
    markFieldFormatted: function (el, text) {
      this.marker.markFieldInfo(el, text);
      return this;
    }
    
  });

  //keys or keys combinations that should be always allowed
  var permittedCharacters = function (e, c) {
    //characters or characters combination always permitted
    if (contains([8, 0, 37, 39, 9], c) || (e.ctrlKey && contains([120, 118, 99, 97, 88, 86, 67], c))) return true;
    return false;
  }

  var stringFromCode = function (c) {
    return String.fromCharCode(c);
  }
  function match(s, rx) {
    return s.match(rx);
  }
  //returns the value that a field will have, if the given keypress event goes through
  function foreseeValue(e) {
    var a = "selectionStart",
      b = "selectionEnd",
      element = e.target,
      value = element.value,
      c = e.keyCode || e.charCode,
      key = String.fromCharCode(c),
      selected = value.substr(element[a], element[b]),
      beforeSelection = value.substr(0, element[a]),
      afterSelection = value.substr(element[b], value.length);
    return [beforeSelection, key, afterSelection].join("");
  }

  //constraints: rules to disallows certain inputs
  var Constraints = Forms.Constraints = {

    PermittedCharacters: permittedCharacters,

    StringFromCode: stringFromCode,

    ForeseeValue: foreseeValue,

    //allows to input only numbers
    integer: function (e, c) {
      var c = (e.keyCode || e.charCode), key = stringFromCode(c);
      if (!permittedCharacters(e, c) && !match(key, /[0-9]/)) return false;
      return true;
    },

    //allows to input only letters
    letters: function (e, c) {
      var c = (e.keyCode || e.charCode), key = stringFromCode(c);
      if (!permittedCharacters(e, c) && !match(key, /[a-zA-Z]/)) return false;
      return true;
    },

    digits: function (e, c) {
      var c = (e.keyCode || e.charCode), key = stringFromCode(c);
      if (!permittedCharacters(e, c) && !match(key, /\d/)) return false;
      return true;
    }

  };

  //base validation rules
  function getError(message, args) {
    return {
      error: true,
      message: message,
      field: args[0],
      params: args
    };
  };

  //validation
  Forms.Validation = {

    GetError: getError,

    LocalizeError: localizeError,

    //basic validation rules
    Rules: {

      none: {
        fn: function () {
          return true;
        }
      },

      noSpaces: {
        fn: function (field, value, forced) {
          if (!value) return true;
          if (value.match(/\s/)) 
            return getError(localizeError("spacesInValue"), arguments);
          return true;
        }
      },

      remote: {
        deferred: true,
        fn: function (field, value, forced, promiseProvider) {
          if (!promiseProvider)
            raise(7);
          return promiseProvider.apply(field, arguments);
        }
      },

      required: {
        fn: function (field, value, forced, params) {
          if (isString(params))
            params = { message: params };
          var defaults = { message: localizeError(isSelectable(field) ? "selectValue" : "emptyValue") },
            o = extend(defaults, params);
          
          if (isRadioButton(field)) {
            //any radio button within the same group must be selected
            var group = find(this.element, nameSelector(field));
            if (any(group, function (o) { return o.checked; }))
              return true;
            else
              return getError(o.message, arguments);
          }

          if (!value || !!value.toString().match(/^\s+$/))
            return getError(o.message, arguments);
          return true;
        }
      },

      integer: {
        fn: function (field, value, forced, options) {
          if (!value) return true;
          if (!/^\d+$/.test(value))
            return getError(localizeError("notInteger"), arguments);
          if (options) {
            var intVal = parseInt(value);
            if (isNumber(options.min) && intVal < options.min)
              return getError(localizeError("minValue", options), arguments);
            if (isNumber(options.max) && intVal > options.max)
              return getError(localizeError("maxValue", options), arguments);
          }
          return true;
        }
      },

      letters: {
        fn: function (field, value, forced) {
          if (!value) return true;
          if (!/^[a-zA-Z]+$/.test(value))
            return getError(localizeError("canContainOnlyLetters"), arguments);
          return true;
        }
      },

      digits: {
        fn: function (field, value, forced) {
          if (!value) return true;
          if (!/^\d+$/.test(value))
            return getError(localizeError("canContainOnlyDigits"), arguments);
          return true;
        }
      },

      maxLength: {
        fn: function (field, value, forced, limit) {
          if (!value) return true;
          if (value[LEN] > limit)
            return getError(localizeError("maxLength", { length: limit }), arguments);
          return true;
        }
      },

      minLength: {
        fn: function (field, value, forced, limit) {
          if (!value) return true;
          if (value[LEN] < limit)
            return getError(localizeError("minLength", { length: limit }), arguments);
          return true;
        }
      },

      mustCheck: {
        fn: function (field, value, forced, limit) {
          if (!field.checked)
            return getError(localizeError("mustBeChecked"), arguments);
          return true;
        }
      }
    }
  };

  /**
   * Creates an instance of Validator.
   * @type {Function}
   */
  var Validator = Forms.Validation.Validator = function (dataentry) {
    return this.initialize(dataentry);
  };

  extend(Validator.prototype, {
    /**
     * The normal event that triggers validation.
     */
    ev: "blur",

    /**
     * Default options that get merged into the options property.
     */
    defaults: {
      invalidClass: "ug-field-invalid",
      message: localizeError("invalidValue"),
      params: []
    },

    /**
     * Applies initialization logic to this validator.
     * @param options
     */
    initialize: function (dataentry) {
      var self = this;
      var rules = Forms.Validation.Rules;
      self.rules = rules;
      self.dataentry = dataentry;
      //set the context of validation functions
      self.context = dataentry;
      //set marker
      self.marker = dataentry.marker;
      return self;
    },

    /**
     * Disposes of this validator.
     */
    dispose: function () {
      var self = this;
      self.marker =
      self.rules =
      self.options =
      self.context =
      self.dataentry = null;
      return self;
    },
  
    /**
     * Ensures that a validation rule is defined inside this validator.
     * @param name
     */
    checkValidator: function (name) {
      if (!this.rules[name]) {
        raise(3, name);
      }
    },

    /**
     * Gets a single validation rule.
     * @param o
     * @returns {*}
     */
    getValidator: function (o) {
      var self = this, defaults = self.defaults, rules = self.rules;
      if (isString(o)) {
        self.checkValidator(o);
        return extend({ name: o }, defaults, rules[o]);
      }
      if (isPlainObject(o)) {
        if (!o.name)
          raise(6);
        self.checkValidator(o.name);
        return extend({}, defaults, o, rules[o.name]);
      }
      //invalid validator definition
      raise(14);
    },
  
    /**
     * Get full validators rules by names
     * this is implemented to permit the definition of validation by string names
     * @param a
     * @returns {{direct: Array, deferred: Array}}
     */
    getValidators: function (a) {
      //get validators by name, accepts an array of names
      var v = { direct: [], deferred: [] }, t = this;
      each(a, function (val) {
        var validator = t.getValidator(val);
        if (validator.deferred) {
          v.deferred.push(validator);
        } else {
          v.direct.push(validator);
        }
      });
      return v;
    },
  
    /**
     * Validate asynchrounously, applying the given validation rules.
     * first argument is an array of validation rules to apply (array items can be string or objects)
     */
    validate: function (rules, field, val, forced) {
      //field is an element, val its value
      //returns a full validation queue, by name
      var queue = this.getValidationChain(rules);
      return this.chain(queue, field, val, forced);
    },
  
    /**
     * Gets a chain of promise objects, of validation rules to be applied.
     * @param fieldName
     * @returns {Array}
     */
    getValidationChain: function (a) {
      var v = this.getValidators(a), chain = [], self = this;
      //client side validation first
      each(v.direct, function (validator) {
        validator.fn = self.makeValidatorDeferred(validator.fn);
        chain.push(validator);
      });
      //deferreds later
      each(v.deferred, function (validator) {
        chain.push(validator);
      });
      return chain;
    },
  
    /**
     * Makes a synchronous function asynchrounous,
     * to treat all validation functions as promises.
     * @param f
     * @returns {*}
     */
    makeValidatorDeferred: function (f) {
      var validator = this;
      return wrap(f, function (func) {
        var args = toArray(arguments);
        return new Promise(function (resolve, reject) {
          var result = func.apply(validator.context, args.slice(1, args[LEN]));
          //NB: using Native Promise, we don't want to treat a common scenario like an invalid field as a rejection
          resolve(result);
        });
      });
    },
  
    /**
     * Executes a series of deferred that need to be executed one after the other.
     * returns a deferred object that completes when every single deferred completes, or at the first that fails.
     * @param queue
     * @returns {Window.Promise}
     */
    chain: function (queue) {
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
          if (!data.field) {
            data.field = this;
          }
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
            queue[i].fn.apply(validator.context, args.concat(queue[i].params)).then(success, failure);
          }
        }
        queue[i].fn.apply(validator.context, args.concat(queue[i].params)).then(success, failure);
      });
    }

  });

  /**
   * Creates an instance of DataEntry.
   * @type {Function}
   */
  var DataEntry = Forms.DataEntry = function (options) {
    if (!options) raise(8);//missing options
    if (!options.element) raise(8);//missing element
    if (!options[_schema_]) raise(8);//missing schema
    var self = this, baseProperties = self.baseProperties;
    extend(self, pick(options, self.baseProperties));
    self.options = extend({}, self.defaults, pick(options, self.baseProperties, 1));
    return self.initialize(options);
  };
  
  extend(DataEntry.prototype, {

    /**
     * Default options, that get merged into the instance options.
     */
    defaults: {
      //whether to allow implicit constraints by match with validator names, or not
      allowImplicitConstraints: true,

      //whether to allow implicit formatting by match with validator names, or not
      allowImplicitFormat: true,

      //the type of elements that should be generated to display information over fields
      markStyle: "tooltips"
    },

    /**
     * Base properties, that get merged into the instance, if passed as options.
     */
    baseProperties: ["element", "schema", "context", "events"],

    /**
     * Applies initialization logic on this dataentry
     * @param options
     * @returns {DataEntry}
     */
    initialize: function (options) {
      var self = this;
      //initialize harvester, validator and formatter
      self.marker = new self.markerType(self);
      self.harvester = new self.harvesterType(self);
      self.validator = new self.validatorType(self);
      self.formatter = new self.formatterType(self);
      //bag for validation functions
      self.fn = {};
      //array of registered event handlers
      self.handlers = [];
      //apply automatic event handlers if this.element is defined
      self.bindEvents().checkElement();
      addClass(self.element, "ug-dataentry");
      return self;
    },

    /**
     * Disposes of this dataentry.
     */
    dispose: function () {
      var self = this;
      self.removeValidation().undelegateEvents();
      each(["validator", "formatter", "harvester", "marker"], function (n) {
        self[n].dispose();
        self[n] = null;
      });
      self.fn = self.element = null;
      return self;
    },

    /**
     * Reference to string utility
     */
    string: S,

    /**
     * The type of harvester to use to collect values.
     */
    harvesterType: DomHarvester,

    /**
     * The type of marker to use when decorating fields.
     */
    markerType: DomMarker,

    /**
     * The type of validator to use when validating fields and values.
     */
    validatorType: Validator,

    /**
     * The type of formatter to use when formatting values.
     */
    formatterType: Formatter,

    /**
     * Validates the fields defined in the schema of this DataEntry; or specific fields by name.
     * @param fields
     * @param options
     * @returns {Window.Promise}
     */
    validate: function (fields, options) {
      var self = this;
      if (fields && isFunction(fields)) fields = fields.call(self);
      if (fields && !isArray(fields)) raise(9);// invalid parameter: fields must be an array of strings
      //if this context has no element, throw exception
      if (!self.element) raise(10);
      //if this context has no schema, throw exception
      var schema = self[_schema_];
      if (!schema) raise(11);
      var context = self.context || self;

      return new Promise(function (resolve, reject) {
        var chain = [];
        for (var x in schema) {
          if (fields && !contains(fields, x)) continue;
          chain.push(self.validateField(x, options));
        }
        Promise.all(chain).then(function (a) {
          var data = flatten(a);
          var errors = where(data, function (o) { return o && o.error; });
          if (errors[LEN]) {
            //focus the first invalid field
            errors[0].field.focus();
            //resolve with failur value
            resolve.call(context, {
              valid: false,
              errors: errors
            });
          } else {
            //all the validation rules returned success
            resolve.call(context, {
              valid: true,
              values: self.harvester.getValues()
            });
          }
        }, function (data) {
          //an exception happen while performing validation; reject the promise
          reject.apply(context, [data]);
        });
      });
    },

    /**
     * Validates one or more fields, by a single name
     * it returns a deferred that completes when validation completes for each field with the given name
     * @param fieldName
     * @param options
     * @returns {Window.Promise}
     */
    validateField: function (fieldName, options) {
      //set options with default values
      options = extend({
        elements: null,
        decorateField: true,
        onlyTouched: false
      }, options || {});
      var self = this, schema = self[_schema_];
      if (!fieldName)
        raise(12);
      if (!schema)
        raise(11);
      if (!schema[fieldName] || !schema[fieldName].validation)
        //Cannot validate field because the schema object does not contain its definition or its validation definition
        raise(13, fieldName);

      var fields = options.elements ? options.elements : find(self.element, "[name='" + fieldName + "']");
      if (options.onlyTouched) {
        fields = where(fields, function (o) {
          return hasClass(o, "ug-touched");
        });
      }
      if (!fields[LEN]) return;

      var validator = self.validator,
        marker = validator.marker,
        fieldSchema = schema[fieldName],
        validation = self.getFieldValidationDefinition(fieldSchema.validation),
        chain = [];

      each(fields, function (field) {
        var value = self.getFieldValue(fieldName, field);

        if (options.decorateField) {
          //mark field neutrum before validation
          marker.markFieldNeutrum(field);
        }
        var p;
        if (options.decorateField) {
          p = validator.validate(validation, field, value).then(function (data) {
            //the validation process succeeded (didn't produce any exception)
            //but this doesn't mean that the field is valid:
            for (var j = 0, q = data[LEN]; j < q; j++) {
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
      //NB: the chain can contain more than one element, when a fieldset contains multiple elements with the same name
      //(which is proper HTML and relatively common scenario)
      return new Promise(function (resolve, reject) {
        Promise.all(chain).then(function () {
          resolve(toArray(arguments));
        });
      });
    },

    /**
     * Gets an array of validations to apply on a field
     * it supports the use of arrays or functions, which return arrays.
     * @param schema
     * @returns {*}
     */
    getFieldValidationDefinition: function (schema) {
      return isFunction(schema) ? schema.apply(this.context || this, []) : schema;
    },

    /**
     * Gets the value from the field with the given name.
     * @param name
     * @param field
     * @returns {*}
     */
    getFieldValue: function (name, field) {
      //to not be confused with the harvester get field value: the dataentry is checking if a specific getter function is defined inside the field schema
      var fieldSchema = this[_schema_][name];
      return fieldSchema.valueGetter ? fieldSchema.valueGetter.call(this.context, field) : this.harvester.getFieldValue(name, field);
    },

    /**
     * Binds all events for the validation logic.
     * @returns {Forms.DataEntry}
     */
    bindEvents: function () {
      return this.delegateEvents();
    },

    /**
     * Sets all event listeners as delegated events on this dataentry element.
     * @returns {Forms.DataEntry}
     */
    delegateEvents: function () {
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
    },

    /**
     * Sets a delegate event listener.
     * @param element
     * @param eventName
     * @param selector
     * @param method
     * @returns {Forms.DataEntry}
     */
    setEventListener: function (element, type, selector, callback) {
      var listener = function(e) {
        var m = e.currentTarget;
        var targets = find(element, selector);
        if (any(targets, function (o) { return e.target === o; })) {
          var re = callback(e);
          if (re === false) {
            e.preventDefault();
          }
          return re;
        }
      };
      this.handlers.push({
        type: type,
        fn: listener
      });
      element.addEventListener(type, listener, true);
      return this;
    },

    /**
     * Removes all event handlers associated with the dataentry element.
     * @returns {Forms.DataEntry}
     */
    undelegateEvents: function () {
      var self = this, element = self.element;
      each(self.handlers, function (o) {
        element.removeEventListener(o.type, o.fn, true);
      });
      self.handlers = [];
      return self;
    },

    /**
     * If the bound element is a form, prevents its submission by default
     * @returns {Forms.DataEntry}
     */
    checkElement: function () {
      var self = this, element = self.element;
      if (element && /form/i.test(element.tagName))
        element.addEventListener("submit", function (e) {
          e.preventDefault();
        });
      return self;
    },

    /**
     * Generates a dynamic definition of events to bind to the dataentry element
     * @returns {events|*|{}}
     */
    getEvents: function () {
      var self = this, events = self.events || {};
      if (isFunction(events)) events = events.call(self);
      //extends events object with validation events
      events = extend({}, events,
      self.getValidationDefinition(),
      self.getPreFormattingDefinition(),
      self.getMetaEvents(),
      self.getConstraintsDefinition());
      return events;
    },

    /**
     * Gets an "events" object that describes on blur validation events for all input inside the given element
     * which appears inside the schema of this object
     * @returns {}
     */
    getValidationDefinition: function () {
      var self = this, schema = self[_schema_], marker = self.marker;
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

          var fieldSchema = self[_schema_][name], validation = self.getFieldValidationDefinition(fieldSchema.validation);
          var value = self.getFieldValue(name, f);

          //I can easily pass the whole context as parameter, if needed
          self.validator.validate(validation, f, value, forced).then(function done(data) {
            //the validation process succeeded (didn't produce any exception)
            //but this doesn't mean that the field is valid
            var error = first(data, function(o) { return o.error; });
            if (error) {
              marker.markFieldInvalid(f, {
                message: error.message
              });
            } else {
              //mark the field valid
              marker.markFieldValid(f);
              //apply formatters if applicable
              var name = attr(f, "name"), format = self[_schema_][name].format;
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
    },

    /**
     * Gets an "events" object that describes on focus pre formatting events for all input inside the given element
     * @returns {}
     */
    getPreFormattingDefinition: function () {
      var self = this, schema = self[_schema_];
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
    },

    /**
     * Gets formatting rules to be applied upon focus, for a field.
     * @param x
     * @returns {*}
     */
    getFieldPreformatRules: function (x) {
      var self = this, fieldSchema = self[_schema_][x];
      if (!fieldSchema) return [];
      var preformat = fieldSchema.preformat;
      if (!preformat && self.options.allowImplicitFormat && !isFunction(fieldSchema.validation)) {
        preformat = [];
        var validation = self.getFieldValidationDefinition(fieldSchema.validation);
        for (var i = 0, l = validation[LEN]; i < l; i++) {
          var n = validation[i].name || validation[i];
          if (Forms.Formatting.PreRules[n])
            preformat.push(n);
        }
      }
      return preformat;
    },

    /**
     * Returns events definitions that are used for contextual information for the dataentry.
     * @returns {{keypress input,select,textarea: Function, keydown input,select,textarea: Function, change select: Function, change input[type='checkbox']: Function}}
     */
    getMetaEvents: function () {
      var activationCallback = function (e) {
        //add a class to the element
        this.formatter.marker.markFieldTouched(e.target);
        //activate validation after keypress
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
        if (hasOwnProperty(self[_schema_], name)) {
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
    },

    /**
     * Auto binds format functions based on names of validators, if the view is instantiated
     * with an option strictFormat true, or if the format was already bound, this function does nothing
     * @returns {Forms.DataEntry}
     */
    autobindFormat: function () {
      var self = this, schema = self[_schema_], options = self.options;
      if (!schema || options.strictFormat || options.formatBound)
        return;

      for (var x in schema) {
        var ox = schema[x];
        if (!ox.format) {
          ox.format = [];
        }
        var format = ox.format, validation = ox.validation;
        if (validation) {
          var validation = validation;
          if (isFunction(validation)) {
            //auto binding of format when validation schema is defined as a function
            //is not implemented yet, so continue
            //it is still possible to specify the format
            continue;
          }

          for (var i = 0, l = validation[LEN]; i < l; i++) {
            //by definition validator entries can be string or objects with name property
            var validatorName = isString(validation[i]) ? validation[i] : validation[i].name;
            if (hasOwnProperty(self.formatter.rules, validatorName) && !contains(format, validatorName)) {
              format.push(validatorName);
            }
          }
        }
      }
      self.options.formatBound = true;
      return self;
    },

    /**
     * Gets an "events" object that describes on keypress constraints for all input inside the given element
     * @returns {}
     */
    getConstraintsDefinition: function () {
      var self = this, schema = self[_schema_];
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
    },

    /**
     * Removes all validation information currently displayed by this dataentry.
     * @param sel
     * @returns {Forms.DataEntry}
     */
    removeValidation: function (sel) {
      this.marker.removeElements();
      return this;
    }
    
  });
  
  return Forms;
}));
