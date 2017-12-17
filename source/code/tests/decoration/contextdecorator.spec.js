/**
 * Tests for built-in ContextDecorator class.
 * This class should be used when validation information must be set inside objects.
 * 
 * https://github.com/RobertoPrevato/DataEntry
 *
 * Copyright 2017, Roberto Prevato
 * https://robertoprevato.github.io
 *
 * Licensed under the MIT license:
 * http://www.opensource.org/licenses/MIT
 */
import ContextDecorator from "../../scripts/forms/decoration/contextdecorator"
import _ from "../../scripts/utils"


describe("ContextDecorator", () => {

  it("must mark invalid fields by altering objects", () => {
    const decorator = new ContextDecorator({
      options: {
        validationTarget: {}
      }
    });
    var text = "Hello World";

    // act
    decorator.markFieldInvalid("name", {
      message: text
    })

    // assert
    var validationData = decorator.target.name;
    expect(validationData).toBeDefined();

    expect(validationData).toEqual({
      valid: false,
      error: { message: text }
    });
  })

  it("must set field information by altering objects", () => {
    const decorator = new ContextDecorator({
      options: {
        validationTarget: {}
      }
    });
    var text = "Hello World";

    // act
    decorator.markFieldInfo("name", {
      message: text
    })

    // assert
    var validationData = decorator.target.name;
    expect(validationData).toBeDefined();

    expect(validationData).toEqual({
      valid: true,
      info: { message: text }
    });
  })

  it("must clear field information for valid values", () => {
    const decorator = new ContextDecorator({
      options: {
        validationTarget: {}
      }
    });
    var text = "Hello World";

    // act
    decorator.markFieldInvalid("name", {
      message: text
    })
    decorator.markFieldValid("name");
    
    // assert
    var validationData = decorator.target.name;
    expect(validationData).toBeDefined();

    expect(validationData).toEqual({
      valid: true
    });
  })
})