/**
 * DataEntry with built-in context classes.
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
import ContextHarvester from "../code/scripts/forms/harvesting/contextharvester"
import ContextDecorator from "../code/scripts/forms/decoration/contextdecorator"

DataEntry.configure({
  marker: ContextDecorator,
  harvester: ContextHarvester
})

if (typeof window != "undefined") {
  window.DataEntry = {
    DataEntry: DataEntry,
    Validator: Validator,
    Formatter: Formatter,
    ContextHarvester: ContextHarvester,
    ContextDecorator: ContextDecorator
  };
}

module.exports = {
  DataEntry,
  Validator,
  Formatter,
  ContextHarvester,
  ContextDecorator
}