/**
 * Tests for built-in DomBinder class.
 * Use `npm run karchrome` to debug and see a visual representation of these tests.
 * 
 * https://github.com/RobertoPrevato/DataEntry
 *
 * Copyright 2019, Roberto Prevato
 * https://robertoprevato.github.io
 *
 * Licensed under the MIT license:
 * http://www.opensource.org/licenses/MIT
 */

import DomBinder from "../../scripts/forms/binding/dombinder"
import DataEntry from "../../scripts/forms/dataentry"
import DomHarvester from "../../scripts/forms/harvesting/domharvester"
import DomDecorator from "../../scripts/forms/decoration/domdecorator"
import _ from "../../scripts/utils"
import $ from "../../scripts/dom"
import { noReject, wait } from "../tests-utils"

//#region useful functions

const section = $.createElement("section");
$.setAttr(section, {"class": "tests-section"})
section.innerHTML = "<h2>DomBinder tests</h2>"
document.body.appendChild(section);

function arrange(innerHtml, comment) {
  var wrapper = $.createElement("div")
  $.setAttr(wrapper, {
    "id": _.uniqueId(),
    "class": "test-wrapper"
  });
  wrapper.innerHTML = comment ? `<h2 class="info">${comment}</h2>` + innerHtml : innerHtml;
  section.appendChild(wrapper);
  return wrapper;
}

//#endregion

