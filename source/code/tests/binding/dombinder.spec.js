/**
 * Tests for built-in DomBinder class.
 * Use `npm run karchrome` to debug and see a visual representation of these tests.
 * 
 * https://github.com/RobertoPrevato/DataEntry
 *
 * Copyright 2017, Roberto Prevato
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
      validator: { ev: "blur" },
      element: true
    });
    var ev = binder.getValidationDefinition();

    expect(ev).toBeDefined();
    expect(ev).toEqual({
      "blur [name='foo']": "validation_foo",
      "blur [name='ufo']": "validation_ufo"
    });
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
    setTimeout(function () {
      expect($.hasClass(input, "ug-field-invalid")).toEqual(true);
      expect($.hasClass(input, "ug-field-valid")).toEqual(false);
      
      // set value of the input;
      input.value = "Got a value";

      $.fire(input, "blur");

      setTimeout(function () {
        expect($.hasClass(input, "ug-field-invalid")).toEqual(false);
        expect($.hasClass(input, "ug-field-valid")).toEqual(true);
        always();
      }, 0);
    }, 0);
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
    setTimeout(function () {
      const v = input.value;
      expect(v).toEqual("007");

      always();
    }, 0);
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
    setTimeout(function () {
      expect(dataentry.validationActive).toEqual(true);
      always();
    }, 0);
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
    setTimeout(function () {
      expect(dataentry.validationActive).toEqual(true);
      always();
    }, 0);
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
    setTimeout(function () {
      expect(dataentry.validationActive).toEqual(true);
      always();
    }, 0);
  })

  it("must activate dataentry validation after change event (group of checkboxes)", always => {
    // TODO: handle following situation: by default, any checkbox should be sufficient
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
    setTimeout(function () {
      expect(dataentry.validationActive).toEqual(true);
      always();
    }, 0);
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
    setTimeout(function () {
      const v = input.value;
      expect(v).toEqual("7");

      $.fire(input, "blur");
      setTimeout(function () {
        const v = input.value;
        expect(v).toEqual("007");
  
        always();
      }, 0);
    }, 0);
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
})