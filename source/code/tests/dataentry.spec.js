/**
 * Tests for core DataEntry class.
 * https://github.com/RobertoPrevato/DataEntry
 *
 * Copyright 2017, Roberto Prevato
 * https://robertoprevato.github.io
 *
 * Licensed under the MIT license:
 * http://www.opensource.org/licenses/MIT
 */
import DataEntry from "../scripts/forms/dataentry"


// Following marker and harvester are used for testing purpose
// they also demonstrate the abstraction of DataEntry, Validator and Formatter classes from DOM Manipulation
// This makes the library suitable for any other library (React, Knockout, DOM manipulation, etc.)
class TestMarker {

  constructor(obj) {
    this.target = obj;
    this.prefix = "_(deco)_";
  }

  markFieldNeutrum(name) {
    this.target[this.prefix + name] = "neuter";
  }

  markFieldInvalid(name, error) {
    this.target[this.prefix + name] = "invalid: " + error.message;
  }

  markFieldValid(name) {
    this.target[this.prefix + name] = "valid";
  }
}


class TestHarvester {

  constructor(obj) {
    this.source = obj;
  }

  getValues() {
    var x, o = {};
    for (x in this.source) {
      if (x.indexOf("_(deco)_") != 0) {
        o[x] = this.source[x];
      }
    }
    return o;
  }

  getValue(name) {
    return this.source[name];
  }
}


function noReject(always) {
  return function () {
    expect(0).toEqual(1, "Validation process must not be rejected")
    always()
  }
}


const NOT_NAME = "Matteo";


