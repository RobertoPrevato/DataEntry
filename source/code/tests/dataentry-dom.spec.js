/**
 * Tests for DataEntry used with DomDecorator and DomHarvester.
 * https://github.com/RobertoPrevato/DataEntry
 *
 * Copyright 2017, Roberto Prevato
 * https://robertoprevato.github.io
 *
 * Licensed under the MIT license:
 * http://www.opensource.org/licenses/MIT
 */
import DataEntry from "../scripts/forms/dataentry"
import DomHarvester from "../scripts/forms/harvesting/domharvester"
import DomDecorator from "../scripts/forms/decoration/domdecorator"
import _ from "../scripts/utils"
import $ from "../scripts/dom"
import { raiseSettings } from "../scripts/raise"
import { noReject } from "./tests-utils"


raiseSettings.writeToConsole = false; // for tests

//#region useful functions

const section = $.createElement("section");
$.setAttr(section, {"class": "tests-section"})
section.innerHTML = "<h2>DataEntry with DomHarvester and DomDecorator tests</h2>"
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


describe("DataEntry with DOM classes", () => {

  it("must handle a single input element", always => {
    var wrapper = arrange(`
    <input name="name" type="text" value="Foo" />
    `, "single element");

    const dataentry = new DataEntry({
      element: wrapper,
      marker: DomDecorator,
      harvester: DomHarvester,
      schema: {
        name: ["required"]
      }
    })
    
    dataentry.validate().then(function (data) {
      expect(data.valid).toEqual(true);
      expect(data.values).toEqual({
        name: "Foo"
      });

      always();
    }, noReject(always))
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
    `, "group of elements (1)");

    const dataentry = new DataEntry({
      element: wrapper,
      marker: DomDecorator,
      harvester: DomHarvester,
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
    
    dataentry.validate().then(function (data) {
      expect(data.valid).toEqual(false);
      expect(data.errors).toBeDefined();
      expect(data.errors.length).toEqual(6);
      always();
    }, noReject(always))
  })

  it("must throw exception if required parameters are missing", function () {
    expect(function() {
      new DataEntry({
        marker: null,
        harvester: null,
        schema: {}
      })
    }).toThrow(new Error("missing options: marker, harvester. For further details: https://github.com/RobertoPrevato/DataEntry/wiki/Errors#8"));
  })

  it("must throw exception if decorator is missing", function () {
    expect(function() {
      new DataEntry({
        marker: DomDecorator,
        harvester: null,
        schema: {}
      })
    }).toThrow(new Error("missing options: harvester. For further details: https://github.com/RobertoPrevato/DataEntry/wiki/Errors#8"));
  })

  it("must throw exception if harvester is missing", function () {
    expect(function() {
      new DataEntry({
        marker: null,
        harvester: DomHarvester,
        schema: {}
      })
    }).toThrow(new Error("missing options: marker. For further details: https://github.com/RobertoPrevato/DataEntry/wiki/Errors#8"));
  })

  it("must throw exception if element is missing and we try to use DomHarvester", function () {
    expect(function() {
      new DataEntry({
        element: null,
        marker: DomDecorator,
        harvester: DomHarvester,
        schema: {}
      })
    }).toThrow(new Error("missing 'element' in dataentry. Specify an HTML element for the dataentry, in order to use the DomHarvester. For further details: https://github.com/RobertoPrevato/DataEntry/wiki/Errors#8"));
  })
})