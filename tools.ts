/**
 * Danii's Tools
 * 
 * This is a set of tools that I add to and use daily, it adds functionality to
 * objects and such that I feel should be implemented in Javascript.
 * 
 * All content belongs to their rightful owners.
 * 
 * 
 * hi, i'm getting things cleaned up here.
 */

/*
  Types
*/
type Getter = () => any;
type Setter = (v: any) => void;
type Pair<K, V> = [K, V];
type Entry<T> = Pair<Key, T>;
//type A<K extends string | number, V> = {[key: string | number]: V}; //https://github.com/microsoft/TypeScript/pull/26797
type Of<T> = {[key: string]: T}; //A<string | number, T>;
type Key = string | number | symbol;
type Constructor<T> = {new(): (...args: any[]) => T, prototype: Prototype<T>} & Function;
type Prototype<T> = {constructor: Constructor<T>};
type Timeout = ReturnType<typeof setTimeout> | ReturnType<typeof setInterval>;

type Mapper<V, R, F = V[], T = any> = (this: T, current: V, index?: number, object?: F) => R;
type Reducer<V, R, F = V[], I = V> = (accumulator: R | I, current: V, index?: number, object?: F) => R;
type Consumer<V, F = V[], T = any> = Mapper<V, void, F, T>;

type StackFrame = {
  file: string,
  methodName: string,
  arguments: string[],
  lineNumber: number,
  column: number
};



/*
  Definitions
*/
let defineProperties = <T>(target: T, values: Partial<T>) => {
  let reducer = (map, key) => ({...map, [key]: {...Object.getOwnPropertyDescriptor(values, key), "enumerable": false}});
  Object.defineProperties(target, Object.keys(values).reduce<PropertyDescriptorMap>(reducer, {}));
}

declare global {
  interface Array<T> {
    //New Getters / Setters
    last: T;
  
    //New Functions
  
    /**
     * Executes .flat and .crumble all in one go.
     * 
     * @see Array.prototype.flat
     * @see Array.prototype.crumble
     * @param depth The maximum recusrion depth.
     * @returns Null, one element or the array with sub arrays concatinated.
     */
    crumbleFlat(depth?: number): null | T | T[];
  
    /**
     * Returns null if nothing is in the array, or the one element in an array
     * if the array only contains one value, otherwise the array itself if more
     * than one elements are stored.
     * 
     * Can be thought of as trying to remove an array's brackets.
     * 
     * @returns Null, one element or the array itself.
     */
    crumble(): null | T | T[];
  
    reduceSkip<R = T>(callback: (previous: T | R, current: T, skip: symbol, index?: number, array?: T[]) => R | symbol): (T | R)[];
    reduceSkip<R = T, I = T>(callback: (previous: R | I, current: T, skip: symbol, index?: number, array?: T[]) => R | symbol, initial?: I): (R | I)[];
  
    /**
     * Reverses the elements in an array without changing itself.
     * 
     * @returns A new array with the values reversed.
     */
    softReverse(): T[];
  
    //Better Typed Functions
    every<TH = any>(callback: Mapper<T, boolean, this, TH>, thisArg?: TH): boolean;
    filter<TH = any>(callback: Mapper<T, boolean, this, TH>, thisArg?: TH): T[];
    find<TH = any>(callback: Mapper<T, boolean, this, TH>, thisArg?: TH): T;
    findIndex<TH = any>(callback: Mapper<T, boolean, this, TH>, thisArg?: TH): number;
    forEach<TH = any>(callback: Consumer<T, this, TH>, thisArg?: TH): void;
    map<R = void, TH = any>(callback: Mapper<T, R, this, TH>, thisArg?: TH): R[];
    reduce<R = T>(callback: Reducer<T, R, this>): T | R;
    reduce<R = T, I = T>(callback: Reducer<T, R, this, I>, initial: I): R | I;
    reduceRight<R = T>(callback: Reducer<T, R, this>): T | R;
    reduceRight<R = T, I = T>(callback: Reducer<T, R, this, I>, initial: I): R | T;
    some<TH = any>(callback: Mapper<T, boolean, this, TH>, thisArg?: TH): boolean;
  }

  interface ObjectConstructor {
    //New Functions
    clone<T extends Object>(item: T): T;
  
    every<T, V, TH = any>(object: Of<V> & T, callback: Mapper<Entry<V>, boolean, T, TH>, thisArg?: TH): boolean;
    filter<T, V, TH = any>(object: Of<V> & T, callback: Mapper<Entry<V>, boolean, T, TH>, thisArg?: TH): Of<V>;
  
    getType(item: any): string;
    objectHasOwnProperty(object: any, property: Key): boolean;
    objectHasProperty(object: any, property: Key): boolean;
    
    //Better Typed Functions
    entries<T>(object: Of<T>): Entry<T>[];
    fromEntries<T>(entries: Entry<T>[]): Of<T>;
    getPrototypeOf<T>(constructor: T): Prototype<T>;
    getPrototypeOf(constructor: any): any;
  }

  interface String {
    //New Functions
    capitalize(): string;
    escape(nonSpecials: boolean): string;
    toTitleCase(): string;

    /**
     * Interpolates a string as if it was a template.
     * It should be noted that templates execute code, and that has
     * been emulated by this function.
     * 
     * @param str String to interpolate with.
     * @param values The variables supplied.
     */
    interpolate(values: Of<any>);
  }

  interface SymbolConstructor {
    readonly skip: symbol;
  }
}

