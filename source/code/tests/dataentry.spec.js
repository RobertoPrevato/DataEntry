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
import { noReject } from "./tests-utils"

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

  setValue(name, value) {
    this.source[name] = value;
  }

  getValue(name) {
    return this.source[name];
  }
}

const NOT_NAME = "Whatever";


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

  it("must support altering defaults with `configure` method", () => {
    DataEntry.configure({
      foo: "Unit test",
      hello: 20
    })

    expect(DataEntry.defaults.foo).toEqual("Unit test");
    expect(DataEntry.defaults.hello).toEqual(20);
    var context = {};
    var a = new DataEntry({
      context: context,
      schema: {
        name: ["required"]
      },
      marker: new TestMarker(context),
      harvester: new TestHarvester(context)
    })

    expect(a.options.foo).toEqual("Unit test");
    expect(a.options.hello).toEqual(20);
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
      // validation must fail; because 'name' requires a value and data object has no value
      expect(results.valid).toEqual(false, "Validation must fail")

      // result must contain information about the error
      const errors = results.errors;
      expect(errors instanceof Array).toEqual(true)
      expect(errors.length).toEqual(1);

      const onlyError = errors[0];
      expect(onlyError.field).toEqual("name")
      expect(onlyError.message).toEqual("required")

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
      expect(data["_(deco)_name"]).toEqual("invalid: required");
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
      expect(onlyError.message).toEqual("required")

      always()
    }, noReject(always));
  })

  it("must support validation rules with extra parameters", always => {
    var data = {
      name: "Fuffolo"
    };

    var a = new DataEntry({
      schema: {
        name: [{ name: "not", params: ["Fuffolo"] }]
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
      expect(onlyError.value).toEqual("Fuffolo")

      always()
    }, noReject(always));
  })

  it("must support multiple validation rules for each field", always => {
    var data = {
      name: "Fuffolo"
    };

    var a = new DataEntry({
      schema: {
        name: ["required", { name: "not", params: ["Fuffolo"] }]
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
      expect(onlyError.value).toEqual("Fuffolo")

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

  it("must handle dynamic validation rules", always => {
    var data = {
      side: "dark"
    };

    var a = new DataEntry({
      schema: {
        "side": {
          validation: ["required"]
        },
        "fav-jedi": {
          validation: function () {
            var side = this.getFieldValue("side");
            return side == "light" ? ["required"] : ["none"];
          }
        },
        "fav-sith": {
          validation: function () {
            var side = this.getFieldValue("side");
            return side == "dark" ? ["required"] : ["none"];
          }
        }
      },
      marker: new TestMarker(data),
      harvester: new TestHarvester(data)
    })

    a.validate().then(results => {
      // validation must fail; a fav-sith is required
      expect(results.valid).toEqual(false, "Validation must fail")
      expect(data["_(deco)_fav-sith"]).toEqual("invalid: required");
      expect(data["_(deco)_fav-jedi"]).toEqual("valid");
      expect(data["_(deco)_side"]).toEqual("valid");

      // change side
      data.side = "light";

      a.validate().then(results => {
        // validation must fail; a fav-sith is required
        expect(results.valid).toEqual(false, "Validation must fail")
        expect(data["_(deco)_fav-sith"]).toEqual("valid");
        expect(data["_(deco)_fav-jedi"]).toEqual("invalid: required");
        expect(data["_(deco)_side"]).toEqual("valid");
  
        always()
      }, noReject(always));
    }, noReject(always));
  });

  it("must run callbacks for dynamic validation rules in the context of DataEntry", always => {
    var data = {};

    var a = new DataEntry({
      schema: {
        "a": {
          validation: function () {
            expect(this).toBe(a);
            return ["none"];
          }
        }
      },
      marker: new TestMarker(data),
      harvester: new TestHarvester(data)
    })
    
    a.validate().then(results => {
      always()
    }, noReject(always));
  });

  it("must run callbacks for dynamic validation rules in the context of DataEntry (context specified by option)", always => {
    var data = {};

    var a = new DataEntry({
      schema: {
        "_": {
          validation: function () {
            expect(this).toBe(a.context);
            return ["none"];
          }
        }
      },
      context: {},
      marker: new TestMarker(data),
      harvester: new TestHarvester(data)
    })
    
    a.validate().then(results => {
      always()
    }, noReject(always));
  });

  it("must be disposable", () => {
    const data = {};
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

    a.dispose();

    expect(a.marker).toBeFalsy();
    expect(a.harvester).toBeFalsy();
  })

  it("must support a localizer object", always => {
    var data = {
      name: null
    };
    const exampleText = "Il campo richiede un valore";
    
    var a = new DataEntry({
      schema: {
        name: ["required"]
      },
      marker: new TestMarker(data),
      harvester: new TestHarvester(data),
      localizer: {
        reg: {
          "required": exampleText
        },
        t: function (key) {
          return this.reg[key];
        },
        lookup: function (key) {
          return !!this.reg[key];
        }
      }
    })

    a.validate().then(results => {
      // validation must fail;
      expect(results.valid).toEqual(false, "Validation must fail")
      expect(data["_(deco)_name"]).toEqual("invalid: " + exampleText);

      always()
    }, noReject(always));
  });
  
  it("must support sending parameters to the localizer object", always => {
    var data = {
      foo: "A"
    };  
    var a = new DataEntry({
      schema: {
        foo: [{
          name: "minLength",
          length: 5
          //params: [5]
        }]
      },
      marker: new TestMarker(data),
      harvester: new TestHarvester(data),
      localizer: {
        reg: {
          "minLength": "The value must be at least of {{min}} characters."
        },
        t: function (key, params) {
          return this.reg[key].replace("{{min}}", params[0].length);
        },
        lookup: function (key) {
          return !!this.reg[key];
        }
      }
    })

    a.validate().then(results => {
      // validation must fail;
      expect(results.valid).toEqual(false, "Validation must fail")
      expect(data["_(deco)_foo"]).toEqual("invalid: " + "The value must be at least of 5 characters.");

      always()
    }, noReject(always));
  });

  it("must support error messages specified in schema", always => {
    var data = {
      foo: null,
      key: ""
    };

    var a = new DataEntry({
      schema: {
        foo: [{ name: "required", message: "A foo is required" }],
        key: [{ name: "required", message: "A key is required" }]
      },
      marker: new TestMarker(data),
      harvester: new TestHarvester(data)
    })

    a.validate().then(results => {
      // validation must fail;
      expect(results.valid).toEqual(false, "Validation must fail")
      expect(data["_(deco)_foo"]).toEqual("invalid: A foo is required");
      expect(data["_(deco)_key"]).toEqual("invalid: A key is required");

      always()
    }, noReject(always));
  });

  it("error messages specified in schema must bypass the localizer", always => {
    var data = {
      foo: null,
      key: "",
      ufo: null
    };

    var a = new DataEntry({
      schema: {
        foo: [{ name: "required", message: "A foo is required" }],
        key: [{ name: "required", message: "A key is required" }],
        ufo: ["required"]
      },
      marker: new TestMarker(data),
      harvester: new TestHarvester(data),
      localizer: {
        t: function (key) {
          return "Hello, World"
        },
        lookup: function () {
          return true;
        }
      }
    })

    a.validate().then(results => {
      // validation must fail;
      expect(results.valid).toEqual(false, "Validation must fail")
      expect(data["_(deco)_foo"]).toEqual("invalid: A foo is required");
      expect(data["_(deco)_key"]).toEqual("invalid: A key is required");
      expect(data["_(deco)_ufo"]).toEqual("invalid: Hello, World");

      always()
    }, noReject(always));
  });

  it("must support error messages specified in schema, using functions", always => {
    var data = {
      foo: null,
      key: ""
    };

    var a = new DataEntry({
      schema: {
        foo: [{ 
          name: "required", 
          message: function () {
            return "A foo is required";
          }
        }],
        key: [{ 
          name: "required", 
          message: () => {
            return "A key is required"
          }
        }]
      },
      marker: new TestMarker(data),
      harvester: new TestHarvester(data)
    })

    a.validate().then(results => {
      // validation must fail;
      expect(results.valid).toEqual(false, "Validation must fail")
      expect(data["_(deco)_foo"]).toEqual("invalid: A foo is required");
      expect(data["_(deco)_key"]).toEqual("invalid: A key is required");

      always()
    }, noReject(always));
  });
})
