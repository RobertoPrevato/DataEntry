/**
 * Core DataEntry classes.
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

if (typeof window != "undefined") {
  window.DataEntry = {
    DataEntry: DataEntry,
    Validator: Validator,
    Formatter: Formatter
  };
}

module.exports = {
  DataEntry,
  Validator,
  Formatter
}