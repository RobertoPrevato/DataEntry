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
const OBJECT = "object",
  STRING = "string",
  NUMBER = "number",
  FUNCTION = "function",
  REP = "replace";
import _ from "../scripts/utils.js";

const len = _.len;
const any = _.any;
const each = _.each;

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
    for (var i = 0, l = len(n); i < l; i ++) {
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
function setAttr(el, o) {
  for (let x in o) {
    el.setAttribute(x, o[x]);
  }
}
function nameSelector(el) {
  return "[name='" + (_.isString(el) ? el : attrName(el)) + "']";
}
function isPassword(o) {
  return isInput(o) && attr(o, "type") == "password";
}
const isIE = /Trident\/|MSIE/.test(window.navigator.userAgent);

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
      each(el.querySelectorAll("option"), o => {
        if (o.selected)
          v.push(o.value);
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
    if (fn(nx))
      break;
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
  return (style.display == "none" || style.visibility == "hidden");
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
  return (
    typeof HTMLElement === OBJECT ? o instanceof HTMLElement : //DOM2
    o && typeof o === OBJECT && o !== null && o.nodeType === 1 && typeof o.nodeName === STRING
  );
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
const DOT = ".";

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

const HANDLERS = [];

export default {

  splitNamespace,

  /**
   * Empties an element, removing all its children elements and event handlers.
   */
  empty(node) {
    while (node.hasChildNodes()) {
      // remove event handlers on the child, about to be removed:
      this.off(node.lastChild);
      node.removeChild(node.lastChild);
    }
  },

  /**
   * Removes an element, with all event handlers.
   */
  remove(a) {
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
  closest(el, predicate, excludeItself) {
    if (!el || !predicate) return;
    if (!excludeItself) {
      if (predicate(el)) return el;
    }
    var o, parent = el;
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
  closestWithTag(el, tagName, excludeItself) {
    if (!tagName) return;
    tagName = tagName.toUpperCase();
    return this.closest(el, el => {
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
  closestWithClass(el, className, excludeItself) {
    if (!className) return;
    return this.closest(el, el => hasClass(el, className), excludeItself);
  },

  /**
   * Returns a value indicating whether the a node contains another node.
   *
   * @param a: containing node
   * @param b: node to be checked for containment
   */
  contains(a, b) {
    if (!a || !b) return false
    if (!a.hasChildNodes()) return false;
    var children = a.childNodes, l = children.length;
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
  on(element, type, selector, callback) {
    if (!isElement(element))
      // element could be a text element or a comment
      throw new Error("argument is not a DOM element.");
    if (_.isFunction(selector) && !callback) {
      callback = selector;
      selector = null;
    }
    var $ = this;
    var parts = splitNamespace(type);
    var eventName = parts[0], ns = parts[1];
    var listener = (e) => {
      var m = e.target;
      if (selector) {
        var targets = find(element, selector);
        if (any(targets, (o) => { return e.target === o || $.contains(o, e.target); })) {
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
  off(element, type) {
    const toRemove = [];
    if (!isElement(element))
      // element could be a text element or a comment
      return;
    if (type) {
      if (type[0] === DOT) {
        // unset event listeners by namespace
        var ns = type.substr(1);
        each(HANDLERS, (o) => {
          // remove the event handler
          if (o.el === element && o.ns == ns) {
            o.el.removeEventListener(o.ev, o.fn, true);
            toRemove.push(o);
          }
        });
      } else {
        // check namespace
        var parts = splitNamespace(type);
        var eventName = parts[0], ns = parts[1];
        each(HANDLERS, (o) => {
          if (o.el === element && o.ev == eventName && (!ns || o.ns == ns)) {
            // remove the event handler
            o.el.removeEventListener(o.ev, o.fn, true);
            toRemove.push(o);
          }
        });
      }
    } else {
      each(HANDLERS, (o) => {
        if (o.el === element) {
          // remove the event handler
          o.el.removeEventListener(o.ev, o.fn, true);
          toRemove.push(o);
        }
      });
    }
    // remove event handlers
    _.removeItems(HANDLERS, toRemove);
  },

  /**
   * Expose event handlers singleton, for debugging and testing purpose.
   */
  eventHandlers() {
    return HANDLERS;
  },

  /**
   * Removes all active event handlers.
   */
  offAll() {
    var self = this, element;
    each(HANDLERS, (o) => {
      element = o.el;
      element.removeEventListener(o.ev, o.fn, true);
    });
    while (HANDLERS.length) {
      HANDLERS.pop();
    }
    return self;
  },

  fire,

  /**
   * Returns the siblings of the given element.
   *
   * @param el: element of which to get the siblings.
   */
  siblings(el, allNodes) {
    var parent = expectParent(el);
    var a = [], children = parent[allNodes ? "childNodes" : "children"];
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
  nextSiblings(el, allNodes) {
    var parent = expectParent(el);
    var a = [], children = parent[allNodes ? "childNodes" : "children"], include = false;
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
  prevSiblings(el, allNodes) {
    var parent = expectParent(el);
    var a = [], children = parent[allNodes ? "childNodes" : "children"];
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
  findByClass(el, name) {
    return el.getElementsByClassName(name);
  },

  isFocused,

  getFocusedElement,

  /**
   * Returns a value indicating whether there is any input element currently focused.
   */
  anyInputFocused() {
    var a = this.getFocusedElement();
    return a && /input|select|textarea/i.test(a.tagName);
  },

  prev,

  next,

  append,

  addClass,

  removeClass,

  modClass,

  attr,

  hasClass,

  after,

  createElement,

  isElement,

  isInput,

  isAnyInput,

  isSelectable,

  isRadioButton,

  isCheckbox,

  isPassword,

  attrName,

  isHidden,

  find,

  findFirst,

  findFirstByClass,

  getValue,

  setValue,

  setAttr,

  nextWithClass,

  nameSelector,

  lastSibling,

  parent
};
