/**
 * Decorator class editing context object.
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


class ContextDecorator {

  /**
   * Creates a new instance of ContextDecorator associated with the given dataentry.
   *
   * @param dataentry: instance of DataEntry.
   */
  constructor(dataentry) {

  }

  /**
   * Disposes of this decorator.
   */
  dispose() {
    
    return this;
  }
}

export default ContextDecorator