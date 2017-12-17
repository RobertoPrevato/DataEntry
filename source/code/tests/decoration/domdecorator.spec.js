/**
 * Tests for built-in DomDecorator class.
 * https://github.com/RobertoPrevato/DataEntry
 *
 * Copyright 2017, Roberto Prevato
 * https://robertoprevato.github.io
 *
 * Licensed under the MIT license:
 * http://www.opensource.org/licenses/MIT
 */
import DomDecorator from "../../scripts/forms/decoration/domdecorator"
import _ from "../../scripts/utils"
import $ from "../../scripts/dom"

//#region useful functions

function arrange() {
  var wrapper = $.createElement("div")
  $.setAttr(wrapper, {
    "id": _.uniqueId(),
    "class": "domdecorator-wrapper"
  });
  document.body.appendChild(wrapper);
  
  
  var input = $.createElement("input");
  $.setAttr(input, {
    "type": "text",
    "value": "foo"
  });
  
  wrapper.appendChild(input);
  return [wrapper, input];
}

function arrangeRadios() {
  var wrapper = $.createElement("div")
  $.setAttr(wrapper, {
    "id": _.uniqueId(),
    "class": "domdecorator-wrapper"
  });
  document.body.appendChild(wrapper);
  
  wrapper.innerHTML = `<label for="light-side">Favorite side of the force</label>
  <input type="radio" name="side" id="light-side" />
  <input type="radio" name="side" id="dark-side" />`;
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
    var [wrapper, input] = arrange();
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
    var [wrapper, input] = arrange();
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
    var [wrapper, input] = arrange();

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
    var [wrapper, input] = arrange();
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
    var [wrapper, input] = arrange();
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
    var [wrapper, input] = arrange();
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
    var [wrapper, input] = arrange();
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
    // TODO: handle displaying of tooltips on radio buttons!
    // arrange
    var wrapper = arrangeRadios();
    var text = "I find your lack of faith disturbing.";

    // act
    decorator.markFieldInvalid(document.getElementById("light-side"), {
      message: text
    })

    // assert
    var tooltipElement = getValidationWrapper(wrapper);
    expect(tooltipElement).toBeDefined();

    var messageElement = getTooltipInner(tooltipElement);
    expect(messageElement).toBeDefined();
    expect(messageElement.innerText).toEqual(text);
  })
})