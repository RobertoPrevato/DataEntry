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
import DomBinder from "./scripts/forms/binding/dombinder"
import DomHarvester from "./scripts/forms/harvesting/domharvester"
import DomDecorator from "./scripts/forms/decoration/domdecorator"
import { Constraints, foreseeValue } from "./scripts/forms/constraints/rules"


const FormsDom = {
  DomBinder: DomBinder,
  DomHarvester: DomHarvester,
  DomDecorator: DomDecorator,
  Constraints: Constraints,
  foreseeValue: foreseeValue
};

if (typeof "module" !== undefined) {
  module.export = FormsDom;
}