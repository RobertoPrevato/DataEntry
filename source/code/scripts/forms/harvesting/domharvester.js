/**
 * Harvester class operating on HTML elements.
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
import { raise } from "../../../scripts/raise"

const first = _.first;
const each = _.each;
const any = _.any;
const len = _.len;
const isRadioButton = $.isRadioButton;
const isCheckbox = $.isCheckbox;
const getValue = $.getValue;


class DomHarvester {
  /**
   * Creates a new instance of DomHarvester associated with the given dataentry.
   *
   * @param dataentry: instance of DataEntry.
   */
  constructor(dataentry) {
    if (!dataentry)
      raise(2, "missing 'dataentry' for DomHarvester");

    var element = dataentry.element;
    if (!element)
      // requires a configured element for the dataentry
      raise(8, "missing 'element' in dataentry. Specify an HTML element for the dataentry, in order to use the DomHarvester");

    this.dataentry = dataentry;
    this.element = element;
  }

  /**
   * Sets the values using the given object.
   * 
   * @param {object} context 
   */
  setValues(context) {
    for (let x in context) {
      this.setValue(x, context[x]);
    }
  }

  /**
   * Returns the fields by name.
   * 
   * @param {*} name 
   */
  getFields(name) {
    return $.find(this.element, $.nameSelector(name))
  }

  /**
   * Get all values for the underlying dataentry, depending on its schema and DOM element.
   */
  getValues() {
    return this.getValuesFromElement(this.element);
  }

  getElements(name) {
    return $.find(this.element, $.nameSelector(name));
  }

  setValue(field, value) {
    if (_.isString(field)) {
      field = this.getElements(field); // multiple elements may be returned
      if (field.length == 1) {
        field = field[0];
      }
    }
    return $.setValue(field, value);
  }

  getValue(field) {
    if (!field) raise(12);
    // handle groups of radio or checkboxes, too
    if (_.isString(field) || isRadioButton(field) || this.isCheckboxInGroup(field))
      return this.getValueFromElements(this.getElements(field));

    return getValue(field);
  }

  isCheckboxInGroup(el) {
    return isCheckbox(el) && len($.find(this.element, $.nameSelector(el))) > 1;
  }

  getKeys() {
    var schema = this.dataentry.schema;
    return _.keys(schema);
  }

  /**
   * Gets all the values from all input with a specified name, in form of key-value pair dictionary.
   * Elements with class 'ug-silent' are discarded.
   * @param el HTML element
   * @returns {object}
   */
  getValuesFromElement(element) {
    var self = this,
      element = self.element,
      keys = self.getKeys(),
      values = {};

    // the schema has properties that should match `name` attributes of input elements (like in classic HTML)
    each(keys, key => {
      // get elements by matching name attribute
      var elementsWithMatchingName = $.find(element, $.nameSelector(key)),
        k = _.len(elementsWithMatchingName);

      if (k) {
        values[key] = self.getValueFromElements(elementsWithMatchingName);
      } else {
        values[key] = undefined;
      }
    })

    return values;
  }

  /**
   * Returns a single value from a list of elements.
   * 
   * @param {NodeList} elements 
   */
  getValueFromElements(elements) {
    var count = len(elements);
    if (count > 1) {
      // multiple elements

      // handle group of radio buttons:
      if (isRadioButton(elements[0])) {
        // throw exception if any element is not a radio button:
        if (any(elements, el => {
          return !isRadioButton(el);
        })) raise(19, `DOM contains input elements with name "${$.attrName(elements[0])}" and different type`);

        var checked = first(elements, o => {
          return o.checked;
        });
        return checked ? checked.value : undefined;
      }

      // handle groups of checkboxes
      if (isCheckbox(elements[0])) {
        var v = [];
        each(elements, o => {
          // throw exception if any element is not a radio button:
          if (!isCheckbox(o))
            raise(19, `DOM contains input elements with name "${$.attrName(elements[0])}" and different type`);

          if (o.checked) {
            v.push($.attr(o, "value"));
          }
        });
        return v;
      }

      // handle other kinds of elements;
      var v = [];
      each(elements, o => {
        var elementValue = getValue(o);

        // add the value only if not empty
        if (!_.nilOrEmpty(elementValue))
          v.push(elementValue);
      });
      return v;
    }
    return count ? getValue(elements[0]) : undefined;
  }

  dispose() {
    this.dataentry = null;
    this.element = null;
    return this;
  }
}

export default DomHarvester;