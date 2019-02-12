/**
 * Tests for core Formatter class.
 * https://github.com/RobertoPrevato/DataEntry
 *
 * Copyright 2019, Roberto Prevato
 * https://robertoprevato.github.io
 *
 * Licensed under the MIT license:
 * http://www.opensource.org/licenses/MIT
 */

import Formatter from "../../scripts/forms/formatting/formatter"


describe("Formatter", () => {

  it("must format by global rules defined inside Formatter.Rules", () => {
    const a = new Formatter();

    // trim is one of the built-in formatters
    const formatted = a.format(["trim"], "name", "  Hello!  ");
    expect(formatted).toEqual("Hello!")
  })

  it("must support definition of new rules", () => {
    var k = 0;
    Formatter.Rules.ufo = {
      fn: function () {
        return "ufo";
      }
    };

    var a = new Formatter()

    const formatted = a.format(["ufo"], "name", "  Hello!  ");
    expect(formatted).toEqual("ufo")
  })

  it("must support instance specific rules, by dataentry `formatRules` options", () => {
    var a = new Formatter({
      options: {
        formatRules: {
          "1": function (field, value) {
            return "1";
          }
        }
      }
    })

    const formatted = a.format(["1"], "", "badass");
    expect(formatted).toEqual("1")
  })

  it("must support composition of multiple formattings", () => {
    var k = 0;
    Formatter.Rules.a = {
      fn: function (field, value) {
        return value.replace(/a/g, "4");
      }
    };
    Formatter.Rules.b = {
      fn: function (field, value) {
        return value.replace(/s/g, "5"); // badass
      }
    };

    var a = new Formatter()

    const formatted = a.format(["a", "b"], "", "badass");
    expect(formatted).toEqual("b4d455")
  })
})