defineProperties(Array.prototype, {
  get last(this: any[]) {
    return this[Math.max(0, this.length - 1)];
  },

  set last(this: any[], item: any) {
    this[Math.max(0, this.length - 1)] = item;
  },

  crumble(this: any[]) {
    let switchObj = {
      "0": null,
      "1": this[0],
      "default": this,
    };

    return this.length > 1 ? switchObj.default : switchObj[this.length];
  },
  
  crumbleFlat(this: any[], depth?: number) {
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
  reduceSkip<Type>(this: Type[], callback: (previous: any, current: Type,
      skip: symbol, index: number, array: Type[]) => any, initial: any): any[] {
    let previousExists = false;
    let skip = Symbol.skip;
    let previous;
    let out = [];

    for (let index = 0; index < this.length; index++) {
      let value = this[index];
      if (!previousExists) {
        previousExists = true;
        if (arguments.length > 1) previous = Object.clone(initial);
        else {previous = value; continue;}
      }

      let result = callback(previous, value, skip, index, this);
      if (result == skip) {
        out.push(previous);
        previousExists = false;
        index--;
      } else {
        previous = result;
      }
    }
    if (previousExists) out.push(previous);
    return out;
  },

  softReverse(this: any[]) {
    let ret = [];
    for (let entry of Array.from(this.entries())) ret[entry[0] * -1 + this.length - 1] = entry[1];
    return ret;
  }
} as Partial<any[]>);

defineProperties(Object, {
  clone<T extends Object>(item: T): T {
    if (typeof item != "object") return item;

    let Construct: Constructor<T> = item.constructor as Constructor<T>;
    return Object.assign(new Construct(), item);
  },

  every<Type, Values, This = any>(this: ObjectConstructor, object: Of<Values> & Type, callback: Mapper<Entry<Values>, boolean, Type, This>, thisArg?: This): boolean {
    return this.entries(object).every((a, i) => callback.call(thisArg, a, i, object));
  },

  filter<Type, Values, This = any>(this: ObjectConstructor, object: Of<Values> & Type, callback: Mapper<Entry<Values>, boolean, Type, This>, thisArg?: This): Of<Values> {
    return this.fromEntries(this.entries(object).filter((a, i) => callback.call(thisArg, a, i, object)));
  },

  getType(item: any) {
    return Object.getPrototypeOf(item).constructor.name;
  },

  objectHasOwnProperty(object: any, property: Key) {
    return [].hasOwnProperty.call(object, property);
  },

  objectHasProperty(this: ObjectConstructor, object: any, property: Key) {
    let protoChain: Prototype<Object>[] = [object];
    while (this.getPrototypeOf(protoChain.last) !== null) protoChain.push(this.getPrototypeOf(protoChain.last));
    return protoChain.some((proto) => this.objectHasOwnProperty(proto, property));
  }
});

defineProperties(String.prototype, {
  capitalize() {
    return this.substr(0, 1).toUpperCase() + this.substr(1);
  },

  escape(nonSpecials: boolean = true) {
    let charArray = this.split("");
    if (nonSpecials) charArray = charArray.map((char) => ['"', "'", "\\"].includes(char) ? "\\" + char : char)
    charArray = charArray.map((char) => ["\n", "\r", "\t"].includes(char) ? "\\" + {"\n": "n", "\r": "r", "\t": "t"}[char] : char);
    return charArray.join("");
  },

  toTitleCase() {
    return this.split(" ").map((word) => word.toLowerCase().capitalize()).join(" ");
  },

  interpolate(this: string, values: Of<any>) {
    let match: number;
    let bldr = this.split("");
    let vars = `let [${Object.keys(values)}] = [${Object.keys(values).map((key) => "values." + key)}]`;
    while ((match = bldr.indexOf("$", ++match)) != -1) {
      if (bldr[match++ - 1] == "\\" || bldr[match++] != "{") continue;
      let bracks = 1;
      let end = match;
      while ((bldr[end] == "}" ? bracks-- : bldr[end] == "{" ? bracks++ : bracks) > 0) end++;
      end--;
      let code = bldr.slice(match--, end).join("");
      bldr.splice(--match, end - --match, `${eval(`${vars}; (${code.escape(false)})`)}`);
    }
    return bldr.join("");
  }
} as Partial<String>);

defineProperties(Symbol, {
  "skip": Symbol("skip")
});


/**
 * Ensures that the mentioned method's this value will always be that of the
 * object it belongs to.
 * 
 * @param proto Prototype of the object.
 * @param key Name of the function.
 * @param descriptor Function's descriptor.
 */
function bound<Type extends (...a: any[]) => any>(proto: Object, key: string, descriptor: TypedPropertyDescriptor<Type>) {
  if (proto.constructor == Object) descriptor = proto; //BABEL Fix

  let value = descriptor.value;
  delete descriptor.writable;
  delete descriptor.value;

  descriptor.get = function() {
    return value.bind(this) as Type;
  }
  return descriptor;
}

/**
 * 
 * 
 * This decorator currently doesn't work in TypeScript due to TypeScript not
 * allowing decorators to change the signature of the underlying function.
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

  descriptor.get = function() {
    let thisHere = this;
    return function(...items) {
      return value.call(thisHere, this, ...items);
    }
  }
  return descriptor;
}



/*
  Errors
*/
class AdvancedError extends Error {
  private static readonly UNKNOWN_FUNCTION = '<unknown>';

  /**
   * Creates a class that extends this class.
   * 
   * @param name The name of the new class.
   * @returns A class constructor function extending this class.
   */
  public static extend(name: string): typeof AdvancedError {
    name = name.capitalize();
    let {[name]: extended} = {[name]: class extends this {}};
    return extended;
  }

  //!!! I DO NOT OWN THE STACK TRACE PARSERS BELOW. THESE WERE BRROWED FROM A STACK OVERFLOW POST.
  public static stringifyStack(error: Error) {
    if (!(error instanceof AdvancedError)) return error.stack;

    let errors: Error[] = [error];
    while (error instanceof AdvancedError && error.suppressed)
        errors.push(error = error.suppressed);

    let string = "";
    let lastStack: StackFrame[];
    errors.forEach((error, index) => {
      let fullStack = error instanceof AdvancedError ?
          error.stackMap :
          (errors[index - 1] as AdvancedError).suppressedStackMap;

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
      if (error.message) string += ": " + error.message;
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

  public static parseStack(stackString: string): StackFrame[] {
    const lines = stackString.split('\n');

    return lines.reduce((stack, line) => {
      const parseResult =
        AdvancedError.parseChrome(line) ||
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
  
  private static parseChrome(line: string): StackFrame {
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

  
  private static parseWinjs(line: string): StackFrame {
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
  
  private static parseGecko(line: string): StackFrame {
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

  private static parseJSC(line: string): StackFrame {
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

  private static parseNode(line: string): StackFrame {
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

  public readonly stack: any;
  public readonly message: any;
  private displayedStack: string;
  private readonly description: string;
  private readonly stackMap: StackFrame[];

  public readonly suppressed?: Error;
  private suppressedStackMap?: StackFrame[];

  public constructor(message?: string | Error, suppressed?: Error) {
    if (message instanceof Error) [message, suppressed] = [undefined as string, message];
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

    let hidden = <C>(common: C) => {
      return {
        get(this: AdvancedError): string | C {
          if (AdvancedError.parseStack(new Error().stack).length > 1) {
            return common;
          } else {
            return this.displayedStack;
          }
        }
      }
    };
    Object.defineProperties(this, {
      "stack": hidden(this.stackMap),
      "message": hidden(this.description)
    });

    this.displayedStack = AdvancedError.stringifyStack(this);
  }

  public toString() {
    return this.displayedStack;
  }
}

class ArbitraryDataError<Type> extends AdvancedError {
  private readonly data: Type;

  constructor(data: Type, message: string | Error, suppressed?: Error) {
    super(message, suppressed);
    this.data = data;
  }

  public getData() {
    return this.data;
  }
}

class StringBuilder extends Array<string> {
  public join(glue?: string) {
    return super.join(glue || "");
  }
}

let AdvancedTypeError = AdvancedError.extend("AdvancedTypeError");
let NullError = AdvancedTypeError.extend("NullError");

let ArgumentsError = AdvancedError.extend("ArgumentsError");

export {AdvancedError, Of, bound, Timeout};