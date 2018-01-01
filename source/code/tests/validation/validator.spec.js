/**
 * Tests for core Validator class.
 * https://github.com/RobertoPrevato/DataEntry
 *
 * Copyright 2018, Roberto Prevato
 * https://robertoprevato.github.io
 *
 * Licensed under the MIT license:
 * http://www.opensource.org/licenses/MIT
 */
import Validator from "../../scripts/forms/validation/validator"

describe("Validator", () => {

  it("must validate by global rules defined inside Validator.Rules (invalid value)", always => {
    var v = new Validator()

    v.validate(["required"], "", null).then(function (results) {
      const firstError = results[0];
      
      expect(firstError.error).toEqual(true);
      expect(firstError.message).toEqual("required");
      always()
    }, function () {
      expect(0).toEqual(1)
      always()
    });
  })

  it("must validate by global rules defined inside Validator.Rules (valid value)", always => {
    var v = new Validator()

    v.validate(["required"], "", "A value").then(function (results) {
      const firstResult = results[0];
      expect(firstResult).toEqual(true);
      always()
    }, function () {
      expect(0).toEqual(1)
      always()
    });
  })

  it("must support instance specific rules, by dataentry `rules` options", always => {
    var v = new Validator({
      options: {
        rules: {
          "not-foo": function (field, value, forced) {
            if (value === "foo")
              return v.getError("cannotBe", arguments);
            return true;
          }
        }
      }
    })

    v.validate(["not-foo"], "", "foo").then(function (results) {
      const firstError = results[0];

      expect(firstError.error).toEqual(true);
      expect(firstError.message).toEqual("cannotBe");
      always()
    }, function () {
      expect(0).toEqual(1)
      always()
    });

    // the original rules must not change
    expect(Validator.Rules["not-foo"]).toBeUndefined();
  })

  it("must support custom messages for each rule definition", always => {
    var v = new Validator({
      options: {
        rules: {
          "not-foo": function (field, value, forced) {
            if (value === "foo")
              return v.getError("cannotBe", arguments);
            return true;
          }
        }
      }
    })

    v.validate([{ name: "not-foo", message: "Cannot be foo!" }], "", "foo").then(function (results) {
      const firstError = results[0];

      expect(firstError.error).toEqual(true);
      expect(firstError.message).toEqual("Cannot be foo!");
      always()
    }, function () {
      expect(0).toEqual(1)
      always()
    });
  })

  it("must support definition of new rules", always => {
    var k = 0;
    Validator.Rules.ufo = {
      fn: function () {
        k++;
        return true;
      }
    };

    var v = new Validator()

    v.validate(["ufo"], "", "").then(function (results) {
      const firstResult = results[0];
      
      expect(firstResult).toEqual(true);
      expect(k).toEqual(1);
      always()
    }, function () {
      expect(0).toEqual(1)
      always()
    });
  })

  it("must support definition of new rules (asynchronous)", always => {
    var k = 0;
    Validator.Rules.wait = {
      deferred: true,
      fn: function (field, value, forced, promiseProvider) {
        return new Promise(function (resolve, reject) {
          k++;
          setTimeout(() => {
            resolve(true);
          }, 5)
        })
      }
    };

    var v = new Validator()

    v.validate(["wait"], "", "").then(function (results) {
      const firstResult = results[0];
      
      expect(firstResult).toEqual(true);
      expect(k).toEqual(1);
      always()
    }, function () {
      expect(0).toEqual(1)
      always()
    });
  })

  it("must support definition of new rules (asynchronous, error)", always => {
    var k = 0;
    Validator.Rules.wait = {
      deferred: true,
      fn: function (field, value, forced, promiseProvider) {
        return new Promise(function (resolve, reject) {
          k++;
          setTimeout(() => {
            resolve({
              error: true,
              message: "Test"
            });
          }, 5)
        })
      }
    };

    var v = new Validator()

    v.validate(["wait"], "", "").then(function (results) {
      const firstError = results[0];

      expect(firstError.error).toEqual(true);
      expect(firstError.message).toEqual("Test");
      always()
    }, function () {
      expect(0).toEqual(1)
      always()
    });
  })

  it("must support definition of new rules (asynchronous, rejected due to failure)", always => {
    var k = 0;
    Validator.Rules.wait = {
      deferred: true,
      fn: function (field, value, forced, promiseProvider) {
        return new Promise(function (resolve, reject) {
          k++;
          setTimeout(() => {
            reject("Internal server error or anything else");
          }, 5)
        })
      }
    };

    var v = new Validator()

    v.validate(["wait"], "", "").then(function (results) {
      // we must not get here..
      expect(0).toEqual(1)
      always()
    }).catch(function (results) {
      const firstError = results[0];
      expect(firstError.error).toEqual(true);
      expect(firstError.message).toEqual("failedValidation");     
      always()
    });
  })

  it("must support onError callbacks for fields", always => {
    var v = new Validator({
      options: {
        rules: {
          "not-foo": function (field, value, forced) {
            if (value === "foo")
              return v.getError("cannotBe", arguments);
            return true;
          }
        }
      }
    })
    var k = 0;

    v.validate([{
      name: "not-foo", 
      onError: function (field, value, params) {
        k++;
        expect(value).toEqual("foo");
      },
      params: ["ufo"]
    }], "", "foo").then(function (results) {
      const firstError = results[0];

      expect(firstError.error).toEqual(true);
      expect(k).toEqual(1);
      always()
    }, function () {
      expect(0).toEqual(1)
      always()
    });
  })
})