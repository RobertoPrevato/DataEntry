/**
 * DataEntry main object.
 * https://github.com/RobertoPrevato/DataEntry
 *
 * Copyright 2017, Roberto Prevato
 * https://robertoprevato.github.io
 *
 * Licensed under the MIT license:
 * http://www.opensource.org/licenses/MIT
 */
import DataEntry from "./dataentry"
import Validator from "./validation/validator"
import Formatter from "./formatting/formatter"


const Forms = {
  DataEntry: DataEntry,
  Validator: Validator,
  Formatter: Formatter
};

export default Forms;