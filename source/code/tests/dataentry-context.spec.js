/**
 * Tests for DataEntry used with ContextDecorator and ContextHarvester.
 * https://github.com/RobertoPrevato/DataEntry
 *
 * Copyright 2017, Roberto Prevato
 * https://robertoprevato.github.io
 *
 * Licensed under the MIT license:
 * http://www.opensource.org/licenses/MIT
 */
import DataEntry from "../scripts/forms/dataentry"
import ContextHarvester from "../scripts/forms/harvesting/contextharvester"
import ContextDecorator from "../scripts/forms/decoration/contextdecorator"
import _ from "../scripts/utils"
import { raiseSettings } from "../scripts/raise"
import { noReject } from "./tests-utils"

raiseSettings.writeToConsole = false; // for tests


describe("DataEntry with context classes", () => {

  it("must handle context with single property", always => {
    const context = {
      name: "Foo"
    };
    const validationTarget = {};

    const dataentry = new DataEntry({
      marker: ContextDecorator,
      harvester: ContextHarvester,
      schema: {
        name: ["required"]
      },
      context: context,
      validationTarget: validationTarget
    })

    dataentry.validate().then(function (data) {
      expect(data.valid).toEqual(true);
      expect(data.values).toEqual({
        name: "Foo"
      });

      expect(validationTarget).toEqual({
        name: { valid: true }
      })

      always();
    }, noReject(always))
  })

  it("must handle context with single property (invalid value)", always => {
    const context = {
      name: null
    };
    const validationTarget = {};

    const dataentry = new DataEntry({
      marker: ContextDecorator,
      harvester: ContextHarvester,
      schema: {
        name: ["required"]
      },
      context: context,
      validationTarget: validationTarget
    })

    dataentry.validate().then(function (data) {
      expect(data.valid).toEqual(false);
      expect(data.values).toBeUndefined();
      
      expect(validationTarget).toEqual({
        name: { valid: false, error: {message: "required"} }
      })

      always();
    }, noReject(always))
  })
})