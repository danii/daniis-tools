"use strict";
//!!! THIS FILE IS OUTDATED CURRENTLY
/**
 * Danii's Tools
 *
 * This is a set of tools that I add to and use daily, it adds functionality to
 * objects and such that I feel should be implemented in Javascript.
 *
 * ©\2019 Daniel Conley ...not, but maybe one day haha.
 * (Would be under a public liscense obv.)
 */
Object.defineProperty(exports, "__esModule", { value: true });
/*
  Definitions
*/
let defineProperties = (target, values) => {
    let reducer = (map, key) => ({ ...map, [key]: { ...Object.getOwnPropertyDescriptor(values, key), "enumerable": false } });
    Object.defineProperties(target, Object.keys(values).reduce(reducer, {}));
};
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
    //Attempting to use Type Paramaters here is a nightmare, so any is used
    //instead.
    /**
     *
     * @param this
     * @param callback
     * @param initial
     */
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
        let match;
        let bldr = this.split("");
        let vars = `let [${Object.keys(values)}] = [${Object.keys(values).map((key) => "values." + key)}]`;
        while ((match = bldr.indexOf("$", ++match)) != -1) {
            if (bldr[match++ - 1] == "\\" || bldr[match++] != "{")
                continue;
            let bracks = 1;
            let end = match;
            while ((bldr[end] == "}" ? bracks-- : bldr[end] == "{" ? bracks++ : bracks) > 0)
                end++;
            end--;
            let code = bldr.slice(match--, end).join("");
            bldr.splice(--match, end - --match, `${eval(`${vars}; (${code.escape(false)})`)}`);
        }
        return bldr.join("");
    }
});
defineProperties(Symbol, {
    "skip": Symbol("skip")
});
/*
  Errors
*/
class AdvancedError extends Error {
    constructor(message, suppressed) {
        if (message instanceof Error)
            [message, suppressed] = [undefined, message];
        super();
        // if (!(this instanceof arguments.callee)) {
        //   let Construct = arguments.callee as Constructor<any>;
        //   let thiz = Object.create(Construct.prototype);
        //   eval("_this = thiz");
        //   let protos: Constructor<any>[] = [];
        //   let Proto = Construct;
        //   while (Proto.name != "") {
        //     Proto = Object.getPrototypeOf(Proto);
        //     protos.unshift(Proto);
        //   }
        //   let reducer = (thiz: AdvancedError, proto) => {return proto.call(thiz), thiz;};
        //   thiz = protos.reduce(reducer, this);
        //   eval("_this = thiz");
        //   let p = new Error();
        //   this.stack = p.stack;
        // }
        this.description = message;
        this.name = this.constructor.name;
        this.stackMap = AdvancedError.parseStack(this.stack);
        if (suppressed) {
            this.suppressed = suppressed;
            if (!(suppressed instanceof AdvancedError)) {
                this.suppressedStackMap = AdvancedError.parseStack(suppressed.stack);
            }
        }
        let hidden = (common) => {
            return {
                get() {
                    console.log(new Error().stack);
                    if (AdvancedError.parseStack(new Error().stack).length > 1) {
                        return common;
                    }
                    else {
                        console.debug("Error thrown: ", this);
                        return this.displayedStack;
                    }
                }
            };
        };
        Object.defineProperties(this, {
            "stack": hidden(this.stackMap),
            "message": hidden(this.description)
        });
        this.displayedStack = AdvancedError.stringifyStack(this);
    }
    /**
     * Creates a class that extends this class.
     *
     * @param name The name of the new class.
     * @returns A class constructor function extending this class.
     */
    static extend(name) {
        name = name.capitalize();
        let { [name]: extended } = { [name]: class extends this {
            } };
        return extended;
    }
    static stringifyStack(error) {
        if (!(error instanceof AdvancedError))
            return error.stack;
        let errors = [error];
        while (error instanceof AdvancedError && error.suppressed)
            errors.push(error = error.suppressed);
        let string = "";
        let lastStack;
        errors.forEach((error, index) => {
            let fullStack = error instanceof AdvancedError ?
                error.stackMap :
                errors[index - 1].suppressedStackMap;
            let usedStack = Object.clone(fullStack);
            if (lastStack) {
                let rLastStack = lastStack.softReverse();
                let lcsf = usedStack.softReverse().find((frame, index) => {
                    let compare = rLastStack[index];
                    return !compare || frame.methodName != compare.methodName ||
                        frame.file != compare.file;
                });
                usedStack.splice(usedStack.indexOf(lcsf) + 2);
            }
            string += (index != 0 ? "\nCaused by: " : "") + error.name;
            if (error.message)
                string += ": " + error.message;
            usedStack.forEach((stack) => {
                string += "\n\tat " + stack.methodName + " (" + stack.file + ":" +
                    stack.lineNumber + ":" + stack.column + ")";
            });
            if (usedStack.length < fullStack.length)
                string += "\n\t... " + (fullStack.length - usedStack.length) + " more";
            lastStack = fullStack;
        });
        return string;
    }
    static parseStack(stackString) {
        const lines = stackString.split('\n');
        return lines.reduce((stack, line) => {
            const parseResult = AdvancedError.parseChrome(line) ||
                AdvancedError.parseWinjs(line) ||
                AdvancedError.parseGecko(line) ||
                AdvancedError.parseNode(line) ||
                AdvancedError.parseJSC(line);
            if (parseResult) {
                stack.push(parseResult);
            }
            return stack;
        }, []);
    }
    static parseChrome(line) {
        const chromeRe = /^\s*at (.*?) ?\(((?:file|https?|blob|chrome-extension|native|eval|webpack|<anonymous>|\/).*?)(?::(\d+))?(?::(\d+))?\)?\s*$/i;
        const chromeEvalRe = /\((\S*)(?::(\d+))(?::(\d+))\)/;
        const parts = chromeRe.exec(line);
        if (!parts) {
            return null;
        }
        const isNative = parts[2] && parts[2].indexOf('native') === 0; // start of line
        const isEval = parts[2] && parts[2].indexOf('eval') === 0; // start of line
        const submatch = chromeEvalRe.exec(parts[2]);
        if (isEval && submatch != null) {
            // throw out eval line/column and use top-most line/column number
            parts[2] = submatch[1]; // url
            parts[3] = submatch[2]; // line
            parts[4] = submatch[3]; // column
        }
        return {
            file: !isNative ? parts[2] : null,
            methodName: parts[1] || AdvancedError.UNKNOWN_FUNCTION,
            arguments: isNative ? [parts[2]] : [],
            lineNumber: parts[3] ? +parts[3] : null,
            column: parts[4] ? +parts[4] : null,
        };
    }
    static parseWinjs(line) {
        const winjsRe = /^\s*at (?:((?:\[object object\])?.+) )?\(?((?:file|ms-appx|https?|webpack|blob):.*?):(\d+)(?::(\d+))?\)?\s*$/i;
        const parts = winjsRe.exec(line);
        if (!parts) {
            return null;
        }
        return {
            file: parts[2],
            methodName: parts[1] || AdvancedError.UNKNOWN_FUNCTION,
            arguments: [],
            lineNumber: +parts[3],
            column: parts[4] ? +parts[4] : null,
        };
    }
    static parseGecko(line) {
        const geckoRe = /^\s*(.*?)(?:\((.*?)\))?(?:^|@)((?:file|https?|blob|chrome|webpack|resource|\[native).*?|[^@]*bundle)(?::(\d+))?(?::(\d+))?\s*$/i;
        const geckoEvalRe = /(\S+) line (\d+)(?: > eval line \d+)* > eval/i;
        const parts = geckoRe.exec(line);
        if (!parts) {
            return null;
        }
        const isEval = parts[3] && parts[3].indexOf(' > eval') > -1;
        const submatch = geckoEvalRe.exec(parts[3]);
        if (isEval && submatch != null) {
            // throw out eval line/column and use top-most line number
            parts[3] = submatch[1];
            parts[4] = submatch[2];
            parts[5] = null; // no column when eval
        }
        return {
            file: parts[3],
            methodName: parts[1] || AdvancedError.UNKNOWN_FUNCTION,
            arguments: parts[2] ? parts[2].split(',') : [],
            lineNumber: parts[4] ? +parts[4] : null,
            column: parts[5] ? +parts[5] : null,
        };
    }
    static parseJSC(line) {
        const javaScriptCoreRe = /^\s*(?:([^@]*)(?:\((.*?)\))?@)?(\S.*?):(\d+)(?::(\d+))?\s*$/i;
        const parts = javaScriptCoreRe.exec(line);
        if (!parts) {
            return null;
        }
        return {
            file: parts[3],
            methodName: parts[1] || AdvancedError.UNKNOWN_FUNCTION,
            arguments: [],
            lineNumber: +parts[4],
            column: parts[5] ? +parts[5] : null,
        };
    }
    static parseNode(line) {
        const nodeRe = /^\s*at (?:((?:\[object object\])?\S+(?: \[as \S+\])?) )?\(?(.*?):(\d+)(?::(\d+))?\)?\s*$/i;
        const parts = nodeRe.exec(line);
        if (!parts) {
            return null;
        }
        return {
            file: parts[2],
            methodName: parts[1] || AdvancedError.UNKNOWN_FUNCTION,
            arguments: [],
            lineNumber: +parts[3],
            column: parts[4] ? +parts[4] : null,
        };
    }
    toString() {
        return this.displayedStack;
    }
}
AdvancedError.UNKNOWN_FUNCTION = '<unknown>';
exports.AdvancedError = AdvancedError;
class ArbitraryDataError extends AdvancedError {
    constructor(data, message, suppressed) {
        super(message, suppressed);
        this.data = data;
    }
    getData() {
        return this.data;
    }
}
let AdvancedTypeError = AdvancedError.extend("AdvancedTypeError");
let NullError = AdvancedTypeError.extend("NullError");
let ArgumentsError = AdvancedError.extend("ArgumentsError");
