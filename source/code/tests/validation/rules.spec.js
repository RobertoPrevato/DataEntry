/**
 * Tests for built-in validation rules.
 * https://github.com/RobertoPrevato/DataEntry
 *
 * Copyright 2018, Roberto Prevato
 * https://robertoprevato.github.io
 *
 * Licensed under the MIT license:
 * http://www.opensource.org/licenses/MIT
 */
import { ValidationRules } from "../../scripts/forms/validation/rules"


describe("Built-in validation rules", () => {

  it("integer must validate integer values", () => {
    // empty values are valid for integer validation rule (doesn't check for required values)
    expect(ValidationRules.integer("", "", false)).toEqual(true);
    expect(ValidationRules.integer("", null, false)).toEqual(true);

    expect(ValidationRules.integer("", "A", false).error).toEqual(true);
    expect(ValidationRules.integer("", "1", false)).toEqual(true);
    expect(ValidationRules.integer("", "10", false)).toEqual(true);

    // values with decimal places are not integer
    expect(ValidationRules.integer("", "12.1", false).error).toEqual(true);
  });

  it("integer must support minimum and maximum parameters", () => {
    expect(ValidationRules.integer("", "10", false, {min: 11}).error).toEqual(true);
    expect(ValidationRules.integer("", "10", false, {max: 11})).toEqual(true);
    expect(ValidationRules.integer("", "12", false, {max: 11}).error).toEqual(true);
    expect(ValidationRules.integer("", "12", false, {min: 9, max: 11}).error).toEqual(true);
    expect(ValidationRules.integer("", "12", false, {min: 9, max: 13})).toEqual(true);
  });

});
