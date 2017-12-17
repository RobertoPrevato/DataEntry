/**
 * Tests for built-in DomHarvester class.
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
import DomHarvester from "../../scripts/forms/harvesting/domharvester"
import _ from "../../scripts/utils"
import $ from "../../scripts/dom"

//#region useful functions

const section = $.createElement("section");
$.setAttr(section, {"class": "tests-section"})
section.innerHTML = "<h2>DomHarvester tests</h2>"
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

describe("DomHarvester", () => {

  it("must get values depending on dataentry schema and input elements 'name'", () => {
    var wrapper = arrange(`
    <input name="name" type="text" value="Foo" />
    <input name="not-in-schema" type="text" value="Ufo" />
    `, "get values by schema keys");
    var harvester = new DomHarvester({
      element: wrapper,
      schema: {
        "name": []
      }
    });
    
    var values = harvester.getValues();
    expect(values).toEqual({
      name: "Foo"
    })
  })

  it("must get values depending on dataentry schema and input elements 'name' (multiple inputs)", () => {
    var wrapper = arrange(`
    <input name="name" type="text" value="Zenyatta" />
    <input name="name" type="text" value="Mei" />
    <input name="name" type="text" value="Widowmaker" />
    `, "get values by schema keys (multiple elements with the same name)");
    var harvester = new DomHarvester({
      element: wrapper,
      schema: {
        "name": []
      }
    });
    
    var values = harvester.getValues();
    expect(values).toEqual({
      name: ["Zenyatta", "Mei", "Widowmaker"]
    })
  })

  it("must get values depending on dataentry schema and input elements 'name', ignoring empty fields", () => {
    var wrapper = arrange(`
    <input name="name" type="text" value="Zenyatta" />
    <input name="name" type="text" value="Mei" />
    <input name="name" type="text" value="Widowmaker" />
    <input name="name" type="text" value="" />
    `, "get values by schema keys (multiple elements with the same name)");
    var harvester = new DomHarvester({
      element: wrapper,
      schema: {
        "name": []
      }
    });
    
    var values = harvester.getValues();
    expect(values).toEqual({
      name: ["Zenyatta", "Mei", "Widowmaker"]
    })
  })

  it("must get values from select element", () => {
    var wrapper = arrange(`
    <select name="brand">
      <option value="volvo">Volvo</option>
      <option value="saab">Saab</option>
      <option value="vw">VW</option>
      <option value="audi" selected>Audi</option>
    </select>
    `, "simple select");
    var harvester = new DomHarvester({
      element: wrapper,
      schema: {
        brand: []
      }
    });
    
    var values = harvester.getValues();
    expect(values).toEqual({
      brand: "audi"
    })
  })

  it("must get values from multiple select element", () => {
    var wrapper = arrange(`
    <select name="brand" multiple>
      <option value="volvo">Volvo</option>
      <option value="saab" selected>Saab</option>
      <option value="vw">VW</option>
      <option value="audi" selected>Audi</option>
    </select>
    `, "multiple select");
    var harvester = new DomHarvester({
      element: wrapper,
      schema: {
        brand: []
      }
    });
    
    var values = harvester.getValues();
    expect(values).toEqual({
      brand: ["saab", "audi"]
    })
  })

  it("must get values from groups of radio buttons", () => {
    var wrapper = arrange(`<label for="light-side">Favorite side of the force</label>
    <input type="radio" name="side" value="light-side" />
    <input type="radio" name="side" value="dark-side" checked />`, "radio buttons");
    var harvester = new DomHarvester({
      element: wrapper,
      schema: {
        side: []
      }
    });
    
    var values = harvester.getValues();
    expect(values).toEqual({
      side: "dark-side"
    })
  })

  it("must get values from groups of radio buttons (none selected)", () => {
    var wrapper = arrange(`<label for="light-side">Favorite side of the force</label>
    <input type="radio" name="side" value="light-side" />
    <input type="radio" name="side" value="dark-side" />`, "radio buttons (none selected)");
    var harvester = new DomHarvester({
      element: wrapper,
      schema: {
        side: []
      }
    });
    
    var values = harvester.getValues();
    expect(values).toEqual({
      side: undefined
    })
  })

  it("must get values from groups of checkboxes", () => {
    var wrapper = arrange(`
    <input type="checkbox" name="letters" value="a" checked />
    <input type="checkbox" name="letters" value="b" />
    <input type="checkbox" name="letters" value="c" checked />
    <input type="checkbox" name="letters" value="d" />
    <input type="checkbox" name="letters" value="e" checked />
    <input type="checkbox" name="letters" value="f" />
    <input type="checkbox" name="letters" value="g" />`, "checkboxes");
    var harvester = new DomHarvester({
      element: wrapper,
      schema: {
        letters: []
      }
    });
    
    var values = harvester.getValues();
    expect(values).toEqual({
      letters: ["a", "c", "e"]
    })
  })

  it("must get values from groups of checkboxes (none checked)", () => {
    var wrapper = arrange(`
    <input type="checkbox" name="letters" value="a" />
    <input type="checkbox" name="letters" value="b" />
    <input type="checkbox" name="letters" value="c" />
    <input type="checkbox" name="letters" value="d" />
    <input type="checkbox" name="letters" value="e" />
    <input type="checkbox" name="letters" value="f" />
    <input type="checkbox" name="letters" value="g" />`, "checkboxes (none checked)");
    var harvester = new DomHarvester({
      element: wrapper,
      schema: {
        letters: []
      }
    });
    
    var values = harvester.getValues();
    expect(values).toEqual({
      letters: []
    })
  })

  it("must get values from elements with contenteditable attribute", () => {
    var wrapper = arrange(`<p contenteditable="true" name="name">Foo</p>`, "contenteditable elements");
    var harvester = new DomHarvester({
      element: wrapper,
      schema: {
        "name": []
      }
    });
    
    var values = harvester.getValues();
    expect(values).toEqual({
      name: "Foo"
    })
  })
})