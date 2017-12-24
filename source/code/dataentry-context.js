/**
 * DataEntry DOM classes.
 * https://github.com/RobertoPrevato/DataEntry
 *
 * Copyright 2017, Roberto Prevato
 * https://robertoprevato.github.io
 *
 * Licensed under the MIT license:
 * http://www.opensource.org/licenses/MIT
 */
import ContextHarvester from "./scripts/forms/harvesting/contextharvester"
import ContextDecorator from "./scripts/forms/decoration/contextdecorator"


const FormsContext = {
  ContextHarvester: ContextHarvester,
  ContextDecorator: ContextDecorator
};

if (typeof "module" !== undefined) {
  module.export = FormsContext;
}