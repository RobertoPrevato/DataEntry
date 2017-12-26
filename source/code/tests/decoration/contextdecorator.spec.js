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
    decorator.markFieldInfo("name", text)

    // assert
    var validationData = decorator.target.name;
    expect(validationData).toBeDefined();

    expect(validationData).toEqual({
      valid: true,
      info: text
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

  it("must mark invalid fields by altering objects (setter style)", () => {
    var v;
    const decorator = new ContextDecorator({
      options: {
        validationTarget: {
          name: function (value) {
            v = value;
          }
        }
      }
    });
    var text = "Hello World";

    // act
    decorator.markFieldInvalid("name", {
      message: text
    })

    // assert
    var validationData = v;
    expect(validationData).toBeDefined();

    expect(validationData).toEqual({
      valid: false,
      error: { message: text }
    });
  })

  it("must set field information by altering objects (setter style)", () => {
    var v;
    const decorator = new ContextDecorator({
      options: {
        validationTarget: {
          name: function (value) {
            v = value;
          }
        }
      }
    });
    var text = "Hello World";

    // act
    decorator.markFieldInfo("name", text)

    // assert
    var validationData = v;
    expect(validationData).toBeDefined();

    expect(validationData).toEqual({
      valid: true,
      info: text
    });
  })

  it("must clear field information for neutral fields (setter style)", () => {
    var v;
    const decorator = new ContextDecorator({
      options: {
        validationTarget: {
          name: function (value) {
            v = value;
          }
        }
      }
    });
    var text = "Hello World";

    // act
    decorator.markFieldInvalid("name", text)
    decorator.markFieldNeutrum("name")

    // assert
    var validationData = v;
    expect(validationData).toBeUndefined();
  })
  
  it("must clear field information for valid values (setter style)", () => {
    var v;
    const decorator = new ContextDecorator({
      options: {
        validationTarget: {
          name: function (value) {
            v = value;
          }
        }
      }
    });
    var text = "Hello World";

    // act
    decorator.markFieldInvalid("name", {
      message: text
    })
    decorator.markFieldValid("name");
    
    // assert
    expect(v).toBeDefined();
    expect(v).toEqual({
      valid: true
    });
  })
})