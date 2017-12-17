/**
 * Decorator class editing context objects.
 * https://github.com/RobertoPrevato/DataEntry
 *
 * Copyright 2017, Roberto Prevato
 * https://robertoprevato.github.io
 *
 * Licensed under the MIT license:
 * http://www.opensource.org/licenses/MIT
 */
import _ from "../../../scripts/utils"
import raise from "../../../scripts/raise"


function setInObject(obj, name, value) {
  if (_.isFunction(obj[name])) {
    // setter style (e.g. Knockout)
    obj[name](value);
  } else {
    // simply set
    obj[name] = value;
  }
}


class ContextDecorator {

  /**
   * Creates a new instance of ContextDecorator associated with the given dataentry.
   *
   * @param dataentry: instance of DataEntry.
   */
  constructor(dataentry) {
    if (!dataentry)
      raise(17, "missing context for ContextDecorator (constructor parameter)")
    
    var options = dataentry.options || {};
    var obj = options.validationTarget || dataentry.context;
    if (!obj)
      raise(17, "missing context for ContextDecorator")

    this.target = obj;
  }

  markFieldNeutrum(name) {
    setInObject(this.target, name, undefined);
  }

  markFieldInvalid(name, error) {
    setInObject(this.target, name, { valid: false, error: error });
  }

  markFieldValid(name) {
    setInObject(this.target, name, { valid: true });
  }

  markFieldInfo(name, message) {
    setInObject(this.target, name, { valid: true, info: message });
  }

  /**
   * Disposes of this decorator.
   */
  dispose() {
    this.target = null;
    return this;
  }
}

export default ContextDecorator