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

},{"../../scripts/utils":14}],2:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _utils = require("../scripts/utils.js");

var _utils2 = _interopRequireDefault(_utils);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * DOM utilities.
 * https://github.com/RobertoPrevato/DataEntry
 *
 * Copyright 2019, Roberto Prevato
 * https://robertoprevato.github.io
 *
 * Licensed under the MIT license:
 * http://www.opensource.org/licenses/MIT
 */
var OBJECT = "object",
    STRING = "string",
    NUMBER = "number",
    FUNCTION = "function",
    REP = "replace";


var len = _utils2.default.len;
var any = _utils2.default.any;
var each = _utils2.default.each;

/**
* Returns the currently active element, in the DOM.
*/
function getFocusedElement() {
  return document.querySelector(":focus");
}
/**
* Return a value indicating whether the given element is focused.
*
* @param el: element to check for focus
*/
function isFocused(el) {
  if (!el) return false;
  return el === getFocusedElement();
}

function modClass(el, n, add) {
  if (n.search(/\s/) > -1) {
    n = n.split(/\s/g);
    for (var i = 0, l = len(n); i < l; i++) {
      modClass(el, n[i], add);
    }
  } else if ((typeof n === "undefined" ? "undefined" : _typeof(n)) == STRING) {
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
function setAttr(el, o) {
  for (var x in o) {
    el.setAttribute(x, o[x]);
  }
}
function nameSelector(el) {
  return "[name='" + (_utils2.default.isString(el) ? el : attrName(el)) + "']";
}
function isPassword(o) {
  return isInput(o) && attr(o, "type") == "password";
}
var isIE = /Trident\/|MSIE/.test(window.navigator.userAgent);

/**
 * Fires an event on a given element.
 *
 * @param el: element on which to fire an event.
 * @param eventName: name of the event to fire.
 * @param data: event data.
 */
function fire(el, eventName, data) {
  if (eventName == "focus") {
    el.focus();
  }
  var event;
  if (isIE) {
    event = document.createEvent("Event");
    // args: string type, boolean bubbles, boolean cancellable
    event.initEvent(eventName, false, true);
    el.dispatchEvent(event);
    return;
  }
  if (window.CustomEvent) {
    event = new CustomEvent(eventName, { detail: data });
  } else if (document.createEvent) {
    event = document.createEvent("CustomEvent");
    event.initCustomEvent(eventName, true, true, data);
  }
  el.dispatchEvent(event);
}
function setValue(el, v) {
  if (el.type == "checkbox") {
    el.checked = v == true || /1|true/.test(v);
    fire(el, "change", { forced: true });
    return;
  }
  if (el.value != v) {
    var selectionStart;

    if (isIE) {
      selectionStart = el.selectionStart;
    }

    el.value = v;

    // fix for IE11 moving caret at the beginning of the value, after setting element value
    if (isIE && isFocused(el)) {
      el.selectionStart = selectionStart;
    }
    fire(el, "change", { forced: true });
  }
}
function isContentEditable(el) {
  return el && el.contentEditable == "true";
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
  if (/select/i.test(el.tagName)) {
    if (el.multiple) {
      // return an array with all selected values
      var v = [];
      each(el.querySelectorAll("option"), function (o) {
        if (o.selected) v.push(o.value);
      });
      return v;
    }
  }
  if (isContentEditable(el)) {
    return el.innerText; // innerText respects line breaks
  }
  return el.value;
}
function isRadioButton(el) {
  return el && /^input$/i.test(el.tagName) && /^(radio)$/i.test(el.type);
}
function isCheckbox(el) {
  return el && /^input$/i.test(el.tagName) && /^(checkbox)$/i.test(el.type);
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
function lastSibling(el, fn) {
  var nx = el;
  while (nx = nx.nextElementSibling) {
    if (fn(nx)) break;
  }
  return nx;
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
function findFirstByClass(el, name) {
  return el.getElementsByClassName(name)[0];
}
function isHidden(el) {
  var style = window.getComputedStyle(el);
  return style.display == "none" || style.visibility == "hidden";
}
function createElement(tag) {
  return document.createElement(tag);
}
function after(a, b) {
  a.parentNode.insertBefore(b, a.nextSibling);
}
function append(a, b) {
  a.appendChild(b);
}
function parent(el) {
  return el.parentElement || el.parentNode;
}
function isElement(o) {
  return (typeof HTMLElement === "undefined" ? "undefined" : _typeof(HTMLElement)) === OBJECT ? o instanceof HTMLElement : //DOM2
  o && (typeof o === "undefined" ? "undefined" : _typeof(o)) === OBJECT && o !== null && o.nodeType === 1 && _typeof(o.nodeName) === STRING;
}
function isAnyInput(o) {
  return o && isElement(o) && (/input|button|textarea|select/i.test(o.tagName) || isContentEditable(o));
}
function isInput(o) {
  return o && isElement(o) && /input/i.test(o.tagName);
}
function expectParent(el) {
  if (!isElement(el)) throw new Error("expected HTML Element");
  var parent = el.parentNode;
  if (!isElement(parent)) throw new Error("expected HTML element with parentNode");
  return parent;
}
var DOT = ".";

/**
 * Splits an event name into its event name and namespace.
 */
function splitNamespace(eventName) {
  var i = eventName.indexOf(DOT);
  if (i > -1) {
    var name = eventName.substr(0, i);
    return [eventName.substr(0, i), eventName.substr(i + 1)];
  }
  return [eventName, ""];
}

var HANDLERS = [];

exports.default = {

  splitNamespace: splitNamespace,

  /**
   * Empties an element, removing all its children elements and event handlers.
   */
  empty: function empty(node) {
    while (node.hasChildNodes()) {
      // remove event handlers on the child, about to be removed:
      this.off(node.lastChild);
      node.removeChild(node.lastChild);
    }
  },


  /**
   * Removes an element, with all event handlers.
   */
  remove: function remove(a) {
    if (!a) return;
    this.off(a);
    var parent = a.parentElement || a.parentNode;
    if (parent) {
      parent.removeChild(a);
    }
  },


  /**
   * Gets the closest ancestor of the given element having the given tagName.
   *
   * @param el: element from which to find the ancestor
   * @param predicate: predicate to use for lookup.
   * @param excludeItself: whether to include the element itself.
   */
  closest: function closest(el, predicate, excludeItself) {
    if (!el || !predicate) return;
    if (!excludeItself) {
      if (predicate(el)) return el;
    }
    var o,
        parent = el;
    while (parent = parent.parentElement) {
      if (predicate(parent)) {
        return parent;
      }
    }
  },


  /**
   * Gets the closest ancestor of the given element having the given tagName.
   *
   * @param el: element from which to find the ancestor
   * @param tagName: tagName to look for.
   * @param excludeItself: whether to include the element itself.
   */
  closestWithTag: function closestWithTag(el, tagName, excludeItself) {
    if (!tagName) return;
    tagName = tagName.toUpperCase();
    return this.closest(el, function (el) {
      return el.tagName == tagName;
    }, excludeItself);
  },


  /**
   * Gets the closest ancestor of the given element having the given class.
   *
   * @param el: element from which to find the ancestor
   * @param tagName: tagName to look for.
   * @param excludeItself: whether to include the element itself.
   */
  closestWithClass: function closestWithClass(el, className, excludeItself) {
    if (!className) return;
    return this.closest(el, function (el) {
      return hasClass(el, className);
    }, excludeItself);
  },


  /**
   * Returns a value indicating whether the a node contains another node.
   *
   * @param a: containing node
   * @param b: node to be checked for containment
   */
  contains: function contains(a, b) {
    if (!a || !b) return false;
    if (!a.hasChildNodes()) return false;
    var children = a.childNodes,
        l = children.length;
    for (var i = 0; i < l; i++) {
      var child = children[i];
      if (child === b) return true;
      if (this.contains(child, b)) {
        return true;
      }
    }
    return false;
  },


  /**
   * Sets a delegate event listener.
   *
   * @param element
   * @param eventName
   * @param selector
   * @param method
   * @returns {this}
   */
  on: function on(element, type, selector, callback) {
    if (!isElement(element))
      // element could be a text element or a comment
      throw new Error("argument is not a DOM element.");
    if (_utils2.default.isFunction(selector) && !callback) {
      callback = selector;
      selector = null;
    }
    var $ = this;
    var parts = splitNamespace(type);
    var eventName = parts[0],
        ns = parts[1];
    var listener = function listener(e) {
      var m = e.target;
      if (selector) {
        var targets = find(element, selector);
        if (any(targets, function (o) {
          return e.target === o || $.contains(o, e.target);
        })) {
          var re = callback(e, e.detail);
          if (re === false) {
            e.preventDefault();
          }
          return true;
        }
      } else {
        var re = callback(e, e.detail);
        if (re === false) {
          e.preventDefault();
        }
        return true;
      }
      return true;
    };
    HANDLERS.push({
      type: type,
      ev: eventName,
      ns: ns,
      fn: listener,
      el: element
    });
    element.addEventListener(eventName, listener, true);
    return this;
  },


  /**
   * Removes all event handlers set by DOM helper on a given element.
   * @returns {this}
   */
  off: function off(element, type) {
    var toRemove = [];
    if (!isElement(element))
      // element could be a text element or a comment
      return;
    if (type) {
      if (type[0] === DOT) {
        // unset event listeners by namespace
        var ns = type.substr(1);
        each(HANDLERS, function (o) {
          // remove the event handler
          if (o.el === element && o.ns == ns) {
            o.el.removeEventListener(o.ev, o.fn, true);
            toRemove.push(o);
          }
        });
      } else {
        // check namespace
        var parts = splitNamespace(type);
        var eventName = parts[0],
            ns = parts[1];
        each(HANDLERS, function (o) {
          if (o.el === element && o.ev == eventName && (!ns || o.ns == ns)) {
            // remove the event handler
            o.el.removeEventListener(o.ev, o.fn, true);
            toRemove.push(o);
          }
        });
      }
    } else {
      each(HANDLERS, function (o) {
        if (o.el === element) {
          // remove the event handler
          o.el.removeEventListener(o.ev, o.fn, true);
          toRemove.push(o);
        }
      });
    }
    // remove event handlers
    _utils2.default.removeItems(HANDLERS, toRemove);
  },


  /**
   * Expose event handlers singleton, for debugging and testing purpose.
   */
  eventHandlers: function eventHandlers() {
    return HANDLERS;
  },


  /**
   * Removes all active event handlers.
   */
  offAll: function offAll() {
    var self = this,
        element;
    each(HANDLERS, function (o) {
      element = o.el;
      element.removeEventListener(o.ev, o.fn, true);
    });
    while (HANDLERS.length) {
      HANDLERS.pop();
    }
    return self;
  },


  fire: fire,

  /**
   * Returns the siblings of the given element.
   *
   * @param el: element of which to get the siblings.
   */
  siblings: function siblings(el, allNodes) {
    var parent = expectParent(el);
    var a = [],
        children = parent[allNodes ? "childNodes" : "children"];
    for (var i = 0, l = children.length; i < l; i++) {
      var child = children[i];
      if (child !== el) {
        a.push(child);
      }
    }
    return a;
  },


  /**
   * Returns the next siblings of the given element.
   *
   * @param el: element of which to get the siblings.
   */
  nextSiblings: function nextSiblings(el, allNodes) {
    var parent = expectParent(el);
    var a = [],
        children = parent[allNodes ? "childNodes" : "children"],
        include = false;
    for (var i = 0, l = children.length; i < l; i++) {
      var child = children[i];
      if (child !== el && include) {
        a.push(child);
      } else {
        include = true;
      }
    }
    return a;
  },


  /**
   * Returns the previous siblings of the given element.
   *
   * @param el: element of which to get the siblings.
   */
  prevSiblings: function prevSiblings(el, allNodes) {
    var parent = expectParent(el);
    var a = [],
        children = parent[allNodes ? "childNodes" : "children"];
    for (var i = 0, l = children.length; i < l; i++) {
      var child = children[i];
      if (child !== el) {
        a.push(child);
      } else {
        break;
      }
    }
    return a;
  },


  /**
   * Finds elements by class name.
   */
  findByClass: function findByClass(el, name) {
    return el.getElementsByClassName(name);
  },


  isFocused: isFocused,

  getFocusedElement: getFocusedElement,

  /**
   * Returns a value indicating whether there is any input element currently focused.
   */
  anyInputFocused: function anyInputFocused() {
    var a = this.getFocusedElement();
    return a && /input|select|textarea/i.test(a.tagName);
  },


  prev: prev,

  next: next,

  append: append,

  addClass: addClass,

  removeClass: removeClass,

  modClass: modClass,

  attr: attr,

  hasClass: hasClass,

  after: after,

  createElement: createElement,

  isElement: isElement,

  isInput: isInput,

  isAnyInput: isAnyInput,

  isSelectable: isSelectable,

  isRadioButton: isRadioButton,

  isCheckbox: isCheckbox,

  isPassword: isPassword,

  attrName: attrName,

  isHidden: isHidden,

  find: find,

  findFirst: findFirst,

  findFirstByClass: findFirstByClass,

  getValue: getValue,

  setValue: setValue,

  setAttr: setAttr,

  nextWithClass: nextWithClass,

  nameSelector: nameSelector,

  lastSibling: lastSibling,

  parent: parent
};

},{"../scripts/utils.js":14}],3:[function(require,module,exports){
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

},{}],4:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _utils = require("../../utils");

var _utils2 = _interopRequireDefault(_utils);

var _dom = require("../../dom");

var _dom2 = _interopRequireDefault(_dom);

var _raise = require("../../raise");

var _rules = require("../constraints/rules");

var _events = require("../../components/events");

var _events2 = _interopRequireDefault(_events);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; } /**
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                * Built-in event handlers for DOM elements.
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                * For example, these functions implement the logic that automatically executes validation
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                * when a user interacts with a field (change, blur, paste, cut). 
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                * This is painful if you have to implement it yourself.
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                * 
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                * https://github.com/RobertoPrevato/DataEntry
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                *
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                * Copyright 2019, Roberto Prevato
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                * https://robertoprevato.github.io
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                *
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                * Licensed under the MIT license:
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                * http://www.opensource.org/licenses/MIT
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                */


var defer = _utils2.default.defer;
var attr = _dom2.default.attr;
var len = _utils2.default.len;
var extend = _utils2.default.extend;
var isString = _utils2.default.isString;
var isFunction = _utils2.default.isFunction;
var first = _utils2.default.first;

var DomBinder = function (_EventsEmitter) {
  _inherits(DomBinder, _EventsEmitter);

  function DomBinder(dataentry) {
    _classCallCheck(this, DomBinder);

    var _this = _possibleConstructorReturn(this, (DomBinder.__proto__ || Object.getPrototypeOf(DomBinder)).call(this));

    var self = _this;

    self.dataentry = dataentry;
    self.element = dataentry.element;
    if (!dataentry.element) (0, _raise.raise)(20, "missing `element` in dataentry");
    self.fn = {};

    var options = dataentry ? dataentry.options : {};
    self.constraints = _utils2.default.extend({}, _rules.Constraints, options.constraintRules);

    if (options.events) self.events = options.events;

    self.validationEvent = options.validationEvent || DomBinder.validationEvent;

    if (self.element !== true) self.bind();

    // does the dataentry implement the event interface?
    if (_utils2.default.quacks(dataentry, ["on", "trigger"])) {
      if (!dataentry.options.disableAutoFocus) {
        self.listenTo(dataentry, "first:error", function (error) {
          // focus the first invalid field
          _dom2.default.fire(error.field, "focus");
        });
      }
    }
    return _this;
  }

  _createClass(DomBinder, [{
    key: "dispose",
    value: function dispose() {
      var self = this;
      self.unbind();
      self.off();
      self.stopListening();
      // delete handlers
      for (var x in self.fn) {
        delete self.fn[x];
      }

      if (_utils2.default.quacks(self.dataentry, ["on", "trigger"])) self.stopListening(self.dataentry);
      self.dataentry = null;
      self.element = null;
      self.constraints = null;
    }
  }, {
    key: "bind",
    value: function bind() {
      var self = this,
          events = self.getEvents(),
          element = self.element,
          delegateEventSplitter = /^(\S+)\s*(.*)$/;
      for (var key in events) {
        var method = events[key];
        if (!isFunction(method)) method = self.fn[method];
        if (!method) continue;
        var match = key.match(delegateEventSplitter);
        var type = match[1],
            selector = match[2];

        method = method.bind(self.dataentry); // execute methods in the context of the dataentry
        _dom2.default.on(element, type, selector, method);
      }
      return self;
    }
  }, {
    key: "unbind",
    value: function unbind() {
      _dom2.default.off(this.element);
    }
  }, {
    key: "getEvents",
    value: function getEvents() {
      var self = this,
          events = self.events || {};
      if (isFunction(events)) events = events.call(self);
      //extends events object with validation events
      events = extend({}, events, self.getValidationDefinition(), self.getPreFormattingDefinition(), self.getMetaEvents(), self.getConstraintsDefinition());
      return events;
    }

    /**
     * Gets an "events" object that describes on keypress constraints for all input inside the given element
     */

  }, {
    key: "getConstraintsDefinition",
    value: function getConstraintsDefinition() {
      var self = this,
          constraints = self.constraints,
          dataentry = self.dataentry,
          schema = dataentry.schema;

      if (!schema) return {};

      var o = {},
          x;
      for (x in schema) {
        var ev = "keypress [name='" + x + "']",
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
            (0, _raise.raise)(5, constraint);
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
              if (_utils2.default.has(constraints, name)) {
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

  }, {
    key: "getPreFormattingDefinition",
    value: function getPreFormattingDefinition() {
      var self = this,
          dataentry = self.dataentry,
          schema = dataentry.schema;
      if (!schema) return {};
      var o = {},
          x;

      function getHandler(name, preformat) {
        return function (e, forced) {
          var el = e.target;
          var v = dataentry.formatter.format(preformat, el, _dom2.default.getValue(el));
          dataentry.harvester.setValue(el, v);
        };
      }

      for (x in schema) {
        // get preformat definition
        var preformat = self.getFieldPreformatRules(x);
        if (preformat && len(preformat)) {

          var preformattingEvent = "focus",
              ev = preformattingEvent + " [name='" + x + "']",
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

  }, {
    key: "getFieldPreformatRules",
    value: function getFieldPreformatRules(x) {
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

  }, {
    key: "getValidationDefinition",
    value: function getValidationDefinition() {
      var self = this,
          dataentry = self.dataentry,
          schema = dataentry.schema;
      if (!schema) return {};
      var o = {},
          x;
      for (x in schema) {
        var validationEvent = schema[x].validationEvent || self.validationEvent;
        // support multiple events:
        var names = validationEvent.split(/,|;/g);
        var functionName = "validation_" + x;
        _utils2.default.each(names, function (name) {
          name = name.trim();
          var ev = name + " [name='" + x + "']";
          o[ev] = functionName;
        });
        // store handler
        self.fn[functionName] = self.getValidationEventHandler(x);
      }
      return o;
    }
  }, {
    key: "getValidationEventHandler",
    value: function getValidationEventHandler(name) {
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

        validator.validate(validation, f, value, forced).then(function (data) {
          // the validation process succeeded (didn't produce any exception)
          // but this doesn't mean that the field is valid
          var error = first(data, function (o) {
            return o.error;
          });

          if (error) {
            var errorData = {
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
              var errorData = {
                message: data[i].message
              };
              marker.markFieldInvalid(f, errorData);
              dataentry.trigger("errors", [errorData]);
            }
          }
        });
      };
    }

    /**
     * Returns events definitions that are used for contextual information for the dataentry.
     */

  }, {
    key: "getMetaEvents",
    value: function getMetaEvents() {
      var dataentry = this.dataentry;

      var activationCallback = function activationCallback(e) {
        // add a class to the element
        dataentry.marker.markFieldTouched(e.target);
        // activate validation after keypress
        dataentry.validationActive = true;
        return true;
      };
      var changeCallback = function changeCallback(e, forced) {
        // add a class to the element
        dataentry.marker.markFieldTouched(e.target);
        dataentry.validationActive = true;
        // trigger validation
        var target = e.target,
            name = target.name;
        // on the other hand, we don't want to validate the whole form before the user trying to input anything
        if (_utils2.default.has(dataentry.schema, name)) {
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
  }]);

  return DomBinder;
}(_events2.default);

DomBinder.validationEvent = "blur";

exports.default = DomBinder;

},{"../../components/events":1,"../../dom":2,"../../raise":13,"../../utils":14,"../constraints/rules":5}],5:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.match = exports.stringFromCode = exports.permittedCharacters = exports.foreseeValue = exports.Constraints = undefined;

var _utils = require("../../utils");

var _utils2 = _interopRequireDefault(_utils);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var contains = _utils2.default.contains;

/**
 * Returns a value indicating wether the keys or keys combinations should be always allowed
 */
/**
 * DataEntry built-in constraints rules.
 * https://github.com/RobertoPrevato/DataEntry
 *
 * Copyright 2019, Roberto Prevato
 * https://robertoprevato.github.io
 *
 * Licensed under the MIT license:
 * http://www.opensource.org/licenses/MIT
 */
function permittedCharacters(e, c) {
  //characters or characters combination always permitted
  if (contains([8, 0, 37, 39, 9], c) || e.ctrlKey && contains([120, 118, 99, 97, 88, 86, 67], c)) return true;
  return false;
}

// shortcut for String.fromCharCode
function stringFromCode(c) {
  return String.fromCharCode(c);
}

// shortcut for string match regex call
function match(s, rx) {
  return s.match(rx);
}

/**
 * Returns the value that a field will have, if the given keypress event goes through.
 * 
 * @param {*} e 
 */
function foreseeValue(e) {
  var a = "selectionStart",
      b = "selectionEnd",
      element = e.target,
      value = element.value,
      c = e.keyCode || e.charCode,
      key = stringFromCode(c),
      selected = value.substr(element[a], element[b]),
      beforeSelection = value.substr(0, element[a]),
      afterSelection = value.substr(element[b], value.length);
  return [beforeSelection, key, afterSelection].join("");
}

function onlyDigits(e, c) {
  var c = e.keyCode || e.charCode,
      key = stringFromCode(c);
  if (!permittedCharacters(e, c) && !match(key, /\d/)) return false;
  return true;
}

var Constraints = {

  // Allows to input only letters
  letters: function letters(e, c) {
    var c = e.keyCode || e.charCode,
        key = stringFromCode(c);
    if (!permittedCharacters(e, c) && !match(key, /[a-zA-Z]/)) return false;
    return true;
  },

  // Allows to input only digits
  digits: onlyDigits,

  integer: onlyDigits
};

exports.Constraints = Constraints;
exports.foreseeValue = foreseeValue;
exports.permittedCharacters = permittedCharacters;
exports.stringFromCode = stringFromCode;
exports.match = match;

},{"../../utils":14}],6:[function(require,module,exports){
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

},{"../../scripts/components/events":1,"../../scripts/raise":13,"../../scripts/utils":14,"./formatting/formatter":8,"./validation/validator":12}],7:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }(); /**
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      * Decorator class using HTML elements: it displays information 
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      * by injecting or removing elements inside the DOM.
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      * 
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

var _dom = require("../../../scripts/dom");

var _dom2 = _interopRequireDefault(_dom);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var each = _utils2.default.each;
var extend = _utils2.default.extend;
var isString = _utils2.default.isString;
var append = _dom2.default.append;
var addClass = _dom2.default.addClass;
var removeClass = _dom2.default.removeClass;
var removeElement = _dom2.default.remove.bind(_dom2.default);
var next = _dom2.default.next;
var createElement = _dom2.default.createElement;
var isRadioButton = _dom2.default.isRadioButton;
var findFirst = _dom2.default.findFirst;
var after = _dom2.default.after;
var attr = _dom2.default.attr;

// support for explicitly defined targets through data attributes
function checkSpecificTarget(element) {
  var specificTarget = element.dataset.validationTarget;
  if (specificTarget) return document.getElementById(specificTarget);
}

// when a field relates to a group, then it make sense to display information only on the first element of the group.
// a common case for this situation are radio buttons: if a value coming from a group of radio buttons is required,
// then it makes sense to display information only on the first one;
function checkGroup(element) {
  if (isRadioButton(element)) {
    // return the first radio button appearing in DOM
    return this.dataentry && this.dataentry.element ? this.dataentry.element.querySelectorAll(_dom2.default.nameSelector(element))[0] : element;
  }
  return element;
}

function _checkElement(element) {
  var specificTarget = checkSpecificTarget(element);
  if (specificTarget) return specificTarget;

  var re = checkGroup.call(this, element);
  // support radio and checkboxes before labels (decorate after labels)
  if (/^radio|checkbox$/i.test(element.type)) {
    var nx = next(element);
    if (nx && /label/i.test(nx.tagName) && element.id == attr(nx, "for")) {
      return nx;
    }
  }
  return re;
}

var TOOLTIPS = "tooltips";

var DomDecorator = function () {

  /**
   * Creates a new instance of DomDecorator associated with the given dataentry.
   *
   * @param dataentry: instance of DataEntry.
   */
  function DomDecorator(dataentry) {
    _classCallCheck(this, DomDecorator);

    this.dataentry = dataentry;
    // default to tooltips if not specified otherwise
    this.markStyle = dataentry ? dataentry.options.markStyle || TOOLTIPS : TOOLTIPS;
    this.options = _utils2.default.extend({}, DomDecorator.defaults, dataentry && dataentry.options ? dataentry.options.decoratorOptions : {});
    this._elements = [];
  }

  _createClass(DomDecorator, [{
    key: "create",
    value: function create(tagname) {
      var el = _dom2.default.createElement(tagname);
      this._elements.push(el);
      return el;
    }
  }, {
    key: "checkElement",
    value: function checkElement(element) {
      return _checkElement(element);
    }
  }, {
    key: "bindDecoratorElement",
    value: function bindDecoratorElement(field, markerElement) {
      if (_dom2.default.attr(markerElement, 'id') === field.dataset.markerId) {
        // elements are already bound
        return;
      }
      var uniqueId = _utils2.default.uniqueId('ug-dataentry-marker');
      _dom2.default.setAttr(markerElement, { 'id': uniqueId });
      field.dataset.markerId = uniqueId;
    }
  }, {
    key: "getCurrentMessageElement",
    value: function getCurrentMessageElement(field) {
      var markerId = field.dataset.markerId;
      if (markerId) {
        return document.getElementById(markerId);
      }
    }

    /**
     * Gets an element to display validation information about the given field.
     * If the element already exists, it is returned.
     * 
     * @param f
     * @param create
     * @returns {*}
     */

  }, {
    key: "getMessageElement",
    value: function getMessageElement(f, create, options) {
      var self = this;
      if (self.markStyle == TOOLTIPS) {
        var l = self.getCurrentMessageElement(f);
        if (l) return l;
        if (create) {
          l = self.getTooltipElement(f, create, options);
          // assign an unique id to this element;
          self.bindDecoratorElement(f, l);
          return l;
        } else {
          return null;
        }
      }
      var l = self.getCurrentMessageElement(f);
      if (l) return l;
      if (!create) return null;
      l = self.create("span");
      addClass(l, "ug-message-element");
      self.bindDecoratorElement(f, l);
      return l;
    }

    /**
     * Gets the options to display a message on the given field.
     * 
     * @param f
     * @returns {*}
     */

  }, {
    key: "getOptions",
    value: function getOptions(f, options) {
      var de = this.dataentry,
          schema = de ? de.schema : null,
          fs = schema ? schema[f.name] : null,
          defaults = this.defaults,
          messageOptions = fs ? fs.message : "right";
      if (isString(messageOptions)) messageOptions = { position: messageOptions };
      return extend({}, defaults, messageOptions, options);
    }

    /**
     * Gets an element that can be styled as tooltip
     * 
     * @param f
     * @param create
     * @returns {*}
     */

  }, {
    key: "getTooltipElement",
    value: function getTooltipElement(f, create, options) {
      var divtag = "div",
          o = this.getOptions(f, options),
          wrapper = this.create(divtag),
          tooltip = createElement(divtag),
          arrow = createElement(divtag),
          p = createElement("p");
      addClass(wrapper, "ug-validation-wrapper");
      addClass(tooltip, "tooltip validation-tooltip in " + (o.position || "right"));
      addClass(arrow, "tooltip-arrow");
      addClass(p, "tooltip-inner");
      append(wrapper, tooltip);
      append(tooltip, arrow);
      append(tooltip, p);
      return wrapper;
    }

    /**
     * Sets the text to display in the marker element.
     * 
     * @param marker element
     * @param message
     */

  }, {
    key: "setElementText",
    value: function setElementText(el, message) {
      var textContent = "textContent";
      if (this.markStyle == "tooltips") {
        findFirst(el, ".tooltip-inner")[textContent] = message;
        return;
      }
      el[textContent] = message;
    }

    /**
     * Removes the element used to display information for the given field.
     * 
     * @param f
     * @returns {DomMarker}
     */

  }, {
    key: "removeMessageElement",
    value: function removeMessageElement(f) {
      var self = this;
      f = _checkElement.call(self, f);
      var l = self.getMessageElement(f, false);
      if (l) removeElement(l);
      return self;
    }

    /**
     * Marks the field in neuter state (no success/no error)
     * 
     * @param f
     * @returns {DomMarker|*}
     */

  }, {
    key: "markFieldNeutrum",
    value: function markFieldNeutrum(f) {
      var self = this,
          options = self.options;
      f = _checkElement.call(self, f);
      removeClass(f, options.invalidClass + " " + options.validClass);
      return self.removeMessageElement(f);
    }

    /**
     * Marks the given field in valid state
     * 
     * @param f
     * @returns {DomMarker|*}
     */

  }, {
    key: "markFieldValid",
    value: function markFieldValid(f) {
      var self = this,
          options = self.options;
      f = _checkElement.call(self, f);
      addClass(removeClass(f, options.invalidClass), options.validClass);
      return self.removeMessageElement(f);
    }

    /**
     * Marks a field with some information.
     * 
     * @param {*} f 
     * @param {*} options 
     */

  }, {
    key: "markField",
    value: function markField(f, options, css) {
      var self = this;
      f = _checkElement.call(self, f);
      var l = self.getMessageElement(f, true, options);
      self.setElementText(addClass(l, css), options.message);
      after(f, l);
      return self;
    }

    /**
     * Displays information about the given field
     * 
     * @param f
     * @param options
     * @returns {DomMarker}
     */

  }, {
    key: "markFieldInfo",
    value: function markFieldInfo(f, options) {
      var self = this,
          o = self.options;
      addClass(removeClass(f, o.invalidClass), o.validClass);
      return self.markField(f, options, "ug-info");
    }

    /**
     * Marks the given field in invalid state
     * 
     * @param f
     * @param options
     * @returns {DomMarker}
     */

  }, {
    key: "markFieldInvalid",
    value: function markFieldInvalid(f, options) {
      var self = this,
          o = self.options;
      addClass(removeClass(f, o.validClass), o.invalidClass);
      return self.markField(f, options, "ug-error");
    }

    /**
     * Marks the given field as `touched` by the user
     * 
     * @param f
     * @returns {DomMarker}
     */

  }, {
    key: "markFieldTouched",
    value: function markFieldTouched(f) {
      f = _checkElement.call(this, f);
      addClass(f, "ug-touched");
      return this;
    }

    /**
     * Removes all the marker elements created by this DomDecorator.
     */

  }, {
    key: "removeElements",
    value: function removeElements() {
      each(this._elements, function (element) {
        return _dom2.default.remove(element);
      });
      return this;
    }

    /**
     * Disposes of this decorator.
     */

  }, {
    key: "dispose",
    value: function dispose() {
      this.dataentry = null;
      this.removeElements();
      return this;
    }
  }]);

  return DomDecorator;
}();

DomDecorator.defaults = {
  position: "right",
  invalidClass: "ug-field-invalid",
  validClass: "ug-field-valid"
};

exports.default = DomDecorator;

},{"../../../scripts/dom":2,"../../../scripts/utils":14}],8:[function(require,module,exports){
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

},{"../../../scripts/raise":13,"../../../scripts/utils":14,"./rules":9}],9:[function(require,module,exports){
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

},{"../../utils":14}],10:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }(); /**
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      * Harvester class operating on HTML elements.
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

var _dom = require("../../../scripts/dom");

var _dom2 = _interopRequireDefault(_dom);

var _raise = require("../../../scripts/raise");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var first = _utils2.default.first;
var each = _utils2.default.each;
var any = _utils2.default.any;
var len = _utils2.default.len;
var isRadioButton = _dom2.default.isRadioButton;
var isCheckbox = _dom2.default.isCheckbox;
var _getValue = _dom2.default.getValue;

var DomHarvester = function () {
  /**
   * Creates a new instance of DomHarvester associated with the given dataentry.
   *
   * @param dataentry: instance of DataEntry.
   */
  function DomHarvester(dataentry) {
    _classCallCheck(this, DomHarvester);

    if (!dataentry) (0, _raise.raise)(2, "missing 'dataentry' for DomHarvester");

    var element = dataentry.element;
    if (!element)
      // requires a configured element for the dataentry
      (0, _raise.raise)(8, "missing 'element' in dataentry. Specify an HTML element for the dataentry, in order to use the DomHarvester");

    this.dataentry = dataentry;
    this.element = element;
  }

  /**
   * Sets the values using the given object.
   * 
   * @param {object} context 
   */


  _createClass(DomHarvester, [{
    key: "setValues",
    value: function setValues(context) {
      for (var x in context) {
        this.setValue(x, context[x]);
      }
    }

    /**
     * Returns the fields by name.
     * 
     * @param {*} name 
     */

  }, {
    key: "getFields",
    value: function getFields(name) {
      return _dom2.default.find(this.element, _dom2.default.nameSelector(name));
    }

    /**
     * Get all values for the underlying dataentry, depending on its schema and DOM element.
     */

  }, {
    key: "getValues",
    value: function getValues() {
      return this.getValuesFromElement(this.element);
    }
  }, {
    key: "getElements",
    value: function getElements(name) {
      return _dom2.default.find(this.element, _dom2.default.nameSelector(name));
    }
  }, {
    key: "setValue",
    value: function setValue(field, value) {
      if (_utils2.default.isString(field)) {
        field = this.getElements(field); // multiple elements may be returned
        if (field.length == 1) {
          field = field[0];
        }
      }
      return _dom2.default.setValue(field, value);
    }
  }, {
    key: "getValue",
    value: function getValue(field) {
      if (!field) (0, _raise.raise)(12);
      // handle groups of radio or checkboxes, too
      if (_utils2.default.isString(field) || isRadioButton(field) || this.isCheckboxInGroup(field)) return this.getValueFromElements(this.getElements(field));

      return _getValue(field);
    }
  }, {
    key: "isCheckboxInGroup",
    value: function isCheckboxInGroup(el) {
      return isCheckbox(el) && len(_dom2.default.find(this.element, _dom2.default.nameSelector(el))) > 1;
    }
  }, {
    key: "getKeys",
    value: function getKeys() {
      var schema = this.dataentry.schema;
      return _utils2.default.keys(schema);
    }

    /**
     * Gets all the values from all input with a specified name, in form of key-value pair dictionary.
     * Elements with class 'ug-silent' are discarded.
     * @param el HTML element
     * @returns {object}
     */

  }, {
    key: "getValuesFromElement",
    value: function getValuesFromElement(element) {
      var self = this,
          element = self.element,
          keys = self.getKeys(),
          values = {};

      // the schema has properties that should match `name` attributes of input elements (like in classic HTML)
      each(keys, function (key) {
        // get elements by matching name attribute
        var elementsWithMatchingName = _dom2.default.find(element, _dom2.default.nameSelector(key)),
            k = _utils2.default.len(elementsWithMatchingName);

        if (k) {
          values[key] = self.getValueFromElements(elementsWithMatchingName);
        } else {
          values[key] = undefined;
        }
      });

      return values;
    }

    /**
     * Returns a single value from a list of elements.
     * 
     * @param {NodeList} elements 
     */

  }, {
    key: "getValueFromElements",
    value: function getValueFromElements(elements) {
      var count = len(elements);
      if (count > 1) {
        // multiple elements

        // handle group of radio buttons:
        if (isRadioButton(elements[0])) {
          // throw exception if any element is not a radio button:
          if (any(elements, function (el) {
            return !isRadioButton(el);
          })) (0, _raise.raise)(19, "DOM contains input elements with name \"" + _dom2.default.attrName(elements[0]) + "\" and different type");

          var checked = first(elements, function (o) {
            return o.checked;
          });
          return checked ? checked.value : undefined;
        }

        // handle groups of checkboxes
        if (isCheckbox(elements[0])) {
          var v = [];
          each(elements, function (o) {
            // throw exception if any element is not a radio button:
            if (!isCheckbox(o)) (0, _raise.raise)(19, "DOM contains input elements with name \"" + _dom2.default.attrName(elements[0]) + "\" and different type");

            if (o.checked) {
              v.push(_dom2.default.attr(o, "value"));
            }
          });
          return v;
        }

        // handle other kinds of elements;
        var v = [];
        each(elements, function (o) {
          var elementValue = _getValue(o);

          // add the value only if not empty
          if (!_utils2.default.nilOrEmpty(elementValue)) v.push(elementValue);
        });
        return v;
      }
      return count ? _getValue(elements[0]) : undefined;
    }
  }, {
    key: "dispose",
    value: function dispose() {
      this.dataentry = null;
      this.element = null;
      return this;
    }
  }]);

  return DomHarvester;
}();

exports.default = DomHarvester;

},{"../../../scripts/dom":2,"../../../scripts/raise":13,"../../../scripts/utils":14}],11:[function(require,module,exports){
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

},{"../../utils":14}],12:[function(require,module,exports){
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

},{"../../../scripts/raise":13,"../../../scripts/utils":14,"./rules":11}],13:[function(require,module,exports){
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

},{}],14:[function(require,module,exports){
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

},{"../scripts/exceptions":3}],15:[function(require,module,exports){
"use strict";

var _dataentry = require("../code/scripts/forms/dataentry");

var _dataentry2 = _interopRequireDefault(_dataentry);

var _validator = require("../code/scripts/forms/validation/validator");

var _validator2 = _interopRequireDefault(_validator);

var _formatter = require("../code/scripts/forms/formatting/formatter");

var _formatter2 = _interopRequireDefault(_formatter);

var _dombinder = require("../code/scripts/forms/binding/dombinder");

var _dombinder2 = _interopRequireDefault(_dombinder);

var _domharvester = require("../code/scripts/forms/harvesting/domharvester");

var _domharvester2 = _interopRequireDefault(_domharvester);

var _domdecorator = require("../code/scripts/forms/decoration/domdecorator");

var _domdecorator2 = _interopRequireDefault(_domdecorator);

var _rules = require("../code/scripts/forms/constraints/rules");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

_dataentry2.default.configure({
  marker: _domdecorator2.default,
  harvester: _domharvester2.default,
  binder: _dombinder2.default
}); /**
     * DataEntry with built-in DOM classes.
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
    DomHarvester: _domharvester2.default,
    DomDecorator: _domdecorator2.default,
    DomBinder: _dombinder2.default,
    Constraints: _rules.Constraints,
    utils: {
      foreseeValue: _rules.foreseeValue
    }
  };
}

module.exports = {
  DataEntry: _dataentry2.default,
  Validator: _validator2.default,
  Formatter: _formatter2.default,
  DomHarvester: _domharvester2.default,
  DomDecorator: _domdecorator2.default,
  Constraints: _rules.Constraints,
  DomBinder: _dombinder2.default
};

},{"../code/scripts/forms/binding/dombinder":4,"../code/scripts/forms/constraints/rules":5,"../code/scripts/forms/dataentry":6,"../code/scripts/forms/decoration/domdecorator":7,"../code/scripts/forms/formatting/formatter":8,"../code/scripts/forms/harvesting/domharvester":10,"../code/scripts/forms/validation/validator":12}]},{},[15])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJjb2RlL3NjcmlwdHMvY29tcG9uZW50cy9ldmVudHMuanMiLCJjb2RlL3NjcmlwdHMvZG9tLmpzIiwiY29kZS9zY3JpcHRzL2V4Y2VwdGlvbnMuanMiLCJjb2RlL3NjcmlwdHMvZm9ybXMvYmluZGluZy9kb21iaW5kZXIuanMiLCJjb2RlL3NjcmlwdHMvZm9ybXMvY29uc3RyYWludHMvcnVsZXMuanMiLCJjb2RlL3NjcmlwdHMvZm9ybXMvZGF0YWVudHJ5LmpzIiwiY29kZS9zY3JpcHRzL2Zvcm1zL2RlY29yYXRpb24vZG9tZGVjb3JhdG9yLmpzIiwiY29kZS9zY3JpcHRzL2Zvcm1zL2Zvcm1hdHRpbmcvZm9ybWF0dGVyLmpzIiwiY29kZS9zY3JpcHRzL2Zvcm1zL2Zvcm1hdHRpbmcvcnVsZXMuanMiLCJjb2RlL3NjcmlwdHMvZm9ybXMvaGFydmVzdGluZy9kb21oYXJ2ZXN0ZXIuanMiLCJjb2RlL3NjcmlwdHMvZm9ybXMvdmFsaWRhdGlvbi9ydWxlcy5qcyIsImNvZGUvc2NyaXB0cy9mb3Jtcy92YWxpZGF0aW9uL3ZhbGlkYXRvci5qcyIsImNvZGUvc2NyaXB0cy9yYWlzZS5qcyIsImNvZGUvc2NyaXB0cy91dGlscy5qcyIsImRpc3RyaWJ1dGlvbmZpbGVzL2RhdGFlbnRyeS1kb20uanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7Ozs7Ozs4UUNBQTs7Ozs7Ozs7Ozs7O0FBVUE7Ozs7Ozs7O0FBRUEsSUFBSSxRQUFRLEVBQVo7QUFDQSxJQUFJLE9BQU8sTUFBTSxJQUFqQjtBQUNBLElBQUksUUFBUSxNQUFNLEtBQWxCO0FBQ0EsSUFBSSxTQUFTLE1BQU0sTUFBbkI7O0FBRUE7QUFDQSxJQUFNLGdCQUFnQixLQUF0Qjs7QUFFQSxJQUFJLFlBQVksU0FBWixTQUFZLENBQVUsR0FBVixFQUFlLE1BQWYsRUFBdUIsSUFBdkIsRUFBNkIsSUFBN0IsRUFBbUM7QUFDakQsTUFB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R0FBUixFQUFhLEtBQUssQ0FBTCxDQUFiLEVBQXNCLEtBQUssQ0FBTCxDQUF0QixFQUErQixLQUFLLENBQUwsQ0FBL0IsRUFBeUM7QUFDakQ7QUFBUyxXQUFHLEtBQUgsQ0FBUyxHQUFULEVBQWMsSUFBZDtBQUxYO0FBT0QsR0F4ZFk7OztBQTBkYixVQTFkYTs7QUE0ZGIsS0E1ZGEsZUE0ZFQsQ0E1ZFMsRUE0ZE47QUFDTCxXQUFPLE1BQU0sSUFBTixJQUFjLE1BQU0sU0FBM0I7QUFDRCxHQTlkWTtBQWdlYixZQWhlYSxzQkFnZUYsQ0FoZUUsRUFnZUM7QUFDWixXQUFPLE1BQU0sSUFBTixJQUFjLE1BQU0sU0FBcEIsSUFBaUMsTUFBTSxFQUE5QztBQUNEO0FBbGVZLEM7Ozs7O0FDdlBmOzs7O0FBQ0E7Ozs7QUFDQTs7OztBQUNBOzs7O0FBQ0E7Ozs7QUFDQTs7OztBQUNBOzs7O0FBRUEsb0JBQVUsU0FBVixDQUFvQjtBQUNsQixVQUFRLHNCQURVO0FBRWxCLGFBQVcsc0JBRk87QUFHbEIsVUFBUTtBQUhVLENBQXBCLEUsQ0FsQkE7Ozs7Ozs7Ozs7OztBQXdCQSxJQUFJLE9BQU8sTUFBUCxJQUFpQixXQUFyQixFQUFrQztBQUNoQyxTQUFPLFNBQVAsR0FBbUI7QUFDakIsZUFBVyxtQkFETTtBQUVqQixlQUFXLG1CQUZNO0FBR2pCLGVBQVcsbUJBSE07QUFJakIsa0JBQWMsc0JBSkc7QUFLakIsa0JBQWMsc0JBTEc7QUFNakIsZUFBVyxtQkFOTTtBQU9qQixpQkFBYSxrQkFQSTtBQVFqQixXQUFPO0FBQ0wsb0JBQWM7QUFEVDtBQVJVLEdBQW5CO0FBWUQ7O0FBRUQsT0FBTyxPQUFQLEdBQWlCO0FBQ2YsZ0NBRGU7QUFFZixnQ0FGZTtBQUdmLGdDQUhlO0FBSWYsc0NBSmU7QUFLZixzQ0FMZTtBQU1mLGlDQU5lO0FBT2Y7QUFQZSxDQUFqQiIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uKCl7ZnVuY3Rpb24gcihlLG4sdCl7ZnVuY3Rpb24gbyhpLGYpe2lmKCFuW2ldKXtpZighZVtpXSl7dmFyIGM9XCJmdW5jdGlvblwiPT10eXBlb2YgcmVxdWlyZSYmcmVxdWlyZTtpZighZiYmYylyZXR1cm4gYyhpLCEwKTtpZih1KXJldHVybiB1KGksITApO3ZhciBhPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIraStcIidcIik7dGhyb3cgYS5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGF9dmFyIHA9bltpXT17ZXhwb3J0czp7fX07ZVtpXVswXS5jYWxsKHAuZXhwb3J0cyxmdW5jdGlvbihyKXt2YXIgbj1lW2ldWzFdW3JdO3JldHVybiBvKG58fHIpfSxwLHAuZXhwb3J0cyxyLGUsbix0KX1yZXR1cm4gbltpXS5leHBvcnRzfWZvcih2YXIgdT1cImZ1bmN0aW9uXCI9PXR5cGVvZiByZXF1aXJlJiZyZXF1aXJlLGk9MDtpPHQubGVuZ3RoO2krKylvKHRbaV0pO3JldHVybiBvfXJldHVybiByfSkoKSIsIi8qKlxyXG4gKiBFdmVudHMuXHJcbiAqIGh0dHBzOi8vZ2l0aHViLmNvbS9Sb2JlcnRvUHJldmF0by9EYXRhRW50cnlcclxuICpcclxuICogQ29weXJpZ2h0IDIwMTksIFJvYmVydG8gUHJldmF0b1xyXG4gKiBodHRwczovL3JvYmVydG9wcmV2YXRvLmdpdGh1Yi5pb1xyXG4gKlxyXG4gKiBMaWNlbnNlZCB1bmRlciB0aGUgTUlUIGxpY2Vuc2U6XHJcbiAqIGh0dHA6Ly93d3cub3BlbnNvdXJjZS5vcmcvbGljZW5zZXMvTUlUXHJcbiAqL1xyXG5pbXBvcnQgXyBmcm9tIFwiLi4vLi4vc2NyaXB0cy91dGlsc1wiO1xyXG5cclxudmFyIGFycmF5ID0gW107XHJcbnZhciBwdXNoID0gYXJyYXkucHVzaDtcclxudmFyIHNsaWNlID0gYXJyYXkuc2xpY2U7XHJcbnZhciBzcGxpY2UgPSBhcnJheS5zcGxpY2U7XHJcblxyXG4vLyBSZWd1bGFyIGV4cHJlc3Npb24gdXNlZCB0byBzcGxpdCBldmVudCBzdHJpbmdzLlxyXG5jb25zdCBldmVudFNwbGl0dGVyID0gL1xccysvO1xyXG5cclxudmFyIGV2ZW50c0FwaSA9IGZ1bmN0aW9uIChvYmosIGFjdGlvbiwgbmFtZSwgcmVzdCkge1xyXG4gIGlmICghbmFtZSkgcmV0dXJuIHRydWU7XHJcblxyXG4gIC8vIEhhbmRsZSBldmVudCBtYXBzLlxyXG4gIGlmICh0eXBlb2YgbmFtZSA9PT0gXCJvYmplY3RcIikge1xyXG4gICAgZm9yICh2YXIga2V5IGluIG5hbWUpIHtcclxuICAgICAgb2JqW2FjdGlvbl0uYXBwbHkob2JqLCBba2V5LCBuYW1lW2tleV1dLmNvbmNhdChyZXN0KSk7XHJcbiAgICB9XHJcbiAgICByZXR1cm4gZmFsc2U7XHJcbiAgfVxyXG5cclxuICAvLyBIYW5kbGUgc3BhY2Ugc2VwYXJhdGVkIGV2ZW50IG5hbWVzLlxyXG4gIGlmIChldmVudFNwbGl0dGVyLnRlc3QobmFtZSkpIHtcclxuICAgIHZhciBuYW1lcyA9IG5hbWUuc3BsaXQoZXZlbnRTcGxpdHRlcik7XHJcbiAgICBmb3IgKHZhciBpID0gMCwgbCA9IG5hbWVzLmxlbmd0aDsgaSA8IGw7IGkrKykge1xyXG4gICAgICBvYmpbYWN0aW9uXS5hcHBseShvYmosIFtuYW1lc1tpXV0uY29uY2F0KHJlc3QpKTtcclxuICAgIH1cclxuICAgIHJldHVybiBmYWxzZTtcclxuICB9XHJcblxyXG4gIHJldHVybiB0cnVlO1xyXG59XHJcblxyXG52YXIgdHJpZ2dlckV2ZW50cyA9IGZ1bmN0aW9uIChldmVudHMsIGFyZ3MpIHtcclxuICB2YXIgZXYsIGkgPSAtMSwgbCA9IGV2ZW50cy5sZW5ndGgsIGExID0gYXJnc1swXSwgYTIgPSBhcmdzWzFdLCBhMyA9IGFyZ3NbMl07XHJcbiAgc3dpdGNoIChhcmdzLmxlbmd0aCkge1xyXG4gICAgY2FzZSAwOiB3aGlsZSAoKytpIDwgbCkgKGV2ID0gZXZlbnRzW2ldKS5jYWxsYmFjay5jYWxsKGV2LmN0eCk7IHJldHVybjtcclxuICAgIGNhc2UgMTogd2hpbGUgKCsraSA8IGwpIChldiA9IGV2ZW50c1tpXSkuY2FsbGJhY2suY2FsbChldi5jdHgsIGExKTsgcmV0dXJuO1xyXG4gICAgY2FzZSAyOiB3aGlsZSAoKytpIDwgbCkgKGV2ID0gZXZlbnRzW2ldKS5jYWxsYmFjay5jYWxsKGV2LmN0eCwgYTEsIGEyKTsgcmV0dXJuO1xyXG4gICAgY2FzZSAzOiB3aGlsZSAoKytpIDwgbCkgKGV2ID0gZXZlbnRzW2ldKS5jYWxsYmFjay5jYWxsKGV2LmN0eCwgYTEsIGEyLCBhMyk7IHJldHVybjtcclxuICAgIGRlZmF1bHQ6IHdoaWxlICgrK2kgPCBsKSAoZXYgPSBldmVudHNbaV0pLmNhbGxiYWNrLmFwcGx5KGV2LmN0eCwgYXJncyk7XHJcbiAgfVxyXG59XHJcblxyXG4vL1xyXG4vLyBCYXNlIGNsYXNzIGZvciBldmVudHMgZW1pdHRlcnNcclxuLy9cclxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgRXZlbnRzRW1pdHRlciB7XHJcblxyXG4gIC8vIEJpbmQgYW4gZXZlbnQgdG8gYSBgY2FsbGJhY2tgIGZ1bmN0aW9uLiBQYXNzaW5nIGBcImFsbFwiYCB3aWxsIGJpbmRcclxuICAvLyB0aGUgY2FsbGJhY2sgdG8gYWxsIGV2ZW50cyBmaXJlZC5cclxuICBvbihuYW1lLCBjYWxsYmFjaywgY29udGV4dCkge1xyXG4gICAgaWYgKCFldmVudHNBcGkodGhpcywgXCJvblwiLCBuYW1lLCBbY2FsbGJhY2ssIGNvbnRleHRdKSB8fCAhY2FsbGJhY2spIHJldHVybiB0aGlzO1xyXG4gICAgdGhpcy5fZXZlbnRzIHx8ICh0aGlzLl9ldmVudHMgPSB7fSk7XHJcbiAgICB2YXIgZXZlbnRzID0gdGhpcy5fZXZlbnRzW25hbWVdIHx8ICh0aGlzLl9ldmVudHNbbmFtZV0gPSBbXSk7XHJcbiAgICBldmVudHMucHVzaCh7IGNhbGxiYWNrOiBjYWxsYmFjaywgY29udGV4dDogY29udGV4dCwgY3R4OiBjb250ZXh0IHx8IHRoaXMgfSk7XHJcbiAgICByZXR1cm4gdGhpcztcclxuICB9XHJcblxyXG4gIC8vIEJpbmQgYW4gZXZlbnQgdG8gb25seSBiZSB0cmlnZ2VyZWQgYSBzaW5nbGUgdGltZS4gQWZ0ZXIgdGhlIGZpcnN0IHRpbWVcclxuICAvLyB0aGUgY2FsbGJhY2sgaXMgaW52b2tlZCwgaXQgd2lsbCBiZSByZW1vdmVkLlxyXG4gIG9uY2UobmFtZSwgY2FsbGJhY2ssIGNvbnRleHQpIHtcclxuICAgIGlmICghZXZlbnRzQXBpKHRoaXMsIFwib25jZVwiLCBuYW1lLCBbY2FsbGJhY2ssIGNvbnRleHRdKSB8fCAhY2FsbGJhY2spIHJldHVybiB0aGlzO1xyXG4gICAgdmFyIHNlbGYgPSB0aGlzO1xyXG4gICAgdmFyIG9uY2UgPSBfLm9uY2UoZnVuY3Rpb24gKCkge1xyXG4gICAgICBzZWxmLm9mZihuYW1lLCBvbmNlKTtcclxuICAgICAgY2FsbGJhY2suYXBwbHkodGhpcywgYXJndW1lbnRzKTtcclxuICAgIH0pO1xyXG4gICAgb25jZS5fY2FsbGJhY2sgPSBjYWxsYmFjaztcclxuICAgIHJldHVybiB0aGlzLm9uKG5hbWUsIG9uY2UsIGNvbnRleHQpO1xyXG4gIH1cclxuXHJcbiAgLy8gUmVtb3ZlIG9uZSBvciBtYW55IGNhbGxiYWNrcy5cclxuICBvZmYobmFtZSwgY2FsbGJhY2ssIGNvbnRleHQpIHtcclxuICAgIHZhciByZXRhaW4sIGV2LCBldmVudHMsIG5hbWVzLCBpLCBsLCBqLCBrO1xyXG4gICAgaWYgKCF0aGlzLl9ldmVudHMgfHwgIWV2ZW50c0FwaSh0aGlzLCBcIm9mZlwiLCBuYW1lLCBbY2FsbGJhY2ssIGNvbnRleHRdKSkgcmV0dXJuIHRoaXM7XHJcbiAgICBpZiAoIW5hbWUgJiYgIWNhbGxiYWNrICYmICFjb250ZXh0KSB7XHJcbiAgICAgIHRoaXMuX2V2ZW50cyA9IHt9O1xyXG4gICAgICByZXR1cm4gdGhpcztcclxuICAgIH1cclxuXHJcbiAgICBuYW1lcyA9IG5hbWUgPyBbbmFtZV0gOiBfLmtleXModGhpcy5fZXZlbnRzKTtcclxuICAgIGZvciAoaSA9IDAsIGwgPSBuYW1lcy5sZW5ndGg7IGkgPCBsOyBpKyspIHtcclxuICAgICAgbmFtZSA9IG5hbWVzW2ldO1xyXG4gICAgICBpZiAoZXZlbnRzID0gdGhpcy5fZXZlbnRzW25hbWVdKSB7XHJcbiAgICAgICAgdGhpcy5fZXZlbnRzW25hbWVdID0gcmV0YWluID0gW107XHJcbiAgICAgICAgaWYgKGNhbGxiYWNrIHx8IGNvbnRleHQpIHtcclxuICAgICAgICAgIGZvciAoaiA9IDAsIGsgPSBldmVudHMubGVuZ3RoOyBqIDwgazsgaisrKSB7XHJcbiAgICAgICAgICAgIGV2ID0gZXZlbnRzW2pdO1xyXG4gICAgICAgICAgICBpZiAoKGNhbGxiYWNrICYmIGNhbGxiYWNrICE9PSBldi5jYWxsYmFjayAmJiBjYWxsYmFjayAhPT0gZXYuY2FsbGJhY2suX2NhbGxiYWNrKSB8fFxyXG4gICAgICAgICAgICAoY29udGV4dCAmJiBjb250ZXh0ICE9PSBldi5jb250ZXh0KSkge1xyXG4gICAgICAgICAgICAgIHJldGFpbi5wdXNoKGV2KTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAoIXJldGFpbi5sZW5ndGgpIGRlbGV0ZSB0aGlzLl9ldmVudHNbbmFtZV07XHJcbiAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4gdGhpcztcclxuICB9XHJcblxyXG4gIC8vIFRyaWdnZXIgb25lIG9yIG1hbnkgZXZlbnRzLCBmaXJpbmcgYWxsIGJvdW5kIGNhbGxiYWNrcy5cclxuICB0cmlnZ2VyKG5hbWUpIHtcclxuICAgIGlmICghdGhpcy5fZXZlbnRzKSByZXR1cm4gdGhpcztcclxuICAgIHZhciBhcmdzID0gc2xpY2UuY2FsbChhcmd1bWVudHMsIDEpO1xyXG4gICAgaWYgKCFldmVudHNBcGkodGhpcywgXCJ0cmlnZ2VyXCIsIG5hbWUsIGFyZ3MpKSByZXR1cm4gdGhpcztcclxuICAgIHZhciBldmVudHMgPSB0aGlzLl9ldmVudHNbbmFtZV07XHJcbiAgICB2YXIgYWxsRXZlbnRzID0gdGhpcy5fZXZlbnRzLmFsbDtcclxuICAgIGlmIChldmVudHMpIHRyaWdnZXJFdmVudHMoZXZlbnRzLCBhcmdzKTtcclxuICAgIGlmIChhbGxFdmVudHMpIHRyaWdnZXJFdmVudHMoYWxsRXZlbnRzLCBhcmd1bWVudHMpO1xyXG4gICAgcmV0dXJuIHRoaXM7XHJcbiAgfVxyXG5cclxuICAvLyBUcmlnZ2VyIG9uZSBvciBtYW55IGV2ZW50cywgZmlyaW5nIGFsbCBib3VuZCBjYWxsYmFja3MuXHJcbiAgZW1pdChuYW1lKSB7XHJcbiAgICByZXR1cm4gdGhpcy50cmlnZ2VyKG5hbWUpO1xyXG4gIH1cclxuXHJcbiAgLy8gVGVsbCB0aGlzIG9iamVjdCB0byBzdG9wIGxpc3RlbmluZyB0byBlaXRoZXIgc3BlY2lmaWMgZXZlbnRzLCBvclxyXG4gIC8vIHRvIGV2ZXJ5IG9iamVjdCBpdCdzIGN1cnJlbnRseSBsaXN0ZW5pbmcgdG8uXHJcbiAgc3RvcExpc3RlbmluZyhvYmosIG5hbWUsIGNhbGxiYWNrKSB7XHJcbiAgICB2YXIgbGlzdGVuZXJzID0gdGhpcy5fbGlzdGVuZXJzO1xyXG4gICAgaWYgKCFsaXN0ZW5lcnMpIHJldHVybiB0aGlzO1xyXG4gICAgdmFyIGRlbGV0ZUxpc3RlbmVyID0gIW5hbWUgJiYgIWNhbGxiYWNrO1xyXG4gICAgaWYgKHR5cGVvZiBuYW1lID09PSBcIm9iamVjdFwiKSBjYWxsYmFjayA9IHRoaXM7XHJcbiAgICBpZiAob2JqKSAobGlzdGVuZXJzID0ge30pW29iai5fbGlzdGVuZXJJZF0gPSBvYmo7XHJcbiAgICBmb3IgKHZhciBpZCBpbiBsaXN0ZW5lcnMpIHtcclxuICAgICAgbGlzdGVuZXJzW2lkXS5vZmYobmFtZSwgY2FsbGJhY2ssIHRoaXMpO1xyXG4gICAgICBpZiAoZGVsZXRlTGlzdGVuZXIpIGRlbGV0ZSB0aGlzLl9saXN0ZW5lcnNbaWRdO1xyXG4gICAgfVxyXG4gICAgcmV0dXJuIHRoaXM7XHJcbiAgfVxyXG5cclxuICBsaXN0ZW5UbyhvYmosIG5hbWUsIGNhbGxiYWNrKSB7XHJcbiAgICAvLyBzdXBwb3J0IGNhbGxpbmcgdGhlIG1ldGhvZCB3aXRoIGFuIG9iamVjdCBhcyBzZWNvbmQgcGFyYW1ldGVyXHJcbiAgICBpZiAoYXJndW1lbnRzLmxlbmd0aCA9PSAyICYmIHR5cGVvZiBuYW1lID09IFwib2JqZWN0XCIpIHtcclxuICAgICAgdmFyIHg7XHJcbiAgICAgIGZvciAoeCBpbiBuYW1lKSB7XHJcbiAgICAgICAgdGhpcy5saXN0ZW5UbyhvYmosIHgsIG5hbWVbeF0pO1xyXG4gICAgICB9XHJcbiAgICAgIHJldHVybiB0aGlzO1xyXG4gICAgfVxyXG5cclxuICAgIHZhciBsaXN0ZW5lcnMgPSB0aGlzLl9saXN0ZW5lcnMgfHwgKHRoaXMuX2xpc3RlbmVycyA9IHt9KTtcclxuICAgIHZhciBpZCA9IG9iai5fbGlzdGVuZXJJZCB8fCAob2JqLl9saXN0ZW5lcklkID0gXy51bmlxdWVJZChcImxcIikpO1xyXG4gICAgbGlzdGVuZXJzW2lkXSA9IG9iajtcclxuICAgIGlmICh0eXBlb2YgbmFtZSA9PT0gXCJvYmplY3RcIikgY2FsbGJhY2sgPSB0aGlzO1xyXG4gICAgb2JqLm9uKG5hbWUsIGNhbGxiYWNrLCB0aGlzKTtcclxuICAgIHJldHVybiB0aGlzO1xyXG4gIH1cclxuXHJcbiAgbGlzdGVuVG9PbmNlKG9iaiwgbmFtZSwgY2FsbGJhY2spIHtcclxuICAgIHZhciBsaXN0ZW5lcnMgPSB0aGlzLl9saXN0ZW5lcnMgfHwgKHRoaXMuX2xpc3RlbmVycyA9IHt9KTtcclxuICAgIHZhciBpZCA9IG9iai5fbGlzdGVuZXJJZCB8fCAob2JqLl9saXN0ZW5lcklkID0gXy51bmlxdWVJZChcImxcIikpO1xyXG4gICAgbGlzdGVuZXJzW2lkXSA9IG9iajtcclxuICAgIGlmICh0eXBlb2YgbmFtZSA9PT0gXCJvYmplY3RcIikgY2FsbGJhY2sgPSB0aGlzO1xyXG4gICAgb2JqLm9uY2UobmFtZSwgY2FsbGJhY2ssIHRoaXMpO1xyXG4gICAgcmV0dXJuIHRoaXM7XHJcbiAgfVxyXG59O1xyXG4iLCIvKipcclxuICogRE9NIHV0aWxpdGllcy5cclxuICogaHR0cHM6Ly9naXRodWIuY29tL1JvYmVydG9QcmV2YXRvL0RhdGFFbnRyeVxyXG4gKlxyXG4gKiBDb3B5cmlnaHQgMjAxOSwgUm9iZXJ0byBQcmV2YXRvXHJcbiAqIGh0dHBzOi8vcm9iZXJ0b3ByZXZhdG8uZ2l0aHViLmlvXHJcbiAqXHJcbiAqIExpY2Vuc2VkIHVuZGVyIHRoZSBNSVQgbGljZW5zZTpcclxuICogaHR0cDovL3d3dy5vcGVuc291cmNlLm9yZy9saWNlbnNlcy9NSVRcclxuICovXHJcbmNvbnN0IE9CSkVDVCA9IFwib2JqZWN0XCIsXHJcbiAgU1RSSU5HID0gXCJzdHJpbmdcIixcclxuICBOVU1CRVIgPSBcIm51bWJlclwiLFxyXG4gIEZVTkNUSU9OID0gXCJmdW5jdGlvblwiLFxyXG4gIFJFUCA9IFwicmVwbGFjZVwiO1xyXG5pbXBvcnQgXyBmcm9tIFwiLi4vc2NyaXB0cy91dGlscy5qc1wiO1xyXG5cclxuY29uc3QgbGVuID0gXy5sZW47XHJcbmNvbnN0IGFueSA9IF8uYW55O1xyXG5jb25zdCBlYWNoID0gXy5lYWNoO1xyXG5cclxuLyoqXHJcbiogUmV0dXJucyB0aGUgY3VycmVudGx5IGFjdGl2ZSBlbGVtZW50LCBpbiB0aGUgRE9NLlxyXG4qL1xyXG5mdW5jdGlvbiBnZXRGb2N1c2VkRWxlbWVudCgpIHtcclxuIHJldHVybiBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiOmZvY3VzXCIpO1xyXG59XHJcbi8qKlxyXG4qIFJldHVybiBhIHZhbHVlIGluZGljYXRpbmcgd2hldGhlciB0aGUgZ2l2ZW4gZWxlbWVudCBpcyBmb2N1c2VkLlxyXG4qXHJcbiogQHBhcmFtIGVsOiBlbGVtZW50IHRvIGNoZWNrIGZvciBmb2N1c1xyXG4qL1xyXG5mdW5jdGlvbiBpc0ZvY3VzZWQoZWwpIHtcclxuIGlmICghZWwpIHJldHVybiBmYWxzZTtcclxuIHJldHVybiBlbCA9PT0gZ2V0Rm9jdXNlZEVsZW1lbnQoKTtcclxufVxyXG5cclxuZnVuY3Rpb24gbW9kQ2xhc3MoZWwsIG4sIGFkZCkge1xyXG4gIGlmIChuLnNlYXJjaCgvXFxzLykgPiAtMSkge1xyXG4gICAgbiA9IG4uc3BsaXQoL1xccy9nKTtcclxuICAgIGZvciAodmFyIGkgPSAwLCBsID0gbGVuKG4pOyBpIDwgbDsgaSArKykge1xyXG4gICAgICBtb2RDbGFzcyhlbCwgbltpXSwgYWRkKTtcclxuICAgIH1cclxuICB9IGVsc2UgaWYgKHR5cGVvZiBuID09IFNUUklORykge1xyXG4gICAgZWwuY2xhc3NMaXN0W2FkZCA/IFwiYWRkXCIgOiBcInJlbW92ZVwiXShuKTtcclxuICB9XHJcbiAgcmV0dXJuIGVsO1xyXG59XHJcbmZ1bmN0aW9uIGFkZENsYXNzKGVsLCBuKSB7XHJcbiAgcmV0dXJuIG1vZENsYXNzKGVsLCBuLCAxKTtcclxufVxyXG5mdW5jdGlvbiByZW1vdmVDbGFzcyhlbCwgbikge1xyXG4gIHJldHVybiBtb2RDbGFzcyhlbCwgbiwgMCk7XHJcbn1cclxuZnVuY3Rpb24gaGFzQ2xhc3MoZWwsIG4pIHtcclxuICByZXR1cm4gZWwgJiYgZWwuY2xhc3NMaXN0LmNvbnRhaW5zKG4pO1xyXG59XHJcbmZ1bmN0aW9uIGF0dHIoZWwsIG4pIHtcclxuICByZXR1cm4gZWwuZ2V0QXR0cmlidXRlKG4pO1xyXG59XHJcbmZ1bmN0aW9uIGF0dHJOYW1lKGVsKSB7XHJcbiAgcmV0dXJuIGF0dHIoZWwsIFwibmFtZVwiKTtcclxufVxyXG5mdW5jdGlvbiBzZXRBdHRyKGVsLCBvKSB7XHJcbiAgZm9yIChsZXQgeCBpbiBvKSB7XHJcbiAgICBlbC5zZXRBdHRyaWJ1dGUoeCwgb1t4XSk7XHJcbiAgfVxyXG59XHJcbmZ1bmN0aW9uIG5hbWVTZWxlY3RvcihlbCkge1xyXG4gIHJldHVybiBcIltuYW1lPSdcIiArIChfLmlzU3RyaW5nKGVsKSA/IGVsIDogYXR0ck5hbWUoZWwpKSArIFwiJ11cIjtcclxufVxyXG5mdW5jdGlvbiBpc1Bhc3N3b3JkKG8pIHtcclxuICByZXR1cm4gaXNJbnB1dChvKSAmJiBhdHRyKG8sIFwidHlwZVwiKSA9PSBcInBhc3N3b3JkXCI7XHJcbn1cclxuY29uc3QgaXNJRSA9IC9UcmlkZW50XFwvfE1TSUUvLnRlc3Qod2luZG93Lm5hdmlnYXRvci51c2VyQWdlbnQpO1xyXG5cclxuLyoqXHJcbiAqIEZpcmVzIGFuIGV2ZW50IG9uIGEgZ2l2ZW4gZWxlbWVudC5cclxuICpcclxuICogQHBhcmFtIGVsOiBlbGVtZW50IG9uIHdoaWNoIHRvIGZpcmUgYW4gZXZlbnQuXHJcbiAqIEBwYXJhbSBldmVudE5hbWU6IG5hbWUgb2YgdGhlIGV2ZW50IHRvIGZpcmUuXHJcbiAqIEBwYXJhbSBkYXRhOiBldmVudCBkYXRhLlxyXG4gKi9cclxuZnVuY3Rpb24gZmlyZShlbCwgZXZlbnROYW1lLCBkYXRhKSB7XHJcbiAgaWYgKGV2ZW50TmFtZSA9PSBcImZvY3VzXCIpIHtcclxuICAgIGVsLmZvY3VzKCk7XHJcbiAgfVxyXG4gIHZhciBldmVudDtcclxuICBpZiAoaXNJRSkge1xyXG4gICAgZXZlbnQgPSBkb2N1bWVudC5jcmVhdGVFdmVudChcIkV2ZW50XCIpO1xyXG4gICAgLy8gYXJnczogc3RyaW5nIHR5cGUsIGJvb2xlYW4gYnViYmxlcywgYm9vbGVhbiBjYW5jZWxsYWJsZVxyXG4gICAgZXZlbnQuaW5pdEV2ZW50KGV2ZW50TmFtZSwgZmFsc2UsIHRydWUpOyBcclxuICAgIGVsLmRpc3BhdGNoRXZlbnQoZXZlbnQpO1xyXG4gICAgcmV0dXJuO1xyXG4gIH1cclxuICBpZiAod2luZG93LkN1c3RvbUV2ZW50KSB7XHJcbiAgICBldmVudCA9IG5ldyBDdXN0b21FdmVudChldmVudE5hbWUsIHsgZGV0YWlsOiBkYXRhIH0pO1xyXG4gIH0gZWxzZSBpZiAoZG9jdW1lbnQuY3JlYXRlRXZlbnQpIHtcclxuICAgIGV2ZW50ID0gZG9jdW1lbnQuY3JlYXRlRXZlbnQoXCJDdXN0b21FdmVudFwiKTtcclxuICAgIGV2ZW50LmluaXRDdXN0b21FdmVudChldmVudE5hbWUsIHRydWUsIHRydWUsIGRhdGEpO1xyXG4gIH1cclxuICBlbC5kaXNwYXRjaEV2ZW50KGV2ZW50KTtcclxufVxyXG5mdW5jdGlvbiBzZXRWYWx1ZShlbCwgdikge1xyXG4gIGlmIChlbC50eXBlID09IFwiY2hlY2tib3hcIikge1xyXG4gICAgZWwuY2hlY2tlZCA9IHYgPT0gdHJ1ZSB8fCAvMXx0cnVlLy50ZXN0KHYpO1xyXG4gICAgZmlyZShlbCwgXCJjaGFuZ2VcIiwgeyBmb3JjZWQ6IHRydWUgfSk7XHJcbiAgICByZXR1cm47XHJcbiAgfVxyXG4gIGlmIChlbC52YWx1ZSAhPSB2KSB7XHJcbiAgICB2YXIgc2VsZWN0aW9uU3RhcnQ7XHJcblxyXG4gICAgaWYgKGlzSUUpIHtcclxuICAgICAgc2VsZWN0aW9uU3RhcnQgPSBlbC5zZWxlY3Rpb25TdGFydDtcclxuICAgIH1cclxuXHJcbiAgICBlbC52YWx1ZSA9IHY7XHJcblxyXG4gICAgLy8gZml4IGZvciBJRTExIG1vdmluZyBjYXJldCBhdCB0aGUgYmVnaW5uaW5nIG9mIHRoZSB2YWx1ZSwgYWZ0ZXIgc2V0dGluZyBlbGVtZW50IHZhbHVlXHJcbiAgICBpZiAoaXNJRSAmJiBpc0ZvY3VzZWQoZWwpKSB7XHJcbiAgICAgIGVsLnNlbGVjdGlvblN0YXJ0ID0gc2VsZWN0aW9uU3RhcnQ7XHJcbiAgICB9XHJcbiAgICBmaXJlKGVsLCBcImNoYW5nZVwiLCB7IGZvcmNlZDogdHJ1ZSB9KTtcclxuICB9XHJcbn1cclxuZnVuY3Rpb24gaXNDb250ZW50RWRpdGFibGUoZWwpIHtcclxuICByZXR1cm4gZWwgJiYgZWwuY29udGVudEVkaXRhYmxlID09IFwidHJ1ZVwiO1xyXG59XHJcbmZ1bmN0aW9uIGdldFZhbHVlKGVsKSB7XHJcbiAgdmFyIGlzSW5wdXQgPSAvaW5wdXQvaS50ZXN0KGVsLnRhZ05hbWUpO1xyXG4gIGlmIChpc0lucHV0KSB7XHJcbiAgICBzd2l0Y2ggKGF0dHIoZWwsIFwidHlwZVwiKSkge1xyXG4gICAgICBjYXNlIFwicmFkaW9cIjpcclxuICAgICAgY2FzZSBcImNoZWNrYm94XCI6XHJcbiAgICAgICAgcmV0dXJuIGVsLmNoZWNrZWQ7XHJcbiAgICB9XHJcbiAgfVxyXG4gIGlmICgvc2VsZWN0L2kudGVzdChlbC50YWdOYW1lKSkge1xyXG4gICAgaWYgKGVsLm11bHRpcGxlKSB7XHJcbiAgICAgIC8vIHJldHVybiBhbiBhcnJheSB3aXRoIGFsbCBzZWxlY3RlZCB2YWx1ZXNcclxuICAgICAgdmFyIHYgPSBbXTtcclxuICAgICAgZWFjaChlbC5xdWVyeVNlbGVjdG9yQWxsKFwib3B0aW9uXCIpLCBvID0+IHtcclxuICAgICAgICBpZiAoby5zZWxlY3RlZClcclxuICAgICAgICAgIHYucHVzaChvLnZhbHVlKTtcclxuICAgICAgfSk7XHJcbiAgICAgIHJldHVybiB2O1xyXG4gICAgfVxyXG4gIH1cclxuICBpZiAoaXNDb250ZW50RWRpdGFibGUoZWwpKSB7XHJcbiAgICByZXR1cm4gZWwuaW5uZXJUZXh0OyAvLyBpbm5lclRleHQgcmVzcGVjdHMgbGluZSBicmVha3NcclxuICB9XHJcbiAgcmV0dXJuIGVsLnZhbHVlO1xyXG59XHJcbmZ1bmN0aW9uIGlzUmFkaW9CdXR0b24oZWwpIHtcclxuICByZXR1cm4gZWwgJiYgL15pbnB1dCQvaS50ZXN0KGVsLnRhZ05hbWUpICYmIC9eKHJhZGlvKSQvaS50ZXN0KGVsLnR5cGUpO1xyXG59XHJcbmZ1bmN0aW9uIGlzQ2hlY2tib3goZWwpIHtcclxuICByZXR1cm4gZWwgJiYgL15pbnB1dCQvaS50ZXN0KGVsLnRhZ05hbWUpICYmIC9eKGNoZWNrYm94KSQvaS50ZXN0KGVsLnR5cGUpO1xyXG59XHJcbmZ1bmN0aW9uIGlzU2VsZWN0YWJsZShlbCkge1xyXG4gIHJldHVybiBlbCAmJiAoL15zZWxlY3QkL2kudGVzdChlbC50YWdOYW1lKSB8fCBpc1JhZGlvQnV0dG9uKGVsKSk7XHJcbn1cclxuZnVuY3Rpb24gbmV4dChlbCkge1xyXG4gIHJldHVybiBlbC5uZXh0RWxlbWVudFNpYmxpbmc7XHJcbn1cclxuZnVuY3Rpb24gbmV4dFdpdGhDbGFzcyhlbCwgbikge1xyXG4gIHZhciBhID0gZWwubmV4dEVsZW1lbnRTaWJsaW5nO1xyXG4gIHJldHVybiBoYXNDbGFzcyhhLCBuKSA/IGEgOiB1bmRlZmluZWQ7XHJcbn1cclxuZnVuY3Rpb24gbGFzdFNpYmxpbmcoZWwsIGZuKSB7XHJcbiAgdmFyIG54ID0gZWw7XHJcbiAgd2hpbGUgKG54ID0gbngubmV4dEVsZW1lbnRTaWJsaW5nKSB7XHJcbiAgICBpZiAoZm4obngpKVxyXG4gICAgICBicmVhaztcclxuICB9XHJcbiAgcmV0dXJuIG54O1xyXG59XHJcbmZ1bmN0aW9uIHByZXYoZWwpIHtcclxuICByZXR1cm4gZWwucHJldmlvdXNFbGVtZW50U2libGluZztcclxufVxyXG5mdW5jdGlvbiBmaW5kKGVsLCBzZWxlY3Rvcikge1xyXG4gIHJldHVybiBlbC5xdWVyeVNlbGVjdG9yQWxsKHNlbGVjdG9yKTtcclxufVxyXG5mdW5jdGlvbiBmaW5kRmlyc3QoZWwsIHNlbGVjdG9yKSB7XHJcbiAgcmV0dXJuIGVsLnF1ZXJ5U2VsZWN0b3JBbGwoc2VsZWN0b3IpWzBdO1xyXG59XHJcbmZ1bmN0aW9uIGZpbmRGaXJzdEJ5Q2xhc3MoZWwsIG5hbWUpIHtcclxuICByZXR1cm4gZWwuZ2V0RWxlbWVudHNCeUNsYXNzTmFtZShuYW1lKVswXTtcclxufVxyXG5mdW5jdGlvbiBpc0hpZGRlbihlbCkge1xyXG4gIHZhciBzdHlsZSA9IHdpbmRvdy5nZXRDb21wdXRlZFN0eWxlKGVsKTtcclxuICByZXR1cm4gKHN0eWxlLmRpc3BsYXkgPT0gXCJub25lXCIgfHwgc3R5bGUudmlzaWJpbGl0eSA9PSBcImhpZGRlblwiKTtcclxufVxyXG5mdW5jdGlvbiBjcmVhdGVFbGVtZW50KHRhZykge1xyXG4gIHJldHVybiBkb2N1bWVudC5jcmVhdGVFbGVtZW50KHRhZyk7XHJcbn1cclxuZnVuY3Rpb24gYWZ0ZXIoYSwgYikge1xyXG4gIGEucGFyZW50Tm9kZS5pbnNlcnRCZWZvcmUoYiwgYS5uZXh0U2libGluZyk7XHJcbn1cclxuZnVuY3Rpb24gYXBwZW5kKGEsIGIpIHtcclxuICBhLmFwcGVuZENoaWxkKGIpO1xyXG59XHJcbmZ1bmN0aW9uIHBhcmVudChlbCkge1xyXG4gIHJldHVybiBlbC5wYXJlbnRFbGVtZW50IHx8IGVsLnBhcmVudE5vZGU7XHJcbn1cclxuZnVuY3Rpb24gaXNFbGVtZW50KG8pIHtcclxuICByZXR1cm4gKFxyXG4gICAgdHlwZW9mIEhUTUxFbGVtZW50ID09PSBPQkpFQ1QgPyBvIGluc3RhbmNlb2YgSFRNTEVsZW1lbnQgOiAvL0RPTTJcclxuICAgIG8gJiYgdHlwZW9mIG8gPT09IE9CSkVDVCAmJiBvICE9PSBudWxsICYmIG8ubm9kZVR5cGUgPT09IDEgJiYgdHlwZW9mIG8ubm9kZU5hbWUgPT09IFNUUklOR1xyXG4gICk7XHJcbn1cclxuZnVuY3Rpb24gaXNBbnlJbnB1dChvKSB7XHJcbiAgcmV0dXJuIG8gJiYgaXNFbGVtZW50KG8pICYmICgvaW5wdXR8YnV0dG9ufHRleHRhcmVhfHNlbGVjdC9pLnRlc3Qoby50YWdOYW1lKSB8fCBpc0NvbnRlbnRFZGl0YWJsZShvKSk7XHJcbn1cclxuZnVuY3Rpb24gaXNJbnB1dChvKSB7XHJcbiAgcmV0dXJuIG8gJiYgaXNFbGVtZW50KG8pICYmIC9pbnB1dC9pLnRlc3Qoby50YWdOYW1lKTtcclxufVxyXG5mdW5jdGlvbiBleHBlY3RQYXJlbnQoZWwpIHtcclxuICBpZiAoIWlzRWxlbWVudChlbCkpIHRocm93IG5ldyBFcnJvcihcImV4cGVjdGVkIEhUTUwgRWxlbWVudFwiKTtcclxuICB2YXIgcGFyZW50ID0gZWwucGFyZW50Tm9kZTtcclxuICBpZiAoIWlzRWxlbWVudChwYXJlbnQpKSB0aHJvdyBuZXcgRXJyb3IoXCJleHBlY3RlZCBIVE1MIGVsZW1lbnQgd2l0aCBwYXJlbnROb2RlXCIpO1xyXG4gIHJldHVybiBwYXJlbnQ7XHJcbn1cclxuY29uc3QgRE9UID0gXCIuXCI7XHJcblxyXG4vKipcclxuICogU3BsaXRzIGFuIGV2ZW50IG5hbWUgaW50byBpdHMgZXZlbnQgbmFtZSBhbmQgbmFtZXNwYWNlLlxyXG4gKi9cclxuZnVuY3Rpb24gc3BsaXROYW1lc3BhY2UoZXZlbnROYW1lKSB7XHJcbiAgdmFyIGkgPSBldmVudE5hbWUuaW5kZXhPZihET1QpO1xyXG4gIGlmIChpID4gLTEpIHtcclxuICAgIHZhciBuYW1lID0gZXZlbnROYW1lLnN1YnN0cigwLCBpKTtcclxuICAgIHJldHVybiBbZXZlbnROYW1lLnN1YnN0cigwLCBpKSwgZXZlbnROYW1lLnN1YnN0cihpICsgMSldO1xyXG4gIH1cclxuICByZXR1cm4gW2V2ZW50TmFtZSwgXCJcIl07XHJcbn1cclxuXHJcbmNvbnN0IEhBTkRMRVJTID0gW107XHJcblxyXG5leHBvcnQgZGVmYXVsdCB7XHJcblxyXG4gIHNwbGl0TmFtZXNwYWNlLFxyXG5cclxuICAvKipcclxuICAgKiBFbXB0aWVzIGFuIGVsZW1lbnQsIHJlbW92aW5nIGFsbCBpdHMgY2hpbGRyZW4gZWxlbWVudHMgYW5kIGV2ZW50IGhhbmRsZXJzLlxyXG4gICAqL1xyXG4gIGVtcHR5KG5vZGUpIHtcclxuICAgIHdoaWxlIChub2RlLmhhc0NoaWxkTm9kZXMoKSkge1xyXG4gICAgICAvLyByZW1vdmUgZXZlbnQgaGFuZGxlcnMgb24gdGhlIGNoaWxkLCBhYm91dCB0byBiZSByZW1vdmVkOlxyXG4gICAgICB0aGlzLm9mZihub2RlLmxhc3RDaGlsZCk7XHJcbiAgICAgIG5vZGUucmVtb3ZlQ2hpbGQobm9kZS5sYXN0Q2hpbGQpO1xyXG4gICAgfVxyXG4gIH0sXHJcblxyXG4gIC8qKlxyXG4gICAqIFJlbW92ZXMgYW4gZWxlbWVudCwgd2l0aCBhbGwgZXZlbnQgaGFuZGxlcnMuXHJcbiAgICovXHJcbiAgcmVtb3ZlKGEpIHtcclxuICAgIGlmICghYSkgcmV0dXJuO1xyXG4gICAgdGhpcy5vZmYoYSk7XHJcbiAgICB2YXIgcGFyZW50ID0gYS5wYXJlbnRFbGVtZW50IHx8IGEucGFyZW50Tm9kZTtcclxuICAgIGlmIChwYXJlbnQpIHtcclxuICAgICAgcGFyZW50LnJlbW92ZUNoaWxkKGEpO1xyXG4gICAgfVxyXG4gIH0sXHJcblxyXG4gIC8qKlxyXG4gICAqIEdldHMgdGhlIGNsb3Nlc3QgYW5jZXN0b3Igb2YgdGhlIGdpdmVuIGVsZW1lbnQgaGF2aW5nIHRoZSBnaXZlbiB0YWdOYW1lLlxyXG4gICAqXHJcbiAgICogQHBhcmFtIGVsOiBlbGVtZW50IGZyb20gd2hpY2ggdG8gZmluZCB0aGUgYW5jZXN0b3JcclxuICAgKiBAcGFyYW0gcHJlZGljYXRlOiBwcmVkaWNhdGUgdG8gdXNlIGZvciBsb29rdXAuXHJcbiAgICogQHBhcmFtIGV4Y2x1ZGVJdHNlbGY6IHdoZXRoZXIgdG8gaW5jbHVkZSB0aGUgZWxlbWVudCBpdHNlbGYuXHJcbiAgICovXHJcbiAgY2xvc2VzdChlbCwgcHJlZGljYXRlLCBleGNsdWRlSXRzZWxmKSB7XHJcbiAgICBpZiAoIWVsIHx8ICFwcmVkaWNhdGUpIHJldHVybjtcclxuICAgIGlmICghZXhjbHVkZUl0c2VsZikge1xyXG4gICAgICBpZiAocHJlZGljYXRlKGVsKSkgcmV0dXJuIGVsO1xyXG4gICAgfVxyXG4gICAgdmFyIG8sIHBhcmVudCA9IGVsO1xyXG4gICAgd2hpbGUgKHBhcmVudCA9IHBhcmVudC5wYXJlbnRFbGVtZW50KSB7XHJcbiAgICAgIGlmIChwcmVkaWNhdGUocGFyZW50KSkge1xyXG4gICAgICAgIHJldHVybiBwYXJlbnQ7XHJcbiAgICAgIH1cclxuICAgIH1cclxuICB9LFxyXG5cclxuICAvKipcclxuICAgKiBHZXRzIHRoZSBjbG9zZXN0IGFuY2VzdG9yIG9mIHRoZSBnaXZlbiBlbGVtZW50IGhhdmluZyB0aGUgZ2l2ZW4gdGFnTmFtZS5cclxuICAgKlxyXG4gICAqIEBwYXJhbSBlbDogZWxlbWVudCBmcm9tIHdoaWNoIHRvIGZpbmQgdGhlIGFuY2VzdG9yXHJcbiAgICogQHBhcmFtIHRhZ05hbWU6IHRhZ05hbWUgdG8gbG9vayBmb3IuXHJcbiAgICogQHBhcmFtIGV4Y2x1ZGVJdHNlbGY6IHdoZXRoZXIgdG8gaW5jbHVkZSB0aGUgZWxlbWVudCBpdHNlbGYuXHJcbiAgICovXHJcbiAgY2xvc2VzdFdpdGhUYWcoZWwsIHRhZ05hbWUsIGV4Y2x1ZGVJdHNlbGYpIHtcclxuICAgIGlmICghdGFnTmFtZSkgcmV0dXJuO1xyXG4gICAgdGFnTmFtZSA9IHRhZ05hbWUudG9VcHBlckNhc2UoKTtcclxuICAgIHJldHVybiB0aGlzLmNsb3Nlc3QoZWwsIGVsID0+IHtcclxuICAgICAgcmV0dXJuIGVsLnRhZ05hbWUgPT0gdGFnTmFtZTtcclxuICAgIH0sIGV4Y2x1ZGVJdHNlbGYpO1xyXG4gIH0sXHJcblxyXG4gIC8qKlxyXG4gICAqIEdldHMgdGhlIGNsb3Nlc3QgYW5jZXN0b3Igb2YgdGhlIGdpdmVuIGVsZW1lbnQgaGF2aW5nIHRoZSBnaXZlbiBjbGFzcy5cclxuICAgKlxyXG4gICAqIEBwYXJhbSBlbDogZWxlbWVudCBmcm9tIHdoaWNoIHRvIGZpbmQgdGhlIGFuY2VzdG9yXHJcbiAgICogQHBhcmFtIHRhZ05hbWU6IHRhZ05hbWUgdG8gbG9vayBmb3IuXHJcbiAgICogQHBhcmFtIGV4Y2x1ZGVJdHNlbGY6IHdoZXRoZXIgdG8gaW5jbHVkZSB0aGUgZWxlbWVudCBpdHNlbGYuXHJcbiAgICovXHJcbiAgY2xvc2VzdFdpdGhDbGFzcyhlbCwgY2xhc3NOYW1lLCBleGNsdWRlSXRzZWxmKSB7XHJcbiAgICBpZiAoIWNsYXNzTmFtZSkgcmV0dXJuO1xyXG4gICAgcmV0dXJuIHRoaXMuY2xvc2VzdChlbCwgZWwgPT4gaGFzQ2xhc3MoZWwsIGNsYXNzTmFtZSksIGV4Y2x1ZGVJdHNlbGYpO1xyXG4gIH0sXHJcblxyXG4gIC8qKlxyXG4gICAqIFJldHVybnMgYSB2YWx1ZSBpbmRpY2F0aW5nIHdoZXRoZXIgdGhlIGEgbm9kZSBjb250YWlucyBhbm90aGVyIG5vZGUuXHJcbiAgICpcclxuICAgKiBAcGFyYW0gYTogY29udGFpbmluZyBub2RlXHJcbiAgICogQHBhcmFtIGI6IG5vZGUgdG8gYmUgY2hlY2tlZCBmb3IgY29udGFpbm1lbnRcclxuICAgKi9cclxuICBjb250YWlucyhhLCBiKSB7XHJcbiAgICBpZiAoIWEgfHwgIWIpIHJldHVybiBmYWxzZVxyXG4gICAgaWYgKCFhLmhhc0NoaWxkTm9kZXMoKSkgcmV0dXJuIGZhbHNlO1xyXG4gICAgdmFyIGNoaWxkcmVuID0gYS5jaGlsZE5vZGVzLCBsID0gY2hpbGRyZW4ubGVuZ3RoO1xyXG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBsOyBpKyspIHtcclxuICAgICAgdmFyIGNoaWxkID0gY2hpbGRyZW5baV07XHJcbiAgICAgIGlmIChjaGlsZCA9PT0gYikgcmV0dXJuIHRydWU7XHJcbiAgICAgIGlmICh0aGlzLmNvbnRhaW5zKGNoaWxkLCBiKSkge1xyXG4gICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgICByZXR1cm4gZmFsc2U7XHJcbiAgfSxcclxuXHJcbiAgLyoqXHJcbiAgICogU2V0cyBhIGRlbGVnYXRlIGV2ZW50IGxpc3RlbmVyLlxyXG4gICAqXHJcbiAgICogQHBhcmFtIGVsZW1lbnRcclxuICAgKiBAcGFyYW0gZXZlbnROYW1lXHJcbiAgICogQHBhcmFtIHNlbGVjdG9yXHJcbiAgICogQHBhcmFtIG1ldGhvZFxyXG4gICAqIEByZXR1cm5zIHt0aGlzfVxyXG4gICAqL1xyXG4gIG9uKGVsZW1lbnQsIHR5cGUsIHNlbGVjdG9yLCBjYWxsYmFjaykge1xyXG4gICAgaWYgKCFpc0VsZW1lbnQoZWxlbWVudCkpXHJcbiAgICAgIC8vIGVsZW1lbnQgY291bGQgYmUgYSB0ZXh0IGVsZW1lbnQgb3IgYSBjb21tZW50XHJcbiAgICAgIHRocm93IG5ldyBFcnJvcihcImFyZ3VtZW50IGlzIG5vdCBhIERPTSBlbGVtZW50LlwiKTtcclxuICAgIGlmIChfLmlzRnVuY3Rpb24oc2VsZWN0b3IpICYmICFjYWxsYmFjaykge1xyXG4gICAgICBjYWxsYmFjayA9IHNlbGVjdG9yO1xyXG4gICAgICBzZWxlY3RvciA9IG51bGw7XHJcbiAgICB9XHJcbiAgICB2YXIgJCA9IHRoaXM7XHJcbiAgICB2YXIgcGFydHMgPSBzcGxpdE5hbWVzcGFjZSh0eXBlKTtcclxuICAgIHZhciBldmVudE5hbWUgPSBwYXJ0c1swXSwgbnMgPSBwYXJ0c1sxXTtcclxuICAgIHZhciBsaXN0ZW5lciA9IChlKSA9PiB7XHJcbiAgICAgIHZhciBtID0gZS50YXJnZXQ7XHJcbiAgICAgIGlmIChzZWxlY3Rvcikge1xyXG4gICAgICAgIHZhciB0YXJnZXRzID0gZmluZChlbGVtZW50LCBzZWxlY3Rvcik7XHJcbiAgICAgICAgaWYgKGFueSh0YXJnZXRzLCAobykgPT4geyByZXR1cm4gZS50YXJnZXQgPT09IG8gfHwgJC5jb250YWlucyhvLCBlLnRhcmdldCk7IH0pKSB7XHJcbiAgICAgICAgICB2YXIgcmUgPSBjYWxsYmFjayhlLCBlLmRldGFpbCk7XHJcbiAgICAgICAgICBpZiAocmUgPT09IGZhbHNlKSB7XHJcbiAgICAgICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcclxuICAgICAgICAgIH1cclxuICAgICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgICAgIH1cclxuICAgICAgfSBlbHNlIHtcclxuICAgICAgICB2YXIgcmUgPSBjYWxsYmFjayhlLCBlLmRldGFpbCk7XHJcbiAgICAgICAgaWYgKHJlID09PSBmYWxzZSkge1xyXG4gICAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgICAgfVxyXG4gICAgICByZXR1cm4gdHJ1ZTtcclxuICAgIH07XHJcbiAgICBIQU5ETEVSUy5wdXNoKHtcclxuICAgICAgdHlwZTogdHlwZSxcclxuICAgICAgZXY6IGV2ZW50TmFtZSxcclxuICAgICAgbnM6IG5zLFxyXG4gICAgICBmbjogbGlzdGVuZXIsXHJcbiAgICAgIGVsOiBlbGVtZW50XHJcbiAgICB9KTtcclxuICAgIGVsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lcihldmVudE5hbWUsIGxpc3RlbmVyLCB0cnVlKTtcclxuICAgIHJldHVybiB0aGlzO1xyXG4gIH0sXHJcblxyXG4gIC8qKlxyXG4gICAqIFJlbW92ZXMgYWxsIGV2ZW50IGhhbmRsZXJzIHNldCBieSBET00gaGVscGVyIG9uIGEgZ2l2ZW4gZWxlbWVudC5cclxuICAgKiBAcmV0dXJucyB7dGhpc31cclxuICAgKi9cclxuICBvZmYoZWxlbWVudCwgdHlwZSkge1xyXG4gICAgY29uc3QgdG9SZW1vdmUgPSBbXTtcclxuICAgIGlmICghaXNFbGVtZW50KGVsZW1lbnQpKVxyXG4gICAgICAvLyBlbGVtZW50IGNvdWxkIGJlIGEgdGV4dCBlbGVtZW50IG9yIGEgY29tbWVudFxyXG4gICAgICByZXR1cm47XHJcbiAgICBpZiAodHlwZSkge1xyXG4gICAgICBpZiAodHlwZVswXSA9PT0gRE9UKSB7XHJcbiAgICAgICAgLy8gdW5zZXQgZXZlbnQgbGlzdGVuZXJzIGJ5IG5hbWVzcGFjZVxyXG4gICAgICAgIHZhciBucyA9IHR5cGUuc3Vic3RyKDEpO1xyXG4gICAgICAgIGVhY2goSEFORExFUlMsIChvKSA9PiB7XHJcbiAgICAgICAgICAvLyByZW1vdmUgdGhlIGV2ZW50IGhhbmRsZXJcclxuICAgICAgICAgIGlmIChvLmVsID09PSBlbGVtZW50ICYmIG8ubnMgPT0gbnMpIHtcclxuICAgICAgICAgICAgby5lbC5yZW1vdmVFdmVudExpc3RlbmVyKG8uZXYsIG8uZm4sIHRydWUpO1xyXG4gICAgICAgICAgICB0b1JlbW92ZS5wdXNoKG8pO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG4gICAgICB9IGVsc2Uge1xyXG4gICAgICAgIC8vIGNoZWNrIG5hbWVzcGFjZVxyXG4gICAgICAgIHZhciBwYXJ0cyA9IHNwbGl0TmFtZXNwYWNlKHR5cGUpO1xyXG4gICAgICAgIHZhciBldmVudE5hbWUgPSBwYXJ0c1swXSwgbnMgPSBwYXJ0c1sxXTtcclxuICAgICAgICBlYWNoKEhBTkRMRVJTLCAobykgPT4ge1xyXG4gICAgICAgICAgaWYgKG8uZWwgPT09IGVsZW1lbnQgJiYgby5ldiA9PSBldmVudE5hbWUgJiYgKCFucyB8fCBvLm5zID09IG5zKSkge1xyXG4gICAgICAgICAgICAvLyByZW1vdmUgdGhlIGV2ZW50IGhhbmRsZXJcclxuICAgICAgICAgICAgby5lbC5yZW1vdmVFdmVudExpc3RlbmVyKG8uZXYsIG8uZm4sIHRydWUpO1xyXG4gICAgICAgICAgICB0b1JlbW92ZS5wdXNoKG8pO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG4gICAgICB9XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICBlYWNoKEhBTkRMRVJTLCAobykgPT4ge1xyXG4gICAgICAgIGlmIChvLmVsID09PSBlbGVtZW50KSB7XHJcbiAgICAgICAgICAvLyByZW1vdmUgdGhlIGV2ZW50IGhhbmRsZXJcclxuICAgICAgICAgIG8uZWwucmVtb3ZlRXZlbnRMaXN0ZW5lcihvLmV2LCBvLmZuLCB0cnVlKTtcclxuICAgICAgICAgIHRvUmVtb3ZlLnB1c2gobyk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9KTtcclxuICAgIH1cclxuICAgIC8vIHJlbW92ZSBldmVudCBoYW5kbGVyc1xyXG4gICAgXy5yZW1vdmVJdGVtcyhIQU5ETEVSUywgdG9SZW1vdmUpO1xyXG4gIH0sXHJcblxyXG4gIC8qKlxyXG4gICAqIEV4cG9zZSBldmVudCBoYW5kbGVycyBzaW5nbGV0b24sIGZvciBkZWJ1Z2dpbmcgYW5kIHRlc3RpbmcgcHVycG9zZS5cclxuICAgKi9cclxuICBldmVudEhhbmRsZXJzKCkge1xyXG4gICAgcmV0dXJuIEhBTkRMRVJTO1xyXG4gIH0sXHJcblxyXG4gIC8qKlxyXG4gICAqIFJlbW92ZXMgYWxsIGFjdGl2ZSBldmVudCBoYW5kbGVycy5cclxuICAgKi9cclxuICBvZmZBbGwoKSB7XHJcbiAgICB2YXIgc2VsZiA9IHRoaXMsIGVsZW1lbnQ7XHJcbiAgICBlYWNoKEhBTkRMRVJTLCAobykgPT4ge1xyXG4gICAgICBlbGVtZW50ID0gby5lbDtcclxuICAgICAgZWxlbWVudC5yZW1vdmVFdmVudExpc3RlbmVyKG8uZXYsIG8uZm4sIHRydWUpO1xyXG4gICAgfSk7XHJcbiAgICB3aGlsZSAoSEFORExFUlMubGVuZ3RoKSB7XHJcbiAgICAgIEhBTkRMRVJTLnBvcCgpO1xyXG4gICAgfVxyXG4gICAgcmV0dXJuIHNlbGY7XHJcbiAgfSxcclxuXHJcbiAgZmlyZSxcclxuXHJcbiAgLyoqXHJcbiAgICogUmV0dXJucyB0aGUgc2libGluZ3Mgb2YgdGhlIGdpdmVuIGVsZW1lbnQuXHJcbiAgICpcclxuICAgKiBAcGFyYW0gZWw6IGVsZW1lbnQgb2Ygd2hpY2ggdG8gZ2V0IHRoZSBzaWJsaW5ncy5cclxuICAgKi9cclxuICBzaWJsaW5ncyhlbCwgYWxsTm9kZXMpIHtcclxuICAgIHZhciBwYXJlbnQgPSBleHBlY3RQYXJlbnQoZWwpO1xyXG4gICAgdmFyIGEgPSBbXSwgY2hpbGRyZW4gPSBwYXJlbnRbYWxsTm9kZXMgPyBcImNoaWxkTm9kZXNcIiA6IFwiY2hpbGRyZW5cIl07XHJcbiAgICBmb3IgKHZhciBpID0gMCwgbCA9IGNoaWxkcmVuLmxlbmd0aDsgaSA8IGw7IGkrKykge1xyXG4gICAgICB2YXIgY2hpbGQgPSBjaGlsZHJlbltpXTtcclxuICAgICAgaWYgKGNoaWxkICE9PSBlbCkge1xyXG4gICAgICAgIGEucHVzaChjaGlsZCk7XHJcbiAgICAgIH1cclxuICAgIH1cclxuICAgIHJldHVybiBhO1xyXG4gIH0sXHJcblxyXG4gIC8qKlxyXG4gICAqIFJldHVybnMgdGhlIG5leHQgc2libGluZ3Mgb2YgdGhlIGdpdmVuIGVsZW1lbnQuXHJcbiAgICpcclxuICAgKiBAcGFyYW0gZWw6IGVsZW1lbnQgb2Ygd2hpY2ggdG8gZ2V0IHRoZSBzaWJsaW5ncy5cclxuICAgKi9cclxuICBuZXh0U2libGluZ3MoZWwsIGFsbE5vZGVzKSB7XHJcbiAgICB2YXIgcGFyZW50ID0gZXhwZWN0UGFyZW50KGVsKTtcclxuICAgIHZhciBhID0gW10sIGNoaWxkcmVuID0gcGFyZW50W2FsbE5vZGVzID8gXCJjaGlsZE5vZGVzXCIgOiBcImNoaWxkcmVuXCJdLCBpbmNsdWRlID0gZmFsc2U7XHJcbiAgICBmb3IgKHZhciBpID0gMCwgbCA9IGNoaWxkcmVuLmxlbmd0aDsgaSA8IGw7IGkrKykge1xyXG4gICAgICB2YXIgY2hpbGQgPSBjaGlsZHJlbltpXTtcclxuICAgICAgaWYgKGNoaWxkICE9PSBlbCAmJiBpbmNsdWRlKSB7XHJcbiAgICAgICAgYS5wdXNoKGNoaWxkKTtcclxuICAgICAgfSBlbHNlIHtcclxuICAgICAgICBpbmNsdWRlID0gdHJ1ZTtcclxuICAgICAgfVxyXG4gICAgfVxyXG4gICAgcmV0dXJuIGE7XHJcbiAgfSxcclxuXHJcbiAgLyoqXHJcbiAgICogUmV0dXJucyB0aGUgcHJldmlvdXMgc2libGluZ3Mgb2YgdGhlIGdpdmVuIGVsZW1lbnQuXHJcbiAgICpcclxuICAgKiBAcGFyYW0gZWw6IGVsZW1lbnQgb2Ygd2hpY2ggdG8gZ2V0IHRoZSBzaWJsaW5ncy5cclxuICAgKi9cclxuICBwcmV2U2libGluZ3MoZWwsIGFsbE5vZGVzKSB7XHJcbiAgICB2YXIgcGFyZW50ID0gZXhwZWN0UGFyZW50KGVsKTtcclxuICAgIHZhciBhID0gW10sIGNoaWxkcmVuID0gcGFyZW50W2FsbE5vZGVzID8gXCJjaGlsZE5vZGVzXCIgOiBcImNoaWxkcmVuXCJdO1xyXG4gICAgZm9yICh2YXIgaSA9IDAsIGwgPSBjaGlsZHJlbi5sZW5ndGg7IGkgPCBsOyBpKyspIHtcclxuICAgICAgdmFyIGNoaWxkID0gY2hpbGRyZW5baV07XHJcbiAgICAgIGlmIChjaGlsZCAhPT0gZWwpIHtcclxuICAgICAgICBhLnB1c2goY2hpbGQpO1xyXG4gICAgICB9IGVsc2Uge1xyXG4gICAgICAgIGJyZWFrO1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgICByZXR1cm4gYTtcclxuICB9LFxyXG5cclxuICAvKipcclxuICAgKiBGaW5kcyBlbGVtZW50cyBieSBjbGFzcyBuYW1lLlxyXG4gICAqL1xyXG4gIGZpbmRCeUNsYXNzKGVsLCBuYW1lKSB7XHJcbiAgICByZXR1cm4gZWwuZ2V0RWxlbWVudHNCeUNsYXNzTmFtZShuYW1lKTtcclxuICB9LFxyXG5cclxuICBpc0ZvY3VzZWQsXHJcblxyXG4gIGdldEZvY3VzZWRFbGVtZW50LFxyXG5cclxuICAvKipcclxuICAgKiBSZXR1cm5zIGEgdmFsdWUgaW5kaWNhdGluZyB3aGV0aGVyIHRoZXJlIGlzIGFueSBpbnB1dCBlbGVtZW50IGN1cnJlbnRseSBmb2N1c2VkLlxyXG4gICAqL1xyXG4gIGFueUlucHV0Rm9jdXNlZCgpIHtcclxuICAgIHZhciBhID0gdGhpcy5nZXRGb2N1c2VkRWxlbWVudCgpO1xyXG4gICAgcmV0dXJuIGEgJiYgL2lucHV0fHNlbGVjdHx0ZXh0YXJlYS9pLnRlc3QoYS50YWdOYW1lKTtcclxuICB9LFxyXG5cclxuICBwcmV2LFxyXG5cclxuICBuZXh0LFxyXG5cclxuICBhcHBlbmQsXHJcblxyXG4gIGFkZENsYXNzLFxyXG5cclxuICByZW1vdmVDbGFzcyxcclxuXHJcbiAgbW9kQ2xhc3MsXHJcblxyXG4gIGF0dHIsXHJcblxyXG4gIGhhc0NsYXNzLFxyXG5cclxuICBhZnRlcixcclxuXHJcbiAgY3JlYXRlRWxlbWVudCxcclxuXHJcbiAgaXNFbGVtZW50LFxyXG5cclxuICBpc0lucHV0LFxyXG5cclxuICBpc0FueUlucHV0LFxyXG5cclxuICBpc1NlbGVjdGFibGUsXHJcblxyXG4gIGlzUmFkaW9CdXR0b24sXHJcblxyXG4gIGlzQ2hlY2tib3gsXHJcblxyXG4gIGlzUGFzc3dvcmQsXHJcblxyXG4gIGF0dHJOYW1lLFxyXG5cclxuICBpc0hpZGRlbixcclxuXHJcbiAgZmluZCxcclxuXHJcbiAgZmluZEZpcnN0LFxyXG5cclxuICBmaW5kRmlyc3RCeUNsYXNzLFxyXG5cclxuICBnZXRWYWx1ZSxcclxuXHJcbiAgc2V0VmFsdWUsXHJcblxyXG4gIHNldEF0dHIsXHJcblxyXG4gIG5leHRXaXRoQ2xhc3MsXHJcblxyXG4gIG5hbWVTZWxlY3RvcixcclxuXHJcbiAgbGFzdFNpYmxpbmcsXHJcblxyXG4gIHBhcmVudFxyXG59O1xyXG4iLCIvKipcclxuICogUHJveHkgZnVuY3Rpb25zIHRvIHJhaXNlIGV4Y2VwdGlvbnMuXHJcbiAqIGh0dHBzOi8vZ2l0aHViLmNvbS9Sb2JlcnRvUHJldmF0by9EYXRhRW50cnlcclxuICpcclxuICogQ29weXJpZ2h0IDIwMTksIFJvYmVydG8gUHJldmF0b1xyXG4gKiBodHRwczovL3JvYmVydG9wcmV2YXRvLmdpdGh1Yi5pb1xyXG4gKlxyXG4gKiBMaWNlbnNlZCB1bmRlciB0aGUgTUlUIGxpY2Vuc2U6XHJcbiAqIGh0dHA6Ly93d3cub3BlbnNvdXJjZS5vcmcvbGljZW5zZXMvTUlUXHJcbiAqL1xyXG5jb25zdCBOT19QQVJBTSA9IFwiPz8/XCJcclxuXHJcbmZ1bmN0aW9uIEFyZ3VtZW50TnVsbEV4Y2VwdGlvbihuYW1lKSB7XHJcbiAgdGhyb3cgbmV3IEVycm9yKFwiVGhlIHBhcmFtZXRlciBjYW5ub3QgYmUgbnVsbDogXCIgKyAobmFtZSB8fCBOT19QQVJBTSkpXHJcbn1cclxuXHJcbmZ1bmN0aW9uIEFyZ3VtZW50RXhjZXB0aW9uKGRldGFpbHMpIHtcclxuICB0aHJvdyBuZXcgRXJyb3IoXCJJbnZhbGlkIGFyZ3VtZW50OiBcIiArIChkZXRhaWxzIHx8IE5PX1BBUkFNKSlcclxufVxyXG5cclxuZnVuY3Rpb24gVHlwZUV4Y2VwdGlvbihuYW1lLCBleHBlY3RlZFR5cGUpIHtcclxuICB0aHJvdyBuZXcgRXJyb3IoXCJFeHBlY3RlZCBwYXJhbWV0ZXI6IFwiICsgKG5hbWUgfHwgTk9fUEFSQU0pICsgXCIgb2YgdHlwZTogXCIgKyAodHlwZSB8fCBOT19QQVJBTSkpXHJcbn1cclxuXHJcbmZ1bmN0aW9uIE9wZXJhdGlvbkV4Y2VwdGlvbihkZXNjKSB7XHJcbiAgdGhyb3cgbmV3IEVycm9yKFwiSW52YWxpZCBvcGVyYXRpb246IFwiICsgZGVzYyk7XHJcbn1cclxuXHJcbmV4cG9ydCB7XHJcbiAgQXJndW1lbnRFeGNlcHRpb24sXHJcbiAgQXJndW1lbnROdWxsRXhjZXB0aW9uLFxyXG4gIFR5cGVFeGNlcHRpb24sXHJcbiAgT3BlcmF0aW9uRXhjZXB0aW9uXHJcbn1cclxuIiwiLyoqXHJcbiAqIEJ1aWx0LWluIGV2ZW50IGhhbmRsZXJzIGZvciBET00gZWxlbWVudHMuXHJcbiAqIEZvciBleGFtcGxlLCB0aGVzZSBmdW5jdGlvbnMgaW1wbGVtZW50IHRoZSBsb2dpYyB0aGF0IGF1dG9tYXRpY2FsbHkgZXhlY3V0ZXMgdmFsaWRhdGlvblxyXG4gKiB3aGVuIGEgdXNlciBpbnRlcmFjdHMgd2l0aCBhIGZpZWxkIChjaGFuZ2UsIGJsdXIsIHBhc3RlLCBjdXQpLiBcclxuICogVGhpcyBpcyBwYWluZnVsIGlmIHlvdSBoYXZlIHRvIGltcGxlbWVudCBpdCB5b3Vyc2VsZi5cclxuICogXHJcbiAqIGh0dHBzOi8vZ2l0aHViLmNvbS9Sb2JlcnRvUHJldmF0by9EYXRhRW50cnlcclxuICpcclxuICogQ29weXJpZ2h0IDIwMTksIFJvYmVydG8gUHJldmF0b1xyXG4gKiBodHRwczovL3JvYmVydG9wcmV2YXRvLmdpdGh1Yi5pb1xyXG4gKlxyXG4gKiBMaWNlbnNlZCB1bmRlciB0aGUgTUlUIGxpY2Vuc2U6XHJcbiAqIGh0dHA6Ly93d3cub3BlbnNvdXJjZS5vcmcvbGljZW5zZXMvTUlUXHJcbiAqL1xyXG5pbXBvcnQgXyBmcm9tIFwiLi4vLi4vdXRpbHNcIlxyXG5pbXBvcnQgJCBmcm9tIFwiLi4vLi4vZG9tXCJcclxuaW1wb3J0IHsgcmFpc2UgfSBmcm9tIFwiLi4vLi4vcmFpc2VcIlxyXG5pbXBvcnQgeyBDb25zdHJhaW50cyB9IGZyb20gXCIuLi9jb25zdHJhaW50cy9ydWxlc1wiXHJcbmltcG9ydCBFdmVudHNFbWl0dGVyIGZyb20gXCIuLi8uLi9jb21wb25lbnRzL2V2ZW50c1wiXHJcblxyXG5jb25zdCBkZWZlciA9IF8uZGVmZXI7XHJcbmNvbnN0IGF0dHIgPSAkLmF0dHI7XHJcbmNvbnN0IGxlbiA9IF8ubGVuO1xyXG5jb25zdCBleHRlbmQgPSBfLmV4dGVuZDtcclxuY29uc3QgaXNTdHJpbmcgPSBfLmlzU3RyaW5nO1xyXG5jb25zdCBpc0Z1bmN0aW9uID0gXy5pc0Z1bmN0aW9uO1xyXG5jb25zdCBmaXJzdCA9IF8uZmlyc3Q7XHJcblxyXG5cclxuY2xhc3MgRG9tQmluZGVyIGV4dGVuZHMgRXZlbnRzRW1pdHRlciB7XHJcblxyXG4gIGNvbnN0cnVjdG9yKGRhdGFlbnRyeSkge1xyXG4gICAgc3VwZXIoKVxyXG4gICAgY29uc3Qgc2VsZiA9IHRoaXM7XHJcblxyXG4gICAgc2VsZi5kYXRhZW50cnkgPSBkYXRhZW50cnk7XHJcbiAgICBzZWxmLmVsZW1lbnQgPSBkYXRhZW50cnkuZWxlbWVudDtcclxuICAgIGlmICghZGF0YWVudHJ5LmVsZW1lbnQpXHJcbiAgICAgIHJhaXNlKDIwLCBcIm1pc3NpbmcgYGVsZW1lbnRgIGluIGRhdGFlbnRyeVwiKTtcclxuICAgIHNlbGYuZm4gPSB7fTtcclxuXHJcbiAgICB2YXIgb3B0aW9ucyA9IGRhdGFlbnRyeSA/IGRhdGFlbnRyeS5vcHRpb25zIDoge307XHJcbiAgICBzZWxmLmNvbnN0cmFpbnRzID0gXy5leHRlbmQoe30sIENvbnN0cmFpbnRzLCBvcHRpb25zLmNvbnN0cmFpbnRSdWxlcyk7XHJcblxyXG4gICAgaWYgKG9wdGlvbnMuZXZlbnRzKVxyXG4gICAgICBzZWxmLmV2ZW50cyA9IG9wdGlvbnMuZXZlbnRzO1xyXG5cclxuICAgIHNlbGYudmFsaWRhdGlvbkV2ZW50ID0gb3B0aW9ucy52YWxpZGF0aW9uRXZlbnQgfHwgRG9tQmluZGVyLnZhbGlkYXRpb25FdmVudDtcclxuXHJcbiAgICBpZiAoc2VsZi5lbGVtZW50ICE9PSB0cnVlKVxyXG4gICAgICBzZWxmLmJpbmQoKTtcclxuICAgIFxyXG4gICAgLy8gZG9lcyB0aGUgZGF0YWVudHJ5IGltcGxlbWVudCB0aGUgZXZlbnQgaW50ZXJmYWNlP1xyXG4gICAgaWYgKF8ucXVhY2tzKGRhdGFlbnRyeSwgW1wib25cIiwgXCJ0cmlnZ2VyXCJdKSkge1xyXG4gICAgICBpZiAoIWRhdGFlbnRyeS5vcHRpb25zLmRpc2FibGVBdXRvRm9jdXMpIHtcclxuICAgICAgICBzZWxmLmxpc3RlblRvKGRhdGFlbnRyeSwgXCJmaXJzdDplcnJvclwiLCBlcnJvciA9PiB7XHJcbiAgICAgICAgICAvLyBmb2N1cyB0aGUgZmlyc3QgaW52YWxpZCBmaWVsZFxyXG4gICAgICAgICAgJC5maXJlKGVycm9yLmZpZWxkLCBcImZvY3VzXCIpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICBkaXNwb3NlKCkge1xyXG4gICAgY29uc3Qgc2VsZiA9IHRoaXM7XHJcbiAgICBzZWxmLnVuYmluZCgpO1xyXG4gICAgc2VsZi5vZmYoKTtcclxuICAgIHNlbGYuc3RvcExpc3RlbmluZygpO1xyXG4gICAgLy8gZGVsZXRlIGhhbmRsZXJzXHJcbiAgICBmb3IgKHZhciB4IGluIHNlbGYuZm4pIHtcclxuICAgICAgZGVsZXRlIHNlbGYuZm5beF07XHJcbiAgICB9XHJcblxyXG4gICAgaWYgKF8ucXVhY2tzKHNlbGYuZGF0YWVudHJ5LCBbXCJvblwiLCBcInRyaWdnZXJcIl0pKVxyXG4gICAgICBzZWxmLnN0b3BMaXN0ZW5pbmcoc2VsZi5kYXRhZW50cnkpO1xyXG4gICAgc2VsZi5kYXRhZW50cnkgPSBudWxsO1xyXG4gICAgc2VsZi5lbGVtZW50ID0gbnVsbDtcclxuICAgIHNlbGYuY29uc3RyYWludHMgPSBudWxsO1xyXG4gIH1cclxuXHJcbiAgYmluZCgpIHtcclxuICAgIHZhciBzZWxmID0gdGhpcyxcclxuICAgICAgZXZlbnRzID0gc2VsZi5nZXRFdmVudHMoKSxcclxuICAgICAgZWxlbWVudCA9IHNlbGYuZWxlbWVudCxcclxuICAgICAgZGVsZWdhdGVFdmVudFNwbGl0dGVyID0gL14oXFxTKylcXHMqKC4qKSQvO1xyXG4gICAgZm9yICh2YXIga2V5IGluIGV2ZW50cykge1xyXG4gICAgICB2YXIgbWV0aG9kID0gZXZlbnRzW2tleV07XHJcbiAgICAgIGlmICghaXNGdW5jdGlvbihtZXRob2QpKSBtZXRob2QgPSBzZWxmLmZuW21ldGhvZF07XHJcbiAgICAgIGlmICghbWV0aG9kKSBjb250aW51ZTtcclxuICAgICAgdmFyIG1hdGNoID0ga2V5Lm1hdGNoKGRlbGVnYXRlRXZlbnRTcGxpdHRlcik7XHJcbiAgICAgIHZhciB0eXBlID0gbWF0Y2hbMV0sIHNlbGVjdG9yID0gbWF0Y2hbMl07XHJcblxyXG4gICAgICBtZXRob2QgPSBtZXRob2QuYmluZChzZWxmLmRhdGFlbnRyeSk7IC8vIGV4ZWN1dGUgbWV0aG9kcyBpbiB0aGUgY29udGV4dCBvZiB0aGUgZGF0YWVudHJ5XHJcbiAgICAgICQub24oZWxlbWVudCwgdHlwZSwgc2VsZWN0b3IsIG1ldGhvZCk7XHJcbiAgICB9XHJcbiAgICByZXR1cm4gc2VsZjtcclxuICB9XHJcblxyXG4gIHVuYmluZCgpIHtcclxuICAgICQub2ZmKHRoaXMuZWxlbWVudCk7XHJcbiAgfVxyXG5cclxuICBnZXRFdmVudHMoKSB7XHJcbiAgICB2YXIgc2VsZiA9IHRoaXMsXHJcbiAgICAgIGV2ZW50cyA9IHNlbGYuZXZlbnRzIHx8IHt9O1xyXG4gICAgaWYgKGlzRnVuY3Rpb24oZXZlbnRzKSkgZXZlbnRzID0gZXZlbnRzLmNhbGwoc2VsZik7XHJcbiAgICAvL2V4dGVuZHMgZXZlbnRzIG9iamVjdCB3aXRoIHZhbGlkYXRpb24gZXZlbnRzXHJcbiAgICBldmVudHMgPSBleHRlbmQoe30sIGV2ZW50cyxcclxuICAgICAgc2VsZi5nZXRWYWxpZGF0aW9uRGVmaW5pdGlvbigpLFxyXG4gICAgICBzZWxmLmdldFByZUZvcm1hdHRpbmdEZWZpbml0aW9uKCksXHJcbiAgICAgIHNlbGYuZ2V0TWV0YUV2ZW50cygpLFxyXG4gICAgICBzZWxmLmdldENvbnN0cmFpbnRzRGVmaW5pdGlvbigpXHJcbiAgICApO1xyXG4gICAgcmV0dXJuIGV2ZW50cztcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEdldHMgYW4gXCJldmVudHNcIiBvYmplY3QgdGhhdCBkZXNjcmliZXMgb24ga2V5cHJlc3MgY29uc3RyYWludHMgZm9yIGFsbCBpbnB1dCBpbnNpZGUgdGhlIGdpdmVuIGVsZW1lbnRcclxuICAgKi9cclxuICBnZXRDb25zdHJhaW50c0RlZmluaXRpb24oKSB7XHJcbiAgICB2YXIgc2VsZiA9IHRoaXMsIFxyXG4gICAgICAgIGNvbnN0cmFpbnRzID0gc2VsZi5jb25zdHJhaW50cyxcclxuICAgICAgICBkYXRhZW50cnkgPSBzZWxmLmRhdGFlbnRyeSxcclxuICAgICAgICBzY2hlbWEgPSBkYXRhZW50cnkuc2NoZW1hO1xyXG5cclxuICAgIGlmICghc2NoZW1hKSByZXR1cm4ge307XHJcblxyXG4gICAgdmFyIG8gPSB7fSwgeDtcclxuICAgIGZvciAoeCBpbiBzY2hlbWEpIHtcclxuICAgICAgdmFyIGV2ID0gYGtleXByZXNzIFtuYW1lPScke3h9J11gLFxyXG4gICAgICAgIGZ1bmN0aW9uTmFtZSA9IFwiY29uc3RyYWludF9cIiArIHgsXHJcbiAgICAgICAgb3ggPSBzY2hlbWFbeF0sXHJcbiAgICAgICAgY29uc3RyYWludCA9IG94LmNvbnN0cmFpbnQ7XHJcbiAgICAgIGlmIChjb25zdHJhaW50KSB7XHJcbiAgICAgICAgLy8gZXhwbGljaXQgY29uc3RyYWludFxyXG4gICAgICAgIGlmIChpc0Z1bmN0aW9uKGNvbnN0cmFpbnQpKSBjb25zdHJhaW50ID0gY29uc3RyYWludC5jYWxsKGRhdGFlbnRyeSk7XHJcblxyXG4gICAgICAgIC8vIGNvbnN0cmFpbnQgbXVzdCBiZSBhIHNpbmdsZSBmdW5jdGlvbiBuYW1lXHJcbiAgICAgICAgaWYgKGhhc093blByb3BlcnR5KGNvbnN0cmFpbnRzLCBjb25zdHJhaW50KSkge1xyXG4gICAgICAgICAgLy8gc2V0IHJlZmVyZW5jZSBpbiBldmVudHMgb2JqZWN0XHJcbiAgICAgICAgICBvW2V2XSA9IGZ1bmN0aW9uTmFtZTtcclxuICAgICAgICAgIC8vIHNldCBmdW5jdGlvblxyXG4gICAgICAgICAgc2VsZi5mbltmdW5jdGlvbk5hbWVdID0gY29uc3RyYWludHNbY29uc3RyYWludF07XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgIHJhaXNlKDUsIGNvbnN0cmFpbnQpO1xyXG4gICAgICAgIH1cclxuICAgICAgfSBlbHNlIGlmIChkYXRhZW50cnkub3B0aW9ucy51c2VJbXBsaWNpdENvbnN0cmFpbnRzICE9PSBmYWxzZSkge1xyXG4gICAgICAgIC8vIHNldCBpbXBsaWNpdCBjb25zdHJhaW50cyBieSB2YWxpZGF0b3IgbmFtZXMsIGlmIGF2YWlsYWJsZVxyXG4gICAgICAgIC8vIGNoZWNrIHZhbGlkYXRpb24gc2NoZW1hXHJcbiAgICAgICAgdmFyIHZhbGlkYXRpb24gPSBveC52YWxpZGF0aW9uIHx8IG94O1xyXG4gICAgICAgIGlmICh2YWxpZGF0aW9uKSB7XHJcbiAgICAgICAgICAvLyBpbXBsaWNpdCBjb25zdHJhaW50XHJcbiAgICAgICAgICBpZiAoaXNGdW5jdGlvbih2YWxpZGF0aW9uKSkgdmFsaWRhdGlvbiA9IHZhbGlkYXRpb24uY2FsbChkYXRhZW50cnkpO1xyXG4gICAgICAgICAgZm9yICh2YXIgaSA9IDAsIGwgPSBsZW4odmFsaWRhdGlvbik7IGkgPCBsOyBpKyspIHtcclxuXHJcbiAgICAgICAgICAgIHZhciBuYW1lID0gaXNTdHJpbmcodmFsaWRhdGlvbltpXSkgPyB2YWxpZGF0aW9uW2ldIDogdmFsaWRhdGlvbltpXS5uYW1lO1xyXG4gICAgICAgICAgICBpZiAoXy5oYXMoY29uc3RyYWludHMsIG5hbWUpKSB7XHJcbiAgICAgICAgICAgICAgLy8gc2V0IHJlZmVyZW5jZSBpbiBldmVudHMgb2JqZWN0XHJcbiAgICAgICAgICAgICAgb1tldl0gPSBmdW5jdGlvbk5hbWU7XHJcbiAgICAgICAgICAgICAgLy8gc2V0IGZ1bmN0aW9uXHJcbiAgICAgICAgICAgICAgc2VsZi5mbltmdW5jdGlvbk5hbWVdID0gY29uc3RyYWludHNbbmFtZV07XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgIH1cclxuICAgIHJldHVybiBvO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogR2V0cyBhbiBcImV2ZW50c1wiIG9iamVjdCB0aGF0IGRlc2NyaWJlcyBvbiBmb2N1cyBwcmUgZm9ybWF0dGluZyBldmVudHMgZm9yIGFsbCBpbnB1dCBpbnNpZGUgdGhlIGdpdmVuIGVsZW1lbnRcclxuICAgKi9cclxuICBnZXRQcmVGb3JtYXR0aW5nRGVmaW5pdGlvbigpIHtcclxuICAgIHZhciBzZWxmID0gdGhpcywgXHJcbiAgICAgICAgZGF0YWVudHJ5ID0gc2VsZi5kYXRhZW50cnksXHJcbiAgICAgICAgc2NoZW1hID0gZGF0YWVudHJ5LnNjaGVtYTtcclxuICAgIGlmICghc2NoZW1hKSByZXR1cm4ge307XHJcbiAgICB2YXIgbyA9IHt9LCB4O1xyXG5cclxuICAgIGZ1bmN0aW9uIGdldEhhbmRsZXIobmFtZSwgcHJlZm9ybWF0KSB7XHJcbiAgICAgIHJldHVybiBmdW5jdGlvbiAoZSwgZm9yY2VkKSB7XHJcbiAgICAgICAgdmFyIGVsID0gZS50YXJnZXQ7XHJcbiAgICAgICAgY29uc3QgdiA9IGRhdGFlbnRyeS5mb3JtYXR0ZXIuZm9ybWF0KHByZWZvcm1hdCwgZWwsICQuZ2V0VmFsdWUoZWwpKTtcclxuICAgICAgICBkYXRhZW50cnkuaGFydmVzdGVyLnNldFZhbHVlKGVsLCB2KTtcclxuICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIGZvciAoeCBpbiBzY2hlbWEpIHtcclxuICAgICAgLy8gZ2V0IHByZWZvcm1hdCBkZWZpbml0aW9uXHJcbiAgICAgIHZhciBwcmVmb3JtYXQgPSBzZWxmLmdldEZpZWxkUHJlZm9ybWF0UnVsZXMoeCk7XHJcbiAgICAgIGlmIChwcmVmb3JtYXQgJiYgbGVuKHByZWZvcm1hdCkpIHtcclxuXHJcbiAgICAgICAgdmFyIHByZWZvcm1hdHRpbmdFdmVudCA9IFwiZm9jdXNcIiwgXHJcbiAgICAgICAgICAgIGV2ID0gYCR7cHJlZm9ybWF0dGluZ0V2ZW50fSBbbmFtZT0nJHt4fSddYCxcclxuICAgICAgICAgICAgZnVuY3Rpb25OYW1lID0gXCJwcmVmb3JtYXRfXCIgKyB4O1xyXG5cclxuICAgICAgICBvW2V2XSA9IGZ1bmN0aW9uTmFtZTtcclxuICAgICAgICBzZWxmLmZuW2Z1bmN0aW9uTmFtZV0gPSBnZXRIYW5kbGVyKHgsIHByZWZvcm1hdCk7XHJcbiAgICAgIH1cclxuICAgIH1cclxuICAgIHJldHVybiBvO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogR2V0cyBmb3JtYXR0aW5nIHJ1bGVzIHRvIGJlIGFwcGxpZWQgdXBvbiBmb2N1cywgZm9yIGEgZmllbGQuXHJcbiAgICovXHJcbiAgZ2V0RmllbGRQcmVmb3JtYXRSdWxlcyh4KSB7XHJcbiAgICB2YXIgc2VsZiA9IHRoaXMsIFxyXG4gICAgICAgIGRhdGFlbnRyeSA9IHNlbGYuZGF0YWVudHJ5LFxyXG4gICAgICAgIHNjaGVtYSA9IGRhdGFlbnRyeS5zY2hlbWEsXHJcbiAgICAgICAgZmllbGRTY2hlbWEgPSBzY2hlbWFbeF07XHJcbiAgICBpZiAoIWZpZWxkU2NoZW1hKSByZXR1cm47XHJcbiAgICBcclxuICAgIC8vIHByZSBmb3JtYXR0aW5nIHdvcmtzIG9ubHkgZXhwbGljaXRseTsgc2luY2UgaXQgaXMgdXNpbmcgdGhlIHNhbWUgZm9ybWF0dGluZyBydWxlcyB1c2VkIHRvIGZvcm1hdCB2YWxpZCB2YWx1ZXNcclxuICAgIHJldHVybiBmaWVsZFNjaGVtYS5wcmVmb3JtYXQ7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBHZXRzIGFuIFwiZXZlbnRzXCIgb2JqZWN0IHRoYXQgZGVzY3JpYmVzIG9uIGJsdXIgdmFsaWRhdGlvbiBldmVudHMgZm9yIGFsbCBpbnB1dCBpbnNpZGUgdGhlIGdpdmVuIGVsZW1lbnRcclxuICAgKiB3aGljaCBhcHBlYXJzIGluc2lkZSB0aGUgc2NoZW1hIG9mIHRoaXMgb2JqZWN0XHJcbiAgICovXHJcbiAgZ2V0VmFsaWRhdGlvbkRlZmluaXRpb24oKSB7XHJcbiAgICB2YXIgc2VsZiA9IHRoaXMsIFxyXG4gICAgICBkYXRhZW50cnkgPSBzZWxmLmRhdGFlbnRyeSxcclxuICAgICAgc2NoZW1hID0gZGF0YWVudHJ5LnNjaGVtYTtcclxuICAgIGlmICghc2NoZW1hKSByZXR1cm4ge307XHJcbiAgICB2YXIgbyA9IHt9LCB4O1xyXG4gICAgZm9yICh4IGluIHNjaGVtYSkge1xyXG4gICAgICB2YXIgdmFsaWRhdGlvbkV2ZW50ID0gc2NoZW1hW3hdLnZhbGlkYXRpb25FdmVudCB8fCBzZWxmLnZhbGlkYXRpb25FdmVudDtcclxuICAgICAgLy8gc3VwcG9ydCBtdWx0aXBsZSBldmVudHM6XHJcbiAgICAgIHZhciBuYW1lcyA9IHZhbGlkYXRpb25FdmVudC5zcGxpdCgvLHw7L2cpO1xyXG4gICAgICB2YXIgZnVuY3Rpb25OYW1lID0gXCJ2YWxpZGF0aW9uX1wiICsgeDtcclxuICAgICAgXy5lYWNoKG5hbWVzLCBuYW1lID0+IHtcclxuICAgICAgICBuYW1lID0gbmFtZS50cmltKCk7XHJcbiAgICAgICAgdmFyIGV2ID0gYCR7bmFtZX0gW25hbWU9JyR7eH0nXWA7XHJcbiAgICAgICAgb1tldl0gPSBmdW5jdGlvbk5hbWU7XHJcbiAgICAgIH0pXHJcbiAgICAgIC8vIHN0b3JlIGhhbmRsZXJcclxuICAgICAgc2VsZi5mbltmdW5jdGlvbk5hbWVdID0gc2VsZi5nZXRWYWxpZGF0aW9uRXZlbnRIYW5kbGVyKHgpO1xyXG4gICAgfVxyXG4gICAgcmV0dXJuIG87XHJcbiAgfVxyXG5cclxuICBnZXRWYWxpZGF0aW9uRXZlbnRIYW5kbGVyKG5hbWUpIHtcclxuICAgIHZhciBzZWxmID0gdGhpcywgXHJcbiAgICAgICAgZGF0YWVudHJ5ID0gc2VsZi5kYXRhZW50cnksXHJcbiAgICAgICAgc2NoZW1hID0gZGF0YWVudHJ5LnNjaGVtYSwgXHJcbiAgICAgICAgdmFsaWRhdG9yID0gZGF0YWVudHJ5LnZhbGlkYXRvcixcclxuICAgICAgICBmb3JtYXR0ZXIgPSBkYXRhZW50cnkuZm9ybWF0dGVyLFxyXG4gICAgICAgIG1hcmtlciA9IGRhdGFlbnRyeS5tYXJrZXIsXHJcbiAgICAgICAgdXNlSW1wbGljaXRGb3JtYXQgPSBkYXRhZW50cnkub3B0aW9ucy51c2VJbXBsaWNpdEZvcm1hdCAhPT0gZmFsc2U7XHJcblxyXG4gICAgcmV0dXJuIGZ1bmN0aW9uIChlLCBmb3JjZWQpIHtcclxuICAgICAgLy8gdmFsaWRhdGUgb25seSBhZnRlciB1c2VyIGludGVyYWN0aW9uXHJcbiAgICAgIGlmICghZGF0YWVudHJ5LnZhbGlkYXRpb25BY3RpdmUpIHJldHVybiB0cnVlO1xyXG5cclxuICAgICAgaWYgKGZvcmNlZCA9PSB1bmRlZmluZWQpIGZvcmNlZCA9IGZhbHNlO1xyXG4gICAgICBcclxuICAgICAgdmFyIGYgPSBlLnRhcmdldDtcclxuICAgICAgXHJcbiAgICAgIC8vIG1hcmsgdGhlIGZpZWxkIG5ldXRydW0gYmVmb3JlIHZhbGlkYXRpb25cclxuICAgICAgbWFya2VyLm1hcmtGaWVsZE5ldXRydW0oZik7XHJcblxyXG4gICAgICB2YXIgZmllbGRTY2hlbWEgPSBzY2hlbWFbbmFtZV0sIFxyXG4gICAgICAgICAgdmFsaWRhdGlvbiA9IGRhdGFlbnRyeS5nZXRGaWVsZFZhbGlkYXRpb25EZWZpbml0aW9uKGZpZWxkU2NoZW1hLnZhbGlkYXRpb24gfHwgZmllbGRTY2hlbWEpLFxyXG4gICAgICAgICAgdmFsdWUgPSBkYXRhZW50cnkuZ2V0RmllbGRWYWx1ZShmKTtcclxuICAgICAgXHJcbiAgICAgIHZhbGlkYXRvci52YWxpZGF0ZSh2YWxpZGF0aW9uLCBmLCB2YWx1ZSwgZm9yY2VkKS50aGVuKGZ1bmN0aW9uKGRhdGEpIHtcclxuICAgICAgICAvLyB0aGUgdmFsaWRhdGlvbiBwcm9jZXNzIHN1Y2NlZWRlZCAoZGlkbid0IHByb2R1Y2UgYW55IGV4Y2VwdGlvbilcclxuICAgICAgICAvLyBidXQgdGhpcyBkb2Vzbid0IG1lYW4gdGhhdCB0aGUgZmllbGQgaXMgdmFsaWRcclxuICAgICAgICB2YXIgZXJyb3IgPSBmaXJzdChkYXRhLCBmdW5jdGlvbiAobykgeyByZXR1cm4gby5lcnJvcjsgfSk7XHJcblxyXG4gICAgICAgIGlmIChlcnJvcikge1xyXG4gICAgICAgICAgY29uc3QgZXJyb3JEYXRhID0ge1xyXG4gICAgICAgICAgICBtZXNzYWdlOiBlcnJvci5tZXNzYWdlXHJcbiAgICAgICAgICB9O1xyXG4gICAgICAgICAgbWFya2VyLm1hcmtGaWVsZEludmFsaWQoZiwgZXJyb3JEYXRhKTtcclxuICAgICAgICAgIGRhdGFlbnRyeS50cmlnZ2VyKFwiZXJyb3JzXCIsIFtlcnJvckRhdGFdKTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgLy8gbWFyayB0aGUgZmllbGQgdmFsaWRcclxuICAgICAgICAgIG1hcmtlci5tYXJrRmllbGRWYWxpZChmKTtcclxuICAgICAgICAgIFxyXG4gICAgICAgICAgZGF0YWVudHJ5Lm9uR29vZFZhbGlkYXRpb24oZmllbGRTY2hlbWEsIGYsIG5hbWUsIHZhbHVlKTtcclxuICAgICAgICB9XHJcbiAgICAgIH0sIGZ1bmN0aW9uIChkYXRhKSB7XHJcbiAgICAgICAgLy8gdGhlIHZhbGlkYXRpb24gcHJvY2VzcyBmYWlsZWQgKGl0IHByb2R1Y2VkIGFuIGV4Y2VwdGlvbilcclxuICAgICAgICAvLyB0aGlzIHNob3VsZCBoYXBwZW4sIGZvciBleGFtcGxlLCB3aGVuIGEgdmFsaWRhdGlvbiBydWxlIHRoYXQgaW52b2x2ZXMgYW4gQWpheCByZXF1ZXN0IHJlY2VpdmVzIHN0YXR1cyA1MDAgZnJvbSB0aGUgc2VydmVyIHNpZGUuXHJcbiAgICAgICAgaWYgKCFkYXRhKSByZXR1cm47XHJcbiAgICAgICAgZm9yICh2YXIgaSA9IDAsIGwgPSBsZW4oZGF0YSk7IGkgPCBsOyBpKyspIHtcclxuICAgICAgICAgIGlmICghZGF0YVtpXSB8fCBkYXRhW2ldLmVycm9yKSB7XHJcbiAgICAgICAgICAgIC8vIG1hcmsgZmllbGQgaW52YWxpZCBvbiB0aGUgZmlyc3QgdmFsaWRhdGlvbiBkYXRhZW50cnkgZmFpbGVkXHJcbiAgICAgICAgICAgIGNvbnN0IGVycm9yRGF0YSA9IHtcclxuICAgICAgICAgICAgICBtZXNzYWdlOiBkYXRhW2ldLm1lc3NhZ2VcclxuICAgICAgICAgICAgfTtcclxuICAgICAgICAgICAgbWFya2VyLm1hcmtGaWVsZEludmFsaWQoZiwgZXJyb3JEYXRhKTtcclxuICAgICAgICAgICAgZGF0YWVudHJ5LnRyaWdnZXIoXCJlcnJvcnNcIiwgW2Vycm9yRGF0YV0pO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgfSk7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBSZXR1cm5zIGV2ZW50cyBkZWZpbml0aW9ucyB0aGF0IGFyZSB1c2VkIGZvciBjb250ZXh0dWFsIGluZm9ybWF0aW9uIGZvciB0aGUgZGF0YWVudHJ5LlxyXG4gICAqL1xyXG4gIGdldE1ldGFFdmVudHMoKSB7XHJcbiAgICBjb25zdCBkYXRhZW50cnkgPSB0aGlzLmRhdGFlbnRyeTtcclxuXHJcbiAgICB2YXIgYWN0aXZhdGlvbkNhbGxiYWNrID0gZnVuY3Rpb24gKGUpIHtcclxuICAgICAgLy8gYWRkIGEgY2xhc3MgdG8gdGhlIGVsZW1lbnRcclxuICAgICAgZGF0YWVudHJ5Lm1hcmtlci5tYXJrRmllbGRUb3VjaGVkKGUudGFyZ2V0KTtcclxuICAgICAgLy8gYWN0aXZhdGUgdmFsaWRhdGlvbiBhZnRlciBrZXlwcmVzc1xyXG4gICAgICBkYXRhZW50cnkudmFsaWRhdGlvbkFjdGl2ZSA9IHRydWU7XHJcbiAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgfTtcclxuICAgIHZhciBjaGFuZ2VDYWxsYmFjayA9IGZ1bmN0aW9uIChlLCBmb3JjZWQpIHtcclxuICAgICAgLy8gYWRkIGEgY2xhc3MgdG8gdGhlIGVsZW1lbnRcclxuICAgICAgZGF0YWVudHJ5Lm1hcmtlci5tYXJrRmllbGRUb3VjaGVkKGUudGFyZ2V0KTtcclxuICAgICAgZGF0YWVudHJ5LnZhbGlkYXRpb25BY3RpdmUgPSB0cnVlO1xyXG4gICAgICAvLyB0cmlnZ2VyIHZhbGlkYXRpb25cclxuICAgICAgdmFyIHRhcmdldCA9IGUudGFyZ2V0LCBuYW1lID0gdGFyZ2V0Lm5hbWU7XHJcbiAgICAgIC8vIG9uIHRoZSBvdGhlciBoYW5kLCB3ZSBkb24ndCB3YW50IHRvIHZhbGlkYXRlIHRoZSB3aG9sZSBmb3JtIGJlZm9yZSB0aGUgdXNlciB0cnlpbmcgdG8gaW5wdXQgYW55dGhpbmdcclxuICAgICAgaWYgKF8uaGFzKGRhdGFlbnRyeS5zY2hlbWEsIG5hbWUpKSB7XHJcbiAgICAgICAgZGVmZXIoZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgZGF0YWVudHJ5LnZhbGlkYXRlRmllbGQobmFtZSwge1xyXG4gICAgICAgICAgICBmaWVsZHM6IFtlLnRhcmdldF1cclxuICAgICAgICAgIH0pO1xyXG4gICAgICAgIH0pO1xyXG4gICAgICB9XHJcbiAgICB9O1xyXG4gICAgcmV0dXJuIHtcclxuICAgICAgXCJrZXlwcmVzcyBpbnB1dCxzZWxlY3QsdGV4dGFyZWEsW2NvbnRlbnRlZGl0YWJsZV1cIjogYWN0aXZhdGlvbkNhbGxiYWNrLFxyXG4gICAgICBcImtleWRvd24gaW5wdXQsc2VsZWN0LHRleHRhcmVhLFtjb250ZW50ZWRpdGFibGVdXCI6IGFjdGl2YXRpb25DYWxsYmFjayxcclxuICAgICAgXCJjaGFuZ2Ugc2VsZWN0XCI6IGNoYW5nZUNhbGxiYWNrLFxyXG4gICAgICBcImNoYW5nZSBpbnB1dFt0eXBlPSdyYWRpbyddXCI6IGNoYW5nZUNhbGxiYWNrLFxyXG4gICAgICBcImNoYW5nZSBpbnB1dFt0eXBlPSdjaGVja2JveCddXCI6IGNoYW5nZUNhbGxiYWNrXHJcbiAgICB9O1xyXG4gIH1cclxufVxyXG5cclxuRG9tQmluZGVyLnZhbGlkYXRpb25FdmVudCA9IFwiYmx1clwiO1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgRG9tQmluZGVyIiwiLyoqXHJcbiAqIERhdGFFbnRyeSBidWlsdC1pbiBjb25zdHJhaW50cyBydWxlcy5cclxuICogaHR0cHM6Ly9naXRodWIuY29tL1JvYmVydG9QcmV2YXRvL0RhdGFFbnRyeVxyXG4gKlxyXG4gKiBDb3B5cmlnaHQgMjAxOSwgUm9iZXJ0byBQcmV2YXRvXHJcbiAqIGh0dHBzOi8vcm9iZXJ0b3ByZXZhdG8uZ2l0aHViLmlvXHJcbiAqXHJcbiAqIExpY2Vuc2VkIHVuZGVyIHRoZSBNSVQgbGljZW5zZTpcclxuICogaHR0cDovL3d3dy5vcGVuc291cmNlLm9yZy9saWNlbnNlcy9NSVRcclxuICovXHJcbmltcG9ydCBfIGZyb20gXCIuLi8uLi91dGlsc1wiXHJcblxyXG5jb25zdCBjb250YWlucyA9IF8uY29udGFpbnM7XHJcblxyXG4vKipcclxuICogUmV0dXJucyBhIHZhbHVlIGluZGljYXRpbmcgd2V0aGVyIHRoZSBrZXlzIG9yIGtleXMgY29tYmluYXRpb25zIHNob3VsZCBiZSBhbHdheXMgYWxsb3dlZFxyXG4gKi9cclxuZnVuY3Rpb24gcGVybWl0dGVkQ2hhcmFjdGVycyhlLCBjKSB7XHJcbiAgLy9jaGFyYWN0ZXJzIG9yIGNoYXJhY3RlcnMgY29tYmluYXRpb24gYWx3YXlzIHBlcm1pdHRlZFxyXG4gIGlmIChjb250YWlucyhbOCwgMCwgMzcsIDM5LCA5XSwgYykgfHwgKGUuY3RybEtleSAmJiBjb250YWlucyhbMTIwLCAxMTgsIDk5LCA5NywgODgsIDg2LCA2N10sIGMpKSkgcmV0dXJuIHRydWU7XHJcbiAgcmV0dXJuIGZhbHNlO1xyXG59XHJcblxyXG4vLyBzaG9ydGN1dCBmb3IgU3RyaW5nLmZyb21DaGFyQ29kZVxyXG5mdW5jdGlvbiBzdHJpbmdGcm9tQ29kZShjKSB7XHJcbiAgcmV0dXJuIFN0cmluZy5mcm9tQ2hhckNvZGUoYyk7XHJcbn1cclxuXHJcbi8vIHNob3J0Y3V0IGZvciBzdHJpbmcgbWF0Y2ggcmVnZXggY2FsbFxyXG5mdW5jdGlvbiBtYXRjaChzLCByeCkge1xyXG4gIHJldHVybiBzLm1hdGNoKHJ4KTtcclxufVxyXG5cclxuLyoqXHJcbiAqIFJldHVybnMgdGhlIHZhbHVlIHRoYXQgYSBmaWVsZCB3aWxsIGhhdmUsIGlmIHRoZSBnaXZlbiBrZXlwcmVzcyBldmVudCBnb2VzIHRocm91Z2guXHJcbiAqIFxyXG4gKiBAcGFyYW0geyp9IGUgXHJcbiAqL1xyXG5mdW5jdGlvbiBmb3Jlc2VlVmFsdWUoZSkge1xyXG4gIHZhciBhID0gXCJzZWxlY3Rpb25TdGFydFwiLFxyXG4gICAgYiA9IFwic2VsZWN0aW9uRW5kXCIsXHJcbiAgICBlbGVtZW50ID0gZS50YXJnZXQsXHJcbiAgICB2YWx1ZSA9IGVsZW1lbnQudmFsdWUsXHJcbiAgICBjID0gZS5rZXlDb2RlIHx8IGUuY2hhckNvZGUsXHJcbiAgICBrZXkgPSBzdHJpbmdGcm9tQ29kZShjKSxcclxuICAgIHNlbGVjdGVkID0gdmFsdWUuc3Vic3RyKGVsZW1lbnRbYV0sIGVsZW1lbnRbYl0pLFxyXG4gICAgYmVmb3JlU2VsZWN0aW9uID0gdmFsdWUuc3Vic3RyKDAsIGVsZW1lbnRbYV0pLFxyXG4gICAgYWZ0ZXJTZWxlY3Rpb24gPSB2YWx1ZS5zdWJzdHIoZWxlbWVudFtiXSwgdmFsdWUubGVuZ3RoKTtcclxuICByZXR1cm4gW2JlZm9yZVNlbGVjdGlvbiwga2V5LCBhZnRlclNlbGVjdGlvbl0uam9pbihcIlwiKTtcclxufVxyXG5cclxuXHJcbmZ1bmN0aW9uIG9ubHlEaWdpdHMoZSwgYykge1xyXG4gIHZhciBjID0gKGUua2V5Q29kZSB8fCBlLmNoYXJDb2RlKSwga2V5ID0gc3RyaW5nRnJvbUNvZGUoYyk7XHJcbiAgaWYgKCFwZXJtaXR0ZWRDaGFyYWN0ZXJzKGUsIGMpICYmICFtYXRjaChrZXksIC9cXGQvKSkgcmV0dXJuIGZhbHNlO1xyXG4gIHJldHVybiB0cnVlO1xyXG59XHJcblxyXG5cclxuY29uc3QgQ29uc3RyYWludHMgPSB7XHJcblxyXG4gIC8vIEFsbG93cyB0byBpbnB1dCBvbmx5IGxldHRlcnNcclxuICBsZXR0ZXJzOiBmdW5jdGlvbiAoZSwgYykge1xyXG4gICAgdmFyIGMgPSAoZS5rZXlDb2RlIHx8IGUuY2hhckNvZGUpLCBrZXkgPSBzdHJpbmdGcm9tQ29kZShjKTtcclxuICAgIGlmICghcGVybWl0dGVkQ2hhcmFjdGVycyhlLCBjKSAmJiAhbWF0Y2goa2V5LCAvW2EtekEtWl0vKSkgcmV0dXJuIGZhbHNlO1xyXG4gICAgcmV0dXJuIHRydWU7XHJcbiAgfSxcclxuXHJcbiAgLy8gQWxsb3dzIHRvIGlucHV0IG9ubHkgZGlnaXRzXHJcbiAgZGlnaXRzOiBvbmx5RGlnaXRzLFxyXG5cclxuICBpbnRlZ2VyOiBvbmx5RGlnaXRzXHJcbn07XHJcblxyXG5leHBvcnQgeyBcclxuICBDb25zdHJhaW50cywgXHJcbiAgZm9yZXNlZVZhbHVlLCBcclxuICBwZXJtaXR0ZWRDaGFyYWN0ZXJzLFxyXG4gIHN0cmluZ0Zyb21Db2RlLFxyXG4gIG1hdGNoXHJcbn0iLCIvKipcclxuICogRGF0YUVudHJ5IGNsYXNzLlxyXG4gKiBodHRwczovL2dpdGh1Yi5jb20vUm9iZXJ0b1ByZXZhdG8vRGF0YUVudHJ5XHJcbiAqXHJcbiAqIENvcHlyaWdodCAyMDE5LCBSb2JlcnRvIFByZXZhdG9cclxuICogaHR0cHM6Ly9yb2JlcnRvcHJldmF0by5naXRodWIuaW9cclxuICpcclxuICogTGljZW5zZWQgdW5kZXIgdGhlIE1JVCBsaWNlbnNlOlxyXG4gKiBodHRwOi8vd3d3Lm9wZW5zb3VyY2Uub3JnL2xpY2Vuc2VzL01JVFxyXG4gKi9cclxuaW1wb3J0IF8gZnJvbSBcIi4uLy4uL3NjcmlwdHMvdXRpbHNcIlxyXG5pbXBvcnQgeyByYWlzZSB9IGZyb20gXCIuLi8uLi9zY3JpcHRzL3JhaXNlXCJcclxuaW1wb3J0IEV2ZW50c0VtaXR0ZXIgZnJvbSBcIi4uLy4uL3NjcmlwdHMvY29tcG9uZW50cy9ldmVudHNcIlxyXG5pbXBvcnQgRm9ybWF0dGVyIGZyb20gXCIuL2Zvcm1hdHRpbmcvZm9ybWF0dGVyXCJcclxuaW1wb3J0IFZhbGlkYXRvciBmcm9tIFwiLi92YWxpZGF0aW9uL3ZhbGlkYXRvclwiXHJcblxyXG5jb25zdCBWRVJTSU9OID0gXCIyLjAuNVwiXHJcblxyXG5jb25zdCBERUZBVUxUUyA9IHtcclxuICBcclxuICB1c2VJbXBsaWNpdENvbnN0cmFpbnRzOiB0cnVlLCAvLyB3aGV0aGVyIHRvIGVuYWJsZSBpbXBsaWNpdCBjb25zdHJhaW50cyBieSBtYXRjaCB3aXRoIHZhbGlkYXRvciBuYW1lc1xyXG5cclxuICB1c2VJbXBsaWNpdEZvcm1hdDogdHJ1ZSwgLy8gd2hldGhlciB0byBlbmFibGUgaW1wbGljaXQgZm9ybWF0dGluZyBieSBtYXRjaCB3aXRoIHZhbGlkYXRvciBuYW1lc1xyXG5cclxuICBmb3JtYXR0ZXI6IEZvcm1hdHRlcixcclxuXHJcbiAgdmFsaWRhdG9yOiBWYWxpZGF0b3IsXHJcblxyXG4gIGxvY2FsaXplcjogbnVsbCwgLy8gdXNlZCB0byBsb2NhbGl6ZSBlcnJvciBtZXNzYWdlc1xyXG5cclxuICBiaW5kZXI6IG51bGwsXHJcblxyXG4gIHRyaWdnZXJzRGVsYXk6IHVuZGVmaW5lZCAvLyBsZXQgc3BlY2lmeSBhIGRlbGF5IGZvciB2YWxpZGF0aW9uIHRyaWdnZXJzXHJcbn1cclxuXHJcbmNvbnN0IGxlbiA9IF8ubGVuO1xyXG5jb25zdCBpc1N0cmluZyA9IF8uaXNTdHJpbmc7XHJcbmNvbnN0IGlzUGxhaW5PYmplY3QgPSBfLmlzUGxhaW5PYmplY3Q7XHJcbmNvbnN0IGlzRnVuY3Rpb24gPSBfLmlzRnVuY3Rpb247XHJcbmNvbnN0IGlzQXJyYXkgPSBfLmlzQXJyYXk7XHJcbmNvbnN0IGV4dGVuZCA9IF8uZXh0ZW5kO1xyXG5jb25zdCBlYWNoID0gXy5lYWNoO1xyXG5jb25zdCBmaW5kID0gXy5maW5kO1xyXG5jb25zdCB3aGVyZSA9IF8ud2hlcmU7XHJcbmNvbnN0IHBpY2sgPSBfLnBpY2s7XHJcbmNvbnN0IGNvbnRhaW5zID0gXy5jb250YWlucztcclxuY29uc3QgZmxhdHRlbiA9IF8uZmxhdHRlbjtcclxuY29uc3QgZmlyc3QgPSBfLmZpcnN0O1xyXG5cclxuXHJcbmZ1bmN0aW9uIG9iak9ySW5zdGFuY2UodiwgZGF0YWVudHJ5KSB7XHJcbiAgaWYgKCF2KSBcclxuICAgIHJldHVybiBudWxsO1xyXG4gIFxyXG4gIGlmICh2LnByb3RvdHlwZSkge1xyXG4gICAgcmV0dXJuIG5ldyB2KGRhdGFlbnRyeSk7XHJcbiAgfVxyXG4gIHJldHVybiB2O1xyXG59XHJcblxyXG5cclxuZnVuY3Rpb24gdmFsaWRhdGVMb2NhbGl6ZXIob2JqKSB7XHJcbiAgaWYgKCFfLnF1YWNrcyhvYmosIFtcInRcIiwgXCJsb29rdXBcIl0pKSB7XHJcbiAgICByYWlzZSgyMiwgXCJpbnZhbGlkIGBsb2NhbGl6ZXJgIG9wdGlvbjogaXQgbXVzdCBpbXBsZW1lbnQgJ3QnIGFuZCAnbG9va3VwJyBtZXRob2RzLlwiKVxyXG4gIH1cclxufVxyXG5cclxuXHJcbmNsYXNzIERhdGFFbnRyeSBleHRlbmRzIEV2ZW50c0VtaXR0ZXIge1xyXG5cclxuICBzdGF0aWMgZ2V0IHZlcnNpb24oKSB7XHJcbiAgICByZXR1cm4gVkVSU0lPTjtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIENyZWF0ZXMgYSBuZXcgaW5zdGFuY2Ugb2YgRGF0YUVudHJ5IHdpdGggdGhlIGdpdmVuIG9wdGlvbnMgYW5kIHN0YXRpYyBwcm9wZXJ0aWVzLlxyXG4gICAqXHJcbiAgICogQHBhcmFtIG9wdGlvbnM6IG9wdGlvbnMgdG8gdXNlIGZvciB0aGlzIGluc3RhbmNlIG9mIERhdGFFbnRyeS5cclxuICAgKiBAcGFyYW0gc3RhdGljUHJvcGVydGllczogcHJvcGVydGllcyB0byBvdmVycmlkZSBpbiB0aGUgaW5zdGFuY2Ugb2YgRGF0YUVudHJ5LlxyXG4gICAqL1xyXG4gIGNvbnN0cnVjdG9yKG9wdGlvbnMpIHtcclxuICAgIHN1cGVyKCk7XHJcbiAgICBpZiAoIW9wdGlvbnMpIHJhaXNlKDgsIFwibWlzc2luZyBvcHRpb25zXCIpOyAvLyBtaXNzaW5nIG9wdGlvbnNcclxuICAgIGlmICghb3B0aW9ucy5zY2hlbWEpIHJhaXNlKDgsIFwibWlzc2luZyBzY2hlbWFcIik7IC8vIG1pc3Npbmcgc2NoZW1hXHJcblxyXG4gICAgdmFyIHNlbGYgPSB0aGlzLCBiYXNlUHJvcGVydGllcyA9IERhdGFFbnRyeS5iYXNlUHJvcGVydGllcztcclxuXHJcbiAgICBleHRlbmQoc2VsZiwgcGljayhvcHRpb25zLCBiYXNlUHJvcGVydGllcykpO1xyXG4gICAgc2VsZi5vcHRpb25zID0gb3B0aW9ucyA9IGV4dGVuZCh7fSwgRGF0YUVudHJ5LmRlZmF1bHRzLCBwaWNrKG9wdGlvbnMsIGJhc2VQcm9wZXJ0aWVzLCAxKSk7XHJcblxyXG4gICAgdmFyIG1pc3NpbmdUeXBlcyA9IFtdO1xyXG4gICAgZWFjaChbXCJtYXJrZXJcIiwgXCJmb3JtYXR0ZXJcIiwgXCJoYXJ2ZXN0ZXJcIl0sIG5hbWUgPT4ge1xyXG4gICAgICBpZiAoIW9wdGlvbnNbbmFtZV0pIG1pc3NpbmdUeXBlcy5wdXNoKG5hbWUpO1xyXG4gICAgfSk7XHJcbiAgICBpZiAobWlzc2luZ1R5cGVzLmxlbmd0aCkge1xyXG4gICAgICByYWlzZSg4LCBcIm1pc3Npbmcgb3B0aW9uczogXCIgKyBtaXNzaW5nVHlwZXMuam9pbihcIiwgXCIpKVxyXG4gICAgfVxyXG5cclxuICAgIGNvbnN0IGxvY2FsaXplciA9IG9wdGlvbnMubG9jYWxpemVyO1xyXG4gICAgaWYgKGxvY2FsaXplcilcclxuICAgICAgdmFsaWRhdGVMb2NhbGl6ZXIobG9jYWxpemVyKTtcclxuICAgIHNlbGYubG9jYWxpemVyID0gbG9jYWxpemVyO1xyXG5cclxuICAgIGVhY2goW1xyXG4gICAgICBcIm1hcmtlclwiLCBcclxuICAgICAgXCJmb3JtYXR0ZXJcIiwgXHJcbiAgICAgIFwiaGFydmVzdGVyXCIsIFxyXG4gICAgICBcInZhbGlkYXRvclwiLFxyXG4gICAgICBcImJpbmRlclwiXSwgbmFtZSA9PiB7XHJcbiAgICAgIHNlbGZbbmFtZV0gPSBvYmpPckluc3RhbmNlKG9wdGlvbnNbbmFtZV0sIHNlbGYpO1xyXG4gICAgfSlcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIENvbmZpZ3VyZXMgZ2xvYmFsIGRlZmF1bHQgb3B0aW9ucyBmb3IgdGhlIERhdGFFbnRyeS5cclxuICAgKiBcclxuICAgKiBAcGFyYW0ge29iamVjdH0gb3B0aW9ucyBcclxuICAgKi9cclxuICBzdGF0aWMgY29uZmlndXJlKG9wdGlvbnMpIHtcclxuICAgIGVhY2gob3B0aW9ucywgKHYsIGspID0+IHtcclxuICAgICAgRGF0YUVudHJ5LmRlZmF1bHRzW2tdID0gdjtcclxuICAgIH0pO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogRGlzcG9zZXMgb2YgdGhpcyBkYXRhZW50cnkuXHJcbiAgICovXHJcbiAgZGlzcG9zZSgpIHtcclxuICAgIHZhciBzZWxmID0gdGhpcztcclxuICAgIGVhY2goW1xyXG4gICAgICBcImJpbmRlclwiLCBcclxuICAgICAgXCJtYXJrZXJcIiwgXHJcbiAgICAgIFwiZm9ybWF0dGVyXCIsIFxyXG4gICAgICBcImhhcnZlc3RlclwiLCBcclxuICAgICAgXCJ2YWxpZGF0b3JcIixcclxuICAgICAgXCJjb250ZXh0XCJdLCBuYW1lID0+IHtcclxuICAgICAgdmFyIG8gPSBzZWxmW25hbWVdO1xyXG4gICAgICBpZiAobyAmJiBvLmRpc3Bvc2UpXHJcbiAgICAgICAgby5kaXNwb3NlKCk7XHJcbiAgICAgIGRlbGV0ZSBzZWxmW25hbWVdO1xyXG4gICAgfSlcclxuICAgIGVhY2goW1widmFsaWRhdGlvbkNvbnRleHRcIl0sIG5hbWUgPT4ge1xyXG4gICAgICBkZWxldGUgc2VsZi5vcHRpb25zW25hbWVdO1xyXG4gICAgfSlcclxuICAgIGRlbGV0ZSBzZWxmLm9wdGlvbnM7XHJcbiAgICAvLyByZW1vdmUgZXZlbnQgbGlzdGVuZXJzXHJcbiAgICBzZWxmLm9mZigpO1xyXG4gICAgc2VsZi5zdG9wTGlzdGVuaW5nKCk7XHJcbiAgICByZXR1cm4gc2VsZjtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFZhbGlkYXRlcyB0aGUgZmllbGRzIGRlZmluZWQgaW4gdGhlIHNjaGVtYSBvZiB0aGlzIERhdGFFbnRyeTsgb3Igc3BlY2lmaWMgZmllbGRzIGJ5IG5hbWUuXHJcbiAgICogXHJcbiAgICogQHBhcmFtIGZpZWxkc1xyXG4gICAqIEBwYXJhbSBvcHRpb25zXHJcbiAgICogQHJldHVybnMge1Byb21pc2V9XHJcbiAgICovXHJcbiAgdmFsaWRhdGUoZmllbGRzLCBvcHRpb25zKSB7XHJcbiAgICB2YXIgc2VsZiA9IHRoaXM7XHJcbiAgICBvcHRpb25zID0gb3B0aW9ucyB8fCB7fTtcclxuICAgIGlmIChmaWVsZHMgJiYgaXNGdW5jdGlvbihmaWVsZHMpKSBmaWVsZHMgPSBmaWVsZHMuY2FsbChzZWxmKTtcclxuICAgIGlmIChmaWVsZHMgJiYgIWlzQXJyYXkoZmllbGRzKSkgcmFpc2UoOSwgXCJ2YWxpZGF0ZSBgZmllbGRzYCBhcmd1bWVudCBtdXN0IGJlIGFuIGFycmF5IG9mIHN0cmluZ3NcIik7IC8vIGludmFsaWQgcGFyYW1ldGVyOiBmaWVsZHMgbXVzdCBiZSBhbiBhcnJheSBvZiBzdHJpbmdzXHJcblxyXG4gICAgdmFyIHNjaGVtYSA9IHNlbGYuc2NoZW1hO1xyXG4gICAgaWYgKCFzY2hlbWEpIHJhaXNlKDExKTtcclxuXHJcbiAgICByZXR1cm4gbmV3IFByb21pc2UoZnVuY3Rpb24gKHJlc29sdmUsIHJlamVjdCkge1xyXG4gICAgICB2YXIgY2hhaW4gPSBbXSwgdmFsaWRhdGluZ0ZpZWxkcyA9IFtdO1xyXG4gICAgICBmb3IgKHZhciB4IGluIHNjaGVtYSkge1xyXG4gICAgICAgIGlmIChmaWVsZHMgJiYgIWNvbnRhaW5zKGZpZWxkcywgeCkpIGNvbnRpbnVlO1xyXG4gICAgICAgIHZhbGlkYXRpbmdGaWVsZHMucHVzaCh4KTsgLy8gbmFtZXMgb2YgZmllbGRzIGJlaW5nIHZhbGlkYXRlZFxyXG4gICAgICB9XHJcblxyXG4gICAgICBvcHRpb25zLnZhbGlkYXRpbmdGaWVsZHMgPSB2YWxpZGF0aW5nRmllbGRzOyAvLyBzbyB3ZSBkb24ndCB0cmlnZ2VyIHZhbGlkYXRpb24gZm9yIGZpZWxkcyBiZWluZyB2YWxpZGF0ZWRcclxuXHJcbiAgICAgIGVhY2godmFsaWRhdGluZ0ZpZWxkcywgZmllbGROYW1lID0+IHtcclxuICAgICAgICBjaGFpbi5wdXNoKHNlbGYudmFsaWRhdGVGaWVsZChmaWVsZE5hbWUsIG9wdGlvbnMpKTtcclxuICAgICAgfSlcclxuICAgICAgXHJcblxyXG4gICAgICBQcm9taXNlLmFsbChjaGFpbikudGhlbihmdW5jdGlvbiAoYSkge1xyXG4gICAgICAgIHZhciBkYXRhID0gZmxhdHRlbihhKTtcclxuICAgICAgICB2YXIgZXJyb3JzID0gd2hlcmUoZGF0YSwgZnVuY3Rpb24gKG8pIHsgcmV0dXJuIG8gJiYgby5lcnJvcjsgfSk7XHJcbiAgICAgICAgaWYgKGxlbihlcnJvcnMpKSB7XHJcbiAgICAgICAgICBzZWxmLnRyaWdnZXIoXCJmaXJzdDplcnJvclwiLCBlcnJvcnNbMF0pO1xyXG4gICAgICAgICAgc2VsZi50cmlnZ2VyKFwiZXJyb3JzXCIsIGVycm9ycyk7XHJcblxyXG4gICAgICAgICAgLy9yZXNvbHZlIHdpdGggZmFpbHVyZSB2YWx1ZVxyXG4gICAgICAgICAgcmVzb2x2ZS5jYWxsKHNlbGYsIHtcclxuICAgICAgICAgICAgdmFsaWQ6IGZhbHNlLFxyXG4gICAgICAgICAgICBlcnJvcnM6IGVycm9yc1xyXG4gICAgICAgICAgfSk7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgIC8vYWxsIHRoZSB2YWxpZGF0aW9uIHJ1bGVzIHJldHVybmVkIHN1Y2Nlc3NcclxuICAgICAgICAgIHJlc29sdmUuY2FsbChzZWxmLCB7XHJcbiAgICAgICAgICAgIHZhbGlkOiB0cnVlLFxyXG4gICAgICAgICAgICB2YWx1ZXM6IHNlbGYuaGFydmVzdGVyLmdldFZhbHVlcygpXHJcbiAgICAgICAgICB9KTtcclxuICAgICAgICB9XHJcbiAgICAgIH0sIGZ1bmN0aW9uIChkYXRhKSB7XHJcbiAgICAgICAgLy9hbiBleGNlcHRpb24gaGFwcGVuIHdoaWxlIHBlcmZvcm1pbmcgdmFsaWRhdGlvbjsgcmVqZWN0IHRoZSBwcm9taXNlXHJcbiAgICAgICAgcmVqZWN0LmFwcGx5KHNlbGYsIFtkYXRhXSk7XHJcbiAgICAgIH0pO1xyXG4gICAgfSk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBWYWxpZGF0ZXMgb25lIG9yIG1vcmUgZmllbGRzLCBieSBhIHNpbmdsZSBuYW1lXHJcbiAgICogaXQgcmV0dXJucyBhIGRlZmVycmVkIHRoYXQgY29tcGxldGVzIHdoZW4gdmFsaWRhdGlvbiBjb21wbGV0ZXMgZm9yIGVhY2ggZmllbGQgd2l0aCB0aGUgZ2l2ZW4gbmFtZS5cclxuICAgKiBcclxuICAgKiBAcGFyYW0gZmllbGROYW1lXHJcbiAgICogQHBhcmFtIG9wdGlvbnNcclxuICAgKiBAcmV0dXJucyB7UHJvbWlzZX1cclxuICAgKi9cclxuICB2YWxpZGF0ZUZpZWxkKGZpZWxkTmFtZSwgb3B0aW9ucykge1xyXG4gICAgLy8gc2V0IG9wdGlvbnMgd2l0aCBkZWZhdWx0IHZhbHVlc1xyXG4gICAgb3B0aW9ucyA9IGV4dGVuZCh7XHJcbiAgICAgIGRlcHRoOiAwLFxyXG4gICAgICBvbmx5VG91Y2hlZDogZmFsc2VcclxuICAgIH0sIG9wdGlvbnMgfHwge30pO1xyXG4gICAgdmFyIHNlbGYgPSB0aGlzLCBzY2hlbWEgPSBzZWxmLnNjaGVtYTtcclxuXHJcbiAgICBpZiAoIWZpZWxkTmFtZSlcclxuICAgICAgcmFpc2UoMTIpO1xyXG5cclxuICAgIGlmICghc2NoZW1hKVxyXG4gICAgICByYWlzZSgxMSk7XHJcblxyXG4gICAgdmFyIGZpZWxkU2NoZW1hID0gc2NoZW1hW2ZpZWxkTmFtZV07XHJcbiAgICBpZiAoIWZpZWxkU2NoZW1hKVxyXG4gICAgICAvLyBDYW5ub3QgdmFsaWRhdGUgZmllbGQgYmVjYXVzZSB0aGUgc2NoZW1hIG9iamVjdCBkb2VzIG5vdCBjb250YWluIGl0cyBkZWZpbml0aW9uIFxyXG4gICAgICAvLyBvciBpdHMgdmFsaWRhdGlvbiBkZWZpbml0aW9uXHJcbiAgICAgIHJhaXNlKDEzLCBmaWVsZE5hbWUpO1xyXG5cclxuICAgIC8vIG5vcm1hbGl6ZSwgaWYgYXJyYXlcclxuICAgIGlmIChpc0FycmF5KGZpZWxkU2NoZW1hKSkge1xyXG4gICAgICBzY2hlbWFbZmllbGROYW1lXSA9IGZpZWxkU2NoZW1hID0ge1xyXG4gICAgICAgIHZhbGlkYXRpb246IGZpZWxkU2NoZW1hXHJcbiAgICAgIH07XHJcbiAgICB9IGVsc2UgaWYgKCFmaWVsZFNjaGVtYS52YWxpZGF0aW9uKSB7XHJcbiAgICAgIHJhaXNlKDEzLCBmaWVsZE5hbWUpO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIHN1cHBvcnQgZm9yIGhhcnZlc3RlciByZXR1cm5pbmcgbXVsdGlwbGUgZmllbGRzIGJ5IHRoZSBzYW1lIG5hbWVcclxuICAgIC8vIHRoZSBoYXJ2ZXN0ZXIgY2FuIHRoZW4gcmV0dXJuIG90aGVyIGtpbmQgb2YgZmllbGRzIChzdWNoIGFzIEhUTUwgbm9kZXMpXHJcbiAgICB2YXIgZmllbGRzID0gb3B0aW9ucy5maWVsZHMgfHwgKHRoaXMuaGFydmVzdGVyLmdldEZpZWxkcyBcclxuICAgICAgPyB0aGlzLmhhcnZlc3Rlci5nZXRGaWVsZHMoZmllbGROYW1lKVxyXG4gICAgICA6IFtmaWVsZE5hbWVdKTtcclxuICAgIHZhciB2YWxpZGF0b3IgPSBzZWxmLnZhbGlkYXRvcixcclxuICAgICAgbWFya2VyID0gc2VsZi5tYXJrZXIsXHJcbiAgICAgIHZhbGlkYXRpb24gPSBzZWxmLmdldEZpZWxkVmFsaWRhdGlvbkRlZmluaXRpb24oZmllbGRTY2hlbWEudmFsaWRhdGlvbiksXHJcbiAgICAgIGNoYWluID0gW107XHJcbiAgICBcclxuICAgIGVhY2goZmllbGRzLCBmdW5jdGlvbiAoZmllbGQpIHtcclxuICAgICAgdmFyIHZhbHVlID0gc2VsZi5oYXJ2ZXN0ZXIuZ2V0VmFsdWUoZmllbGQpO1xyXG5cclxuICAgICAgLy8gbWFyayBmaWVsZCBuZXV0cnVtIGJlZm9yZSB2YWxpZGF0aW9uXHJcbiAgICAgIG1hcmtlci5tYXJrRmllbGROZXV0cnVtKGZpZWxkKTtcclxuICAgICAgXHJcbiAgICAgIHZhciBwID0gdmFsaWRhdG9yLnZhbGlkYXRlKHZhbGlkYXRpb24sIGZpZWxkLCB2YWx1ZSkudGhlbihmdW5jdGlvbiAoZGF0YSkge1xyXG4gICAgICAgIC8vIHRoZSB2YWxpZGF0aW9uIHByb2Nlc3Mgc3VjY2VlZGVkIChkaWRuJ3QgcHJvZHVjZSBhbnkgZXhjZXB0aW9uKVxyXG4gICAgICAgIC8vIGJ1dCB0aGlzIGRvZXNuJ3QgbWVhbiB0aGF0IHRoZSBmaWVsZCBpcyB2YWxpZDpcclxuICAgICAgICBmb3IgKHZhciBqID0gMCwgcSA9IGxlbihkYXRhKTsgaiA8IHE7IGorKykge1xyXG4gICAgICAgICAgdmFyIG8gPSBkYXRhW2pdO1xyXG4gICAgICAgICAgaWYgKG8uZXJyb3IpIHtcclxuICAgICAgICAgICAgLy8gZmllbGQgaW52YWxpZFxyXG4gICAgICAgICAgICBtYXJrZXIubWFya0ZpZWxkSW52YWxpZChmaWVsZCwge1xyXG4gICAgICAgICAgICAgIG1lc3NhZ2U6IG8ubWVzc2FnZVxyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgLy8gZXhpdFxyXG4gICAgICAgICAgICByZXR1cm4gZGF0YTtcclxuICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgXHJcbiAgICAgICAgLy8gdGhlIGZpZWxkIGlzIHZhbGlkOyBpdHMgdmFsdWUgY2FuIGJlIGZvcm1hdHRlZDtcclxuICAgICAgICBzZWxmLm9uR29vZFZhbGlkYXRpb24oZmllbGRTY2hlbWEsIGZpZWxkLCBmaWVsZE5hbWUsIHZhbHVlLCBvcHRpb25zKTtcclxuXHJcbiAgICAgICAgbWFya2VyLm1hcmtGaWVsZFZhbGlkKGZpZWxkKTtcclxuICAgICAgICByZXR1cm4gZGF0YTtcclxuICAgICAgfSwgZnVuY3Rpb24gKGFycikge1xyXG4gICAgICAgIC8vIHRoZSB2YWxpZGF0aW9uIHByb2Nlc3MgZmFpbGVkIChpdCBwcm9kdWNlZCBhbiBleGNlcHRpb24pXHJcbiAgICAgICAgLy8gdGhpcyBzaG91bGQgaGFwcGVuLCBmb3IgZXhhbXBsZSwgd2hlbiBhIHZhbGlkYXRpb24gcnVsZSB0aGF0IGludm9sdmVzIGFuIEFqYXggcmVxdWVzdCByZWNlaXZlcyBzdGF0dXMgNTAwIGZyb20gdGhlIHNlcnZlciBzaWRlLlxyXG4gICAgICAgIHZhciBhID0gZmlyc3QoYXJyLCBmdW5jdGlvbiAobykge1xyXG4gICAgICAgICAgcmV0dXJuIG8uZXJyb3I7XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgbWFya2VyLm1hcmtGaWVsZEludmFsaWQoZmllbGQsIHtcclxuICAgICAgICAgIG1lc3NhZ2U6IGEubWVzc2FnZVxyXG4gICAgICAgIH0pO1xyXG4gICAgICB9KTtcclxuXHJcbiAgICAgIGNoYWluLnB1c2gocCk7XHJcbiAgICB9KTtcclxuICAgIC8vIE5COiB0aGUgY2hhaW4gY2FuIGNvbnRhaW4gbW9yZSB0aGFuIG9uZSBlbGVtZW50LCB3aGVuIGEgZmllbGRzZXQgY29udGFpbnMgbXVsdGlwbGUgZWxlbWVudHMgd2l0aCB0aGUgc2FtZSBuYW1lXHJcbiAgICAvLyAod2hpY2ggaXMgcHJvcGVyIEhUTUwgYW5kIHJlbGF0aXZlbHkgY29tbW9uIHNjZW5hcmlvKVxyXG4gICAgcmV0dXJuIG5ldyBQcm9taXNlKGZ1bmN0aW9uIChyZXNvbHZlLCByZWplY3QpIHtcclxuICAgICAgUHJvbWlzZS5hbGwoY2hhaW4pLnRoZW4oZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIHJlc29sdmUoXy50b0FycmF5KGFyZ3VtZW50cykpO1xyXG4gICAgICB9KTtcclxuICAgIH0pO1xyXG4gIH1cclxuXHJcbiAgb25Hb29kVmFsaWRhdGlvbihmaWVsZFNjaGVtYSwgZmllbGQsIGZpZWxkTmFtZSwgdmFsdWUsIG9wdGlvbnMpIHtcclxuICAgIHRoaXMuZm9ybWF0QWZ0ZXJWYWxpZGF0aW9uKGZpZWxkU2NoZW1hLCBmaWVsZCwgZmllbGROYW1lLCB2YWx1ZSlcclxuICAgICAgICAuaGFuZGxlVHJpZ2dlcnMoZmllbGRTY2hlbWEsIGZpZWxkLCBmaWVsZE5hbWUsIHZhbHVlLCBvcHRpb25zKTtcclxuICB9XHJcblxyXG4gIGZvcm1hdEFmdGVyVmFsaWRhdGlvbihmaWVsZFNjaGVtYSwgZmllbGQsIGZpZWxkTmFtZSwgdmFsdWUpIHtcclxuICAgIHZhciBzZWxmID0gdGhpcztcclxuICAgIHZhciBmb3JtYXQgPSBmaWVsZFNjaGVtYS5mb3JtYXQsIHZhbGlkYXRpb24gPSBmaWVsZFNjaGVtYS52YWxpZGF0aW9uO1xyXG4gICAgaWYgKGlzRnVuY3Rpb24oZm9ybWF0KSkgZm9ybWF0ID0gZm9ybWF0LmNhbGwoc2VsZiwgZiwgdmFsdWUpO1xyXG4gICAgXHJcbiAgICB2YXIgZm9ybWF0dGVkVmFsdWUgPSB2YWx1ZTtcclxuICAgIGlmIChmb3JtYXQpIHtcclxuICAgICAgZm9ybWF0dGVkVmFsdWUgPSBzZWxmLmZvcm1hdHRlci5mb3JtYXQoZm9ybWF0LCBmaWVsZCwgdmFsdWUpO1xyXG4gICAgfSBlbHNlIGlmIChzZWxmLm9wdGlvbnMudXNlSW1wbGljaXRGb3JtYXQpIHtcclxuICAgICAgLy8gYXBwbHkgZm9ybWF0IHJ1bGVzIGltcGxpY2l0bHkgKGluIHRoaXMgY2FzZSwgdGhlcmUgYXJlIG5vIHBhcmFtZXRlcnMpXHJcbiAgICAgIHZhciBtYXRjaGluZ0Zvcm1hdFJ1bGUgPSBbXTtcclxuICAgICAgXy5lYWNoKHZhbGlkYXRpb24sIHJ1bGUgPT4ge1xyXG4gICAgICAgIHZhciBuYW1lID0gaXNTdHJpbmcocnVsZSkgPyBydWxlIDogcnVsZS5uYW1lO1xyXG4gICAgICAgIGlmIChuYW1lICYmIHNlbGYuZm9ybWF0dGVyLnJ1bGVzW25hbWVdKVxyXG4gICAgICAgICAgbWF0Y2hpbmdGb3JtYXRSdWxlLnB1c2gobmFtZSk7XHJcbiAgICAgIH0pXHJcbiAgICAgIGlmIChtYXRjaGluZ0Zvcm1hdFJ1bGUubGVuZ3RoKSB7XHJcbiAgICAgICAgZm9ybWF0dGVkVmFsdWUgPSBzZWxmLmZvcm1hdHRlci5mb3JtYXQobWF0Y2hpbmdGb3JtYXRSdWxlLCBmaWVsZCwgdmFsdWUpO1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgICBpZiAoZm9ybWF0dGVkVmFsdWUgIT09IHZhbHVlKSB7XHJcbiAgICAgIC8vIHRyaWdnZXIgZXZlbnQgdG8gXHJcbiAgICAgIHNlbGYudHJpZ2dlcihcImZvcm1hdFwiLCBmaWVsZCwgZmllbGROYW1lLCBmb3JtYXR0ZWRWYWx1ZSk7XHJcbiAgICAgIHNlbGYuaGFydmVzdGVyLnNldFZhbHVlKGZpZWxkLCBmb3JtYXR0ZWRWYWx1ZSwgc2VsZiwgZmllbGROYW1lKTtcclxuICAgIH1cclxuICAgIHJldHVybiBzZWxmO1xyXG4gIH1cclxuXHJcbiAgaGFuZGxlVHJpZ2dlcnMoZmllbGRTY2hlbWEsIGZpZWxkLCBmaWVsZE5hbWUsIHZhbHVlLCBvcHRpb25zKSB7XHJcbiAgICB2YXIgdHJpZ2dlciA9IGZpZWxkU2NoZW1hLnRyaWdnZXI7XHJcbiAgICBpZiAoIXRyaWdnZXIpIHJldHVybiB0aGlzO1xyXG5cclxuICAgIC8vIGRvbid0IHJlcGVhdCB2YWxpZGF0aW9uIGZvciBmaWVsZHMgYWxyZWFkeSBiZWluZyB2YWxpZGF0ZWRcclxuICAgIGlmIChvcHRpb25zKVxyXG4gICAgICB0cmlnZ2VyID0gXy5yZWplY3QodHJpZ2dlciwgbyA9PiB7XHJcbiAgICAgICAgcmV0dXJuIG8gPT09IGZpZWxkTmFtZSB8fCBfLmNvbnRhaW5zKG9wdGlvbnMudmFsaWRhdGluZ0ZpZWxkcywgbyk7XHJcbiAgICAgIH0pXHJcblxyXG4gICAgaWYgKCFsZW4odHJpZ2dlcikpXHJcbiAgICAgIHJldHVybiB0aGlzO1xyXG5cclxuICAgIHZhciBzZWxmID0gdGhpcywgXHJcbiAgICAgICAgZGF0YWVudHJ5T3B0aW9ucyA9IHNlbGYub3B0aW9ucyxcclxuICAgICAgICB0cmlnZ2Vyc0RlbGF5ID0gZGF0YWVudHJ5T3B0aW9ucy50cmlnZ2Vyc0RlbGF5O1xyXG4gICAgLy8gYXZvaWQgcmVjdXJzaXZlIGNhbGxzXHJcbiAgICBpZiAob3B0aW9ucyAmJiBvcHRpb25zLmRlcHRoID4gMCkge1xyXG4gICAgICByZXR1cm4gc2VsZjtcclxuICAgIH1cclxuICAgIHZhciBkZXB0aCA9IDE7XHJcblxyXG4gICAgaWYgKF8uaXNOdW1iZXIodHJpZ2dlcnNEZWxheSkpIHtcclxuICAgICAgc2V0VGltZW91dCgoKSA9PiB7XHJcbiAgICAgICAgc2VsZi52YWxpZGF0ZSh0cmlnZ2VyLCB7XHJcbiAgICAgICAgICBkZXB0aDogZGVwdGhcclxuICAgICAgICB9KTtcclxuICAgICAgfSwgdHJpZ2dlcnNEZWxheSlcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIHNlbGYudmFsaWRhdGUodHJpZ2dlciwge1xyXG4gICAgICAgIGRlcHRoOiBkZXB0aFxyXG4gICAgICB9KTtcclxuICAgIH1cclxuICAgIHJldHVybiBzZWxmO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogR2V0cyBhbiBhcnJheSBvZiB2YWxpZGF0aW9ucyB0byBhcHBseSBvbiBhIGZpZWxkLlxyXG4gICAqIGl0IHN1cHBvcnRzIHRoZSB1c2Ugb2YgYXJyYXlzIG9yIGZ1bmN0aW9ucywgd2hpY2ggcmV0dXJuIGFycmF5cy5cclxuICAgKiBcclxuICAgKiBAcGFyYW0gc2NoZW1hXHJcbiAgICogQHJldHVybnMge0FycmF5fVxyXG4gICAqL1xyXG4gIGdldEZpZWxkVmFsaWRhdGlvbkRlZmluaXRpb24oc2NoZW1hKSB7XHJcbiAgICByZXR1cm4gaXNGdW5jdGlvbihzY2hlbWEpID8gc2NoZW1hLmNhbGwodGhpcy5jb250ZXh0IHx8IHRoaXMpIDogc2NoZW1hO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogR2V0IHRoZSB2YWx1ZSBvZiB0aGUgZ2l2ZW4gZmllbGQuIFByb3h5IGZ1bmN0aW9uIHRvIGhhcnZlc3RlciBnZXRWYWx1ZSBmdW5jdGlvbi5cclxuICAgKiBcclxuICAgKiBAcGFyYW0ge3N0cmluZ30gZmllbGQgXHJcbiAgICovXHJcbiAgZ2V0RmllbGRWYWx1ZShmaWVsZCkge1xyXG4gICAgcmV0dXJuIHRoaXMuaGFydmVzdGVyLmdldFZhbHVlKGZpZWxkKTtcclxuICB9XHJcbn1cclxuXHJcbkRhdGFFbnRyeS5WYWxpZGF0b3IgPSBWYWxpZGF0b3I7XHJcbkRhdGFFbnRyeS5Gb3JtYXR0ZXIgPSBGb3JtYXR0ZXI7XHJcbkRhdGFFbnRyeS5kZWZhdWx0cyA9IERFRkFVTFRTO1xyXG5EYXRhRW50cnkuYmFzZVByb3BlcnRpZXMgPSBbXCJlbGVtZW50XCIsIFwic2NoZW1hXCIsIFwiY29udGV4dFwiXTtcclxuXHJcbmV4cG9ydCBkZWZhdWx0IERhdGFFbnRyeSIsIi8qKlxyXG4gKiBEZWNvcmF0b3IgY2xhc3MgdXNpbmcgSFRNTCBlbGVtZW50czogaXQgZGlzcGxheXMgaW5mb3JtYXRpb24gXHJcbiAqIGJ5IGluamVjdGluZyBvciByZW1vdmluZyBlbGVtZW50cyBpbnNpZGUgdGhlIERPTS5cclxuICogXHJcbiAqIGh0dHBzOi8vZ2l0aHViLmNvbS9Sb2JlcnRvUHJldmF0by9EYXRhRW50cnlcclxuICpcclxuICogQ29weXJpZ2h0IDIwMTksIFJvYmVydG8gUHJldmF0b1xyXG4gKiBodHRwczovL3JvYmVydG9wcmV2YXRvLmdpdGh1Yi5pb1xyXG4gKlxyXG4gKiBMaWNlbnNlZCB1bmRlciB0aGUgTUlUIGxpY2Vuc2U6XHJcbiAqIGh0dHA6Ly93d3cub3BlbnNvdXJjZS5vcmcvbGljZW5zZXMvTUlUXHJcbiAqL1xyXG5pbXBvcnQgXyBmcm9tIFwiLi4vLi4vLi4vc2NyaXB0cy91dGlsc1wiXHJcbmltcG9ydCAkIGZyb20gXCIuLi8uLi8uLi9zY3JpcHRzL2RvbVwiXHJcblxyXG5jb25zdCBlYWNoID0gXy5lYWNoO1xyXG5jb25zdCBleHRlbmQgPSBfLmV4dGVuZDtcclxuY29uc3QgaXNTdHJpbmcgPSBfLmlzU3RyaW5nO1xyXG5jb25zdCBhcHBlbmQgPSAkLmFwcGVuZDtcclxuY29uc3QgYWRkQ2xhc3MgPSAkLmFkZENsYXNzO1xyXG5jb25zdCByZW1vdmVDbGFzcyA9ICQucmVtb3ZlQ2xhc3M7XHJcbmNvbnN0IHJlbW92ZUVsZW1lbnQgPSAkLnJlbW92ZS5iaW5kKCQpO1xyXG5jb25zdCBuZXh0ID0gJC5uZXh0O1xyXG5jb25zdCBjcmVhdGVFbGVtZW50ID0gJC5jcmVhdGVFbGVtZW50O1xyXG5jb25zdCBpc1JhZGlvQnV0dG9uID0gJC5pc1JhZGlvQnV0dG9uO1xyXG5jb25zdCBmaW5kRmlyc3QgPSAkLmZpbmRGaXJzdDtcclxuY29uc3QgYWZ0ZXIgPSAkLmFmdGVyO1xyXG5jb25zdCBhdHRyID0gJC5hdHRyO1xyXG5cclxuLy8gc3VwcG9ydCBmb3IgZXhwbGljaXRseSBkZWZpbmVkIHRhcmdldHMgdGhyb3VnaCBkYXRhIGF0dHJpYnV0ZXNcclxuZnVuY3Rpb24gY2hlY2tTcGVjaWZpY1RhcmdldChlbGVtZW50KSB7XHJcbiAgdmFyIHNwZWNpZmljVGFyZ2V0ID0gZWxlbWVudC5kYXRhc2V0LnZhbGlkYXRpb25UYXJnZXQ7XHJcbiAgaWYgKHNwZWNpZmljVGFyZ2V0KSBcclxuICAgIHJldHVybiBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChzcGVjaWZpY1RhcmdldCk7XHJcbn1cclxuXHJcbi8vIHdoZW4gYSBmaWVsZCByZWxhdGVzIHRvIGEgZ3JvdXAsIHRoZW4gaXQgbWFrZSBzZW5zZSB0byBkaXNwbGF5IGluZm9ybWF0aW9uIG9ubHkgb24gdGhlIGZpcnN0IGVsZW1lbnQgb2YgdGhlIGdyb3VwLlxyXG4vLyBhIGNvbW1vbiBjYXNlIGZvciB0aGlzIHNpdHVhdGlvbiBhcmUgcmFkaW8gYnV0dG9uczogaWYgYSB2YWx1ZSBjb21pbmcgZnJvbSBhIGdyb3VwIG9mIHJhZGlvIGJ1dHRvbnMgaXMgcmVxdWlyZWQsXHJcbi8vIHRoZW4gaXQgbWFrZXMgc2Vuc2UgdG8gZGlzcGxheSBpbmZvcm1hdGlvbiBvbmx5IG9uIHRoZSBmaXJzdCBvbmU7XHJcbmZ1bmN0aW9uIGNoZWNrR3JvdXAoZWxlbWVudCkge1xyXG4gIGlmIChpc1JhZGlvQnV0dG9uKGVsZW1lbnQpKSB7XHJcbiAgICAvLyByZXR1cm4gdGhlIGZpcnN0IHJhZGlvIGJ1dHRvbiBhcHBlYXJpbmcgaW4gRE9NXHJcbiAgICByZXR1cm4gdGhpcy5kYXRhZW50cnkgJiYgdGhpcy5kYXRhZW50cnkuZWxlbWVudCA/IHRoaXMuZGF0YWVudHJ5LmVsZW1lbnQucXVlcnlTZWxlY3RvckFsbCgkLm5hbWVTZWxlY3RvcihlbGVtZW50KSlbMF0gOiBlbGVtZW50O1xyXG4gIH1cclxuICByZXR1cm4gZWxlbWVudDtcclxufVxyXG5cclxuZnVuY3Rpb24gY2hlY2tFbGVtZW50KGVsZW1lbnQpIHtcclxuICB2YXIgc3BlY2lmaWNUYXJnZXQgPSBjaGVja1NwZWNpZmljVGFyZ2V0KGVsZW1lbnQpO1xyXG4gIGlmIChzcGVjaWZpY1RhcmdldClcclxuICAgIHJldHVybiBzcGVjaWZpY1RhcmdldDtcclxuICBcclxuICB2YXIgcmUgPSBjaGVja0dyb3VwLmNhbGwodGhpcywgZWxlbWVudCk7XHJcbiAgLy8gc3VwcG9ydCByYWRpbyBhbmQgY2hlY2tib3hlcyBiZWZvcmUgbGFiZWxzIChkZWNvcmF0ZSBhZnRlciBsYWJlbHMpXHJcbiAgaWYgKC9ecmFkaW98Y2hlY2tib3gkL2kudGVzdChlbGVtZW50LnR5cGUpKSB7XHJcbiAgICB2YXIgbnggPSBuZXh0KGVsZW1lbnQpO1xyXG4gICAgaWYgKG54ICYmIC9sYWJlbC9pLnRlc3QobngudGFnTmFtZSkgJiYgZWxlbWVudC5pZCA9PSBhdHRyKG54LCBcImZvclwiKSkge1xyXG4gICAgICByZXR1cm4gbng7XHJcbiAgICB9XHJcbiAgfVxyXG4gIHJldHVybiByZTtcclxufVxyXG5cclxuXHJcbmNvbnN0IFRPT0xUSVBTID0gXCJ0b29sdGlwc1wiXHJcblxyXG5cclxuY2xhc3MgRG9tRGVjb3JhdG9yIHtcclxuXHJcbiAgLyoqXHJcbiAgICogQ3JlYXRlcyBhIG5ldyBpbnN0YW5jZSBvZiBEb21EZWNvcmF0b3IgYXNzb2NpYXRlZCB3aXRoIHRoZSBnaXZlbiBkYXRhZW50cnkuXHJcbiAgICpcclxuICAgKiBAcGFyYW0gZGF0YWVudHJ5OiBpbnN0YW5jZSBvZiBEYXRhRW50cnkuXHJcbiAgICovXHJcbiAgY29uc3RydWN0b3IoZGF0YWVudHJ5KSB7XHJcbiAgICB0aGlzLmRhdGFlbnRyeSA9IGRhdGFlbnRyeTtcclxuICAgIC8vIGRlZmF1bHQgdG8gdG9vbHRpcHMgaWYgbm90IHNwZWNpZmllZCBvdGhlcndpc2VcclxuICAgIHRoaXMubWFya1N0eWxlID0gZGF0YWVudHJ5ID8gKGRhdGFlbnRyeS5vcHRpb25zLm1hcmtTdHlsZSB8fCBUT09MVElQUykgOiBUT09MVElQUztcclxuICAgIHRoaXMub3B0aW9ucyA9IF8uZXh0ZW5kKHt9LCBEb21EZWNvcmF0b3IuZGVmYXVsdHMsIGRhdGFlbnRyeSAmJiBkYXRhZW50cnkub3B0aW9ucyA/IGRhdGFlbnRyeS5vcHRpb25zLmRlY29yYXRvck9wdGlvbnMgOiB7fSk7XHJcbiAgICB0aGlzLl9lbGVtZW50cyA9IFtdO1xyXG4gIH1cclxuXHJcbiAgY3JlYXRlKHRhZ25hbWUpIHtcclxuICAgIHZhciBlbCA9ICQuY3JlYXRlRWxlbWVudCh0YWduYW1lKTtcclxuICAgIHRoaXMuX2VsZW1lbnRzLnB1c2goZWwpO1xyXG4gICAgcmV0dXJuIGVsO1xyXG4gIH1cclxuXHJcbiAgY2hlY2tFbGVtZW50KGVsZW1lbnQpIHtcclxuICAgIHJldHVybiBjaGVja0VsZW1lbnQoZWxlbWVudClcclxuICB9XHJcblxyXG4gIGJpbmREZWNvcmF0b3JFbGVtZW50KGZpZWxkLCBtYXJrZXJFbGVtZW50KSB7XHJcbiAgICBpZiAoJC5hdHRyKG1hcmtlckVsZW1lbnQsICdpZCcpID09PSBmaWVsZC5kYXRhc2V0Lm1hcmtlcklkKSB7XHJcbiAgICAgIC8vIGVsZW1lbnRzIGFyZSBhbHJlYWR5IGJvdW5kXHJcbiAgICAgIHJldHVybjtcclxuICAgIH1cclxuICAgIGxldCB1bmlxdWVJZCA9IF8udW5pcXVlSWQoJ3VnLWRhdGFlbnRyeS1tYXJrZXInKTtcclxuICAgICQuc2V0QXR0cihtYXJrZXJFbGVtZW50LCB7J2lkJzogdW5pcXVlSWR9KTtcclxuICAgIGZpZWxkLmRhdGFzZXQubWFya2VySWQgPSB1bmlxdWVJZDtcclxuICB9XHJcblxyXG4gIGdldEN1cnJlbnRNZXNzYWdlRWxlbWVudChmaWVsZCkge1xyXG4gICAgbGV0IG1hcmtlcklkID0gZmllbGQuZGF0YXNldC5tYXJrZXJJZDtcclxuICAgIGlmIChtYXJrZXJJZCkge1xyXG4gICAgICByZXR1cm4gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQobWFya2VySWQpO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogR2V0cyBhbiBlbGVtZW50IHRvIGRpc3BsYXkgdmFsaWRhdGlvbiBpbmZvcm1hdGlvbiBhYm91dCB0aGUgZ2l2ZW4gZmllbGQuXHJcbiAgICogSWYgdGhlIGVsZW1lbnQgYWxyZWFkeSBleGlzdHMsIGl0IGlzIHJldHVybmVkLlxyXG4gICAqIFxyXG4gICAqIEBwYXJhbSBmXHJcbiAgICogQHBhcmFtIGNyZWF0ZVxyXG4gICAqIEByZXR1cm5zIHsqfVxyXG4gICAqL1xyXG4gIGdldE1lc3NhZ2VFbGVtZW50KGYsIGNyZWF0ZSwgb3B0aW9ucykge1xyXG4gICAgdmFyIHNlbGYgPSB0aGlzO1xyXG4gICAgaWYgKHNlbGYubWFya1N0eWxlID09IFRPT0xUSVBTKSB7XHJcbiAgICAgIHZhciBsID0gc2VsZi5nZXRDdXJyZW50TWVzc2FnZUVsZW1lbnQoZik7XHJcbiAgICAgIGlmIChsKVxyXG4gICAgICAgIHJldHVybiBsO1xyXG4gICAgICBpZiAoY3JlYXRlKSB7XHJcbiAgICAgICAgbCA9IHNlbGYuZ2V0VG9vbHRpcEVsZW1lbnQoZiwgY3JlYXRlLCBvcHRpb25zKTtcclxuICAgICAgICAvLyBhc3NpZ24gYW4gdW5pcXVlIGlkIHRvIHRoaXMgZWxlbWVudDtcclxuICAgICAgICBzZWxmLmJpbmREZWNvcmF0b3JFbGVtZW50KGYsIGwpO1xyXG4gICAgICAgIHJldHVybiBsO1xyXG4gICAgICB9IGVsc2Uge1xyXG4gICAgICAgIHJldHVybiBudWxsO1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgICB2YXIgbCA9IHNlbGYuZ2V0Q3VycmVudE1lc3NhZ2VFbGVtZW50KGYpO1xyXG4gICAgaWYgKGwpXHJcbiAgICAgIHJldHVybiBsO1xyXG4gICAgaWYgKCFjcmVhdGUpXHJcbiAgICAgIHJldHVybiBudWxsO1xyXG4gICAgbCA9IHNlbGYuY3JlYXRlKFwic3BhblwiKTtcclxuICAgIGFkZENsYXNzKGwsIFwidWctbWVzc2FnZS1lbGVtZW50XCIpO1xyXG4gICAgc2VsZi5iaW5kRGVjb3JhdG9yRWxlbWVudChmLCBsKTtcclxuICAgIHJldHVybiBsO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogR2V0cyB0aGUgb3B0aW9ucyB0byBkaXNwbGF5IGEgbWVzc2FnZSBvbiB0aGUgZ2l2ZW4gZmllbGQuXHJcbiAgICogXHJcbiAgICogQHBhcmFtIGZcclxuICAgKiBAcmV0dXJucyB7Kn1cclxuICAgKi9cclxuICBnZXRPcHRpb25zKGYsIG9wdGlvbnMpIHtcclxuICAgIHZhciBkZSA9IHRoaXMuZGF0YWVudHJ5LCBcclxuICAgICAgc2NoZW1hID0gZGUgPyBkZS5zY2hlbWEgOiBudWxsLFxyXG4gICAgICBmcyA9IHNjaGVtYSA/IHNjaGVtYVtmLm5hbWVdIDogbnVsbCxcclxuICAgICAgZGVmYXVsdHMgPSB0aGlzLmRlZmF1bHRzLFxyXG4gICAgICBtZXNzYWdlT3B0aW9ucyA9IGZzID8gZnMubWVzc2FnZSA6IFwicmlnaHRcIjtcclxuICAgIGlmIChpc1N0cmluZyhtZXNzYWdlT3B0aW9ucykpXHJcbiAgICAgIG1lc3NhZ2VPcHRpb25zID0geyBwb3NpdGlvbjogbWVzc2FnZU9wdGlvbnMgfTtcclxuICAgIHJldHVybiBleHRlbmQoe30sIGRlZmF1bHRzLCBtZXNzYWdlT3B0aW9ucywgb3B0aW9ucyk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBHZXRzIGFuIGVsZW1lbnQgdGhhdCBjYW4gYmUgc3R5bGVkIGFzIHRvb2x0aXBcclxuICAgKiBcclxuICAgKiBAcGFyYW0gZlxyXG4gICAqIEBwYXJhbSBjcmVhdGVcclxuICAgKiBAcmV0dXJucyB7Kn1cclxuICAgKi9cclxuICBnZXRUb29sdGlwRWxlbWVudChmLCBjcmVhdGUsIG9wdGlvbnMpIHtcclxuICAgIHZhciBkaXZ0YWcgPSBcImRpdlwiLFxyXG4gICAgICBvID0gdGhpcy5nZXRPcHRpb25zKGYsIG9wdGlvbnMpLFxyXG4gICAgICB3cmFwcGVyID0gdGhpcy5jcmVhdGUoZGl2dGFnKSxcclxuICAgICAgdG9vbHRpcCA9IGNyZWF0ZUVsZW1lbnQoZGl2dGFnKSxcclxuICAgICAgYXJyb3cgPSBjcmVhdGVFbGVtZW50KGRpdnRhZyksXHJcbiAgICAgIHAgPSBjcmVhdGVFbGVtZW50KFwicFwiKTtcclxuICAgIGFkZENsYXNzKHdyYXBwZXIsIFwidWctdmFsaWRhdGlvbi13cmFwcGVyXCIpO1xyXG4gICAgYWRkQ2xhc3ModG9vbHRpcCwgXCJ0b29sdGlwIHZhbGlkYXRpb24tdG9vbHRpcCBpbiBcIiArIChvLnBvc2l0aW9uIHx8IFwicmlnaHRcIikpO1xyXG4gICAgYWRkQ2xhc3MoYXJyb3csIFwidG9vbHRpcC1hcnJvd1wiKTtcclxuICAgIGFkZENsYXNzKHAsIFwidG9vbHRpcC1pbm5lclwiKTtcclxuICAgIGFwcGVuZCh3cmFwcGVyLCB0b29sdGlwKTtcclxuICAgIGFwcGVuZCh0b29sdGlwLCBhcnJvdyk7XHJcbiAgICBhcHBlbmQodG9vbHRpcCwgcCk7XHJcbiAgICByZXR1cm4gd3JhcHBlcjtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFNldHMgdGhlIHRleHQgdG8gZGlzcGxheSBpbiB0aGUgbWFya2VyIGVsZW1lbnQuXHJcbiAgICogXHJcbiAgICogQHBhcmFtIG1hcmtlciBlbGVtZW50XHJcbiAgICogQHBhcmFtIG1lc3NhZ2VcclxuICAgKi9cclxuICBzZXRFbGVtZW50VGV4dChlbCwgbWVzc2FnZSkge1xyXG4gICAgdmFyIHRleHRDb250ZW50ID0gXCJ0ZXh0Q29udGVudFwiO1xyXG4gICAgaWYgKHRoaXMubWFya1N0eWxlID09IFwidG9vbHRpcHNcIikge1xyXG4gICAgICBmaW5kRmlyc3QoZWwsIFwiLnRvb2x0aXAtaW5uZXJcIilbdGV4dENvbnRlbnRdID0gbWVzc2FnZTtcclxuICAgICAgcmV0dXJuO1xyXG4gICAgfVxyXG4gICAgZWxbdGV4dENvbnRlbnRdID0gbWVzc2FnZTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFJlbW92ZXMgdGhlIGVsZW1lbnQgdXNlZCB0byBkaXNwbGF5IGluZm9ybWF0aW9uIGZvciB0aGUgZ2l2ZW4gZmllbGQuXHJcbiAgICogXHJcbiAgICogQHBhcmFtIGZcclxuICAgKiBAcmV0dXJucyB7RG9tTWFya2VyfVxyXG4gICAqL1xyXG4gIHJlbW92ZU1lc3NhZ2VFbGVtZW50KGYpIHtcclxuICAgIHZhciBzZWxmID0gdGhpcztcclxuICAgIGYgPSBjaGVja0VsZW1lbnQuY2FsbChzZWxmLCBmKTtcclxuICAgIHZhciBsID0gc2VsZi5nZXRNZXNzYWdlRWxlbWVudChmLCBmYWxzZSk7XHJcbiAgICBpZiAobClcclxuICAgICAgcmVtb3ZlRWxlbWVudChsKTtcclxuICAgIHJldHVybiBzZWxmO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogTWFya3MgdGhlIGZpZWxkIGluIG5ldXRlciBzdGF0ZSAobm8gc3VjY2Vzcy9ubyBlcnJvcilcclxuICAgKiBcclxuICAgKiBAcGFyYW0gZlxyXG4gICAqIEByZXR1cm5zIHtEb21NYXJrZXJ8Kn1cclxuICAgKi9cclxuICBtYXJrRmllbGROZXV0cnVtKGYpIHtcclxuICAgIHZhciBzZWxmID0gdGhpcywgb3B0aW9ucyA9IHNlbGYub3B0aW9ucztcclxuICAgIGYgPSBjaGVja0VsZW1lbnQuY2FsbChzZWxmLCBmKTtcclxuICAgIHJlbW92ZUNsYXNzKGYsIGAke29wdGlvbnMuaW52YWxpZENsYXNzfSAke29wdGlvbnMudmFsaWRDbGFzc31gKTtcclxuICAgIHJldHVybiBzZWxmLnJlbW92ZU1lc3NhZ2VFbGVtZW50KGYpO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogTWFya3MgdGhlIGdpdmVuIGZpZWxkIGluIHZhbGlkIHN0YXRlXHJcbiAgICogXHJcbiAgICogQHBhcmFtIGZcclxuICAgKiBAcmV0dXJucyB7RG9tTWFya2VyfCp9XHJcbiAgICovXHJcbiAgbWFya0ZpZWxkVmFsaWQoZikge1xyXG4gICAgdmFyIHNlbGYgPSB0aGlzLCBvcHRpb25zID0gc2VsZi5vcHRpb25zO1xyXG4gICAgZiA9IGNoZWNrRWxlbWVudC5jYWxsKHNlbGYsIGYpO1xyXG4gICAgYWRkQ2xhc3MocmVtb3ZlQ2xhc3MoZiwgb3B0aW9ucy5pbnZhbGlkQ2xhc3MpLCBvcHRpb25zLnZhbGlkQ2xhc3MpO1xyXG4gICAgcmV0dXJuIHNlbGYucmVtb3ZlTWVzc2FnZUVsZW1lbnQoZik7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBNYXJrcyBhIGZpZWxkIHdpdGggc29tZSBpbmZvcm1hdGlvbi5cclxuICAgKiBcclxuICAgKiBAcGFyYW0geyp9IGYgXHJcbiAgICogQHBhcmFtIHsqfSBvcHRpb25zIFxyXG4gICAqL1xyXG4gIG1hcmtGaWVsZChmLCBvcHRpb25zLCBjc3MpIHtcclxuICAgIHZhciBzZWxmID0gdGhpcztcclxuICAgIGYgPSBjaGVja0VsZW1lbnQuY2FsbChzZWxmLCBmKTtcclxuICAgIHZhciBsID0gc2VsZi5nZXRNZXNzYWdlRWxlbWVudChmLCB0cnVlLCBvcHRpb25zKTtcclxuICAgIHNlbGYuc2V0RWxlbWVudFRleHQoYWRkQ2xhc3MobCwgY3NzKSwgb3B0aW9ucy5tZXNzYWdlKTtcclxuICAgIGFmdGVyKGYsIGwpO1xyXG4gICAgcmV0dXJuIHNlbGY7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBEaXNwbGF5cyBpbmZvcm1hdGlvbiBhYm91dCB0aGUgZ2l2ZW4gZmllbGRcclxuICAgKiBcclxuICAgKiBAcGFyYW0gZlxyXG4gICAqIEBwYXJhbSBvcHRpb25zXHJcbiAgICogQHJldHVybnMge0RvbU1hcmtlcn1cclxuICAgKi9cclxuICBtYXJrRmllbGRJbmZvKGYsIG9wdGlvbnMpIHtcclxuICAgIHZhciBzZWxmID0gdGhpcywgbyA9IHNlbGYub3B0aW9ucztcclxuICAgIGFkZENsYXNzKHJlbW92ZUNsYXNzKGYsIG8uaW52YWxpZENsYXNzKSwgby52YWxpZENsYXNzKTtcclxuICAgIHJldHVybiBzZWxmLm1hcmtGaWVsZChmLCBvcHRpb25zLCBcInVnLWluZm9cIik7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBNYXJrcyB0aGUgZ2l2ZW4gZmllbGQgaW4gaW52YWxpZCBzdGF0ZVxyXG4gICAqIFxyXG4gICAqIEBwYXJhbSBmXHJcbiAgICogQHBhcmFtIG9wdGlvbnNcclxuICAgKiBAcmV0dXJucyB7RG9tTWFya2VyfVxyXG4gICAqL1xyXG4gIG1hcmtGaWVsZEludmFsaWQoZiwgb3B0aW9ucykge1xyXG4gICAgdmFyIHNlbGYgPSB0aGlzLCBvID0gc2VsZi5vcHRpb25zO1xyXG4gICAgYWRkQ2xhc3MocmVtb3ZlQ2xhc3MoZiwgby52YWxpZENsYXNzKSwgby5pbnZhbGlkQ2xhc3MpO1xyXG4gICAgcmV0dXJuIHNlbGYubWFya0ZpZWxkKGYsIG9wdGlvbnMsIFwidWctZXJyb3JcIik7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBNYXJrcyB0aGUgZ2l2ZW4gZmllbGQgYXMgYHRvdWNoZWRgIGJ5IHRoZSB1c2VyXHJcbiAgICogXHJcbiAgICogQHBhcmFtIGZcclxuICAgKiBAcmV0dXJucyB7RG9tTWFya2VyfVxyXG4gICAqL1xyXG4gIG1hcmtGaWVsZFRvdWNoZWQoZikge1xyXG4gICAgZiA9IGNoZWNrRWxlbWVudC5jYWxsKHRoaXMsIGYpO1xyXG4gICAgYWRkQ2xhc3MoZiwgXCJ1Zy10b3VjaGVkXCIpO1xyXG4gICAgcmV0dXJuIHRoaXM7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBSZW1vdmVzIGFsbCB0aGUgbWFya2VyIGVsZW1lbnRzIGNyZWF0ZWQgYnkgdGhpcyBEb21EZWNvcmF0b3IuXHJcbiAgICovXHJcbiAgcmVtb3ZlRWxlbWVudHMoKSB7XHJcbiAgICBlYWNoKHRoaXMuX2VsZW1lbnRzLCBlbGVtZW50ID0+ICQucmVtb3ZlKGVsZW1lbnQpKTtcclxuICAgIHJldHVybiB0aGlzO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogRGlzcG9zZXMgb2YgdGhpcyBkZWNvcmF0b3IuXHJcbiAgICovXHJcbiAgZGlzcG9zZSgpIHtcclxuICAgIHRoaXMuZGF0YWVudHJ5ID0gbnVsbDtcclxuICAgIHRoaXMucmVtb3ZlRWxlbWVudHMoKTtcclxuICAgIHJldHVybiB0aGlzO1xyXG4gIH1cclxufVxyXG5cclxuRG9tRGVjb3JhdG9yLmRlZmF1bHRzID0ge1xyXG4gIHBvc2l0aW9uOiBcInJpZ2h0XCIsXHJcbiAgaW52YWxpZENsYXNzOiBcInVnLWZpZWxkLWludmFsaWRcIixcclxuICB2YWxpZENsYXNzOiBcInVnLWZpZWxkLXZhbGlkXCJcclxufVxyXG5cclxuZXhwb3J0IGRlZmF1bHQgRG9tRGVjb3JhdG9yIiwiLyoqXHJcbiAqIERhdGFFbnRyeSBmb3JtYXR0ZXIgY2xhc3MuXHJcbiAqIGh0dHBzOi8vZ2l0aHViLmNvbS9Sb2JlcnRvUHJldmF0by9EYXRhRW50cnlcclxuICpcclxuICogQ29weXJpZ2h0IDIwMTksIFJvYmVydG8gUHJldmF0b1xyXG4gKiBodHRwczovL3JvYmVydG9wcmV2YXRvLmdpdGh1Yi5pb1xyXG4gKlxyXG4gKiBMaWNlbnNlZCB1bmRlciB0aGUgTUlUIGxpY2Vuc2U6XHJcbiAqIGh0dHA6Ly93d3cub3BlbnNvdXJjZS5vcmcvbGljZW5zZXMvTUlUXHJcbiAqL1xyXG5pbXBvcnQgXyBmcm9tIFwiLi4vLi4vLi4vc2NyaXB0cy91dGlsc1wiXHJcbmltcG9ydCB7IHJhaXNlIH0gZnJvbSBcIi4uLy4uLy4uL3NjcmlwdHMvcmFpc2VcIlxyXG5pbXBvcnQgeyBGb3JtYXR0aW5nUnVsZXMgfSBmcm9tIFwiLi9ydWxlc1wiXHJcblxyXG5cclxuY29uc3QgbGVuID0gXy5sZW47XHJcbmNvbnN0IG1hcCA9IF8ubWFwO1xyXG5jb25zdCB0b0FycmF5ID0gXy50b0FycmF5O1xyXG5jb25zdCB3cmFwID0gXy53cmFwO1xyXG5jb25zdCBlYWNoID0gXy5lYWNoO1xyXG5jb25zdCBpc1N0cmluZyA9IF8uaXNTdHJpbmc7XHJcbmNvbnN0IGlzRnVuY3Rpb24gPSBfLmlzRnVuY3Rpb247XHJcbmNvbnN0IGlzUGxhaW5PYmplY3QgPSBfLmlzUGxhaW5PYmplY3Q7XHJcbmNvbnN0IGV4dGVuZCA9IF8uZXh0ZW5kO1xyXG5cclxuXHJcbmZ1bmN0aW9uIG5vcm1hbGl6ZVJ1bGUoYSwgZXJyb3IpIHtcclxuICBpZiAoaXNTdHJpbmcoYSkpXHJcbiAgICByZXR1cm4geyBuYW1lOiBhIH07XHJcbiAgaWYgKGlzUGxhaW5PYmplY3QoYSkpIHtcclxuICAgIHZhciBuYW1lID0gYS5uYW1lO1xyXG4gICAgaWYgKCFuYW1lKSByYWlzZShlcnJvcik7XHJcbiAgICByZXR1cm4gYTtcclxuICB9XHJcbiAgcmFpc2UoMTQsIG5hbWUpO1xyXG59XHJcblxyXG5cclxuY2xhc3MgRm9ybWF0dGVyIHtcclxuXHJcbiAgLyoqXHJcbiAgICogQ3JlYXRlcyBhIG5ldyBpbnN0YW5jZSBvZiBWYWxpZGF0b3IgYXNzb2NpYXRlZCB3aXRoIHRoZSBnaXZlbiBkYXRhZW50cnkuXHJcbiAgICpcclxuICAgKiBAcGFyYW0gZGF0YWVudHJ5OiBpbnN0YW5jZSBvZiBEYXRhRW50cnkuXHJcbiAgICovXHJcbiAgY29uc3RydWN0b3IoZGF0YWVudHJ5KSB7XHJcbiAgICB2YXIgcnVsZXMgPSBfLmNsb25lKEZvcm1hdHRlci5SdWxlcyksIFxyXG4gICAgICBzZWxmID0gdGhpcyxcclxuICAgICAgb3B0aW9ucyA9IGRhdGFlbnRyeSA/IGRhdGFlbnRyeS5vcHRpb25zIDogbnVsbDtcclxuICAgIGlmIChvcHRpb25zICYmIG9wdGlvbnMuZm9ybWF0UnVsZXMpIHtcclxuICAgICAgZXh0ZW5kKHJ1bGVzLCBvcHRpb25zLmZvcm1hdFJ1bGVzKTtcclxuICAgIH1cclxuICAgIHNlbGYucnVsZXMgPSBydWxlc1xyXG4gICAgcmV0dXJuIHNlbGY7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBEaXNwb3NlcyBvZiB0aGlzIGZvcm1hdHRlci5cclxuICAgKi9cclxuICBkaXNwb3NlKCkge1xyXG4gICAgZGVsZXRlIHRoaXMucnVsZXM7XHJcbiAgICBkZWxldGUgdGhpcy5kYXRhZW50cnk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBBcHBsaWVzIGZvcm1hdHRpbmcgcnVsZXMgb24gdGhlIGdpdmVuIGZpZWxkLlxyXG4gICAqIFxyXG4gICAqIEBwYXJhbSBydWxlc1xyXG4gICAqIEBwYXJhbSBmaWVsZFxyXG4gICAqIEBwYXJhbSB2YWx1ZVxyXG4gICAqIEByZXR1cm5zIHtGb3JtYXR0ZXJ9XHJcbiAgICovXHJcbiAgZm9ybWF0KHJ1bGVzLCBmaWVsZCwgdmFsdWUsIHBhcmFtcykge1xyXG4gICAgdmFyIHNlbGYgPSB0aGlzO1xyXG4gICAgaWYgKGlzU3RyaW5nKHJ1bGVzKSkge1xyXG4gICAgICB2YXIgbmFtZSA9IHJ1bGVzLCBydWxlID0gc2VsZi5ydWxlc1tuYW1lXTtcclxuICAgICAgaWYgKHJ1bGUpXHJcbiAgICAgICAgcmV0dXJuIChydWxlLmZuIHx8IHJ1bGUpLmNhbGwoc2VsZiwgZmllbGQsIHZhbHVlLCBwYXJhbXMpO1xyXG4gICAgICBcclxuICAgICAgcmFpc2UoNCwgbmFtZSk7XHJcbiAgICB9XHJcbiAgICBmb3IgKHZhciBpID0gMCwgbCA9IGxlbihydWxlcyk7IGkgPCBsOyBpKyspIHtcclxuICAgICAgdmFyIGEgPSBub3JtYWxpemVSdWxlKHJ1bGVzW2ldLCAxNik7XHJcbiAgICAgIHZhciBydWxlRGVmaW5pdGlvbiA9IHNlbGYucnVsZXNbYS5uYW1lXTtcclxuXHJcbiAgICAgIGlmICghcnVsZURlZmluaXRpb24pXHJcbiAgICAgICAgcmFpc2UoNCwgbmFtZSk7XHJcblxyXG4gICAgICAvLyBjYWxsIHdpdGggdGhlIHdob2xlIG9iamVjdCB1c2VkIHRvIGNvbmZpZ3VyZSB0aGUgZm9ybWF0dGluZ1xyXG4gICAgICB2YWx1ZSA9IChydWxlRGVmaW5pdGlvbi5mbiB8fCBydWxlRGVmaW5pdGlvbikuY2FsbChzZWxmLCBmaWVsZCwgdmFsdWUsIF8ub21pdChhLCBcIm5hbWVcIikpO1xyXG4gICAgfVxyXG4gICAgcmV0dXJuIHZhbHVlO1xyXG4gIH1cclxufVxyXG5cclxuRm9ybWF0dGVyLlJ1bGVzID0gRm9ybWF0dGluZ1J1bGVzXHJcblxyXG5leHBvcnQgZGVmYXVsdCBGb3JtYXR0ZXIiLCIvKipcclxuICogRGF0YUVudHJ5IGJ1aWx0LWluIGZvcm1hdHRpbmcgcnVsZXMuXHJcbiAqIGh0dHBzOi8vZ2l0aHViLmNvbS9Sb2JlcnRvUHJldmF0by9EYXRhRW50cnlcclxuICpcclxuICogQ29weXJpZ2h0IDIwMTksIFJvYmVydG8gUHJldmF0b1xyXG4gKiBodHRwczovL3JvYmVydG9wcmV2YXRvLmdpdGh1Yi5pb1xyXG4gKlxyXG4gKiBMaWNlbnNlZCB1bmRlciB0aGUgTUlUIGxpY2Vuc2U6XHJcbiAqIGh0dHA6Ly93d3cub3BlbnNvdXJjZS5vcmcvbGljZW5zZXMvTUlUXHJcbiAqL1xyXG5pbXBvcnQgXyBmcm9tIFwiLi4vLi4vdXRpbHNcIlxyXG5cclxuXHJcbmNvbnN0IEZvcm1hdHRpbmdSdWxlcyA9IHtcclxuICB0cmltOiBmdW5jdGlvbiAoZmllbGQsIHZhbHVlKSB7XHJcbiAgICByZXR1cm4gdmFsdWUgPyB2YWx1ZS5yZXBsYWNlKC9eW1xcc10rfFtcXHNdKyQvZywgXCJcIikgOiB2YWx1ZTtcclxuICB9LFxyXG5cclxuICByZW1vdmVTcGFjZXM6IGZ1bmN0aW9uIChmaWVsZCwgdmFsdWUpIHtcclxuICAgIHJldHVybiB2YWx1ZSA/IHZhbHVlLnJlcGxhY2UocngsIFwiXCIpIDogdmFsdWU7XHJcbiAgfSxcclxuXHJcbiAgcmVtb3ZlTXVsdGlwbGVTcGFjZXM6IGZ1bmN0aW9uIChmaWVsZCwgdmFsdWUpIHtcclxuICAgIHJldHVybiB2YWx1ZSA/IHZhbHVlLnJlcGxhY2UoL1xcc3syLH0vZywgXCIgXCIpIDogdmFsdWU7XHJcbiAgfSxcclxuXHJcbiAgY2xlYW5TcGFjZXM6IGZ1bmN0aW9uIChmaWVsZCwgdmFsdWUpIHtcclxuICAgIGlmICghdmFsdWUpIHJldHVybiB2YWx1ZTtcclxuICAgIHJldHVybiB2YWx1ZS5yZXBsYWNlKC9eW1xcc10rfFtcXHNdKyQvZywgXCJcIikucmVwbGFjZSgvXFxzezIsfS9nLCBcIiBcIik7XHJcbiAgfSxcclxuXHJcbiAgaW50ZWdlcjogZnVuY3Rpb24gKGZpZWxkLCB2YWx1ZSkge1xyXG4gICAgaWYgKCF2YWx1ZSkgcmV0dXJuO1xyXG4gICAgLy9yZW1vdmUgbGVhZGluZyB6ZXJvc1xyXG4gICAgcmV0dXJuIHZhbHVlID8gdmFsdWUucmVwbGFjZSgvXjArLywgXCJcIikgOiB2YWx1ZTtcclxuICB9LFxyXG5cclxuICBcInplcm8tZmlsbFwiOiBmdW5jdGlvbiAoZmllbGQsIHZhbHVlLCBvcHRpb25zKSB7XHJcbiAgICBpZiAoIXZhbHVlKSByZXR1cm4gdmFsdWU7XHJcbiAgICB2YXIgbDtcclxuICAgIGlmIChfLmlzRW1wdHkob3B0aW9ucykpIHtcclxuICAgICAgdmFyIG1sID0gZmllbGQuZ2V0QXR0cmlidXRlKFwibWF4bGVuZ3RoXCIpO1xyXG4gICAgICBpZiAoIW1sKSB0aHJvdyBcIm1heGxlbmd0aCBpcyByZXF1aXJlZCBmb3IgdGhlIHplcm8tZmlsbCBmb3JtYXR0ZXJcIjtcclxuICAgICAgbCA9IHBhcnNlSW50KG1sKTtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIGlmICghKFwibGVuZ3RoXCIgaW4gb3B0aW9ucykpIHtcclxuICAgICAgICB0aHJvdyBcIm1pc3NpbmcgbGVuZ3RoIGluIG9wdGlvbnNcIjtcclxuICAgICAgfVxyXG4gICAgICBsID0gb3B0aW9ucy5sZW5ndGg7XHJcbiAgICB9XHJcbiAgICB2YXIgb3JpZ2luYWwgPSB2YWx1ZTtcclxuICAgIHdoaWxlICh2YWx1ZS5sZW5ndGggPCBsKSB7XHJcbiAgICAgIHZhbHVlID0gXCIwXCIgKyB2YWx1ZTtcclxuICAgIH1cclxuICAgIHJldHVybiB2YWx1ZTtcclxuICB9LFxyXG5cclxuICBcInplcm8tdW5maWxsXCI6IGZ1bmN0aW9uIChmaWVsZCwgdmFsdWUpIHtcclxuICAgIGlmICghdmFsdWUpIHJldHVybiB2YWx1ZTtcclxuICAgIGlmICgvXjArLy50ZXN0KHZhbHVlKSlcclxuICAgICAgdmFsdWUgPSB2YWx1ZS5yZXBsYWNlKC9eMCsvLCBcIlwiKTtcclxuICAgIHJldHVybiB2YWx1ZTtcclxuICB9XHJcbn07XHJcblxyXG5leHBvcnQgeyBGb3JtYXR0aW5nUnVsZXMgfSIsIi8qKlxyXG4gKiBIYXJ2ZXN0ZXIgY2xhc3Mgb3BlcmF0aW5nIG9uIEhUTUwgZWxlbWVudHMuXHJcbiAqIGh0dHBzOi8vZ2l0aHViLmNvbS9Sb2JlcnRvUHJldmF0by9EYXRhRW50cnlcclxuICpcclxuICogQ29weXJpZ2h0IDIwMTksIFJvYmVydG8gUHJldmF0b1xyXG4gKiBodHRwczovL3JvYmVydG9wcmV2YXRvLmdpdGh1Yi5pb1xyXG4gKlxyXG4gKiBMaWNlbnNlZCB1bmRlciB0aGUgTUlUIGxpY2Vuc2U6XHJcbiAqIGh0dHA6Ly93d3cub3BlbnNvdXJjZS5vcmcvbGljZW5zZXMvTUlUXHJcbiAqL1xyXG5pbXBvcnQgXyBmcm9tIFwiLi4vLi4vLi4vc2NyaXB0cy91dGlsc1wiXHJcbmltcG9ydCAkIGZyb20gXCIuLi8uLi8uLi9zY3JpcHRzL2RvbVwiXHJcbmltcG9ydCB7IHJhaXNlIH0gZnJvbSBcIi4uLy4uLy4uL3NjcmlwdHMvcmFpc2VcIlxyXG5cclxuY29uc3QgZmlyc3QgPSBfLmZpcnN0O1xyXG5jb25zdCBlYWNoID0gXy5lYWNoO1xyXG5jb25zdCBhbnkgPSBfLmFueTtcclxuY29uc3QgbGVuID0gXy5sZW47XHJcbmNvbnN0IGlzUmFkaW9CdXR0b24gPSAkLmlzUmFkaW9CdXR0b247XHJcbmNvbnN0IGlzQ2hlY2tib3ggPSAkLmlzQ2hlY2tib3g7XHJcbmNvbnN0IGdldFZhbHVlID0gJC5nZXRWYWx1ZTtcclxuXHJcblxyXG5jbGFzcyBEb21IYXJ2ZXN0ZXIge1xyXG4gIC8qKlxyXG4gICAqIENyZWF0ZXMgYSBuZXcgaW5zdGFuY2Ugb2YgRG9tSGFydmVzdGVyIGFzc29jaWF0ZWQgd2l0aCB0aGUgZ2l2ZW4gZGF0YWVudHJ5LlxyXG4gICAqXHJcbiAgICogQHBhcmFtIGRhdGFlbnRyeTogaW5zdGFuY2Ugb2YgRGF0YUVudHJ5LlxyXG4gICAqL1xyXG4gIGNvbnN0cnVjdG9yKGRhdGFlbnRyeSkge1xyXG4gICAgaWYgKCFkYXRhZW50cnkpXHJcbiAgICAgIHJhaXNlKDIsIFwibWlzc2luZyAnZGF0YWVudHJ5JyBmb3IgRG9tSGFydmVzdGVyXCIpO1xyXG5cclxuICAgIHZhciBlbGVtZW50ID0gZGF0YWVudHJ5LmVsZW1lbnQ7XHJcbiAgICBpZiAoIWVsZW1lbnQpXHJcbiAgICAgIC8vIHJlcXVpcmVzIGEgY29uZmlndXJlZCBlbGVtZW50IGZvciB0aGUgZGF0YWVudHJ5XHJcbiAgICAgIHJhaXNlKDgsIFwibWlzc2luZyAnZWxlbWVudCcgaW4gZGF0YWVudHJ5LiBTcGVjaWZ5IGFuIEhUTUwgZWxlbWVudCBmb3IgdGhlIGRhdGFlbnRyeSwgaW4gb3JkZXIgdG8gdXNlIHRoZSBEb21IYXJ2ZXN0ZXJcIik7XHJcblxyXG4gICAgdGhpcy5kYXRhZW50cnkgPSBkYXRhZW50cnk7XHJcbiAgICB0aGlzLmVsZW1lbnQgPSBlbGVtZW50O1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogU2V0cyB0aGUgdmFsdWVzIHVzaW5nIHRoZSBnaXZlbiBvYmplY3QuXHJcbiAgICogXHJcbiAgICogQHBhcmFtIHtvYmplY3R9IGNvbnRleHQgXHJcbiAgICovXHJcbiAgc2V0VmFsdWVzKGNvbnRleHQpIHtcclxuICAgIGZvciAobGV0IHggaW4gY29udGV4dCkge1xyXG4gICAgICB0aGlzLnNldFZhbHVlKHgsIGNvbnRleHRbeF0pO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogUmV0dXJucyB0aGUgZmllbGRzIGJ5IG5hbWUuXHJcbiAgICogXHJcbiAgICogQHBhcmFtIHsqfSBuYW1lIFxyXG4gICAqL1xyXG4gIGdldEZpZWxkcyhuYW1lKSB7XHJcbiAgICByZXR1cm4gJC5maW5kKHRoaXMuZWxlbWVudCwgJC5uYW1lU2VsZWN0b3IobmFtZSkpXHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBHZXQgYWxsIHZhbHVlcyBmb3IgdGhlIHVuZGVybHlpbmcgZGF0YWVudHJ5LCBkZXBlbmRpbmcgb24gaXRzIHNjaGVtYSBhbmQgRE9NIGVsZW1lbnQuXHJcbiAgICovXHJcbiAgZ2V0VmFsdWVzKCkge1xyXG4gICAgcmV0dXJuIHRoaXMuZ2V0VmFsdWVzRnJvbUVsZW1lbnQodGhpcy5lbGVtZW50KTtcclxuICB9XHJcblxyXG4gIGdldEVsZW1lbnRzKG5hbWUpIHtcclxuICAgIHJldHVybiAkLmZpbmQodGhpcy5lbGVtZW50LCAkLm5hbWVTZWxlY3RvcihuYW1lKSk7XHJcbiAgfVxyXG5cclxuICBzZXRWYWx1ZShmaWVsZCwgdmFsdWUpIHtcclxuICAgIGlmIChfLmlzU3RyaW5nKGZpZWxkKSkge1xyXG4gICAgICBmaWVsZCA9IHRoaXMuZ2V0RWxlbWVudHMoZmllbGQpOyAvLyBtdWx0aXBsZSBlbGVtZW50cyBtYXkgYmUgcmV0dXJuZWRcclxuICAgICAgaWYgKGZpZWxkLmxlbmd0aCA9PSAxKSB7XHJcbiAgICAgICAgZmllbGQgPSBmaWVsZFswXTtcclxuICAgICAgfVxyXG4gICAgfVxyXG4gICAgcmV0dXJuICQuc2V0VmFsdWUoZmllbGQsIHZhbHVlKTtcclxuICB9XHJcblxyXG4gIGdldFZhbHVlKGZpZWxkKSB7XHJcbiAgICBpZiAoIWZpZWxkKSByYWlzZSgxMik7XHJcbiAgICAvLyBoYW5kbGUgZ3JvdXBzIG9mIHJhZGlvIG9yIGNoZWNrYm94ZXMsIHRvb1xyXG4gICAgaWYgKF8uaXNTdHJpbmcoZmllbGQpIHx8IGlzUmFkaW9CdXR0b24oZmllbGQpIHx8IHRoaXMuaXNDaGVja2JveEluR3JvdXAoZmllbGQpKVxyXG4gICAgICByZXR1cm4gdGhpcy5nZXRWYWx1ZUZyb21FbGVtZW50cyh0aGlzLmdldEVsZW1lbnRzKGZpZWxkKSk7XHJcblxyXG4gICAgcmV0dXJuIGdldFZhbHVlKGZpZWxkKTtcclxuICB9XHJcblxyXG4gIGlzQ2hlY2tib3hJbkdyb3VwKGVsKSB7XHJcbiAgICByZXR1cm4gaXNDaGVja2JveChlbCkgJiYgbGVuKCQuZmluZCh0aGlzLmVsZW1lbnQsICQubmFtZVNlbGVjdG9yKGVsKSkpID4gMTtcclxuICB9XHJcblxyXG4gIGdldEtleXMoKSB7XHJcbiAgICB2YXIgc2NoZW1hID0gdGhpcy5kYXRhZW50cnkuc2NoZW1hO1xyXG4gICAgcmV0dXJuIF8ua2V5cyhzY2hlbWEpO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogR2V0cyBhbGwgdGhlIHZhbHVlcyBmcm9tIGFsbCBpbnB1dCB3aXRoIGEgc3BlY2lmaWVkIG5hbWUsIGluIGZvcm0gb2Yga2V5LXZhbHVlIHBhaXIgZGljdGlvbmFyeS5cclxuICAgKiBFbGVtZW50cyB3aXRoIGNsYXNzICd1Zy1zaWxlbnQnIGFyZSBkaXNjYXJkZWQuXHJcbiAgICogQHBhcmFtIGVsIEhUTUwgZWxlbWVudFxyXG4gICAqIEByZXR1cm5zIHtvYmplY3R9XHJcbiAgICovXHJcbiAgZ2V0VmFsdWVzRnJvbUVsZW1lbnQoZWxlbWVudCkge1xyXG4gICAgdmFyIHNlbGYgPSB0aGlzLFxyXG4gICAgICBlbGVtZW50ID0gc2VsZi5lbGVtZW50LFxyXG4gICAgICBrZXlzID0gc2VsZi5nZXRLZXlzKCksXHJcbiAgICAgIHZhbHVlcyA9IHt9O1xyXG5cclxuICAgIC8vIHRoZSBzY2hlbWEgaGFzIHByb3BlcnRpZXMgdGhhdCBzaG91bGQgbWF0Y2ggYG5hbWVgIGF0dHJpYnV0ZXMgb2YgaW5wdXQgZWxlbWVudHMgKGxpa2UgaW4gY2xhc3NpYyBIVE1MKVxyXG4gICAgZWFjaChrZXlzLCBrZXkgPT4ge1xyXG4gICAgICAvLyBnZXQgZWxlbWVudHMgYnkgbWF0Y2hpbmcgbmFtZSBhdHRyaWJ1dGVcclxuICAgICAgdmFyIGVsZW1lbnRzV2l0aE1hdGNoaW5nTmFtZSA9ICQuZmluZChlbGVtZW50LCAkLm5hbWVTZWxlY3RvcihrZXkpKSxcclxuICAgICAgICBrID0gXy5sZW4oZWxlbWVudHNXaXRoTWF0Y2hpbmdOYW1lKTtcclxuXHJcbiAgICAgIGlmIChrKSB7XHJcbiAgICAgICAgdmFsdWVzW2tleV0gPSBzZWxmLmdldFZhbHVlRnJvbUVsZW1lbnRzKGVsZW1lbnRzV2l0aE1hdGNoaW5nTmFtZSk7XHJcbiAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgdmFsdWVzW2tleV0gPSB1bmRlZmluZWQ7XHJcbiAgICAgIH1cclxuICAgIH0pXHJcblxyXG4gICAgcmV0dXJuIHZhbHVlcztcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFJldHVybnMgYSBzaW5nbGUgdmFsdWUgZnJvbSBhIGxpc3Qgb2YgZWxlbWVudHMuXHJcbiAgICogXHJcbiAgICogQHBhcmFtIHtOb2RlTGlzdH0gZWxlbWVudHMgXHJcbiAgICovXHJcbiAgZ2V0VmFsdWVGcm9tRWxlbWVudHMoZWxlbWVudHMpIHtcclxuICAgIHZhciBjb3VudCA9IGxlbihlbGVtZW50cyk7XHJcbiAgICBpZiAoY291bnQgPiAxKSB7XHJcbiAgICAgIC8vIG11bHRpcGxlIGVsZW1lbnRzXHJcblxyXG4gICAgICAvLyBoYW5kbGUgZ3JvdXAgb2YgcmFkaW8gYnV0dG9uczpcclxuICAgICAgaWYgKGlzUmFkaW9CdXR0b24oZWxlbWVudHNbMF0pKSB7XHJcbiAgICAgICAgLy8gdGhyb3cgZXhjZXB0aW9uIGlmIGFueSBlbGVtZW50IGlzIG5vdCBhIHJhZGlvIGJ1dHRvbjpcclxuICAgICAgICBpZiAoYW55KGVsZW1lbnRzLCBlbCA9PiB7XHJcbiAgICAgICAgICByZXR1cm4gIWlzUmFkaW9CdXR0b24oZWwpO1xyXG4gICAgICAgIH0pKSByYWlzZSgxOSwgYERPTSBjb250YWlucyBpbnB1dCBlbGVtZW50cyB3aXRoIG5hbWUgXCIkeyQuYXR0ck5hbWUoZWxlbWVudHNbMF0pfVwiIGFuZCBkaWZmZXJlbnQgdHlwZWApO1xyXG5cclxuICAgICAgICB2YXIgY2hlY2tlZCA9IGZpcnN0KGVsZW1lbnRzLCBvID0+IHtcclxuICAgICAgICAgIHJldHVybiBvLmNoZWNrZWQ7XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgcmV0dXJuIGNoZWNrZWQgPyBjaGVja2VkLnZhbHVlIDogdW5kZWZpbmVkO1xyXG4gICAgICB9XHJcblxyXG4gICAgICAvLyBoYW5kbGUgZ3JvdXBzIG9mIGNoZWNrYm94ZXNcclxuICAgICAgaWYgKGlzQ2hlY2tib3goZWxlbWVudHNbMF0pKSB7XHJcbiAgICAgICAgdmFyIHYgPSBbXTtcclxuICAgICAgICBlYWNoKGVsZW1lbnRzLCBvID0+IHtcclxuICAgICAgICAgIC8vIHRocm93IGV4Y2VwdGlvbiBpZiBhbnkgZWxlbWVudCBpcyBub3QgYSByYWRpbyBidXR0b246XHJcbiAgICAgICAgICBpZiAoIWlzQ2hlY2tib3gobykpXHJcbiAgICAgICAgICAgIHJhaXNlKDE5LCBgRE9NIGNvbnRhaW5zIGlucHV0IGVsZW1lbnRzIHdpdGggbmFtZSBcIiR7JC5hdHRyTmFtZShlbGVtZW50c1swXSl9XCIgYW5kIGRpZmZlcmVudCB0eXBlYCk7XHJcblxyXG4gICAgICAgICAgaWYgKG8uY2hlY2tlZCkge1xyXG4gICAgICAgICAgICB2LnB1c2goJC5hdHRyKG8sIFwidmFsdWVcIikpO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIHJldHVybiB2O1xyXG4gICAgICB9XHJcblxyXG4gICAgICAvLyBoYW5kbGUgb3RoZXIga2luZHMgb2YgZWxlbWVudHM7XHJcbiAgICAgIHZhciB2ID0gW107XHJcbiAgICAgIGVhY2goZWxlbWVudHMsIG8gPT4ge1xyXG4gICAgICAgIHZhciBlbGVtZW50VmFsdWUgPSBnZXRWYWx1ZShvKTtcclxuXHJcbiAgICAgICAgLy8gYWRkIHRoZSB2YWx1ZSBvbmx5IGlmIG5vdCBlbXB0eVxyXG4gICAgICAgIGlmICghXy5uaWxPckVtcHR5KGVsZW1lbnRWYWx1ZSkpXHJcbiAgICAgICAgICB2LnB1c2goZWxlbWVudFZhbHVlKTtcclxuICAgICAgfSk7XHJcbiAgICAgIHJldHVybiB2O1xyXG4gICAgfVxyXG4gICAgcmV0dXJuIGNvdW50ID8gZ2V0VmFsdWUoZWxlbWVudHNbMF0pIDogdW5kZWZpbmVkO1xyXG4gIH1cclxuXHJcbiAgZGlzcG9zZSgpIHtcclxuICAgIHRoaXMuZGF0YWVudHJ5ID0gbnVsbDtcclxuICAgIHRoaXMuZWxlbWVudCA9IG51bGw7XHJcbiAgICByZXR1cm4gdGhpcztcclxuICB9XHJcbn1cclxuXHJcbmV4cG9ydCBkZWZhdWx0IERvbUhhcnZlc3RlcjsiLCIvKipcclxuICogRGF0YUVudHJ5IGJhc2UgdmFsaWRhdGlvbiBydWxlcy5cclxuICogaHR0cHM6Ly9naXRodWIuY29tL1JvYmVydG9QcmV2YXRvL0RhdGFFbnRyeVxyXG4gKlxyXG4gKiBDb3B5cmlnaHQgMjAxOSwgUm9iZXJ0byBQcmV2YXRvXHJcbiAqIGh0dHBzOi8vcm9iZXJ0b3ByZXZhdG8uZ2l0aHViLmlvXHJcbiAqXHJcbiAqIExpY2Vuc2VkIHVuZGVyIHRoZSBNSVQgbGljZW5zZTpcclxuICogaHR0cDovL3d3dy5vcGVuc291cmNlLm9yZy9saWNlbnNlcy9NSVRcclxuICovXHJcbmltcG9ydCBfIGZyb20gXCIuLi8uLi91dGlsc1wiXHJcblxyXG5jb25zdCBsZW4gPSBfLmxlbjtcclxuY29uc3QgaXNQbGFpbk9iamVjdCA9IF8uaXNQbGFpbk9iamVjdDtcclxuY29uc3QgaXNTdHJpbmcgPSBfLmlzU3RyaW5nO1xyXG5jb25zdCBpc051bWJlciA9IF8uaXNOdW1iZXI7XHJcbmNvbnN0IGlzQXJyYXkgPSBfLmlzQXJyYXk7XHJcbmNvbnN0IGlzRW1wdHkgPSBfLmlzRW1wdHk7XHJcblxyXG5cclxuZnVuY3Rpb24gZ2V0RXJyb3IobWVzc2FnZSwgYXJncykge1xyXG4gIHJldHVybiB7XHJcbiAgICBlcnJvcjogdHJ1ZSxcclxuICAgIG1lc3NhZ2U6IG1lc3NhZ2UsXHJcbiAgICBmaWVsZDogYXJnc1swXSxcclxuICAgIHZhbHVlOiBhcmdzWzFdLFxyXG4gICAgcGFyYW1zOiBfLnRvQXJyYXkoYXJncykuc3BsaWNlKDIpXHJcbiAgfTtcclxufVxyXG5cclxuXHJcbmNvbnN0IFZhbGlkYXRpb25SdWxlcyA9IHtcclxuXHJcbiAgbm9uZTogZnVuY3Rpb24gKCkge1xyXG4gICAgcmV0dXJuIHRydWU7XHJcbiAgfSxcclxuXHJcbiAgbm90OiBmdW5jdGlvbiAoZmllbGQsIHZhbHVlLCBmb3JjZWQsIHBhcmFtcykge1xyXG4gICAgdmFyIGV4Y2x1ZGUgPSBwYXJhbXM7XHJcbiAgICBpZiAoXy5pc0FycmF5KGV4Y2x1ZGUpKSB7XHJcbiAgICAgIGlmIChfLmFueShleGNsdWRlLCB4ID0+IHggPT09IHZhbHVlKSkge1xyXG4gICAgICAgIHJldHVybiBnZXRFcnJvcihcImNhbm5vdEJlXCIsIGFyZ3VtZW50cyk7XHJcbiAgICAgIH1cclxuICAgIH1cclxuICAgIGlmICh2YWx1ZSA9PT0gcGFyYW1zKSB7XHJcbiAgICAgIHJldHVybiBnZXRFcnJvcihcImNhbm5vdEJlXCIsIGFyZ3VtZW50cyk7XHJcbiAgICB9XHJcbiAgICByZXR1cm4gdHJ1ZTtcclxuICB9LFxyXG5cclxuICBub1NwYWNlczogZnVuY3Rpb24gKGZpZWxkLCB2YWx1ZSwgZm9yY2VkKSB7XHJcbiAgICBpZiAoIXZhbHVlKSByZXR1cm4gdHJ1ZTtcclxuICAgIGlmICh2YWx1ZS5tYXRjaCgvXFxzLykpIFxyXG4gICAgICByZXR1cm4gZ2V0RXJyb3IoXCJzcGFjZXNJblZhbHVlXCIsIGFyZ3VtZW50cyk7XHJcbiAgICByZXR1cm4gdHJ1ZTtcclxuICB9LFxyXG5cclxuICByZW1vdGU6IHtcclxuICAgIGRlZmVycmVkOiB0cnVlLFxyXG4gICAgZm46IGZ1bmN0aW9uIChmaWVsZCwgdmFsdWUsIGZvcmNlZCwgcHJvbWlzZVByb3ZpZGVyKSB7XHJcbiAgICAgIGlmICghcHJvbWlzZVByb3ZpZGVyKVxyXG4gICAgICAgIHJhaXNlKDcpO1xyXG4gICAgICByZXR1cm4gcHJvbWlzZVByb3ZpZGVyLmFwcGx5KGZpZWxkLCBhcmd1bWVudHMpO1xyXG4gICAgfVxyXG4gIH0sXHJcblxyXG4gIHJlcXVpcmVkOiBmdW5jdGlvbiAoZmllbGQsIHZhbHVlLCBmb3JjZWQsIHBhcmFtcykge1xyXG4gICAgaWYgKGlzU3RyaW5nKHBhcmFtcykpXHJcbiAgICAgIHBhcmFtcyA9IHsgbWVzc2FnZTogcGFyYW1zIH07XHJcbiAgICBcclxuICAgIGlmICghdmFsdWUgfHwgKGlzQXJyYXkodmFsdWUpICYmIGlzRW1wdHkodmFsdWUpKSB8fCAhIXZhbHVlLnRvU3RyaW5nKCkubWF0Y2goL15cXHMrJC8pKVxyXG4gICAgICByZXR1cm4gZ2V0RXJyb3IoXCJyZXF1aXJlZFwiLCBhcmd1bWVudHMpO1xyXG4gICAgcmV0dXJuIHRydWU7XHJcbiAgfSxcclxuXHJcbiAgaW50ZWdlcjogZnVuY3Rpb24gKGZpZWxkLCB2YWx1ZSwgZm9yY2VkLCBvcHRpb25zKSB7XHJcbiAgICBpZiAoIXZhbHVlKSByZXR1cm4gdHJ1ZTtcclxuICAgIGlmICghL15cXGQrJC8udGVzdCh2YWx1ZSkpXHJcbiAgICAgIHJldHVybiBnZXRFcnJvcihcIm5vdEludGVnZXJcIiwgYXJndW1lbnRzKTtcclxuICAgIGlmIChvcHRpb25zKSB7XHJcbiAgICAgIHZhciBpbnRWYWwgPSBwYXJzZUludCh2YWx1ZSk7XHJcbiAgICAgIGlmIChpc051bWJlcihvcHRpb25zLm1pbikgJiYgaW50VmFsIDwgb3B0aW9ucy5taW4pXHJcbiAgICAgICAgcmV0dXJuIGdldEVycm9yKFwibWluVmFsdWVcIiwgYXJndW1lbnRzKTtcclxuICAgICAgaWYgKGlzTnVtYmVyKG9wdGlvbnMubWF4KSAmJiBpbnRWYWwgPiBvcHRpb25zLm1heClcclxuICAgICAgICByZXR1cm4gZ2V0RXJyb3IoXCJtYXhWYWx1ZVwiLCBhcmd1bWVudHMpO1xyXG4gICAgfVxyXG4gICAgcmV0dXJuIHRydWU7XHJcbiAgfSxcclxuXHJcbiAgZXF1YWw6IGZ1bmN0aW9uIChmaWVsZCwgdmFsdWUsIGZvcmNlZCwgZXhwZWN0ZWRWYWx1ZSkge1xyXG4gICAgaWYgKHZhbHVlICE9PSBleHBlY3RlZFZhbHVlKSB7XHJcbiAgICAgIHJldHVybiBnZXRFcnJvcihcImV4cGVjdGVkVmFsdWVcIiwgYXJndW1lbnRzKTtcclxuICAgIH1cclxuICAgIHJldHVybiB0cnVlO1xyXG4gIH0sXHJcblxyXG4gIGxldHRlcnM6IGZ1bmN0aW9uIChmaWVsZCwgdmFsdWUsIGZvcmNlZCkge1xyXG4gICAgaWYgKCF2YWx1ZSkgcmV0dXJuIHRydWU7XHJcbiAgICBpZiAoIS9eW2EtekEtWl0rJC8udGVzdCh2YWx1ZSkpXHJcbiAgICAgIHJldHVybiBnZXRFcnJvcihcImNhbkNvbnRhaW5Pbmx5TGV0dGVyc1wiLCBhcmd1bWVudHMpO1xyXG4gICAgcmV0dXJuIHRydWU7XHJcbiAgfSxcclxuXHJcbiAgZGlnaXRzOiBmdW5jdGlvbiAoZmllbGQsIHZhbHVlLCBmb3JjZWQpIHtcclxuICAgIGlmICghdmFsdWUpIHJldHVybiB0cnVlO1xyXG4gICAgaWYgKCEvXlxcZCskLy50ZXN0KHZhbHVlKSlcclxuICAgICAgcmV0dXJuIGdldEVycm9yKFwiY2FuQ29udGFpbk9ubHlEaWdpdHNcIiwgYXJndW1lbnRzKTtcclxuICAgIHJldHVybiB0cnVlO1xyXG4gIH0sXHJcblxyXG4gIG1heExlbmd0aDogZnVuY3Rpb24gKGZpZWxkLCB2YWx1ZSwgZm9yY2VkLCBsaW1pdCkge1xyXG4gICAgaWYgKCF2YWx1ZSkgcmV0dXJuIHRydWU7XHJcblxyXG4gICAgaWYgKGlzUGxhaW5PYmplY3QobGltaXQpKSB7XHJcbiAgICAgIGxpbWl0ID0gbGltaXQubGVuZ3RoO1xyXG4gICAgfVxyXG4gICAgaWYgKCFpc051bWJlcihsaW1pdCkpXHJcbiAgICAgIHRocm93IFwibWF4TGVuZ3RoIHJ1bGUgcmVxdWlyZXMgYSBudW1lcmljIGxpbWl0ICh1c2UgbGVuZ3RoIG9wdGlvbiwgb3IgcGFyYW1zOiBbbnVtXVwiO1xyXG5cclxuICAgIGlmIChsZW4odmFsdWUpID4gbGltaXQpXHJcbiAgICAgIHJldHVybiBnZXRFcnJvcihcIm1heExlbmd0aFwiLCBhcmd1bWVudHMpO1xyXG4gICAgcmV0dXJuIHRydWU7XHJcbiAgfSxcclxuXHJcbiAgbWluTGVuZ3RoOiBmdW5jdGlvbiAoZmllbGQsIHZhbHVlLCBmb3JjZWQsIGxpbWl0KSB7XHJcbiAgICBpZiAoIXZhbHVlKSByZXR1cm4gZmFsc2U7XHJcblxyXG4gICAgaWYgKGlzUGxhaW5PYmplY3QobGltaXQpKSB7XHJcbiAgICAgIGxpbWl0ID0gbGltaXQubGVuZ3RoO1xyXG4gICAgfVxyXG4gICAgaWYgKCFpc051bWJlcihsaW1pdCkpXHJcbiAgICAgIHRocm93IFwibWluTGVuZ3RoIHJ1bGUgcmVxdWlyZXMgYSBudW1lcmljIGxpbWl0ICh1c2UgbGVuZ3RoIG9wdGlvbiwgb3IgcGFyYW1zOiBbbnVtXVwiO1xyXG4gICAgXHJcbiAgICBpZiAobGVuKHZhbHVlKSA8IGxpbWl0KVxyXG4gICAgICByZXR1cm4gZ2V0RXJyb3IoXCJtaW5MZW5ndGhcIiwgYXJndW1lbnRzKTtcclxuICAgIHJldHVybiB0cnVlO1xyXG4gIH0sXHJcblxyXG4gIG11c3RDaGVjazogZnVuY3Rpb24gKGZpZWxkLCB2YWx1ZSwgZm9yY2VkLCBsaW1pdCkge1xyXG4gICAgaWYgKCFmaWVsZC5jaGVja2VkKVxyXG4gICAgICByZXR1cm4gZ2V0RXJyb3IoXCJtdXN0QmVDaGVja2VkXCIsIGFyZ3VtZW50cyk7XHJcbiAgICByZXR1cm4gdHJ1ZTtcclxuICB9XHJcbn07XHJcblxyXG5leHBvcnQgeyBWYWxpZGF0aW9uUnVsZXMsIGdldEVycm9yIH0iLCIvKipcclxuICogRGF0YUVudHJ5IHZhbGlkYXRvciBjbGFzcy5cclxuICogaHR0cHM6Ly9naXRodWIuY29tL1JvYmVydG9QcmV2YXRvL0RhdGFFbnRyeVxyXG4gKlxyXG4gKiBDb3B5cmlnaHQgMjAxOSwgUm9iZXJ0byBQcmV2YXRvXHJcbiAqIGh0dHBzOi8vcm9iZXJ0b3ByZXZhdG8uZ2l0aHViLmlvXHJcbiAqXHJcbiAqIExpY2Vuc2VkIHVuZGVyIHRoZSBNSVQgbGljZW5zZTpcclxuICogaHR0cDovL3d3dy5vcGVuc291cmNlLm9yZy9saWNlbnNlcy9NSVRcclxuICovXHJcblxyXG5pbXBvcnQgXyBmcm9tIFwiLi4vLi4vLi4vc2NyaXB0cy91dGlsc1wiXHJcbmltcG9ydCB7IHJhaXNlIH0gZnJvbSBcIi4uLy4uLy4uL3NjcmlwdHMvcmFpc2VcIlxyXG5pbXBvcnQgeyBWYWxpZGF0aW9uUnVsZXMsIGdldEVycm9yIH0gZnJvbSBcIi4vcnVsZXNcIlxyXG5cclxuXHJcbmNvbnN0IGxlbiA9IF8ubGVuO1xyXG5jb25zdCBtYXAgPSBfLm1hcDtcclxuY29uc3QgdG9BcnJheSA9IF8udG9BcnJheTtcclxuY29uc3Qgd3JhcCA9IF8ud3JhcDtcclxuY29uc3QgZWFjaCA9IF8uZWFjaDtcclxuY29uc3QgaXNTdHJpbmcgPSBfLmlzU3RyaW5nO1xyXG5jb25zdCBpc0Z1bmN0aW9uID0gXy5pc0Z1bmN0aW9uO1xyXG5jb25zdCBpc1BsYWluT2JqZWN0ID0gXy5pc1BsYWluT2JqZWN0O1xyXG5jb25zdCBleHRlbmQgPSBfLmV4dGVuZDtcclxuY29uc3QgZmFpbGVkVmFsaWRhdGlvbkVycm9yS2V5ID0gXCJmYWlsZWRWYWxpZGF0aW9uXCI7XHJcblxyXG5cclxuZnVuY3Rpb24gcnVsZVBhcmFtcyhhcmdzLCBjdXJyZW50RmllbGRSdWxlKSB7XHJcbiAgaWYgKCFjdXJyZW50RmllbGRSdWxlLnBhcmFtcykge1xyXG4gICAgdmFyIGV4dHJhUGFyYW1zID0gXy5vbWl0KGN1cnJlbnRGaWVsZFJ1bGUsIFtcImZuXCIsIFwibmFtZVwiXSk7XHJcbiAgICByZXR1cm4gYXJncy5jb25jYXQoW2V4dHJhUGFyYW1zXSk7XHJcbiAgfVxyXG4gIHJldHVybiBhcmdzLmNvbmNhdChjdXJyZW50RmllbGRSdWxlLnBhcmFtcyk7XHJcbn1cclxuXHJcblxyXG5jbGFzcyBWYWxpZGF0b3Ige1xyXG5cclxuICAvKipcclxuICAgKiBDcmVhdGVzIGEgbmV3IGluc3RhbmNlIG9mIFZhbGlkYXRvciBhc3NvY2lhdGVkIHdpdGggdGhlIGdpdmVuIGRhdGFlbnRyeS5cclxuICAgKlxyXG4gICAqIEBwYXJhbSBkYXRhZW50cnk6IGluc3RhbmNlIG9mIERhdGFFbnRyeS5cclxuICAgKi9cclxuICBjb25zdHJ1Y3RvcihkYXRhZW50cnkpIHtcclxuICAgIHZhciBydWxlcyA9IF8uY2xvbmUoVmFsaWRhdG9yLlJ1bGVzKSwgXHJcbiAgICAgIHNlbGYgPSB0aGlzLFxyXG4gICAgICBvcHRpb25zID0gZGF0YWVudHJ5ID8gZGF0YWVudHJ5Lm9wdGlvbnMgOiBudWxsO1xyXG4gICAgaWYgKG9wdGlvbnMgJiYgb3B0aW9ucy5ydWxlcykge1xyXG4gICAgICBleHRlbmQocnVsZXMsIG9wdGlvbnMucnVsZXMpO1xyXG4gICAgfVxyXG4gICAgc2VsZi5nZXRFcnJvciA9IGdldEVycm9yO1xyXG4gICAgc2VsZi5ydWxlcyA9IHJ1bGVzXHJcbiAgICBzZWxmLmRhdGFlbnRyeSA9IGRhdGFlbnRyeSB8fCB7fTtcclxuICAgIHJldHVybiBzZWxmO1xyXG4gIH1cclxuXHJcbiAgZGlzcG9zZSgpIHtcclxuICAgIGRlbGV0ZSB0aGlzLnJ1bGVzO1xyXG4gICAgZGVsZXRlIHRoaXMuZGF0YWVudHJ5O1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogRW5zdXJlcyB0aGF0IGEgdmFsaWRhdGlvbiBydWxlIGlzIGRlZmluZWQgaW5zaWRlIHRoaXMgdmFsaWRhdG9yLlxyXG4gICAqIFxyXG4gICAqIEBwYXJhbSBuYW1lXHJcbiAgICovXHJcbiAgY2hlY2tSdWxlKG5hbWUpIHtcclxuICAgIGlmICghdGhpcy5ydWxlc1tuYW1lXSkge1xyXG4gICAgICByYWlzZSgzLCBcIm1pc3NpbmcgdmFsaWRhdGlvbiBydWxlOiBcIiArIG5hbWUpO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgbm9ybWFsaXplUnVsZSh2KSB7XHJcbiAgICBpZiAoaXNQbGFpbk9iamVjdCh2KSkge1xyXG4gICAgICByZXR1cm4gdjtcclxuICAgIH1cclxuXHJcbiAgICBpZiAoaXNGdW5jdGlvbih2KSkge1xyXG4gICAgICByZXR1cm4geyBmbjogdiB9O1xyXG4gICAgfVxyXG4gICAgcmFpc2UoMTQsIFwiaW52YWxpZCB2YWxpZGF0aW9uIHJ1bGUgZGVmaW5pdGlvblwiKVxyXG4gIH1cclxuXHJcbiAgZ2V0UnVsZShvKSB7XHJcbiAgICB2YXIgc2VsZiA9IHRoaXMsXHJcbiAgICAgIGRlZmF1bHRzID0ge30sXHJcbiAgICAgIHJ1bGVzID0gc2VsZi5ydWxlcztcclxuICAgIFxyXG4gICAgaWYgKGlzU3RyaW5nKG8pKSB7XHJcbiAgICAgIHNlbGYuY2hlY2tSdWxlKG8pO1xyXG4gICAgICByZXR1cm4gZXh0ZW5kKHsgbmFtZTogbyB9LCBkZWZhdWx0cywgc2VsZi5ub3JtYWxpemVSdWxlKHJ1bGVzW29dKSk7XHJcbiAgICB9XHJcblxyXG4gICAgaWYgKGlzUGxhaW5PYmplY3QobykpIHtcclxuICAgICAgaWYgKCFvLm5hbWUpXHJcbiAgICAgICAgcmFpc2UoNiwgXCJtaXNzaW5nIG5hbWUgaW4gdmFsaWRhdGlvbiBydWxlXCIpO1xyXG4gICAgICBzZWxmLmNoZWNrUnVsZShvLm5hbWUpO1xyXG4gICAgICByZXR1cm4gZXh0ZW5kKHt9LCBkZWZhdWx0cywgbywgc2VsZi5ub3JtYWxpemVSdWxlKHJ1bGVzW28ubmFtZV0pKTtcclxuICAgIH1cclxuXHJcbiAgICByYWlzZSgxNCwgXCJpbnZhbGlkIHZhbGlkYXRpb24gcnVsZVwiKTtcclxuICB9XHJcblxyXG4gIGdldFJ1bGVzKGEpIHtcclxuICAgIC8vZ2V0IHZhbGlkYXRvcnMgYnkgbmFtZSwgYWNjZXB0cyBhbiBhcnJheSBvZiBuYW1lc1xyXG4gICAgdmFyIHYgPSB7IGRpcmVjdDogW10sIGRlZmVycmVkOiBbXSB9LCB0ID0gdGhpcztcclxuICAgIGVhY2goYSwgZnVuY3Rpb24gKHZhbCkge1xyXG4gICAgICB2YXIgdmFsaWRhdG9yID0gdC5nZXRSdWxlKHZhbCk7XHJcbiAgICAgIGlmICh2YWxpZGF0b3IuZGVmZXJyZWQpIHtcclxuICAgICAgICB2LmRlZmVycmVkLnB1c2godmFsaWRhdG9yKTtcclxuICAgICAgfSBlbHNlIHtcclxuICAgICAgICB2LmRpcmVjdC5wdXNoKHZhbGlkYXRvcik7XHJcbiAgICAgIH1cclxuICAgIH0pO1xyXG4gICAgcmV0dXJuIHY7XHJcbiAgfVxyXG5cclxuICB2YWxpZGF0ZShydWxlcywgZmllbGQsIHZhbCwgZm9yY2VkKSB7XHJcbiAgICB2YXIgcXVldWUgPSB0aGlzLmdldFZhbGlkYXRpb25DaGFpbihydWxlcyk7XHJcbiAgICByZXR1cm4gdGhpcy5jaGFpbihxdWV1ZSwgZmllbGQsIHZhbCwgZm9yY2VkKTtcclxuICB9XHJcblxyXG4gIGdldFZhbGlkYXRpb25DaGFpbihhKSB7XHJcbiAgICB2YXIgdiA9IHRoaXMuZ2V0UnVsZXMoYSksIGNoYWluID0gW10sIHNlbGYgPSB0aGlzO1xyXG4gICAgLy9jbGllbnQgc2lkZSB2YWxpZGF0aW9uIGZpcnN0XHJcbiAgICBlYWNoKHYuZGlyZWN0LCBmdW5jdGlvbiAocikge1xyXG4gICAgICByLmZuID0gc2VsZi5tYWtlUnVsZURlZmVycmVkKHIuZm4pO1xyXG4gICAgICBjaGFpbi5wdXNoKHIpO1xyXG4gICAgfSk7XHJcbiAgICAvL2RlZmVycmVkcyBsYXRlclxyXG4gICAgZWFjaCh2LmRlZmVycmVkLCBmdW5jdGlvbiAocikge1xyXG4gICAgICBjaGFpbi5wdXNoKHIpO1xyXG4gICAgfSk7XHJcbiAgICByZXR1cm4gY2hhaW47XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBXcmFwcyBhIHN5bmNocm9ub3VzIGZ1bmN0aW9uIGludG8gYSBwcm9taXNlLCBzbyBpdCBjYW4gYmUgcnVuIGFzeW5jaHJvbm91c2x5LlxyXG4gICAqIFxyXG4gICAqIEBwYXJhbSB7ZnVuY3Rpb259IGYgXHJcbiAgICovXHJcbiAgbWFrZVJ1bGVEZWZlcnJlZChmKSB7XHJcbiAgICB2YXIgdmFsaWRhdG9yID0gdGhpcztcclxuICAgIHJldHVybiB3cmFwKGYsIGZ1bmN0aW9uIChmdW5jKSB7XHJcbiAgICAgIHZhciBhcmdzID0gdG9BcnJheShhcmd1bWVudHMpO1xyXG4gICAgICByZXR1cm4gbmV3IFByb21pc2UoZnVuY3Rpb24gKHJlc29sdmUsIHJlamVjdCkge1xyXG4gICAgICAgIHZhciByZXN1bHQgPSBmdW5jLmFwcGx5KHZhbGlkYXRvci5kYXRhZW50cnksIGFyZ3Muc2xpY2UoMSwgbGVuKGFyZ3MpKSk7XHJcbiAgICAgICAgLy9OQjogdXNpbmcgTmF0aXZlIFByb21pc2UsIHdlIGRvbid0IHdhbnQgdG8gdHJlYXQgYSBjb21tb24gc2NlbmFyaW8gbGlrZSBhbiBpbnZhbGlkIGZpZWxkIGFzIGEgcmVqZWN0aW9uXHJcbiAgICAgICAgcmVzb2x2ZShyZXN1bHQpO1xyXG4gICAgICB9KTtcclxuICAgIH0pO1xyXG4gIH1cclxuXHJcbiAgbG9jYWxpemVFcnJvcihlcnJvciwgcGFyYW1ldGVycykge1xyXG4gICAgdmFyIGRhdGFlbnRyeSA9IHRoaXMuZGF0YWVudHJ5LFxyXG4gICAgICBsb2NhbGl6ZXIgPSBkYXRhZW50cnkgPyBkYXRhZW50cnkubG9jYWxpemVyIDogbnVsbDtcclxuICAgIHJldHVybiBsb2NhbGl6ZXIgJiYgbG9jYWxpemVyLmxvb2t1cChlcnJvcikgPyBsb2NhbGl6ZXIudChlcnJvciwgcGFyYW1ldGVycykgOiBlcnJvcjtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEV4ZWN1dGVzIGEgc2VyaWVzIG9mIGRlZmVycmVkIHRoYXQgbmVlZCB0byBiZSBleGVjdXRlZCBvbmUgYWZ0ZXIgdGhlIG90aGVyLlxyXG4gICAqIHJldHVybnMgYSBkZWZlcnJlZCBvYmplY3QgdGhhdCBjb21wbGV0ZXMgd2hlbiBldmVyeSBzaW5nbGUgZGVmZXJyZWQgY29tcGxldGVzLCBvciBhdCB0aGUgZmlyc3QgdGhhdCBmYWlscy5cclxuICAgKiBcclxuICAgKiBAcGFyYW0gcXVldWVcclxuICAgKiBAcmV0dXJucyB7UHJvbWlzZX1cclxuICAgKi9cclxuICBjaGFpbihxdWV1ZSkge1xyXG4gICAgaWYgKCFsZW4ocXVldWUpKVxyXG4gICAgICByZXR1cm4gbmV3IFByb21pc2UoZnVuY3Rpb24gKHJlc29sdmUpIHsgcmVzb2x2ZShbXSk7IH0pO1xyXG4gICAgXHJcbiAgICAvLyBub3JtYWxpemUgcXVldWVcclxuICAgIHF1ZXVlID0gbWFwKHF1ZXVlLCBmdW5jdGlvbiAobykge1xyXG4gICAgICBpZiAoaXNGdW5jdGlvbihvKSkge1xyXG4gICAgICAgIHJldHVybiB7IGZuOiBvLCBwYXJhbXM6IFtdIH07XHJcbiAgICAgIH1cclxuICAgICAgcmV0dXJuIG87XHJcbiAgICB9KTtcclxuICAgIHZhciBpID0gMCxcclxuICAgICAgY3VycmVudEZpZWxkUnVsZSA9IHF1ZXVlW2ldLFxyXG4gICAgICBhID0gW10sXHJcbiAgICAgIHZhbGlkYXRvciA9IHRoaXMsXHJcbiAgICAgIGFyZ3MgPSB0b0FycmF5KGFyZ3VtZW50cykuc2xpY2UoMSwgbGVuKGFyZ3VtZW50cykpLFxyXG4gICAgICBmdWxsQXJncyA9IHJ1bGVQYXJhbXMoYXJncywgY3VycmVudEZpZWxkUnVsZSk7XHJcbiAgICBcclxuICAgIHJldHVybiBuZXcgUHJvbWlzZShmdW5jdGlvbiAocmVzb2x2ZSwgcmVqZWN0KSB7XHJcbiAgICAgIGZ1bmN0aW9uIHN1Y2Nlc3MoZGF0YSkge1xyXG4gICAgICAgIC8vIHN1cHBvcnQgc3BlY2lmaWMgZXJyb3IgbWVzc2FnZXMgZm9yIHZhbGlkYXRpb24gcnVsZSBkZWZpbml0aW9uIGluIHNjaGVtYVxyXG4gICAgICAgIGlmIChkYXRhLmVycm9yKSB7XHJcbiAgICAgICAgICB2YXIgcnVsZU1lc3NhZ2UgPSBjdXJyZW50RmllbGRSdWxlLm1lc3NhZ2U7XHJcbiAgICAgICAgICBpZiAocnVsZU1lc3NhZ2UpXHJcbiAgICAgICAgICAgIGRhdGEubWVzc2FnZSA9IGlzRnVuY3Rpb24ocnVsZU1lc3NhZ2UpID8gcnVsZU1lc3NhZ2UuYXBwbHkodmFsaWRhdG9yLmRhdGFlbnRyeSwgYXJncykgOiBydWxlTWVzc2FnZTtcclxuICAgICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICB2YXIgZXJyb3JLZXkgPSBkYXRhLm1lc3NhZ2U7XHJcbiAgICAgICAgICAgIHZhciBsb2NhbGl6ZWRNZXNzYWdlID0gdmFsaWRhdG9yLmxvY2FsaXplRXJyb3IoZXJyb3JLZXksIHJ1bGVQYXJhbXMoW10sIGN1cnJlbnRGaWVsZFJ1bGUpKTtcclxuICAgICAgICAgICAgaWYgKGxvY2FsaXplZE1lc3NhZ2UgIT0gZXJyb3JLZXkpIHtcclxuICAgICAgICAgICAgICBkYXRhLmVycm9yS2V5ID0gZXJyb3JLZXk7XHJcbiAgICAgICAgICAgICAgZGF0YS5tZXNzYWdlID0gbG9jYWxpemVkTWVzc2FnZTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgfVxyXG5cclxuICAgICAgICAgIGlmIChjdXJyZW50RmllbGRSdWxlLm9uRXJyb3IpXHJcbiAgICAgICAgICAgIGN1cnJlbnRGaWVsZFJ1bGUub25FcnJvci5hcHBseSh2YWxpZGF0b3IuZGF0YWVudHJ5LCBhcmdzKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGEucHVzaChkYXRhKTtcclxuICAgICAgICBpZiAoZGF0YS5lcnJvcikge1xyXG4gICAgICAgICAgLy8gY29tbW9uIHZhbGlkYXRpb24gZXJyb3I6IHJlc29sdmUgdGhlIGNoYWluXHJcbiAgICAgICAgICByZXR1cm4gcmVzb2x2ZShhKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgbmV4dCgpOyAvLyBnbyB0byBuZXh0IHByb21pc2VcclxuICAgICAgfVxyXG4gICAgICBmdW5jdGlvbiBmYWlsdXJlKGRhdGEpIHtcclxuICAgICAgICAvLyBOQjogdGhpcyBjYWxsYmFjayB3aWxsIGJlIGNhbGxlZCBpZiBhbiBleGNlcHRpb24gaGFwcGVuIGR1cmluZyB2YWxpZGF0aW9uLlxyXG4gICAgICAgIGEucHVzaCh7XHJcbiAgICAgICAgICBlcnJvcjogdHJ1ZSxcclxuICAgICAgICAgIGVycm9yS2V5OiBmYWlsZWRWYWxpZGF0aW9uRXJyb3JLZXksXHJcbiAgICAgICAgICBtZXNzYWdlOiB2YWxpZGF0b3IubG9jYWxpemVFcnJvcihmYWlsZWRWYWxpZGF0aW9uRXJyb3JLZXksIHJ1bGVQYXJhbXMoW10sIGN1cnJlbnRGaWVsZFJ1bGUpKVxyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIHJlamVjdChhKTsvLyByZWplY3QgdGhlIHZhbGlkYXRpb24gY2hhaW5cclxuICAgICAgfVxyXG4gICAgICBmdW5jdGlvbiBuZXh0KCkge1xyXG4gICAgICAgIGkrKztcclxuICAgICAgICBpZiAoaSA9PSBsZW4ocXVldWUpKSB7XHJcbiAgICAgICAgICAvLyBldmVyeSBzaW5nbGUgcHJvbWlzZSBjb21wbGV0ZWQgcHJvcGVybHlcclxuICAgICAgICAgIHJlc29sdmUoYSk7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgIGN1cnJlbnRGaWVsZFJ1bGUgPSBxdWV1ZVtpXTtcclxuICAgICAgICAgIGZ1bGxBcmdzID0gcnVsZVBhcmFtcyhhcmdzLCBjdXJyZW50RmllbGRSdWxlKTtcclxuICAgICAgICAgIGN1cnJlbnRGaWVsZFJ1bGUuZm4uYXBwbHkodmFsaWRhdG9yLmRhdGFlbnRyeSwgZnVsbEFyZ3MpLnRoZW4oc3VjY2VzcywgZmFpbHVyZSk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICAgIGN1cnJlbnRGaWVsZFJ1bGUuZm4uYXBwbHkodmFsaWRhdG9yLmRhdGFlbnRyeSwgZnVsbEFyZ3MpLnRoZW4oc3VjY2VzcywgZmFpbHVyZSk7XHJcbiAgICB9KTtcclxuICB9XHJcbn1cclxuXHJcblZhbGlkYXRvci5nZXRFcnJvciA9IGdldEVycm9yO1xyXG5WYWxpZGF0b3IuUnVsZXMgPSBWYWxpZGF0aW9uUnVsZXM7XHJcblxyXG5leHBvcnQgZGVmYXVsdCBWYWxpZGF0b3IiLCIvKipcclxuICogRGF0YUVudHJ5IHJhaXNlIGZ1bmN0aW9uLlxyXG4gKiBUaGlzIGZ1bmN0aW9uIGlzIHVzZWQgdG8gcmFpc2UgZXhjZXB0aW9ucyB0aGF0IGluY2x1ZGUgYSBsaW5rIHRvIHRoZSBHaXRIdWIgd2lraSxcclxuICogcHJvdmlkaW5nIGZ1cnRoZXIgaW5mb3JtYXRpb24gYW5kIGRldGFpbHMuXHJcbiAqIGh0dHBzOi8vZ2l0aHViLmNvbS9Sb2JlcnRvUHJldmF0by9EYXRhRW50cnlcclxuICpcclxuICogQ29weXJpZ2h0IDIwMTksIFJvYmVydG8gUHJldmF0b1xyXG4gKiBodHRwczovL3JvYmVydG9wcmV2YXRvLmdpdGh1Yi5pb1xyXG4gKlxyXG4gKiBMaWNlbnNlZCB1bmRlciB0aGUgTUlUIGxpY2Vuc2U6XHJcbiAqIGh0dHA6Ly93d3cub3BlbnNvdXJjZS5vcmcvbGljZW5zZXMvTUlUXHJcbiAqL1xyXG5cclxuY29uc3QgcmFpc2VTZXR0aW5ncyA9IHtcclxuICB3cml0ZVRvQ29uc29sZTogdHJ1ZVxyXG59O1xyXG5cclxuLyoqXHJcbiAqIFJhaXNlcyBhbiBleGNlcHRpb24sIG9mZmVyaW5nIGEgbGluayB0byB0aGUgR2l0SHViIHdpa2kuXHJcbiAqIGh0dHBzOi8vZ2l0aHViLmNvbS9Sb2JlcnRvUHJldmF0by9EYXRhRW50cnkvd2lraS9FcnJvcnNcclxuICovXHJcbmZ1bmN0aW9uIHJhaXNlKGVyciwgZGV0YWlsKSB7XHJcbiAgdmFyIG1lc3NhZ2UgPSAoZGV0YWlsID8gZGV0YWlsIDogXCJFcnJvclwiKSArIFwiLiBGb3IgZnVydGhlciBkZXRhaWxzOiBodHRwczovL2dpdGh1Yi5jb20vUm9iZXJ0b1ByZXZhdG8vRGF0YUVudHJ5L3dpa2kvRXJyb3JzI1wiICsgZXJyO1xyXG4gIGlmIChyYWlzZVNldHRpbmdzLndyaXRlVG9Db25zb2xlICYmIHR5cGVvZiBjb25zb2xlICE9IFwidW5kZWZpbmVkXCIpIHtcclxuICAgIGNvbnNvbGUuZXJyb3IobWVzc2FnZSk7XHJcbiAgfVxyXG4gIHRocm93IG5ldyBFcnJvcihtZXNzYWdlKTtcclxufVxyXG5cclxuZXhwb3J0IHsgcmFpc2UsIHJhaXNlU2V0dGluZ3MgfSIsIi8qKlxyXG4gKiBHZW5lcmljIHV0aWxpdGllcyB0byB3b3JrIHdpdGggb2JqZWN0cyBhbmQgZnVuY3Rpb25zLlxyXG4gKiBodHRwczovL2dpdGh1Yi5jb20vUm9iZXJ0b1ByZXZhdG8vRGF0YUVudHJ5XHJcbiAqXHJcbiAqIENvcHlyaWdodCAyMDE5LCBSb2JlcnRvIFByZXZhdG9cclxuICogaHR0cHM6Ly9yb2JlcnRvcHJldmF0by5naXRodWIuaW9cclxuICpcclxuICogTGljZW5zZWQgdW5kZXIgdGhlIE1JVCBsaWNlbnNlOlxyXG4gKiBodHRwOi8vd3d3Lm9wZW5zb3VyY2Uub3JnL2xpY2Vuc2VzL01JVFxyXG4gKi9cclxuLy8gXHJcbmNvbnN0IE9CSkVDVCA9IFwib2JqZWN0XCIsXHJcbiAgU1RSSU5HID0gXCJzdHJpbmdcIixcclxuICBOVU1CRVIgPSBcIm51bWJlclwiLFxyXG4gIEZVTkNUSU9OID0gXCJmdW5jdGlvblwiLFxyXG4gIFJFUCA9IFwicmVwbGFjZVwiO1xyXG5cclxuaW1wb3J0IHtcclxuICBBcmd1bWVudEV4Y2VwdGlvbixcclxuICBBcmd1bWVudE51bGxFeGNlcHRpb25cclxufSBmcm9tIFwiLi4vc2NyaXB0cy9leGNlcHRpb25zXCJcclxuXHJcbi8qKlxyXG4qIFJldHVybnMgdGhlIGxlbmdodCBvZiB0aGUgZ2l2ZW4gdmFyaWFibGUuXHJcbiogSGFuZGxlcyBhcnJheSwgb2JqZWN0IGtleXMsIHN0cmluZyBhbmQgYW55IG90aGVyIG9iamVjdCB3aXRoIGxlbmd0aCBwcm9wZXJ0eS5cclxuKiBcclxuKiBAcGFyYW0geyp9IG8gXHJcbiovXHJcbmZ1bmN0aW9uIGxlbihvKSB7XHJcbiAgaWYgKCFvKSByZXR1cm4gMDtcclxuICBpZiAoaXNTdHJpbmcobykpXHJcbiAgICByZXR1cm4gby5sZW5ndGg7XHJcbiAgaWYgKGlzUGxhaW5PYmplY3QobykpIHtcclxuICAgIHZhciBpID0gMDtcclxuICAgIGZvciAobGV0IHggaW4gbykge1xyXG4gICAgICBpKys7XHJcbiAgICB9XHJcbiAgICByZXR1cm4gaTtcclxuICB9XHJcbiAgcmV0dXJuIFwibGVuZ3RoXCIgaW4gbyA/IG8ubGVuZ3RoIDogdW5kZWZpbmVkO1xyXG59XHJcblxyXG5mdW5jdGlvbiBtYXAoYSwgZm4pIHtcclxuICBpZiAoIWEgfHwgIWxlbihhKSkge1xyXG4gICAgaWYgKGlzUGxhaW5PYmplY3QoYSkpIHtcclxuICAgICAgdmFyIHgsIGIgPSBbXTtcclxuICAgICAgZm9yICh4IGluIGEpIHtcclxuICAgICAgICBiLnB1c2goZm4oeCwgYVt4XSkpO1xyXG4gICAgICB9XHJcbiAgICAgIHJldHVybiBiO1xyXG4gICAgfVxyXG4gIH07XHJcbiAgdmFyIGIgPSBbXTtcclxuICBmb3IgKHZhciBpID0gMCwgbCA9IGxlbihhKTsgaSA8IGw7IGkrKylcclxuICAgIGIucHVzaChmbihhW2ldKSk7XHJcbiAgcmV0dXJuIGI7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIGVhY2goYSwgZm4pIHtcclxuICBpZiAoaXNQbGFpbk9iamVjdChhKSkge1xyXG4gICAgZm9yICh2YXIgeCBpbiBhKVxyXG4gICAgICBmbihhW3hdLCB4KTtcclxuICAgIHJldHVybiBhO1xyXG4gIH1cclxuICBpZiAoIWEgfHwgIWxlbihhKSkgcmV0dXJuIGE7XHJcbiAgZm9yICh2YXIgaSA9IDAsIGwgPSBsZW4oYSk7IGkgPCBsOyBpKyspXHJcbiAgICBmbihhW2ldLCBpKTtcclxufVxyXG5cclxuZnVuY3Rpb24gZXhlYyhmbiwgaikge1xyXG4gIGZvciAodmFyIGkgPSAwOyBpIDwgajsgaSsrKVxyXG4gICAgZm4oaSk7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIGlzU3RyaW5nKHMpIHtcclxuICByZXR1cm4gdHlwZW9mIHMgPT0gU1RSSU5HO1xyXG59XHJcblxyXG5mdW5jdGlvbiBpc051bWJlcihvKSB7XHJcbiAgLy8gaW4gSmF2YVNjcmlwdCBOYU4gKE5vdCBhIE51bWJlcikgaWYgb2YgdHlwZSBcIm51bWJlclwiIChjdXJpb3VzLi4pXHJcbiAgLy8gSG93ZXZlciwgd2hlbiBjaGVja2luZyBpZiBzb21ldGhpbmcgaXMgYSBudW1iZXIgaXQncyBkZXNpcmFibGUgdG8gcmV0dXJuXHJcbiAgLy8gZmFsc2UgaWYgaXQgaXMgTmFOIVxyXG4gIGlmIChpc05hTihvKSkge1xyXG4gICAgcmV0dXJuIGZhbHNlO1xyXG4gIH1cclxuICByZXR1cm4gdHlwZW9mIG8gPT0gTlVNQkVSO1xyXG59XHJcblxyXG5mdW5jdGlvbiBpc0Z1bmN0aW9uKG8pIHtcclxuICByZXR1cm4gdHlwZW9mIG8gPT0gRlVOQ1RJT047XHJcbn1cclxuXHJcbmZ1bmN0aW9uIGlzT2JqZWN0KG8pIHtcclxuICByZXR1cm4gdHlwZW9mIG8gPT0gT0JKRUNUO1xyXG59XHJcblxyXG5mdW5jdGlvbiBpc0FycmF5KG8pIHtcclxuICByZXR1cm4gbyBpbnN0YW5jZW9mIEFycmF5O1xyXG59XHJcblxyXG5mdW5jdGlvbiBpc0RhdGUobykge1xyXG4gIHJldHVybiBvIGluc3RhbmNlb2YgRGF0ZTtcclxufVxyXG5cclxuZnVuY3Rpb24gaXNSZWdFeHAobykge1xyXG4gIHJldHVybiBvIGluc3RhbmNlb2YgUmVnRXhwO1xyXG59XHJcblxyXG5mdW5jdGlvbiBpc1BsYWluT2JqZWN0KG8pIHtcclxuICByZXR1cm4gdHlwZW9mIG8gPT0gT0JKRUNUICYmIG8gIT09IG51bGwgJiYgby5jb25zdHJ1Y3RvciA9PSBPYmplY3Q7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIGlzRW1wdHkobykge1xyXG4gIGlmICghbykgcmV0dXJuIHRydWU7XHJcbiAgaWYgKGlzQXJyYXkobykpIHtcclxuICAgIHJldHVybiBvLmxlbmd0aCA9PSAwO1xyXG4gIH1cclxuICBpZiAoaXNQbGFpbk9iamVjdChvKSkge1xyXG4gICAgdmFyIHg7XHJcbiAgICBmb3IgKHggaW4gbykge1xyXG4gICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICB9XHJcbiAgICByZXR1cm4gdHJ1ZTtcclxuICB9XHJcbiAgaWYgKGlzU3RyaW5nKG8pKSB7XHJcbiAgICByZXR1cm4gbyA9PT0gXCJcIjtcclxuICB9XHJcbiAgaWYgKGlzTnVtYmVyKG8pKSB7XHJcbiAgICByZXR1cm4gbyA9PT0gMDtcclxuICB9XHJcbiAgdGhyb3cgbmV3IEVycm9yKFwiaW52YWxpZCBhcmd1bWVudFwiKTtcclxufVxyXG5cclxuZnVuY3Rpb24gaGFzT3duUHJvcGVydHkobywgbikge1xyXG4gIHJldHVybiBvICYmIG8uaGFzT3duUHJvcGVydHkobik7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIHVwcGVyKHMpIHtcclxuICByZXR1cm4gcy50b1VwcGVyQ2FzZSgpO1xyXG59XHJcblxyXG5mdW5jdGlvbiBsb3dlcihzKSB7XHJcbiAgcmV0dXJuIHMudG9Mb3dlckNhc2UoKTtcclxufVxyXG5cclxuZnVuY3Rpb24gZmlyc3QoYSwgZm4pIHtcclxuICBpZiAoIWZuKSB7XHJcbiAgICByZXR1cm4gYSA/IGFbMF0gOiB1bmRlZmluZWQ7XHJcbiAgfVxyXG4gIGZvciAodmFyIGkgPSAwLCBsID0gbGVuKGEpOyBpIDwgbDsgaSsrKSB7XHJcbiAgICBpZiAoZm4oYVtpXSkpIHJldHVybiBhW2ldO1xyXG4gIH1cclxufVxyXG5cclxuZnVuY3Rpb24gdG9BcnJheShhKSB7XHJcbiAgaWYgKGlzQXJyYXkoYSkpIHJldHVybiBhO1xyXG4gIGlmICh0eXBlb2YgYSA9PSBPQkpFQ1QgJiYgbGVuKGEpKVxyXG4gICAgcmV0dXJuIG1hcChhLCBmdW5jdGlvbiAobykgeyByZXR1cm4gbzsgfSk7XHJcbiAgcmV0dXJuIEFycmF5LnByb3RvdHlwZS5zbGljZS5jYWxsKGFyZ3VtZW50cyk7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIGZsYXR0ZW4oYSkge1xyXG4gIGlmIChpc0FycmF5KGEpKVxyXG4gICAgcmV0dXJuIFtdLmNvbmNhdC5hcHBseShbXSwgbWFwKGEsIGZsYXR0ZW4pKTtcclxuICByZXR1cm4gYTtcclxufVxyXG5cclxudmFyIF9pZCA9IC0xO1xyXG5mdW5jdGlvbiB1bmlxdWVJZChuYW1lKSB7XHJcbiAgX2lkKys7XHJcbiAgcmV0dXJuIChuYW1lIHx8IFwiaWRcIikgKyBfaWQ7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIHJlc2V0U2VlZCgpIHtcclxuICBfaWQgPSAtMTtcclxufVxyXG5cclxuZnVuY3Rpb24ga2V5cyhvKSB7XHJcbiAgaWYgKCFvKSByZXR1cm4gW107XHJcbiAgdmFyIHgsIGEgPSBbXTtcclxuICBmb3IgKHggaW4gbykge1xyXG4gICAgYS5wdXNoKHgpO1xyXG4gIH1cclxuICByZXR1cm4gYTtcclxufVxyXG5cclxuZnVuY3Rpb24gdmFsdWVzKG8pIHtcclxuICBpZiAoIW8pIHJldHVybiBbXTtcclxuICB2YXIgeCwgYSA9IFtdO1xyXG4gIGZvciAoeCBpbiBvKSB7XHJcbiAgICBhLnB1c2gob1t4XSk7XHJcbiAgfVxyXG4gIHJldHVybiBhO1xyXG59XHJcblxyXG5mdW5jdGlvbiBtaW51cyhvLCBwcm9wcykge1xyXG4gIGlmICghbykgcmV0dXJuIG87XHJcbiAgaWYgKCFwcm9wcykgcHJvcHMgPSBbXTtcclxuICB2YXIgYSA9IHt9LCB4O1xyXG4gIGZvciAoeCBpbiBvKSB7XHJcbiAgICBpZiAocHJvcHMuaW5kZXhPZih4KSA9PSAtMSkge1xyXG4gICAgICBhW3hdID0gb1t4XTtcclxuICAgIH1cclxuICB9XHJcbiAgcmV0dXJuIGE7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIGlzVW5kKHgpIHtcclxuICByZXR1cm4gdHlwZW9mIHggPT09IFwidW5kZWZpbmVkXCI7XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBEZWVwIGNsb25lcyBhbiBpdGVtIChleGNlcHQgZnVuY3Rpb24gdHlwZXMpLlxyXG4gKi9cclxuZnVuY3Rpb24gY2xvbmUobykge1xyXG4gIHZhciB4LCBhO1xyXG4gIGlmIChvID09PSBudWxsKSByZXR1cm4gbnVsbDtcclxuICBpZiAobyA9PT0gdW5kZWZpbmVkKSByZXR1cm4gdW5kZWZpbmVkO1xyXG4gIGlmIChpc09iamVjdChvKSkge1xyXG4gICAgaWYgKGlzQXJyYXkobykpIHtcclxuICAgICAgYSA9IFtdO1xyXG4gICAgICBmb3IgKHZhciBpID0gMCwgbCA9IG8ubGVuZ3RoOyBpIDwgbDsgaSsrKSB7XHJcbiAgICAgICAgYVtpXSA9IGNsb25lKG9baV0pO1xyXG4gICAgICB9XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICBhID0ge307XHJcbiAgICAgIHZhciB2O1xyXG4gICAgICBmb3IgKHggaW4gbykge1xyXG4gICAgICAgIHYgPSBvW3hdO1xyXG4gICAgICAgIGlmICh2ID09PSBudWxsIHx8IHYgPT09IHVuZGVmaW5lZCkge1xyXG4gICAgICAgICAgYVt4XSA9IHY7XHJcbiAgICAgICAgICBjb250aW51ZTtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKGlzT2JqZWN0KHYpKSB7XHJcbiAgICAgICAgICBpZiAoaXNEYXRlKHYpKSB7XHJcbiAgICAgICAgICAgIGFbeF0gPSBuZXcgRGF0ZSh2LmdldFRpbWUoKSk7XHJcbiAgICAgICAgICB9IGVsc2UgaWYgKGlzUmVnRXhwKHYpKSB7XHJcbiAgICAgICAgICAgIGFbeF0gPSBuZXcgUmVnRXhwKHYuc291cmNlLCB2LmZsYWdzKTtcclxuICAgICAgICAgIH0gZWxzZSBpZiAoaXNBcnJheSh2KSkge1xyXG4gICAgICAgICAgICBhW3hdID0gW107XHJcbiAgICAgICAgICAgIGZvciAodmFyIGkgPSAwLCBsID0gdi5sZW5ndGg7IGkgPCBsOyBpKyspIHtcclxuICAgICAgICAgICAgICBhW3hdW2ldID0gY2xvbmUodltpXSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIGFbeF0gPSBjbG9uZSh2KTtcclxuICAgICAgICAgIH1cclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgYVt4XSA9IHY7XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgfSBlbHNlIHtcclxuICAgIGEgPSBvO1xyXG4gIH1cclxuICByZXR1cm4gYTtcclxufVxyXG5cclxuZXhwb3J0IGRlZmF1bHQge1xyXG4gIGV4dGVuZCgpIHtcclxuICAgIHZhciBhcmdzID0gYXJndW1lbnRzO1xyXG4gICAgaWYgKCFsZW4oYXJncykpIHJldHVybjtcclxuICAgIGlmIChsZW4oYXJncykgPT0gMSkgcmV0dXJuIGFyZ3NbMF07XHJcbiAgICB2YXIgYSA9IGFyZ3NbMF0sIGIsIHg7XHJcbiAgICBmb3IgKHZhciBpID0gMSwgbCA9IGxlbihhcmdzKTsgaSA8IGw7IGkrKykge1xyXG4gICAgICBiID0gYXJnc1tpXTtcclxuICAgICAgaWYgKCFiKSBjb250aW51ZTtcclxuICAgICAgZm9yICh4IGluIGIpIHtcclxuICAgICAgICBhW3hdID0gYlt4XTtcclxuICAgICAgfVxyXG4gICAgfVxyXG4gICAgcmV0dXJuIGE7XHJcbiAgfSxcclxuXHJcbiAgc3RyaW5nQXJncyhhKSB7XHJcbiAgICBpZiAoIWEgfHwgaXNVbmQoYS5sZW5ndGgpKSB0aHJvdyBuZXcgRXJyb3IoXCJleHBlY3RlZCBhcnJheSBhcmd1bWVudFwiKTtcclxuICAgIGlmICghYS5sZW5ndGgpIHJldHVybiBbXTtcclxuICAgIHZhciBsID0gYS5sZW5ndGg7XHJcbiAgICBpZiAobCA9PT0gMSkge1xyXG4gICAgICB2YXIgZmlyc3QgPSBhWzBdO1xyXG4gICAgICBpZiAoaXNTdHJpbmcoZmlyc3QpICYmIGZpcnN0LmluZGV4T2YoXCIgXCIpID4gLTEpIHtcclxuICAgICAgICByZXR1cm4gZmlyc3Quc3BsaXQoL1xccysvZyk7XHJcbiAgICAgIH1cclxuICAgIH1cclxuICAgIHJldHVybiBhO1xyXG4gIH0sXHJcblxyXG4gIHVuaXF1ZUlkLFxyXG5cclxuICByZXNldFNlZWQsXHJcblxyXG4gIGZsYXR0ZW4sXHJcblxyXG4gIGVhY2gsXHJcblxyXG4gIGV4ZWMsXHJcblxyXG4gIGtleXMsXHJcblxyXG4gIHZhbHVlcyxcclxuXHJcbiAgbWludXMsXHJcblxyXG4gIG1hcCxcclxuXHJcbiAgZmlyc3QsXHJcblxyXG4gIHRvQXJyYXksXHJcblxyXG4gIGlzQXJyYXksXHJcblxyXG4gIGlzRGF0ZSxcclxuXHJcbiAgaXNTdHJpbmcsXHJcblxyXG4gIGlzTnVtYmVyLFxyXG5cclxuICBpc09iamVjdCxcclxuXHJcbiAgaXNQbGFpbk9iamVjdCxcclxuXHJcbiAgaXNFbXB0eSxcclxuXHJcbiAgaXNGdW5jdGlvbixcclxuXHJcbiAgaGFzOiBoYXNPd25Qcm9wZXJ0eSxcclxuXHJcbiAgaXNOdWxsT3JFbXB0eVN0cmluZyh2KSB7XHJcbiAgICByZXR1cm4gdiA9PT0gbnVsbCB8fCB2ID09PSB1bmRlZmluZWQgfHwgdiA9PT0gXCJcIjtcclxuICB9LFxyXG5cclxuICBsb3dlcixcclxuXHJcbiAgdXBwZXIsXHJcblxyXG4gIC8qKlxyXG4gICAqIER1Y2sgdHlwaW5nOiBjaGVja3MgaWYgYW4gb2JqZWN0IFwiUXVhY2tzIGxpa2UgYSBQcm9taXNlXCJcclxuICAgKlxyXG4gICAqIEBwYXJhbSB7UHJvbWlzZX0gbztcclxuICAgKi9cclxuICBxdWFja3NMaWtlUHJvbWlzZShvKSB7XHJcbiAgICBpZiAobyAmJiB0eXBlb2Ygby50aGVuID09IEZVTkNUSU9OKSB7XHJcbiAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgfVxyXG4gICAgcmV0dXJuIGZhbHNlO1xyXG4gIH0sXHJcblxyXG4gIC8qKlxyXG4gICAqIFJldHVybnMgdGhlIHN1bSBvZiB2YWx1ZXMgaW5zaWRlIGFuIGFycmF5LCBldmVudHVhbGx5IGJ5IHByZWRpY2F0ZS5cclxuICAgKi9cclxuICBzdW0oYSwgZm4pIHtcclxuICAgIGlmICghYSkgcmV0dXJuO1xyXG4gICAgdmFyIGIsIGwgPSBsZW4oYSk7XHJcbiAgICBpZiAoIWwpIHJldHVybjtcclxuICAgIGZvciAodmFyIGkgPSAwLCBsID0gbGVuKGEpOyBpIDwgbDsgaSsrKSB7XHJcbiAgICAgIHZhciB2ID0gZm4gPyBmbihhW2ldKSA6IGFbaV07XHJcbiAgICAgIGlmIChpc1VuZChiKSkge1xyXG4gICAgICAgIGIgPSB2O1xyXG4gICAgICB9IGVsc2Uge1xyXG4gICAgICAgIGIgKz0gdjtcclxuICAgICAgfVxyXG4gICAgfVxyXG4gICAgcmV0dXJuIGI7XHJcbiAgfSxcclxuXHJcbiAgLyoqXHJcbiAgICogUmV0dXJucyB0aGUgbWF4aW11bSB2YWx1ZSBpbnNpZGUgYW4gYXJyYXksIGJ5IHByZWRpY2F0ZS5cclxuICAgKi9cclxuICBtYXgoYSwgZm4pIHtcclxuICAgIHZhciBvID0gLUluZmluaXR5O1xyXG4gICAgZm9yICh2YXIgaSA9IDAsIGwgPSBsZW4oYSk7IGkgPCBsOyBpKyspIHtcclxuICAgICAgdmFyIHYgPSBmbiA/IGZuKGFbaV0pIDogYVtpXTtcclxuICAgICAgaWYgKHYgPiBvKVxyXG4gICAgICAgIG8gPSB2O1xyXG4gICAgfVxyXG4gICAgcmV0dXJuIG87XHJcbiAgfSxcclxuXHJcbiAgLyoqXHJcbiAgICogUmV0dXJucyB0aGUgbWluaW11bSB2YWx1ZSBpbnNpZGUgYW4gYXJyYXksIGJ5IHByZWRpY2F0ZS5cclxuICAgKi9cclxuICBtaW4oYSwgZm4pIHtcclxuICAgIHZhciBvID0gSW5maW5pdHk7XHJcbiAgICBmb3IgKHZhciBpID0gMCwgbCA9IGxlbihhKTsgaSA8IGw7IGkrKykge1xyXG4gICAgICB2YXIgdiA9IGZuID8gZm4oYVtpXSkgOiBhW2ldO1xyXG4gICAgICBpZiAodiA8IG8pXHJcbiAgICAgICAgbyA9IHY7XHJcbiAgICB9XHJcbiAgICByZXR1cm4gbztcclxuICB9LFxyXG5cclxuICAvKipcclxuICAgKiBSZXR1cm5zIHRoZSBpdGVtIHdpdGggdGhlIG1heGltdW0gdmFsdWUgaW5zaWRlIGFuIGFycmF5LCBieSBwcmVkaWNhdGUuXHJcbiAgICovXHJcbiAgd2l0aE1heChhLCBmbikge1xyXG4gICAgdmFyIG87XHJcbiAgICBmb3IgKHZhciBpID0gMCwgbCA9IGxlbihhKTsgaSA8IGw7IGkrKykge1xyXG4gICAgICBpZiAoIW8pIHtcclxuICAgICAgICBvID0gYVtpXTtcclxuICAgICAgICBjb250aW51ZTtcclxuICAgICAgfVxyXG4gICAgICB2YXIgdiA9IGZuKGFbaV0pO1xyXG4gICAgICBpZiAodiA+IGZuKG8pKVxyXG4gICAgICAgIG8gPSBhW2ldO1xyXG4gICAgfVxyXG4gICAgcmV0dXJuIG87XHJcbiAgfSxcclxuXHJcbiAgLyoqXHJcbiAgICogUmV0dXJucyB0aGUgaXRlbSB3aXRoIHRoZSBtaW5pbXVtIHZhbHVlIGluc2lkZSBhbiBhcnJheSwgYnkgcHJlZGljYXRlLlxyXG4gICAqL1xyXG4gIHdpdGhNaW4oYSwgZm4pIHtcclxuICAgIHZhciBvO1xyXG4gICAgZm9yICh2YXIgaSA9IDAsIGwgPSBsZW4oYSk7IGkgPCBsOyBpKyspIHtcclxuICAgICAgaWYgKCFvKSB7XHJcbiAgICAgICAgbyA9IGFbaV07XHJcbiAgICAgICAgY29udGludWU7XHJcbiAgICAgIH1cclxuICAgICAgdmFyIHYgPSBmbihhW2ldKTtcclxuICAgICAgaWYgKHYgPCBmbihvKSlcclxuICAgICAgICBvID0gYVtpXTtcclxuICAgIH1cclxuICAgIHJldHVybiBvO1xyXG4gIH0sXHJcblxyXG4gIGluZGV4T2YoYSwgbykge1xyXG4gICAgcmV0dXJuIGEuaW5kZXhPZihvKTtcclxuICB9LFxyXG5cclxuICBjb250YWlucyhhLCBvKSB7XHJcbiAgICBpZiAoIWEpIHJldHVybiBmYWxzZTtcclxuICAgIHJldHVybiBhLmluZGV4T2YobykgPiAtMTtcclxuICB9LFxyXG5cclxuICAvKipcclxuICAgKiBSZXR1cm5zIGEgdmFsdWUgaW5kaWNhdGluZyB3aGV0aGVyIGFueSBvYmplY3QgaW5zaWRlIGFuIGFycmF5LCBvciBhbnlcclxuICAgKiBrZXktdmFsdWUgcGFpciBpbnNpZGUgYW4gb2JqZWN0LCByZXNwZWN0IGEgZ2l2ZW4gcHJlZGljYXRlLlxyXG4gICAqXHJcbiAgICogQHBhcmFtIGE6IGlucHV0IGFycmF5IG9yIG9iamVjdFxyXG4gICAqIEBwYXJhbSBmbjogcHJlZGljYXRlIHRvIHRlc3QgaXRlbXMgb3Iga2V5LXZhbHVlIHBhaXJzXHJcbiAgICovXHJcbiAgYW55KGEsIGZuKSB7XHJcbiAgICBpZiAoaXNQbGFpbk9iamVjdChhKSkge1xyXG4gICAgICB2YXIgeDtcclxuICAgICAgZm9yICh4IGluIGEpIHtcclxuICAgICAgICBpZiAoZm4oeCwgYVt4XSkpXHJcbiAgICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgICAgfVxyXG4gICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICB9XHJcbiAgICBmb3IgKHZhciBpID0gMCwgbCA9IGxlbihhKTsgaSA8IGw7IGkrKykge1xyXG4gICAgICBpZiAoZm4oYVtpXSkpXHJcbiAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICB9XHJcbiAgICByZXR1cm4gZmFsc2U7XHJcbiAgfSxcclxuXHJcbiAgLyoqXHJcbiAgICogUmV0dXJucyBhIHZhbHVlIGluZGljYXRpbmcgd2hldGhlciBhbGwgb2JqZWN0IGluc2lkZSBhbiBhcnJheSwgb3IgYW55XHJcbiAgICoga2V5LXZhbHVlIHBhaXIgaW5zaWRlIGFuIG9iamVjdCwgcmVzcGVjdCBhIGdpdmVuIHByZWRpY2F0ZS5cclxuICAgKlxyXG4gICAqIEBwYXJhbSBhOiBpbnB1dCBhcnJheSBvciBvYmplY3RcclxuICAgKiBAcGFyYW0gZm46IHByZWRpY2F0ZSB0byB0ZXN0IGl0ZW1zIG9yIGtleS12YWx1ZSBwYWlyc1xyXG4gICAqL1xyXG4gIGFsbChhLCBmbikge1xyXG4gICAgaWYgKGlzUGxhaW5PYmplY3QoYSkpIHtcclxuICAgICAgdmFyIHg7XHJcbiAgICAgIGZvciAoeCBpbiBhKSB7XHJcbiAgICAgICAgaWYgKCFmbih4LCBhW3hdKSlcclxuICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgfVxyXG4gICAgICByZXR1cm4gdHJ1ZTtcclxuICAgIH1cclxuICAgIGZvciAodmFyIGkgPSAwLCBsID0gbGVuKGEpOyBpIDwgbDsgaSsrKSB7XHJcbiAgICAgIGlmICghZm4oYVtpXSkpXHJcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgfVxyXG4gICAgcmV0dXJuIHRydWU7XHJcbiAgfSxcclxuXHJcbiAgLyoqXHJcbiAgICogRmluZHMgdGhlIGZpcnN0IGl0ZW0gb3IgcHJvcGVydHkgdGhhdCByZXNwZWN0cyBhIGdpdmVuIHByZWRpY2F0ZS5cclxuICAgKi9cclxuICBmaW5kKGEsIGZuKSB7XHJcbiAgICBpZiAoIWEpIHJldHVybiBudWxsO1xyXG4gICAgaWYgKGlzQXJyYXkoYSkpIHtcclxuICAgICAgaWYgKCFhIHx8ICFsZW4oYSkpIHJldHVybjtcclxuICAgICAgZm9yICh2YXIgaSA9IDAsIGwgPSBsZW4oYSk7IGkgPCBsOyBpKyspIHtcclxuICAgICAgICBpZiAoZm4oYVtpXSkpXHJcbiAgICAgICAgICByZXR1cm4gYVtpXTtcclxuICAgICAgfVxyXG4gICAgfVxyXG4gICAgaWYgKGlzUGxhaW5PYmplY3QoYSkpIHtcclxuICAgICAgdmFyIHg7XHJcbiAgICAgIGZvciAoeCBpbiBhKSB7XHJcbiAgICAgICAgaWYgKGZuKGFbeF0sIHgpKVxyXG4gICAgICAgICAgcmV0dXJuIGFbeF07XHJcbiAgICAgIH1cclxuICAgIH1cclxuICAgIHJldHVybjtcclxuICB9LFxyXG5cclxuICB3aGVyZShhLCBmbikge1xyXG4gICAgaWYgKCFhIHx8ICFsZW4oYSkpIHJldHVybiBbXTtcclxuICAgIHZhciBiID0gW107XHJcbiAgICBmb3IgKHZhciBpID0gMCwgbCA9IGxlbihhKTsgaSA8IGw7IGkrKykge1xyXG4gICAgICBpZiAoZm4oYVtpXSkpXHJcbiAgICAgICAgYi5wdXNoKGFbaV0pO1xyXG4gICAgfVxyXG4gICAgcmV0dXJuIGI7XHJcbiAgfSxcclxuXHJcbiAgcmVtb3ZlSXRlbShhLCBvKSB7XHJcbiAgICB2YXIgeCA9IC0xO1xyXG4gICAgZm9yICh2YXIgaSA9IDAsIGwgPSBsZW4oYSk7IGkgPCBsOyBpKyspIHtcclxuICAgICAgaWYgKGFbaV0gPT09IG8pIHtcclxuICAgICAgICB4ID0gaTtcclxuICAgICAgICBicmVhaztcclxuICAgICAgfVxyXG4gICAgfVxyXG4gICAgYS5zcGxpY2UoeCwgMSk7XHJcbiAgfSxcclxuXHJcbiAgcmVtb3ZlSXRlbXMoYSwgYikge1xyXG4gICAgZWFjaChiLCB0b1JlbW92ZSA9PiB7XHJcbiAgICAgIHRoaXMucmVtb3ZlSXRlbShhLCB0b1JlbW92ZSk7XHJcbiAgICB9KTtcclxuICB9LFxyXG5cclxuICByZWplY3QoYSwgZm4pIHtcclxuICAgIGlmICghYSB8fCAhbGVuKGEpKSByZXR1cm4gW107XHJcbiAgICB2YXIgYiA9IFtdO1xyXG4gICAgZm9yICh2YXIgaSA9IDAsIGwgPSBsZW4oYSk7IGkgPCBsOyBpKyspIHtcclxuICAgICAgaWYgKCFmbihhW2ldKSlcclxuICAgICAgICBiLnB1c2goYVtpXSk7XHJcbiAgICB9XHJcbiAgICByZXR1cm4gYjtcclxuICB9LFxyXG5cclxuICBwaWNrKG8sIGFyciwgZXhjbHVkZSkge1xyXG4gICAgdmFyIGEgPSB7fTtcclxuICAgIGlmIChleGNsdWRlKSB7XHJcbiAgICAgIGZvciAodmFyIHggaW4gbykge1xyXG4gICAgICAgIGlmIChhcnIuaW5kZXhPZih4KSA9PSAtMSlcclxuICAgICAgICAgIGFbeF0gPSBvW3hdO1xyXG4gICAgICB9XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICBmb3IgKHZhciBpID0gMCwgbCA9IGxlbihhcnIpOyBpIDwgbDsgaSsrKSB7XHJcbiAgICAgICAgdmFyIHAgPSBhcnJbaV07XHJcbiAgICAgICAgaWYgKGhhc093blByb3BlcnR5KG8sIHApKVxyXG4gICAgICAgICAgYVtwXSA9IG9bcF07XHJcbiAgICAgIH1cclxuICAgIH1cclxuICAgIHJldHVybiBhO1xyXG4gIH0sXHJcblxyXG4gIG9taXQoYSwgYXJyKSB7XHJcbiAgICByZXR1cm4gdGhpcy5waWNrKGEsIGFyciwgMSk7XHJcbiAgfSxcclxuXHJcbiAgLyoqXHJcbiAgICogUmVxdWlyZXMgYW4gb2JqZWN0IHRvIGJlIGRlZmluZWQgYW5kIHRvIGhhdmUgdGhlIGdpdmVuIHByb3BlcnRpZXMuXHJcbiAgICpcclxuICAgKiBAcGFyYW0ge09iamVjdH0gbzogb2JqZWN0IHRvIHZhbGlkYXRlXHJcbiAgICogQHBhcmFtIHtTdHJpbmdbXX0gcHJvcHM6IGxpc3Qgb2YgcHJvcGVydGllcyB0byByZXF1aXJlXHJcbiAgICogQHBhcmFtIHtzdHJpbmd9IFtuYW1lPW9wdGlvbnNdOlxyXG4gICAqL1xyXG4gIHJlcXVpcmUobywgcHJvcHMsIG5hbWUpIHtcclxuICAgIGlmICghbmFtZSkgbmFtZSA9IFwib3B0aW9uc1wiO1xyXG4gICAgdmFyIGVycm9yID0gXCJcIjtcclxuICAgIGlmIChvKSB7XHJcbiAgICAgIHRoaXMuZWFjaChwcm9wcywgeCA9PiB7XHJcbiAgICAgICAgaWYgKCFoYXNPd25Qcm9wZXJ0eShvLCB4KSkge1xyXG4gICAgICAgICAgZXJyb3IgKz0gXCJtaXNzaW5nICdcIiArIHggKyBcIicgaW4gXCIgKyBuYW1lO1xyXG4gICAgICAgIH1cclxuICAgICAgfSk7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICBlcnJvciA9IFwibWlzc2luZyBcIiArIG5hbWU7XHJcbiAgICB9XHJcbiAgICBpZiAoZXJyb3IpXHJcbiAgICAgIHRocm93IG5ldyBFcnJvcihlcnJvcik7XHJcbiAgfSxcclxuXHJcbiAgd3JhcChmbiwgY2FsbGJhY2ssIGNvbnRleHQpIHtcclxuICAgIHZhciB3cmFwcGVyID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICByZXR1cm4gY2FsbGJhY2suYXBwbHkodGhpcywgW2ZuXS5jb25jYXQodG9BcnJheShhcmd1bWVudHMpKSk7XHJcbiAgICB9O1xyXG4gICAgd3JhcHBlci5iaW5kKGNvbnRleHQgfHwgdGhpcyk7XHJcbiAgICByZXR1cm4gd3JhcHBlcjtcclxuICB9LFxyXG5cclxuICB1bndyYXAobykge1xyXG4gICAgcmV0dXJuIGlzRnVuY3Rpb24obykgPyB1bndyYXAobygpKSA6IG87XHJcbiAgfSxcclxuXHJcbiAgZGVmZXIoZm4pIHtcclxuICAgIHNldFRpbWVvdXQoZm4sIDApO1xyXG4gIH0sXHJcblxyXG4gIC8qKlxyXG4gICAqIFJldHVybnMgYSBuZXcgZnVuY3Rpb24gdGhhdCBjYW4gYmUgaW52b2tlZCBhdCBtb3N0IG4gdGltZXMuXHJcbiAgICovXHJcbiAgYXRNb3N0KG4sIGZuLCBjb250ZXh0KSB7XHJcbiAgICB2YXIgbSA9IG4sIHJlc3VsdDtcclxuICAgIGZ1bmN0aW9uIGEoKSB7XHJcbiAgICAgIGlmIChuID4gMCkge1xyXG4gICAgICAgIG4tLTtcclxuICAgICAgICByZXN1bHQgPSBmbi5hcHBseShjb250ZXh0IHx8IHRoaXMsIGFyZ3VtZW50cyk7XHJcbiAgICAgIH1cclxuICAgICAgcmV0dXJuIHJlc3VsdDtcclxuICAgIH1cclxuICAgIHJldHVybiBhO1xyXG4gIH0sXHJcblxyXG4gIGlzVW5kLFxyXG5cclxuICAvKipcclxuICAgKiBSZXR1cm5zIGEgbmV3IGZ1bmN0aW9uIHRoYXQgY2FuIGJlIGludm9rZWQgYXQgbW9zdCBvbmNlLlxyXG4gICAqL1xyXG4gIG9uY2UoZm4sIGNvbnRleHQpIHtcclxuICAgIHJldHVybiB0aGlzLmF0TW9zdCgxLCBmbiwgY29udGV4dCk7XHJcbiAgfSxcclxuXHJcbiAgLyoqXHJcbiAgICogUmV0dXJucyBhIG5ldyBmdW5jdGlvbiB0aGF0IGlzIGV4ZWN1dGVkIGFsd2F5cyBwYXNzaW5nIHRoZSBnaXZlbiBhcmd1bWVudHMgdG8gaXQuXHJcbiAgICogUHl0aG9uLWZhc2hpb24uXHJcbiAgKi9cclxuICBwYXJ0aWFsKGZuKSB7XHJcbiAgICB2YXIgc2VsZiA9IHRoaXM7XHJcbiAgICB2YXIgYXJncyA9IHNlbGYudG9BcnJheShhcmd1bWVudHMpO1xyXG4gICAgYXJncy5zaGlmdCgpO1xyXG4gICAgcmV0dXJuIGZ1bmN0aW9uIHBhcnRpYWwoKSB7XHJcbiAgICAgIHZhciBiYXJncyA9IHNlbGYudG9BcnJheShhcmd1bWVudHMpO1xyXG4gICAgICByZXR1cm4gZm4uYXBwbHkoe30sIGFyZ3MuY29uY2F0KGJhcmdzKSk7XHJcbiAgICB9O1xyXG4gIH0sXHJcblxyXG4gIGNsb25lLFxyXG5cclxuICAvKipcclxuICAgKiBSZXR1cm5zIGEgbmV3IGZ1bmN0aW9uIHRoYXQgY2FuIGJlIGZpcmVkIG9ubHkgb25jZSBldmVyeSBuIG1pbGxpc2Vjb25kcy5cclxuICAgKiBUaGUgZnVuY3Rpb24gaXMgZmlyZWQgYWZ0ZXIgdGhlIHRpbWVvdXQsIGFuZCBhcyBsYXRlIGFzIHBvc3NpYmxlLlxyXG4gICAqXHJcbiAgICogQHBhcmFtIGZuOiBmdW5jdGlvblxyXG4gICAqIEBwYXJhbSBtczogbWlsbGlzZWNvbmRzXHJcbiAgICogQHBhcmFtIHthbnl9IGNvbnRleHQ6IGZ1bmN0aW9uIGNvbnRleHQuXHJcbiAgICovXHJcbiAgZGVib3VuY2UoZm4sIG1zLCBjb250ZXh0KSB7XHJcbiAgICB2YXIgaXQ7XHJcbiAgICBmdW5jdGlvbiBkKCkge1xyXG4gICAgICBpZiAoaXQpIHtcclxuICAgICAgICBjbGVhclRpbWVvdXQoaXQpO1xyXG4gICAgICB9XHJcbiAgICAgIHZhciBhcmdzID0gYXJndW1lbnRzLmxlbmd0aCA/IHRvQXJyYXkoYXJndW1lbnRzKSA6IHVuZGVmaW5lZDtcclxuICAgICAgaXQgPSBzZXRUaW1lb3V0KCgpID0+IHtcclxuICAgICAgICBpdCA9IG51bGw7XHJcbiAgICAgICAgZm4uYXBwbHkoY29udGV4dCwgYXJncyk7XHJcbiAgICAgIH0sIG1zKTtcclxuICAgIH1cclxuICAgIHJldHVybiBkO1xyXG4gIH0sXHJcblxyXG4gIC8qKlxyXG4gICAqIEVkaXRzIHRoZSBpdGVtcyBvZiBhbiBhcnJheSBieSB1c2luZyBhIGdpdmVuIGZ1bmN0aW9uLlxyXG4gICAqXHJcbiAgICogQHBhcmFtIHthcnJheX0gYTogYXJyYXkgb2YgaXRlbXMuXHJcbiAgICogQHBhcmFtIHtmdW5jdGlvbn0gZm46IGVkaXRpbmcgZnVuY3Rpb24uXHJcbiAgICovXHJcbiAgcmVhY2goYSwgZm4pIHtcclxuICAgIGlmICghaXNBcnJheShhKSkgdGhyb3cgbmV3IEVycm9yKFwiZXhwZWN0ZWQgYXJyYXlcIik7XHJcbiAgICB2YXIgaXRlbTtcclxuICAgIGZvciAodmFyIGkgPSAwLCBsID0gYS5sZW5ndGg7IGkgPCBsOyBpKyspIHtcclxuICAgICAgaXRlbSA9IGFbaV07XHJcbiAgICAgIGlmIChpc0FycmF5KGl0ZW0pKSB7XHJcbiAgICAgICAgdGhpcy5yZWFjaChpdGVtLCBmbik7XHJcbiAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgYVtpXSA9IGZuKGl0ZW0pO1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgICByZXR1cm4gYTtcclxuICB9LFxyXG5cclxuICAvKipcclxuICAgKiBSZXR1cm5zIGEgdmFsdWUgaW5kaWNhdGluZyB3aGV0aGVyIHRoZSBnaXZlbiBvYmplY3QgaW1wbGVtZW50cyBhbGwgZ2l2ZW4gbWV0aG9kcy5cclxuICAgKi9cclxuICBxdWFja3MobywgbWV0aG9kcykge1xyXG4gICAgaWYgKCFvKSByZXR1cm4gZmFsc2U7XHJcbiAgICBpZiAoIW1ldGhvZHMpIHRocm93IFwibWlzc2luZyBtZXRob2RzIGxpc3RcIjtcclxuICAgIGlmIChpc1N0cmluZyhtZXRob2RzKSkge1xyXG4gICAgICBtZXRob2RzID0gdG9BcnJheShhcmd1bWVudHMpLnNsaWNlKDEsIGFyZ3VtZW50cy5sZW5ndGgpO1xyXG4gICAgfVxyXG4gICAgZm9yICh2YXIgaSA9IDAsIGwgPSBtZXRob2RzLmxlbmd0aDsgaSA8IGw7IGkrKykge1xyXG4gICAgICBpZiAoIWlzRnVuY3Rpb24ob1ttZXRob2RzW2ldXSkpIHtcclxuICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgIH1cclxuICAgIH1cclxuICAgIHJldHVybiB0cnVlO1xyXG4gIH0sXHJcblxyXG4gIC8qKlxyXG4gICAqIFJlcGxhY2VzIHZhbHVlcyBpbiBzdHJpbmdzLCB1c2luZyBtdXN0YWNoZXMuXHJcbiAgICovXHJcbiAgZm9ybWF0KHMsIG8pIHtcclxuICAgIHJldHVybiBzLnJlcGxhY2UoL1xce1xceyguKz8pXFx9XFx9L2csIGZ1bmN0aW9uIChzLCBhKSB7XHJcbiAgICAgIGlmICghby5oYXNPd25Qcm9wZXJ0eShhKSlcclxuICAgICAgICByZXR1cm4gcztcclxuICAgICAgcmV0dXJuIG9bYV07XHJcbiAgICB9KTtcclxuICB9LFxyXG5cclxuICAvKipcclxuICAgKiBQcm94eSBmdW5jdGlvbiB0byBmbiBiaW5kLlxyXG4gICAqL1xyXG4gIGJpbmQoZm4sIG8pIHtcclxuICAgIHJldHVybiBmbi5iaW5kKG8pO1xyXG4gIH0sXHJcblxyXG4gIGlmY2FsbChmbiwgY3R4LCBhcmdzKSB7XHJcbiAgICBpZiAoIWZuKSByZXR1cm47XHJcbiAgICBpZiAoIWFyZ3MpIHtcclxuICAgICAgZm4uY2FsbChjdHgpO1xyXG4gICAgICByZXR1cm47XHJcbiAgICB9XHJcbiAgICBzd2l0Y2ggKGFyZ3MubGVuZ3RoKSB7XHJcbiAgICAgIGNhc2UgMDogZm4uY2FsbChjdHgpOyByZXR1cm47XHJcbiAgICAgIGNhc2UgMTogZm4uY2FsbChjdHgsIGFyZ3NbMF0pOyByZXR1cm47XHJcbiAgICAgIGNhc2UgMjogZm4uY2FsbChjdHgsIGFyZ3NbMF0sIGFyZ3NbMV0pOyByZXR1cm47XHJcbiAgICAgIGNhc2UgMzogZm4uY2FsbChjdHgsIGFyZ3NbMF0sIGFyZ3NbMV0sIGFyZ3NbMl0pOyByZXR1cm47XHJcbiAgICAgIGRlZmF1bHQ6IGZuLmFwcGx5KGN0eCwgYXJncyk7XHJcbiAgICB9XHJcbiAgfSxcclxuXHJcbiAgbGVuLFxyXG5cclxuICBuaWwodikge1xyXG4gICAgcmV0dXJuIHYgPT09IG51bGwgfHwgdiA9PT0gdW5kZWZpbmVkO1xyXG4gIH0sXHJcblxyXG4gIG5pbE9yRW1wdHkodikge1xyXG4gICAgcmV0dXJuIHYgPT09IG51bGwgfHwgdiA9PT0gdW5kZWZpbmVkIHx8IHYgPT09IFwiXCI7XHJcbiAgfVxyXG59O1xyXG4iLCIvKipcclxuICogRGF0YUVudHJ5IHdpdGggYnVpbHQtaW4gRE9NIGNsYXNzZXMuXHJcbiAqIGh0dHBzOi8vZ2l0aHViLmNvbS9Sb2JlcnRvUHJldmF0by9EYXRhRW50cnlcclxuICpcclxuICogQ29weXJpZ2h0IDIwMTksIFJvYmVydG8gUHJldmF0b1xyXG4gKiBodHRwczovL3JvYmVydG9wcmV2YXRvLmdpdGh1Yi5pb1xyXG4gKlxyXG4gKiBMaWNlbnNlZCB1bmRlciB0aGUgTUlUIGxpY2Vuc2U6XHJcbiAqIGh0dHA6Ly93d3cub3BlbnNvdXJjZS5vcmcvbGljZW5zZXMvTUlUXHJcbiAqL1xyXG5pbXBvcnQgRGF0YUVudHJ5IGZyb20gXCIuLi9jb2RlL3NjcmlwdHMvZm9ybXMvZGF0YWVudHJ5XCJcclxuaW1wb3J0IFZhbGlkYXRvciBmcm9tIFwiLi4vY29kZS9zY3JpcHRzL2Zvcm1zL3ZhbGlkYXRpb24vdmFsaWRhdG9yXCJcclxuaW1wb3J0IEZvcm1hdHRlciBmcm9tIFwiLi4vY29kZS9zY3JpcHRzL2Zvcm1zL2Zvcm1hdHRpbmcvZm9ybWF0dGVyXCJcclxuaW1wb3J0IERvbUJpbmRlciBmcm9tIFwiLi4vY29kZS9zY3JpcHRzL2Zvcm1zL2JpbmRpbmcvZG9tYmluZGVyXCJcclxuaW1wb3J0IERvbUhhcnZlc3RlciBmcm9tIFwiLi4vY29kZS9zY3JpcHRzL2Zvcm1zL2hhcnZlc3RpbmcvZG9taGFydmVzdGVyXCJcclxuaW1wb3J0IERvbURlY29yYXRvciBmcm9tIFwiLi4vY29kZS9zY3JpcHRzL2Zvcm1zL2RlY29yYXRpb24vZG9tZGVjb3JhdG9yXCJcclxuaW1wb3J0IHsgQ29uc3RyYWludHMsIGZvcmVzZWVWYWx1ZSB9IGZyb20gXCIuLi9jb2RlL3NjcmlwdHMvZm9ybXMvY29uc3RyYWludHMvcnVsZXNcIlxyXG5cclxuRGF0YUVudHJ5LmNvbmZpZ3VyZSh7XHJcbiAgbWFya2VyOiBEb21EZWNvcmF0b3IsXHJcbiAgaGFydmVzdGVyOiBEb21IYXJ2ZXN0ZXIsXHJcbiAgYmluZGVyOiBEb21CaW5kZXJcclxufSlcclxuXHJcbmlmICh0eXBlb2Ygd2luZG93ICE9IFwidW5kZWZpbmVkXCIpIHtcclxuICB3aW5kb3cuRGF0YUVudHJ5ID0ge1xyXG4gICAgRGF0YUVudHJ5OiBEYXRhRW50cnksXHJcbiAgICBWYWxpZGF0b3I6IFZhbGlkYXRvcixcclxuICAgIEZvcm1hdHRlcjogRm9ybWF0dGVyLFxyXG4gICAgRG9tSGFydmVzdGVyOiBEb21IYXJ2ZXN0ZXIsXHJcbiAgICBEb21EZWNvcmF0b3I6IERvbURlY29yYXRvcixcclxuICAgIERvbUJpbmRlcjogRG9tQmluZGVyLFxyXG4gICAgQ29uc3RyYWludHM6IENvbnN0cmFpbnRzLFxyXG4gICAgdXRpbHM6IHtcclxuICAgICAgZm9yZXNlZVZhbHVlOiBmb3Jlc2VlVmFsdWVcclxuICAgIH1cclxuICB9O1xyXG59XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IHtcclxuICBEYXRhRW50cnksXHJcbiAgVmFsaWRhdG9yLFxyXG4gIEZvcm1hdHRlcixcclxuICBEb21IYXJ2ZXN0ZXIsXHJcbiAgRG9tRGVjb3JhdG9yLFxyXG4gIENvbnN0cmFpbnRzLFxyXG4gIERvbUJpbmRlclxyXG59Il19
