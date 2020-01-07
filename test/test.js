const assert = require("assert");
const tools = require("./../dist/commonjs-tools");

/**
 * Typescript's tired and true __decorate function.
 */
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
  var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
  if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
  else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
  return c > 3 && r && Object.defineProperty(target, key, r), r;
};

async function assertPromiseReject(promise, error) {
  class PromiseCompleted extends Error {};
  try {
    await promise;
    throw new PromiseCompleted();
  } catch (err) {
    if (err instanceof PromiseCompleted)
      throw new Error("Promise was completed, but it was expected to be rejected.");
    if (!(err instanceof error))
      throw new Error(`Promise rejected with a ${Object.getPrototypeOf(err).constructor.name}, but it was expected to be rejected with a ${error.name}.`);
  }
}

async function assertPromiseStrictEqual(promise, result) {
  assert.strictEqual(await promise, result);
}

function assertSimilarButNotSame(inputA, inputB) {
  assert(Object.entries(inputA).every(entryA =>
    Object.entries(inputB).find(entryB =>
      entryA[0] == entryB[0] && entryA[1] == entryB[1])));
  assert(inputA != inputB);
}

describe("Array", function() {
  describe("#last", function() {
    it("should be the last element in the array", function() {
      let array = [1, 2, 3];
      assert.strictEqual(array.last, 3);
    });

    it("should be assignable to", function() {
      let array = ["a", "b", "e"];
      let newValue = "c";
      array.last = newValue;
      assert.strictEqual(array[2], newValue);
    });
  });

  describe("#crumble()", function() {
    it("should return null when ran upon an empty array", function() {
      assert.strictEqual([].crumble(), null);
    });

    it("should return the only element when ran upon an array of length one", function() {
      let value = "Hello!";
      let array = [value];
      assert.strictEqual(array.crumble(), value);
    });

    it("should return the array itself when ran upon an array of length greater than one", function() {
      let array = ["Hello", "world!"];
      assert.strictEqual(array.crumble(), array);
    });
  });

  //TODO: Make tests for #crumbleFlat().
  //TODO: Deprecate reduceSkip or fix it.

  describe("#softReverse()", function() {
    it("should return the same value as #reverse()", function() {
      let hardReverse = [1, 2, 3];
      let softReverse = [1, 2, 3];
      
      hardReverse.reverse();
      softReverse = softReverse.softReverse();

      assertSimilarButNotSame(hardReverse, softReverse);
    });

    it("should not modify it's self", function() {
      let array = [1, 2, 3];
      let result = array.softReverse();
      
      assert.strictEqual(array[2], 3);
      assert.notStrictEqual(result, array);
    });
  });
});

describe("Object", function() {
  describe(".clone()", function() {
    it("should return the input, if the input is a primitive", function() {
      let tests = ["Hello world!", 2558, Symbol("Secret!")];
      tests.forEach(test => assert.strictEqual(Object.clone(test), test));
    });

    it("should return an exact copy of the input that is not the input object, if the input is not a primitive", function() {
      let tests = [[1, 2, 3], {"a": "A", "A": "a"}, new Date()];
      tests.forEach(test => assertSimilarButNotSame(Object.clone(test), test));
    });
  });

  //TODO: Object manipulation methods soonTM. (Not serious use of TM.)

  describe(".getType()", function() {
    it('should return the input\'s typeof value if it is not typeof "object"', function() {
      let tests = ["Thinking up values for tests is hard.", 8764, Symbol("Another secret!")];
      tests.forEach(test => assert.strictEqual(Object.getType(test), typeof test));
    });

    it("should return the inputs's contructor's name if it is typeof is \"object\"", function() {
      let tests = {"Object": {"i am": "an object"}, "Array": [1, 2, 3], "RegExp": /[\w\W]*/g};
      Object.entries(tests).forEach(test => assert.strictEqual(Object.getType(test[1]), test[0]));
    });
  });

  //TODO: Make tests for objectHasOwnProperty & objectHasProperty or deprecate them.
});

