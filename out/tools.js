"use strict";
/**!
 * Danii's Tools
 *
 * Copyright (c) 2019 Daniel Conley
 * Licensed under the GNU General Public License Version 3.
 * https://www.gnu.org/licenses/gpl-3.0.txt
 */
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
/*
   AAA  DDDD  DDDD  IIIII TTTTT IIIII  OOO  N   N  SSSS
  A   A D   D D   D   I     T     I   O   O NN  N S
  AAAAA D   D D   D   I     T     I   O   O N N N  SSS
  A   A D   D D   D   I     T     I   O   O N  NN     S
  A   A DDDD  DDDD  IIIII   T   IIIII  OOO  N   N SSSS
*/
/**
 * Internal function for defining a large amount of
 * properties, `values`, to an object, `target`.
 *
 * @param target The object to assign the `values` to.
 * @param values The values to be assigned.
 *
 * @template T The type of the target.
 */
let defineProperties = (target, values) => {
    let reducer = (map, key) => (Object.assign(Object.assign({}, map), { [key]: Object.assign(Object.assign({}, Object.getOwnPropertyDescriptor(values, key)), { "enumerable": false }) }));
    Object.defineProperties(target, Object.keys(values).reduce(reducer, {}));
};
/*
  Appended Properties
*/
//TODO: Fit code within 80 characters width.
defineProperties(Array.prototype, {
    get last() {
        return this[Math.max(0, this.length - 1)];
    },
    set last(item) {
        this[Math.max(0, this.length - 1)] = item;
    },
    crumble() {
        let switchObj = {
            "0": null,
            "1": this[0],
            "default": this,
        };
        return this.length > 1 ? switchObj.default : switchObj[this.length];
    },
    crumbleFlat(depth) {
        return this.flat(depth).crumble();
    },
    //TODO: Attempting to use Type Paramaters here is a nightmare, so any is used instead.
    reduceSkip(callback, initial) {
        let previousExists = false;
        let skip = Symbol.skip;
        let previous;
        let out = [];
        for (let index = 0; index < this.length; index++) {
            let value = this[index];
            if (!previousExists) {
                previousExists = true;
                if (arguments.length > 1)
                    previous = Object.clone(initial);
                else {
                    previous = value;
                    continue;
                }
            }
            let result = callback(previous, value, skip, index, this);
            if (result == skip) {
                out.push(previous);
                previousExists = false;
                index--;
            }
            else {
                previous = result;
            }
        }
        if (previousExists)
            out.push(previous);
        return out;
    },
    softReverse() {
        let ret = [];
        for (let entry of Array.from(this.entries()))
            ret[entry[0] * -1 + this.length - 1] = entry[1];
        return ret;
    }
});
defineProperties(Object, {
    clone(item) {
        if (typeof item != "object")
            return item;
        let Construct = item.constructor;
        //@ts-ignore: Construct WILL always have a construct
        //signature because we already handled all primitives.
        return Object.assign(new Construct(), item);
    },
    every(object, callback, thisArg) {
        return this.entries(object).every((a, i) => callback.call(thisArg, a, i, object));
    },
    filter(object, callback, thisArg) {
        return this.fromEntries(this.entries(object).filter((a, i) => callback.call(thisArg, a, i, object)));
    },
    getType(item) {
        return Object.getPrototypeOf(item).constructor.name;
    },
    objectHasOwnProperty(object, property) {
        return [].hasOwnProperty.call(object, property);
    },
    objectHasProperty(object, property) {
        let protoChain = [object];
        while (this.getPrototypeOf(protoChain.last) !== null)
            protoChain.push(this.getPrototypeOf(protoChain.last));
        return protoChain.some((proto) => this.objectHasOwnProperty(proto, property));
    }
});
defineProperties(String.prototype, {
    capitalize() {
        return this.substr(0, 1).toUpperCase() + this.substr(1);
    },
    escape(nonSpecials = true) {
        let charArray = this.split("");
        if (nonSpecials)
            charArray = charArray.map((char) => ['"', "'", "\\"].includes(char) ? "\\" + char : char);
        charArray = charArray.map((char) => ["\n", "\r", "\t"].includes(char) ? "\\" + { "\n": "n", "\r": "r", "\t": "t" }[char] : char);
        return charArray.join("");
    },
    toTitleCase() {
        return this.split(" ").map((word) => word.toLowerCase().capitalize()).join(" ");
    },
    interpolate(values) {
        let from = 0;
        let data = [];
        let asString = (obj) => obj === null ? "null" : obj === undefined ? "undefined" :
            typeof obj.toString == "function" ? obj.toString() :
                Object.prototype.toString.call(obj);
        let push = (content, code) => data.push({ content, "type": code ? "code" : "string" });
        [...this.matchAll(/\\?\$/g), null].forEach(val => {
            if (val && val[0].startsWith("\\"))
                return;
            let str = this.substring(from, val ? val.index : this.length);
            if (str)
                push(str);
            if (val) {
                let pos = findPairs(this, { "{": num => ++num, "}": num => ++num });
                let code = this.substring(val.index + 2, pos);
                if (code)
                    push(code, true);
                from = pos + 1;
            }
        });
        return data.reduce((acc, val) => acc + (val.type == "code" ?
            asString(evaluate(val.content, values)) :
            val.content), "");
    }
});
defineProperties(Symbol, {
    "skip": Symbol("skip")
});
/*
  FFFFF U   U N   N  CCCC TTTTT IIIII  OOO  N   N  SSSS
  F     U   U NN  N C       T     I   O   O NN  N S
  FFF   U   U N N N C       T     I   O   O N N N  SSS
  F     U   U N  NN C       T     I   O   O N  NN     S
  F      UUU  N   N  CCCC   T   IIIII  OOO  N   N SSSS
*/
const keywords = ["arguments", "in", "of", "for", "if", "else", "throw", "while", "do", "with", "function", "let", "const", "var", "new", "return", "delete"];
/**
 * Ensures that the mentioned method's this value will
 * always be that of the object it belongs to.
 *
 * @param proto Prototype of the object.
 * @param key Name of the function.
 * @param descriptor Function's descriptor.
 */
