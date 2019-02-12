/**
 * Harvester class operating on context objects.
 * https://github.com/RobertoPrevato/DataEntry
 *
 * Copyright 2019, Roberto Prevato
 * https://robertoprevato.github.io
 *
 * Licensed under the MIT license:
 * http://www.opensource.org/licenses/MIT
 */
import _ from "../../../scripts/utils"
import { raise } from "../../../scripts/raise"


function getFromObject(obj, name) {
  if (_.isFunction(obj[name])) {
    // getter style (e.g. Knockout)
    return obj[name]();
  }
  // simply get
  return obj[name];
}


function setInObject(obj, name, value) {
  if (_.isFunction(obj[name])) {
    // setter style (e.g. Knockout)
    obj[name](value);
  } else {
    // simply set
    obj[name] = value;
  }
}


class ContextHarvester {

  /**
   * Creates a new instance of ContextHarvester associated with the given dataentry.
   *
   * @param dataentry: instance of DataEntry.
   */
  constructor(dataentry) {
    if (!dataentry)
      raise(17, "missing context for ContextHarvester (constructor parameter)")
    
    var options = dataentry.options || {};
    var obj = options.sourceObject || dataentry.context;
    if (!obj)
      raise(18, "missing 'context' or 'sourceObject' for ContextHarvester")

    this.dataentry = dataentry;
    this.source = obj;
  }

  dispose() {
    this.dataentry = null;
    this.source = null;
    return this;
  }

  getValues() {
    var self = this,
      schema = self.dataentry.schema,
      keys = _.keys(schema),
      values = {};
    
    for (let x in schema) {
      values[x] = getFromObject(this.source, x);
    }

    return values;
  }

  setValue(name, value) {
    setInObject(this.source, name, value);
  }

  getValue(name) {
    return getFromObject(this.source, name);
  }
}

export default ContextHarvester