describe("DomBinder", () => {

  it("must obtain validation event definition by schema", () => {
    var binder = new DomBinder({
      schema: {
        foo: ["required"],
        ufo: ["none"]
      },
      options: {},
      element: true
    });
    var ev = binder.getValidationDefinition();

    expect(ev).toBeDefined();
    expect(ev).toEqual({
      "blur [name='foo']": "validation_foo",
      "blur [name='ufo']": "validation_ufo"
    });
  })

  it("must support validationEvent option", () => {
    var binder = new DomBinder({
      schema: {
        foo: ["required"],
        ufo: ["none"]
      },
      options: {
        validationEvent: "keyup"
      },
      element: true
    });
    var ev = binder.getValidationDefinition();

    expect(ev).toBeDefined();
    expect(ev).toEqual({
      "keyup [name='foo']": "validation_foo",
      "keyup [name='ufo']": "validation_ufo"
    });
  })

  it("must support global validationEvent option", () => {
    DomBinder.validationEvent = "keyup";

    var binder = new DomBinder({
      schema: {
        foo: ["required"],
        ufo: ["none"]
      },
      options: {
        
      },
      element: true
    });
    var ev = binder.getValidationDefinition();

    expect(ev).toBeDefined();
    expect(ev).toEqual({
      "keyup [name='foo']": "validation_foo",
      "keyup [name='ufo']": "validation_ufo"
    });

    DomBinder.validationEvent = "blur";
  })

  it("must support rule validationEvent option", () => {
    var binder = new DomBinder({
      schema: {
        foo: ["required"],
        ufo: { 
          validation: ["none"], 
          validationEvent: "blur" 
        }
      },
      options: {
        validationEvent: "keyup"
      },
      element: true
    });
    var ev = binder.getValidationDefinition();

    expect(ev).toBeDefined();
    expect(ev).toEqual({
      "keyup [name='foo']": "validation_foo",
      "blur [name='ufo']": "validation_ufo"
    });
  })

  it("must support multiple events for validationEvent option", () => {
    var binder = new DomBinder({
      schema: {
        foo: ["required"],
        ufo: { 
          validation: ["none"], 
          validationEvent: "blur, custom" 
        }
      },
      options: {},
      element: true
    });
    var ev = binder.getValidationDefinition();

    expect(ev).toBeDefined();
    expect(ev).toEqual({
      "blur [name='foo']": "validation_foo",
      "custom [name='ufo']": "validation_ufo",
      "blur [name='ufo']": "validation_ufo"
    });
  })

  it("must support extra events definition", () => {
    const handler = function () {}
    var binder = new DomBinder({
      schema: {
        foo: ["required"],
        ufo: { 
          validation: ["none"], 
          validationEvent: "blur" 
        }
      },
      options: {
        events: {
          "change #foo": handler
        }
      },
      element: true
    });
    var ev = binder.getEvents();

    expect(ev).toBeDefined();
    expect(ev["change #foo"]).toBeDefined();
    expect(ev["change #foo"]).toEqual(handler);
  })

  it("must obtain pre formatting (on focus) event definition by schema", () => {
    var binder = new DomBinder({
      schema: {
        foo: {
          preformat: ["removeZeroes"]
        },
        ufo: {
          preformat: ["removeZeroes"]
        }
      },
      options: {},
      validator: { ev: "blur" },
      element: true
    });
    var ev = binder.getPreFormattingDefinition();
    expect(ev).toBeDefined();
    expect(ev).toEqual({
      "focus [name='foo']": "preformat_foo",
      "focus [name='ufo']": "preformat_ufo"
    });
  })

  it("must obtain constraints event definition by schema", () => {
    var binder = new DomBinder({
      schema: {
        foo: ["digits"]
      },
      options: {
        useImplicitConstraints: true
      },
      validator: { ev: "blur" },
      element: true
    });
    var ev = binder.getConstraintsDefinition();
    expect(ev).toBeDefined();
    expect(ev).toEqual({
      "keypress [name='foo']": "constraint_foo"
    });
  })

  it("must support disabling implicit constraints by configuration", () => {
    var binder = new DomBinder({
      schema: {
        foo: ["digits"]
      },
      options: {
        useImplicitConstraints: false
      },
      validator: { ev: "blur" },
      element: true
    });
    var ev = binder.getConstraintsDefinition();

    expect(ev).toBeDefined();
    expect(ev).toEqual({});
  })

  it("must fire validation on blur", always => {
    var wrapper = arrange(`
    <input name="name" type="text" />
    `, "validation on blur");

    const dataentry = new DataEntry({
      element: wrapper,
      marker: DomDecorator,
      harvester: DomHarvester,
      binder: DomBinder,
      schema: {
        name: ["required"]
      }
    })
    // activate validation:
    dataentry.validationActive = true;

    const input = wrapper.querySelector("input");

    $.fire(input, "blur");

    // the field must be marked as invalid:
    wait().then(() => {
      expect($.hasClass(input, "ug-field-invalid")).toEqual(true);
      expect($.hasClass(input, "ug-field-valid")).toEqual(false);
      
      // set value of the input;
      input.value = "Got a value";

      $.fire(input, "blur");

      return wait();
    }).then(() => {
      expect($.hasClass(input, "ug-field-invalid")).toEqual(false);
      expect($.hasClass(input, "ug-field-valid")).toEqual(true);
      always();
    })
  })

  it("must fire formatting after successful validation", always => {
    var wrapper = arrange(`
    <input name="name" type="text" maxlength="3" />
    `, "formatting on focus and on blur");

    const dataentry = new DataEntry({
      element: wrapper,
      marker: DomDecorator,
      harvester: DomHarvester,
      binder: DomBinder,
      schema: {
        name: {
          validation: ["required"],
          format: [{ name: "zero-fill", length: 3 }],
          preformat: ["zero-unfill"]
        }
      }
    })
    // activate validation:
    dataentry.validationActive = true;

    const input = wrapper.querySelector("input");
    input.value = "7";
    $.fire(input, "blur");

    // the field must be marked as invalid:
    wait().then(() => {
      const v = input.value;
      expect(v).toEqual("007");

      always();
    })
  })

  it("must activate dataentry validation after user interaction", always => {
    var wrapper = arrange(`
    <input name="name" type="text" />
    `, "activation callback");

    const dataentry = new DataEntry({
      element: wrapper,
      marker: DomDecorator,
      harvester: DomHarvester,
      binder: DomBinder,
      schema: {
        name: ["required"]
      }
    })
    const input = wrapper.querySelector("input");

    $.fire(input, "keypress");

    // the field must be marked as invalid:
    wait().then(() => {
      expect(dataentry.validationActive).toEqual(true);
      always();
    });
  })

  it("must activate dataentry validation after change event (select)", always => {
    var wrapper = arrange(`
    <select name="name">
      <option value="A">A</option>
      <option value="B">B</option>
      <option value="C">C</option>
    </select>
    `, "activation callback (change select)");

    const dataentry = new DataEntry({
      element: wrapper,
      marker: DomDecorator,
      harvester: DomHarvester,
      binder: DomBinder,
      schema: {
        name: ["required"]
      }
    })
    const input = wrapper.querySelector("select");

    $.fire(input, "change");

    // the field must be marked as invalid:
    wait().then(() => {
      expect(dataentry.validationActive).toEqual(true);
      always();
    });
  })

  it("must activate dataentry validation after change event (radio buttons)", always => {
    var wrapper = arrange(`
    <input type="radio" name="side" value="dark" />
    <input type="radio" name="side" value="light" />
    `, "activation callback (radio buttons)");

    const dataentry = new DataEntry({
      element: wrapper,
      marker: DomDecorator,
      harvester: DomHarvester,
      binder: DomBinder,
      schema: {
        side: ["required"]
      }
    })
    const input = wrapper.querySelector("[value='dark']");

    $.fire(input, "change");

    // the field must be marked as invalid:
    wait().then(() => {
      expect(dataentry.validationActive).toEqual(true);
      always();
    });
  })

  it("must activate dataentry validation after change event (group of checkboxes)", always => {
    var wrapper = arrange(`
    <div id="letters-wrapper">
      <label>A <input type="checkbox" name="letters" value="a" /></label><br />
      <label>B <input type="checkbox" name="letters" value="b" /></label><br />
      <label>C <input type="checkbox" name="letters" value="c" /></label><br />
      <label>D <input type="checkbox" name="letters" value="d" /></label><br />
    </div>
    `, "activation callback (radio buttons)");

    const dataentry = new DataEntry({
      element: wrapper,
      marker: DomDecorator,
      harvester: DomHarvester,
      binder: DomBinder,
      schema: {
        letters: ["required"]
      }
    })
    const input = wrapper.querySelector("[value='a']");

    $.fire(input, "change");

    // the field must be marked as invalid:
    wait().then(() => {
      expect(dataentry.validationActive).toEqual(true);
      always();
    });
  })

  it("must fire pre format fields on focus", always => {
    var wrapper = arrange(`
    <input name="name" type="text" maxlength="3" value="007" />
    `, "formatting on focus (pre formatting)");

    const dataentry = new DataEntry({
      element: wrapper,
      marker: DomDecorator,
      harvester: DomHarvester,
      binder: DomBinder,
      schema: {
        name: {
          validation: ["required"],
          format: ["zero-fill"],  // on blur, adds zeroes
          preformat: ["zero-unfill"] // on focus, removes zeroes
        }
      }
    })
    // activate validation:
    dataentry.validationActive = true;

    const input = wrapper.querySelector("input");
    $.fire(input, "focus");

    // the field must be marked as invalid:
    wait().then(() => {
      const v = input.value;
      expect(v).toEqual("7");

      $.fire(input, "blur");

      return wait();
    }).then(() => {
      const v = input.value;
      expect(v).toEqual("007");

      always();
    });
  })

  it("must fire constraint rules on keypress", always => {
    var wrapper = arrange(`
    <input name="foo" type="text" maxlength="3" />
    `, "constraints on keypress (digits only)");

    const dataentry = new DataEntry({
      element: wrapper,
      marker: DomDecorator,
      harvester: DomHarvester,
      binder: DomBinder,
      schema: {
        foo: {
          validation: ["digits"]
        }
      }
    })
    // activate validation:
    dataentry.validationActive = true;
    // requires manual testing
    always();
  })

  it("must handle group of input elements", always => {
    var wrapper = arrange(`
    <form method="post" action="?" action="?" autocomplete="off">
      <fieldset>
        <legend>Basic example</legend>
        <label>Username</label>
        <input type="text" name="name" /><br />
        <label>Year (between 1900 and 2015)</label>
        <input type="text" name="year" />
        <br />
        <label>A field that is not required, but accepts only letters</label>
        <input type="text" name="only-letters" /><br />
        <label>Favored food</label>
        <select name="favored-food">
          <option></option>
          <optgroup label="Salty">
            <option value="pizza">Pizza</option>
            <option value="noodles">Noodles</option>
            <option value="asado">Asado</option>
            <option value="sushi">Sushi</option>
          </optgroup>
          <optgroup label="Sweets">
            <option value="cheese-cake">Cheese cake</option>
            <option value="chocolate">Chocolate</option>
            <option value="marmalade">Marmalade</option>
          </optgroup>
        </select><br />
        <label>Light side of the force:</label>
        <input type="radio" value="light" name="force-side" /><br />
        <label>Dark side of the force:</label>
        <input type="radio" value="dark" name="force-side" /><br />
        <label class="inline">A checkbox that must be checked (policy acceptance)</label>
        <input type="checkbox" name="policy-read" /><br />
      </fieldset>
    </form>
    <button class="validation-trigger">Validate</button>
    `, "group of elements with binder (2)");

    const dataentry = new DataEntry({
      element: wrapper,
      marker: DomDecorator,
      harvester: DomHarvester,
      binder: DomBinder,
      schema: {
        name: {
          validation: ["required"],
          format: ["cleanSpaces"]
        },
        year: {
          validation: ["required", { name: "integer", params: [{ min: 1900, max: 2015 }] }]
        },
        "only-letters": {
          validation: ["letters"]
        },
        "policy-read": {
          validation: ["mustCheck"]
        },
        "favored-food": {
          validation: ["required"]
        },
        "force-side": {
          validation: ["required"]
        }
      }
    })

    // to test manually the focusing of first invalid element:
    $.on(wrapper, "click", ".validation-trigger", function () {
      dataentry.validate();
    })

    dataentry.validate().then(function (data) {
      expect(data.valid).toEqual(false);
      expect(data.errors).toBeDefined();
      expect(data.errors.length).toEqual(6);
      always();
    }, noReject(always))
  })
})