describe("String", function() {
  describe("#capitalize()", function() {
    it("should ensure the first character is capitalized", function() {
      assert.strictEqual("hello there.".capitalize(), "Hello there.");
    });
  });

  //TODO: Make tests for escape.

  describe("#toTitleCase()", function() {
    it("should convert the string to title case", function() {
      assert.strictEqual("this is my video TITLE".toTitleCase(), "This Is My Video Title");
    });
  });

  describe("#interpolate()", function() {
    it("should allow insertion of variables at a later point in time", function() {
      let template = "You ${action} ${money} dollars!";
      assert.strictEqual(template.interpolate({"action": "won", "money": 5000}), "You won 5000 dollars!");
    });

    it("should allow manipulation of given variables", function() {
      let template = 'There ${Object.keys(entries).length == 1 ? "is" : "are"} ${Object.keys(entries).length} entr${Object.keys(entries).length == 1 ? "y" : "ies"}.';
      assert.strictEqual(template.interpolate({"entries": {"a": "1", "b": "2"}}), "There are 2 entries.");
      assert.strictEqual(template.interpolate({"entries": {"a": "1"}}), "There is 1 entry.");
    });
  });
});

describe("bound", function() {
  it("should update the property descriptor passed or return a new property descriptor with a getter", function() {
    let descriptor = {
      "value": function() {
        return this;
      },
      "writable": false
    };

    let object = {
      "whatsThis": descriptor.value
    };

    descriptor = tools.bound(object, "whatsThis", descriptor) || descriptor;

    assert.strictEqual(descriptor.writeable, undefined);
    assert.strictEqual(descriptor.value, undefined);
    assert.strictEqual(typeof descriptor.get, "function");
  });

  it("should permanently bind the provided function to it's target", function() {
    let object = {
      func() {
        return this;
      }
    };

    __decorate([tools.bound], object, "func", null);

    assert.strictEqual(object.func.call({}), object);
  });
});

describe("evaluate", function() {
  it("should evaluate any valid javascript code passed to it", function() {
    const promises = [
      assertPromiseStrictEqual(tools.evaluate('"value to be returned"'), "value to be returned"),
      assertPromiseStrictEqual(tools.evaluate('const item = 19; "not an expression!"'), undefined),
      assertPromiseStrictEqual(tools.evaluate('const data = 42; return "this should return though"'), "this should return though"),
      assertPromiseReject(tools.evaluate('def func:\n\tprint("not js code!")'), SyntaxError)
    ];

    return Promise.all(promises);
  });

  it("should support passing values to the code as arguments", function() {
    const object = {};
    const promises = [
      assertPromiseStrictEqual(tools.evaluate("num + 1", {"num": 6}), 7),
      assertPromiseStrictEqual(tools.evaluate("a + b", {"a": 1, "b": 10}), 11),
      assertPromiseStrictEqual(tools.evaluate("passThrough", {"passThrough": object}), object),
      assertPromiseReject(tools.evaluate("undefined", {"50notValid": 420, "this": 69}), Error)
    ];

    return Promise.all(promises);
  });

  it("should have versitile argument arrangements", function() {
    const promises = [
      assertPromiseStrictEqual(tools.evaluate('"direct"'), "direct"),
      assertPromiseStrictEqual(tools.evaluate("`seperate ${arg}`", {"arg": "arguments"}), "seperate arguments"),
      assertPromiseStrictEqual(tools.evaluate("String(arg)", {"args": "seperate options"}, {"asynchronous": true}).then(prom => prom), "seperate options"),
      assertPromiseStrictEqual(tools.evaluate({"code": 'value + " " + value2', "arguments": {"value": "one", "value2": "options object"}}), "one options object")
    ];
    
    return Promise.all(promises);
  });
});
