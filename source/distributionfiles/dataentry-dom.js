/**
 * DataEntry with built-in DOM classes.
 * https://github.com/RobertoPrevato/DataEntry
 *
 * Copyright 2017, Roberto Prevato
 * https://robertoprevato.github.io
 *
 * Licensed under the MIT license:
 * http://www.opensource.org/licenses/MIT
 */
import DataEntry from "../code/scripts/forms/dataentry"
import Validator from "../code/scripts/forms/validation/validator"
import Formatter from "../code/scripts/forms/formatting/formatter"
import DomBinder from "../code/scripts/forms/binding/dombinder"
import DomHarvester from "../code/scripts/forms/harvesting/domharvester"
import DomDecorator from "../code/scripts/forms/decoration/domdecorator"
import { Constraints, foreseeValue } from "../code/scripts/forms/constraints/rules"

DataEntry.configure({
  marker: DomDecorator,
  harvester: DomHarvester,
  binder: DomBinder
})

if (typeof window != "undefined") {
  window.DataEntry = {
    DataEntry: DataEntry,
    Validator: Validator,
    Formatter: Formatter,
    DomHarvester: DomHarvester,
    DomDecorator: DomDecorator,
    DomBinder: DomBinder,
    Constraints: Constraints,
    utils: {
      foreseeValue: foreseeValue
    }
  };
}

module.exports = {
  DataEntry,
  Validator,
  Formatter,
  DomHarvester,
  DomDecorator,
  Constraints,
  DomBinder
}