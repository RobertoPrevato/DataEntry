/**
 * Tests for core Formatter class.
 * https://github.com/RobertoPrevato/DataEntry
 *
 * Copyright 2017, Roberto Prevato
 * https://robertoprevato.github.io
 *
 * Licensed under the MIT license:
 * http://www.opensource.org/licenses/MIT
 */

import Formatter from "../scripts/forms/formatting/formatter"


describe("Formatter", () => {

  it("must format values by rule names", () => {
    const a = new Formatter();

    const formatted = a.format(["trim"], "name", "  Hello!  ");

    expect(formatted).toEqual("Hello!")
  })
})