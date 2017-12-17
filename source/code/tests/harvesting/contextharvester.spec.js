/**
 * Tests for built-in ContextHarvester class.
 * 
 * https://github.com/RobertoPrevato/DataEntry
 *
 * Copyright 2017, Roberto Prevato
 * https://robertoprevato.github.io
 *
 * Licensed under the MIT license:
 * http://www.opensource.org/licenses/MIT
 */
import ContextHarvester from "../../scripts/forms/harvesting/contextharvester"
import _ from "../../scripts/utils"

describe("ContextHarvester", () => {

  it("must get values depending on dataentry schema", () => {
    var harvester = new ContextHarvester({
      schema: {
        name: []
      },
      context: {
        name: "Zenyatta",
        somethingNotInSchema: false
      }
    });

    var values = harvester.getValues();
    expect(values).toEqual({
      name: "Zenyatta"
    })
  })

  it("must get values depending on dataentry schema (multiple properties)", () => {
    var harvester = new ContextHarvester({
      schema: {
        name: [],
        foo: [],
        asd: []
      },
      context: {
        name: "Zenyatta",
        foo: 1000,
        asd: true,
        somethingNotInSchema: false
      }
    });

    var values = harvester.getValues();
    expect(values).toEqual({
      name: "Zenyatta",
      foo: 1000,
      asd: true
    })
  })

  it("must get values depending on dataentry schema (getter style)", () => {
    var harvester = new ContextHarvester({
      schema: {
        name: []
      },
      context: {
        name: function () {
          return "Zenyatta";
        }
      }
    });

    var values = harvester.getValues();
    expect(values).toEqual({
      name: "Zenyatta"
    })
  })

  it("must give precedence to a sourceObject, if specified", () => {
    var harvester = new ContextHarvester({
      schema: {
        name: []
      },
      context: {
        name: "Zenyatta"
      },
      options: {
        sourceObject: {
          name: "Junkrat"
        }
      }
    });

    var values = harvester.getValues();
    expect(values).toEqual({
      name: "Junkrat"
    })
  })

})