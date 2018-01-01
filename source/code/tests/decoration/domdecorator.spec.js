/**
 * Tests for built-in DomDecorator class.
 * Use `npm run karchrome` to debug and see a visual representation of these tests.
 * 
 * https://github.com/RobertoPrevato/DataEntry
 *
 * Copyright 2018, Roberto Prevato
 * https://robertoprevato.github.io
 *
 * Licensed under the MIT license:
 * http://www.opensource.org/licenses/MIT
 */
import DomDecorator from "../../scripts/forms/decoration/domdecorator"
import _ from "../../scripts/utils"
import $ from "../../scripts/dom"

//#region useful functions

const section = $.createElement("section");
$.setAttr(section, {"class": "tests-section"})
section.innerHTML = "<h2>DomDecorator tests</h2>"
document.body.appendChild(section);

function arrange(comment) {
  var wrapper = $.createElement("div")
  $.setAttr(wrapper, {
    "id": _.uniqueId(),
    "class": "test-wrapper"
  });
  section.appendChild(wrapper);
  if (comment)
    wrapper.innerHTML = "<h2 class='info'>" + comment + "</h2>";
  
  var input = $.createElement("input");
  $.setAttr(input, {
    "type": "text",
    "value": "foo"
  });
  
  wrapper.appendChild(input);
  return [wrapper, input];
}

function arrangeRadios(comment) {
  var wrapper = $.createElement("div")
  $.setAttr(wrapper, {
    "id": _.uniqueId(),
    "class": "test-wrapper"
  });
  section.appendChild(wrapper);

  wrapper.innerHTML = (comment ? "<h2 class='info'>" + comment + "</h2>" : "") + `<label for="light-side">Favorite side of the force</label>
  <input type="radio" name="side" id="light-side" />
  <input type="radio" name="side" id="dark-side" />`;
  return wrapper;
}

function arrangeWithTarget(comment) {
  var wrapper = $.createElement("div")
  $.setAttr(wrapper, {
    "id": _.uniqueId(),
    "class": "test-wrapper"
  });
  section.appendChild(wrapper);
  
  wrapper.innerHTML = (comment ? "<h2 class='info'>" + comment + "</h2>" : "") + `
  <input type="text" name="foo" id="with-target" data-validation-target="val-target" />
  <br/>
  <span id="val-target">This is the target of validated element</span>`;
  return wrapper;
}

function getValidationWrapper(element) {
  return element.querySelector(".ug-validation-wrapper");
}

function getTooltipInner(element) {
  return element.querySelector(".tooltip-inner");
}

//#endregion

const decorator = new DomDecorator();

