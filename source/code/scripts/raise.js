/**
 * DataEntry raise function.
 * This function is used to raise exceptions that include a link to the GitHub wiki,
 * providing further information and details.
 * https://github.com/RobertoPrevato/DataEntry
 *
 * Copyright 2018, Roberto Prevato
 * https://robertoprevato.github.io
 *
 * Licensed under the MIT license:
 * http://www.opensource.org/licenses/MIT
 */

const raiseSettings = {
  writeToConsole: true
};

/**
 * Raises an exception, offering a link to the GitHub wiki.
 * https://github.com/RobertoPrevato/DataEntry/wiki/Errors
 */
function raise(err, detail) {
  var message = (detail ? detail : "Error") + ". For further details: https://github.com/RobertoPrevato/DataEntry/wiki/Errors#" + err;
  if (raiseSettings.writeToConsole && typeof console != "undefined") {
    console.error(message);
  }
  throw new Error(message);
}

export { raise, raiseSettings }