function bound(proto, key, descriptor) {
    if (proto.constructor == Object)
        descriptor = proto; //BABEL Fix
    let value = descriptor.value;
    delete descriptor.writable;
    delete descriptor.value;
    descriptor.get = function () { return value.bind(this); };
    return descriptor;
}
exports.bound = bound;
/**
 * Exclusion Reason:
 * This decorator currently doesn't work in TypeScript due
 * to TypeScript not allowing decorators to change the
 * signature of the underlying function.
 *
 * @param proto
 * @param key
 * @param descriptor
 * @deprecated This function doesn't work in TypeScript.
 */
function withSelf(proto, key, descriptor) {
    let value = descriptor.value;
    delete descriptor.writable;
    delete descriptor.value;
    descriptor.get = function () {
        let thisHere = this;
        return function (...items) {
            return value.call(thisHere, this, ...items);
        };
    };
    return descriptor;
}
/**
 * Works like the `eval` function, except it's evaluated
 * within a function, so it's safer. You can set the name
 * and values of the arguments to be used with the args
 * object, and it'll return a value with or without a
 * return statement in the provided code.
 *
 * Exclusion reason: Uhhh it's new so yeah?
 *
 * @param code The code to be executed.
 * @param args The arguments to be used.
 */
function evaluate(code, args = {}) {
    let specialArgNames = ["this"];
    let specialArgs = {};
    args = Object.filter(args, ([key, value]) => {
        if (specialArgNames.includes(key)) {
            specialArgs[key] = value;
            return false;
        }
        else if (keywords.includes(key)) {
            throw new TypeError("Illegal argument name provided.");
        }
        else
            return true;
    });
    let argNames = args ? Object.keys(args) : [];
    let argValues = args ? Object.values(args) : [];
    let finalCode = `try{return eval("${code.escape()}")}catch(a){if(!(a ` +
        'instanceof SyntaxError))throw a;let b=JSON.parse("' +
        JSON.stringify(argNames).escape() + '");return new Function(...b,"' +
        code.escape() + '")(...arguments)}';
    let func = new Function(...argNames, finalCode);
    return func.call(specialArgs.this ? specialArgs.this : this, ...argValues);
}
function findPairs(stringOrOperators, operatorsOrLocation, locationOrDepth, depthArg) {
    const [string, operators, location, depth] = stringOrOperators instanceof Array || typeof stringOrOperators == "string" ||
        stringOrOperators instanceof String ?
        [
            typeof stringOrOperators == "string" ?
                stringOrOperators.split("") : stringOrOperators,
            operatorsOrLocation,
            locationOrDepth || 0,
            depthArg == null ? -1 : depthArg
        ] :
        [
            this.split(""),
            stringOrOperators,
            operatorsOrLocation || 0,
            locationOrDepth == null ? -1 : locationOrDepth
        ];
    if (depth == 0)
        return location;
    const operation = operators[string[location]];
    const newDepth = operation ? operation(depth == -1 ? 0 : depth) : depth;
    return findPairs(string, operators, location + 1, newDepth);
}
/*
   CCCC L      AAA   SSSS  SSSS EEEEE  SSSS
  C     L     A   A S     S     E     S
  C     L     AAAAA  SSS   SSS  EEE    SSS
  C     L     A   A     S     S E         S
   CCCC LLLLL A   A SSSS  SSSS  EEEEE SSSS
*/
class Exception extends Error {
    constructor(message) {
        super(message);
        this.name = this.constructor.name;
        try {
            this.stackModel = Exception.parseError(this).stack;
        }
        catch (ex) {
            this.stackModel = undefined;
        }
    }
    static parseError(error) {
        return this.parseNodeError(error.stack);
    }
    static parseNodeError(error) {
        let output = {};
        let stackMatch = error.match(this.nodeError);
        output.name = stackMatch[1];
        output.message = stackMatch[2];
        output.stack = stackMatch[3].split("\n").map(this.parseNodeStackFrame);
        return output;
    }
    static parseNodeStackFrame(frame) {
        let output = {};
        let stackFrameMatch = frame.match(this.nodeStackFrame);
        let stackFileMatch;
        console.log(frame);
        if (stackFrameMatch[2] == null) {
            stackFileMatch = stackFrameMatch[1].match(this.nodeFileDescriptor);
        }
        else {
            output.name = stackFrameMatch[1];
            if (output.name.startsWith("new ")) {
                output.name = output.name.substr(4);
                output.isConstructor = true;
            }
            stackFileMatch = stackFrameMatch[2].match(this.nodeFileDescriptor);
            if (!stackFileMatch) {
                let stackEvalMatch = stackFrameMatch[2].match(this.nodeEvalDescriptor);
                if (stackEvalMatch)
                    return this.parseNodeEvalDescriptor(output.name, stackFrameMatch[2]);
            }
        }
        if (stackFileMatch) {
            output.file = stackFileMatch[1];
            output.line = parseInt(stackFileMatch[2]);
            output.column = parseInt(stackFileMatch[3]);
        }
        else
            output.isNative = true;
        return output;
    }
    static parseNodeEvalDescriptor(evaluateeName, evalDescriptor) {
        let output = { "name": evaluateeName, "evaluater": {} };
        let stackEvalMatch = evalDescriptor.match(this.nodeEvalDescriptor);
        let stackEvalMatch2 = stackEvalMatch[2].match(this.nodeEvalDescriptor);
        if (stackEvalMatch2) {
            output.evaluater =
                this.parseNodeEvalDescriptor(stackEvalMatch[1], stackEvalMatch[2]);
        }
        else {
            output.evaluater.name = stackEvalMatch[1];
            if (output.evaluater.name.startsWith("new ")) {
                output.evaluater.name = output.evaluater.name.substr(4);
                output.evaluater.isConstructor = true;
            }
            let stackFileMatch = stackEvalMatch[2].match(this.nodeFileDescriptor);
            output.evaluater.file = stackFileMatch[1];
            output.evaluater.line = parseInt(stackFileMatch[2]);
            output.evaluater.column = parseInt(stackFileMatch[3]);
        }
        if (stackEvalMatch[3]) {
            let stackFileMatch = stackEvalMatch[3].match(this.nodeFileDescriptor);
            output.file = stackFileMatch[1];
            output.line = parseInt(stackFileMatch[2]);
            output.column = parseInt(stackFileMatch[3]);
        }
        return output;
    }
}
Exception.nodeError = /^(.*?)(?:: (.*?))?\n([\w\W]*)$/;
Exception.nodeStackFrame = /^\s*at\s+(.+?)(?:\s+\((.+?)\))?$/; //match 1: nodeFileDescriptor | functionName: string, match 2: nodeFileDescriptor | nodeEvalDescriptor | null
Exception.nodeFileDescriptor = /^(\S*?):(\d+):(\d+)$/; //match 1: fileName: string, match 2: line: number, match 3: column: number
Exception.nodeEvalDescriptor = /^eval\s+at\s+(.*?)\s+\((.*?)\)(?:, (.*?))?$/; //match 1: evaluateeFunc: string, match 2: nodeFileDescriptor | nodeEvalDescriptor, match 3: nodeFileDescriptor | null
__decorate([
    bound
], Exception, "parseNodeError", null);
__decorate([
    bound
], Exception, "parseNodeStackFrame", null);
__decorate([
    bound
], Exception, "parseNodeEvalDescriptor", null);
Error.stackTraceLimit = Infinity;
try {
    function MyThing() {
        throw new Exception();
    }
    new MyThing();
}
catch (ex) {
    console.log(ex.stackModel);
}
