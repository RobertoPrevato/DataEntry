/**
 * DataEntry built-in constraints rules.
 * https://github.com/RobertoPrevato/DataEntry
 *
 * Copyright 2017, Roberto Prevato
 * https://robertoprevato.github.io
 *
 * Licensed under the MIT license:
 * http://www.opensource.org/licenses/MIT
 */
import _ from "../../utils"

const contains = _.contains;

/**
 * Returns a value indicating wether the keys or keys combinations should be always allowed
 */
function permittedCharacters(e, c) {
  //characters or characters combination always permitted
  if (contains([8, 0, 37, 39, 9], c) || (e.ctrlKey && contains([120, 118, 99, 97, 88, 86, 67], c))) return true;
  return false;
}

// shortcut for String.fromCharCode
function stringFromCode(c) {
  return String.fromCharCode(c);
}

// shortcut for string match regex call
function match(s, rx) {
  return s.match(rx);
}

/**
 * Returns the value that a field will have, if the given keypress event goes through.
 * 
 * @param {*} e 
 */
function foreseeValue(e) {
  var a = "selectionStart",
    b = "selectionEnd",
    element = e.target,
    value = element.value,
    c = e.keyCode || e.charCode,
    key = stringFromCode(c),
    selected = value.substr(element[a], element[b]),
    beforeSelection = value.substr(0, element[a]),
    afterSelection = value.substr(element[b], value.length);
  return [beforeSelection, key, afterSelection].join("");
}


const Constraints = {

  // Allows to input only letters
  letters: function (e, c) {
    var c = (e.keyCode || e.charCode), key = stringFromCode(c);
    if (!permittedCharacters(e, c) && !match(key, /[a-zA-Z]/)) return false;
    return true;
  },

  // Allows to input only digits
  digits: function (e, c) {
    var c = (e.keyCode || e.charCode), key = stringFromCode(c);
    if (!permittedCharacters(e, c) && !match(key, /\d/)) return false;
    return true;
  }
};

export { 
  Constraints, 
  foreseeValue, 
  permittedCharacters,
  stringFromCode,
  match
}