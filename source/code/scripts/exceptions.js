/**
 * Proxy functions to raise exceptions.
 * https://github.com/RobertoPrevato/DataEntry
 *
 * Copyright 2019, Roberto Prevato
 * https://robertoprevato.github.io
 *
 * Licensed under the MIT license:
 * http://www.opensource.org/licenses/MIT
 */
const NO_PARAM = "???"

function ArgumentNullException(name) {
  throw new Error("The parameter cannot be null: " + (name || NO_PARAM))
}

function ArgumentException(details) {
  throw new Error("Invalid argument: " + (details || NO_PARAM))
}

function TypeException(name, expectedType) {
  throw new Error("Expected parameter: " + (name || NO_PARAM) + " of type: " + (type || NO_PARAM))
}

function OperationException(desc) {
  throw new Error("Invalid operation: " + desc);
}

export {
  ArgumentException,
  ArgumentNullException,
  TypeException,
  OperationException
}