describe("DomDecorator", () => {

  it("must mark invalid elements by adding tooltip elements, by default", () => {
    // arrange
    var [wrapper, input] = arrange("validation tooltip");
    var text = "Hello World";

    // act
    decorator.markFieldInvalid(input, {
      message: text
    })

    // assert
    var tooltipElement = getValidationWrapper(wrapper);
    expect(tooltipElement).toBeDefined();

    var messageElement = getTooltipInner(tooltipElement);
    expect(messageElement).toBeDefined();
    expect(messageElement.innerText).toEqual(text);
  })

  it("must support displaying information on elements by adding tooltip elements, by default", () => {
    // arrange
    var [wrapper, input] = arrange("information tooltip");
    var text = "This is information";

    // act
    decorator.markFieldInfo(input, {
      message: text
    })

    // assert
    var tooltipElement = getValidationWrapper(wrapper);
    expect(tooltipElement).toBeDefined();

    var messageElement = getTooltipInner(tooltipElement);
    expect(messageElement).toBeDefined();
    expect(messageElement.innerText).toEqual(text);
  })

  it("must support disposing, removing created elements", () => {
    // arrange
    var [wrapper, input] = arrange("adding and clearing validation information");

    var decoratorToDispose = new DomDecorator();

    // act
    decoratorToDispose.markFieldInvalid(input, {
      message: "Hello World"
    })

    // assert
    var tooltipElement = getValidationWrapper(wrapper);
    expect(tooltipElement).toBeDefined();
    tooltipElement.setAttribute("id", "to-be-removed")

    var messageElement = getTooltipInner(tooltipElement);
    expect(messageElement).toBeDefined();
    
    decoratorToDispose.dispose();

    tooltipElement = document.getElementById("to-be-removed")
    expect(tooltipElement).toBeNull();
  })

  it("must support adding tooltips on the top", () => {
    // arrange
    var [wrapper, input] = arrange("tooltip on top");
    var text = "Hello World";

    // act
    decorator.markFieldInvalid(input, {
      message: text,
      position: "top"
    })

    // assert
    var tooltipElement = getValidationWrapper(wrapper);
    expect(tooltipElement).toBeDefined();

    var messageElement = getTooltipInner(tooltipElement);
    expect(messageElement).toBeDefined();
    expect(messageElement.innerText).toEqual(text);
  })

  it("must support adding tooltips on the right", () => {
    // arrange
    var [wrapper, input] = arrange("tooltip on the right");
    var text = "Hello World";

    // act
    decorator.markFieldInvalid(input, {
      message: text,
      position: "right"
    })

    // assert
    var tooltipElement = getValidationWrapper(wrapper);
    expect(tooltipElement).toBeDefined();

    var messageElement = getTooltipInner(tooltipElement);
    expect(messageElement).toBeDefined();
    expect(messageElement.innerText).toEqual(text);
  })

  it("must support adding tooltips on the bottom", () => {
    // arrange
    var [wrapper, input] = arrange("tooltip on the bottom");
    var text = "Hello World";

    // act
    decorator.markFieldInvalid(input, {
      message: text,
      position: "bottom"
    })

    // assert
    var tooltipElement = getValidationWrapper(wrapper);
    expect(tooltipElement).toBeDefined();

    var messageElement = getTooltipInner(tooltipElement);
    expect(messageElement).toBeDefined();
    expect(messageElement.innerText).toEqual(text);
  })

  it("must support adding tooltips on the left", () => {
    // arrange
    var [wrapper, input] = arrange("tooltip on the left");
    var text = "Hello World";

    // act
    decorator.markFieldInvalid(input, {
      message: text,
      position: "left"
    })

    // assert
    var tooltipElement = getValidationWrapper(wrapper);
    expect(tooltipElement).toBeDefined();

    var messageElement = getTooltipInner(tooltipElement);
    expect(messageElement).toBeDefined();
    expect(messageElement.innerText).toEqual(text);
  })

  it("must display messages on the label of radio buttons", () => {
    // arrange
    var wrapper = arrangeRadios("radio buttons");
    var text = "I find your lack of faith disturbing.";

    // act
    decorator.markFieldInvalid(document.getElementById("light-side"), {
      message: text
    })

    // by default, the tooltip must be displayed after the last radio button:
    var tooltipElement = getValidationWrapper(wrapper);
    expect(tooltipElement.previousElementSibling).toEqual(document.getElementById("light-side"));
  })

  it("must let specify decoration targets", () => {
    // arrange
    var wrapper = arrangeWithTarget("specific target");
    var text = "Hello World";

    // act
    decorator.markFieldInvalid(document.getElementById("with-target"), {
      message: text
    })

    // assert
    var tooltipElement = getValidationWrapper(wrapper);
    expect(tooltipElement.previousElementSibling).toEqual(wrapper.querySelector("#val-target"));
  })

  it("must clear validation information, when fields are in neutral state", () => {
    // arrange
    var [wrapper, input] = arrange("neutral state must clear error info");
    var text = "Hello World";

    // act
    decorator.markFieldInvalid(input, {
      message: text
    })
    decorator.markFieldNeutrum(input);

    // assert
    var tooltipElement = getValidationWrapper(wrapper);
    expect(tooltipElement).toBeNull();
  })

  it("must clear validation information, when fields are in valid state", () => {
    // arrange
    var [wrapper, input] = arrange("valid state must clear error info");
    var text = "Hello World";

    // act
    decorator.markFieldInvalid(input, {
      message: text
    })
    decorator.markFieldValid(input);

    // assert
    var tooltipElement = getValidationWrapper(wrapper);
    expect(tooltipElement).toBeNull();
  })
})