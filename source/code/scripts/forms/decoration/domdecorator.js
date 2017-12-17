/**
 * Decorator class using HTML elements: the simplest marker possible, displaying information 
 * by injecting or removing simple elements inside the DOM.
 * 
 * https://github.com/RobertoPrevato/DataEntry
 *
 * Copyright 2017, Roberto Prevato
 * https://robertoprevato.github.io
 *
 * Licensed under the MIT license:
 * http://www.opensource.org/licenses/MIT
 */
import _ from "../../../scripts/utils"
import $ from "../../../scripts/dom"
import raise from "../../../scripts/raise"

const each = _.each;
const extend = _.extend;
const isString = _.isString;
const append = $.append;
const addClass = $.addClass;
const removeClass = $.removeClass;
const removeElement = $.remove.bind($);
const next = $.next;
const nextWithClass = $.nextWithClass;
const createElement = $.createElement;
const isRadioButton = $.isRadioButton;
const nameSelector = $.nameSelector;
const findFirst = $.findFirst;
const after = $.after;

// support for explicitly defined targets through data attributes
function checkSpecificTarget(element) {
  var specificTarget = element.dataset.validationTarget;
  if (specificTarget) 
    return document.getElementById(specificTarget);
}
// support for chosen js when marking fields invalid or valid
function checkChosen(element) {
  // fix for chosen selects
  if (!element) return;
  if (/select/i.test(element.tagName) && isHidden(element) && hasClass(element, "chosen-select")) {
    // replace the element with the chosen element
    return next(element);
  }
  return element;
}
// when a field relates to a group, then it make sense to display information only on the first element of the group.
// a common case for this situation are radio buttons: if a value coming from a group of radio buttons is required,
// then it makes sense to display information only on the first one;
function checkGroup(element) {
  if (isRadioButton(element)) {
    // return the last radio button sibling;
    return $.lastSibling(element, sibling => {
      return isRadioButton(sibling);
    }) || $.parent(element);
  }
  return element;
}

function checkElement(element) {
  var specificTarget = checkSpecificTarget(element);
  if (specificTarget)
    return specificTarget;
  
  var re = checkGroup.call(this, element);
  re = checkChosen.call(this, re);
  // support radio and checkboxes before labels (decorate after labels)
  if (/^radio|checkbox$/i.test(element.type)) {
    var nx = next(element);
    if (nx && /label/i.test(nx.tagName) && element.id == attr(nx, "for")) {
      return nx;
    }
  }
  return re;
}


const TOOLTIPS = "tooltips"


class DomDecorator {

  /**
   * Creates a new instance of DomDecorator associated with the given dataentry.
   *
   * @param dataentry: instance of DataEntry.
   */
  constructor(dataentry) {
    this.dataentry = dataentry;
    this.markStyle = dataentry ? dataentry.options.markStyle : TOOLTIPS;
    this._elements = [];
  }

  create(tagname) {
    var el = $.createElement(tagname);
    this._elements.push(el);
    return el;
  }

  /**
   * Gets an element to display validation information about the given field.
   * 
   * @param f
   * @param create
   * @returns {*}
   */
  getMessageElement(f, create, options) {
    var self = this;
    if (self.markStyle == TOOLTIPS) {
      var c = "ug-validation-wrapper",
        l = nextWithClass(f, c);
      if (l)
        return l;
      return create ? self.getTooltipElement(f, create, options) : null;
    }
    var c = "ug-message-element",
      l = nextWithClass(f, c);
    if (l)
      return l;
    if (!create)
      return null;
    l = self.create("span");
    addClass(l, c);
    return l;
  }

  /**
   * Gets the options to display a message on the given field.
   * 
   * @param f
   * @returns {*}
   */
  getOptions(f, options) {
    var de = this.dataentry, 
      schema = de ? de.schema : null,
      fs = schema ? schema[f.name] : null,
      defaults = this.defaults,
      messageOptions = fs ? fs.message : "right";
    if (isString(messageOptions))
      messageOptions = { position: messageOptions };
    return extend({}, defaults, messageOptions, options);
  }

  /**
   * Gets an element that can be styled as tooltip
   * 
   * @param f
   * @param create
   * @returns {*}
   */
  getTooltipElement(f, create, options) {
    var divtag = "div",
      o = this.getOptions(f, options),
      wrapper = this.create(divtag),
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
  }

  /**
   * Sets the text to display in the marker element.
   * 
   * @param marker element
   * @param message
   */
  setElementText(el, message) {
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
  removeMessageElement(f) {
    var self = this;
    f = checkElement.call(self, f);
    var l = self.getMessageElement(f, false);
    if (l)
      removeElement(l);
    return self;
  }

  /**
   * Marks the field in neuter state (no success/no error)
   * 
   * @param f
   * @returns {DomMarker|*}
   */
  markFieldNeutrum(f) {
    var self = this;
    f = checkElement.call(self, f);
    removeClass(f, "ug-field-invalid ug-field-valid");
    return self.removeMessageElement(f);
  }

  /**
   * Marks the given field in valid state
   * 
   * @param f
   * @returns {DomMarker|*}
   */
  markFieldValid(f) {
    var self = this;
    f = checkElement.call(self, f);
    addClass(removeClass(f, "ug-field-invalid"), "ug-field-valid");
    return self.removeMessageElement(f);
  }

  /**
   * Marks a field with some information.
   * 
   * @param {*} f 
   * @param {*} options 
   */
  markField(f, options, css) {
    var self = this;
    f = checkElement.call(self, f);
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
  markFieldInfo(f, options) {
    return this.markField(f, options, "ug-info");
  }

  /**
   * Marks the given field in invalid state
   * 
   * @param f
   * @param options
   * @returns {DomMarker}
   */
  markFieldInvalid(f, options) {
    return this.markField(f, options, "ug-error");
  }

  /**
   * Marks the given field as `touched` by the user
   * 
   * @param f
   * @returns {DomMarker}
   */
  markFieldTouched(f) {
    f = checkElement.call(this, f);
    addClass(f, "ug-touched");
    return this;
  }

  /**
   * Removes all the marker elements created by this DomDecorator.
   */
  removeElements() {
    each(this._elements, element => $.remove(element));
    return this;
  }

  /**
   * Disposes of this decorator.
   */
  dispose() {
    this.dataentry = null;
    this.removeElements();
    return this;
  }
}

DomDecorator.defaults = {
  position: "right"
}

export default DomDecorator