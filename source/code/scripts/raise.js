/**
 * DataEntry raise function.
 * This function is used to raise exceptions that include a link to the GitHub wiki,
 * providing further information and details.
 * https://github.com/RobertoPrevato/DataEntry
 *
 * Copyright 2017, Roberto Prevato
 * https://robertoprevato.github.io
 *
 * Licensed under the MIT license:
 * http://www.opensource.org/licenses/MIT
 */

/**
 * Raises an exception, offering a link to the GitHub wiki.
 */
export default function raise(err, detail) {
  var message = (detail ? detail : "Error") + ". For further details: https://github.com/RobertoPrevato/DataEntry/wiki/Errors#" + err;
  if (typeof console != "undefined") {
    console.error(message);
  }
  throw new Error(message);
}

/*
----------------------------------------------------
Errors
----------------------------------------------------
1. Missing Promise implementation.
*/