describe("DataEntry", () => {

  it("must have a version number", () => {
    var version = DataEntry.version;
    expect(/\d\.\d\.\d/.test(version)).toEqual(true);
  })

  it("must support context", () => {
    const context = {};

    var a = new DataEntry({
      context: context,
      schema: {
        name: ["required"]
      },
      marker: new TestMarker(context),
      harvester: new TestHarvester(context)
    })

    expect(a.context).toBe(context);
  })

  it("must implement validation of required fields", always => {
    var data = {
      name: null
    };

    var a = new DataEntry({
      schema: {
        name: ["required"]
      },
      marker: new TestMarker(data),
      harvester: new TestHarvester(data)
    })

    a.validate().then(results => {
      // validation must fail;
      expect(results.valid).toEqual(false, "Validation must fail")

      // result must contain information about the error
      const errors = results.errors;
      expect(errors instanceof Array).toEqual(true)
      expect(errors.length).toEqual(1);

      const onlyError = errors[0];
      expect(onlyError.field).toEqual("name")
      expect(onlyError.message).toEqual("requiredValue")

      always()
    }, noReject(always));
  })

  it("must use configured marker to decorate valid and invalid fields", always => {
    var data = {
      name: null,
      key: ["required"]
    };

    var a = new DataEntry({
      schema: {
        name: ["required"],
        key: ["required"]
      },
      marker: new TestMarker(data),
      harvester: new TestHarvester(data)
    })

    a.validate().then(results => {
      // validation must fail;
      expect(results.valid).toEqual(false, "Validation must fail")
      expect(data["_(deco)_name"]).toEqual("invalid: requiredValue");
      expect(data["_(deco)_key"]).toEqual("valid");

      always()
    }, noReject(always));
  });

  it("must fail when at least one field is invalid", always => {
    var data = {
      name: null,
      key: "SomeKey"
    };

    var a = new DataEntry({
      schema: {
        name: ["required"],
        key: ["required"]
      },
      marker: new TestMarker(data),
      harvester: new TestHarvester(data)
    })

    a.validate().then(results => {
      // validation must fail;
      expect(results.valid).toEqual(false, "Validation must fail")

      // result must contain information about the error
      const errors = results.errors;
      expect(errors instanceof Array).toEqual(true)
      expect(errors.length).toEqual(1);

      const onlyError = errors[0];
      expect(onlyError.field).toEqual("name")
      expect(onlyError.message).toEqual("requiredValue")

      always()
    }, noReject(always));
  })

  it("must support validation rules with extra parameters", always => {
    var data = {
      name: "Matteo"
    };

    var a = new DataEntry({
      schema: {
        name: [{ name: "not", params: ["Matteo"] }]
      },
      marker: new TestMarker(data),
      harvester: new TestHarvester(data)
    })

    a.validate().then(results => {
      // validation must fail;
      expect(results.valid).toEqual(false, "Validation must fail")

      // result must contain information about the error
      const errors = results.errors;
      expect(errors instanceof Array).toEqual(true)
      expect(errors.length).toEqual(1);

      const onlyError = errors[0];
      expect(onlyError.field).toEqual("name")
      expect(onlyError.message).toEqual("cannotBe")
      expect(onlyError.value).toEqual("Matteo")

      always()
    }, noReject(always));
  })

  it("must support multiple validation rules for each field", always => {
    var data = {
      name: "Matteo"
    };

    var a = new DataEntry({
      schema: {
        name: ["required", { name: "not", params: ["Matteo"] }]
      },
      marker: new TestMarker(data),
      harvester: new TestHarvester(data)
    })

    a.validate().then(results => {
      // validation must fail;
      expect(results.valid).toEqual(false, "Validation must fail")

      // result must contain information about the error
      const errors = results.errors;
      expect(errors instanceof Array).toEqual(true)
      expect(errors.length).toEqual(1);

      const onlyError = errors[0];
      expect(onlyError.field).toEqual("name")
      expect(onlyError.message).toEqual("cannotBe")
      expect(onlyError.value).toEqual("Matteo")

      always()
    }, noReject(always));
  })

  it("must support custom validation rules", always => {
    var k = 0;

    DataEntry.Validator.Rules.extra = function(field, value) {
      k += 1;
      return true; // always valid; this is just to verify that this function is called once per validation
    }

    var data = {
      name: "Foo"
    };

    var a = new DataEntry({
      schema: {
        name: ["required", "extra"]
      },
      marker: new TestMarker(data),
      harvester: new TestHarvester(data)
    })

    a.validate().then(results => {
      // validation must fail;
      expect(k).toEqual(1, "Custom validation rule `extra` must be called once per validation")
      expect(results.valid).toEqual(true, "Validation must succeed")

      a.validate().then(results => {
        expect(k).toEqual(2, "Custom validation rule `extra` must be called once per validation")
        expect(results.valid).toEqual(true, "Validation must succeed")

        always()
      }, noReject(always))
    }, noReject(always));
  })

  it("must stop validation for a field at its first error", always => {
    var k = 0, q = 0;

    DataEntry.Validator.Rules.extra1 = function(field, value) {
      k += 1;
      return DataEntry.Validator.getError("CrashTest", arguments); // always invalid; this is just to verify that this function is called once per validation
    }

    DataEntry.Validator.Rules.extra2 = function(field, value) {
      q += 1;
      return true; // always valid; this is just to verify that this function is called once per validation
    }

    var data = {
      name: "Foo"
    };

    var a = new DataEntry({
      schema: {
        name: ["required", "extra1", "extra2"]
      },
      marker: new TestMarker(data),
      harvester: new TestHarvester(data)
    })

    a.validate().then(results => {
      // validation must fail;
      expect(k).toEqual(1, "Custom validation rule `extra1` must be called once per validation")
      expect(q).toEqual(0, "Custom validation rule `extra2` must not be called, since extra1 fails")
      expect(results.valid).toEqual(false, "Validation must fail")

      a.validate().then(results => {
        expect(k).toEqual(2, "Custom validation rule `extra1` must be called once per validation")
        expect(q).toEqual(0, "Custom validation rule `extra2` must not be called, since extra1 fails")
        expect(results.valid).toEqual(false, "Validation must fail")

        always()
      }, noReject(always))
    }, noReject(always));
  })

  it("must call validation rules in dataentry context", always => {
    const context = {};

    DataEntry.Validator.Rules.extra = function(field, value) {
      expect(this).toBe(a);
      return true; // always valid; this is just to verify that this function is called once per validation
    }

    var a = new DataEntry({
      context: context,
      schema: {
        name: ["extra"]
      },
      marker: new TestMarker(context),
      harvester: new TestHarvester(context)
    })

    expect(a.context).toBe(context);
    a.validate().then(results => {
      // validation must fail;
      expect(results.valid).toEqual(true, "Validation must succeed")
      always();
    }, noReject(always));
  })

  it("must return values when validation succeeds", always => {
    var data = {
      name: "Hello World",
      key: "FOO"
    };

    var a = new DataEntry({
      schema: {
        name: { 
          validation: ["required"], 
          format: ["trim"] 
        },
        key: ["required"]
      },
      marker: new TestMarker(data),
      harvester: new TestHarvester(data)
    })

    a.validate().then(results => {
      // validation must fail;
      expect(results.valid).toEqual(true, "Validation must succeed")

      expect(typeof results.values).toEqual("object", "because this way works TestHarvester class!")
      expect(results.values.name).toEqual("Hello World")
      expect(results.values.key).toEqual("FOO")

      always()
    }, noReject(always));
  })

  it("must support formatting rules", always => {
    var data = {
      name: "   Hello World   "
    };

    var a = new DataEntry({
      schema: {
        name: { 
          validation: ["required"], 
          format: ["trim"] 
        }
      },
      marker: new TestMarker(data),
      harvester: new TestHarvester(data)
    })

    a.validate().then(results => {
      // validation must fail;
      expect(results.valid).toEqual(true, "Validation must succeed")

      var values = results.values;

      expect(values.name).toEqual("Hello World", "After validation, values must be formatted")
      
      always()
    }, noReject(always));
  })
})