/*!
 * Danii's Tools
 * 
 * Copyright (c) 2019 Daniel Conley
 * Licensed under the GNU General Public License Version 3.
 * https://www.gnu.org/licenses/gpl-3.0.txt
 */

/*
  TTTTT Y   Y PPPP  EEEEE  SSSS
    T    Y Y  P   P E     S    
    T     Y   PPPP  EEE    SSS 
    T     Y   P     E         S
    T     Y   P     EEEEE SSSS 
*/

/*
  Excluded Types.
*/

/**
 * Object property getter function.
 * 
 * Exclusion Reason: Isn't necessary.
 */
type Getter = () => any;

/**
 * Object property setter function.
 * 
 * Exclusion Reason: Isn't necessary.
 */
type Setter = (v: any) => void;

/**
 * Entry type for `Object.entries` and `Object.fromEntries`.
 * 
 * Exclusion Reason: See
 *   [this pull request](https://github.com/microsoft/TypeScript/pull/26797).
 */
type Entry<T> = Pair<string, T>;

/**
 * Any type that can be used as an object key.
 * 
 * Exclusion Reason: See
 *   [this pull request](https://github.com/microsoft/TypeScript/pull/26797).
 */
type Key = string | number | symbol;

/**
 * Represents any primitive value's prototype. Using
 * `typeof` on primitive's prototypes reveal that they are
 * objects and`instanceof` reveals that they are not
 * instances of their constructor properties.
 * 
 * Exclusion Reason: Exporting is not necessary at this point in time.
 */
type PsuedoObject<T extends Primitive> =
  T extends string ? {[P in keyof string]: string[P]} & {constructor: Constructor<string>} :
  T extends number ? {[P in keyof number]: number[P]} & {constructor: Constructor<number>} :
  T extends bigint ? {[P in keyof bigint]: bigint[P]} & {constructor: Constructor<bigint>} :
  T extends boolean ? {[P in keyof boolean]: boolean[P]} & {constructor: Constructor<boolean>} :
  T extends symbol ? {[P in keyof symbol]: symbol[P]} & {constructor: Constructor<symbol>} :
  {[P in keyof T]: T[P]} & {constructor: Constructor<T>};

/**
 * A union of all JavaScript primitives.
 */
export type Primitive = string | number | bigint | boolean | symbol;

/*
  Quick Definitions
*/

/**
 * A key-value tuple. `K` is the key, `V` is the value.
 * Although stating this type definition is longer than
 * writing `[K, V]`, it is a more elegant way of writing a
 * key-value tuple.
 */
export type Pair<K, V> = [K, V];

//BELOW TYPE DOES NOT WORK: https://github.com/microsoft/TypeScript/pull/26797
//incomplete docs too
/**
 * An object that is a map of key-value pairs. The key must
 * be a type passable to an object's key.
 * 
 * The name comes from the sentence "**A** map of key-value
 * pairs".
 */
//export type A<K extends string | number, V> = {[key: string | number]: V};

/**
 * An object in which each value is of type `T`.
 * 
 * The name comes from the sentence "An object **of** *T*".
 */
export type Of<T> = {[key: string]: T}; //A<string | number, T>;

/*
  Array Modifiers
*/

/**
 * A function which takes in values under `current` from the
 * object `object`, and returns a new value based off the
 * input.
 * 
 * @param current The value to be operated upon.
 * @param index The index of the `current` value within
 *   `object`.
 * @param object The object the values are originating from.
 * 
 * @template V The type of the values being passed into
 *   `current`.
 * @template R The type of the new values being returned.
 * @template F The type of the object the values are
 *   originating from. Defaults to `Array<V>`.
 * @template T The type of object this function is ran on.
 */
export type Mapper<V, R, F = V[], T = any> =
  (this: T, current: V, index?: number, object?: F) => R;

/**
 * A function which takes in values under `current` from the
 * object `object`, and the return value from the last time
 * of this function's execution, `accumulator`.
 * 
 * If this is the first time executing this function upon
 * object, the accumulator value may be the first value
 * within object, while current takes in the next value, or
 * the accumulator value may be an explicit initial value.
 * 
 * @param accumulator The return value of the last execution
 *   of this function. If this is the first time executing
 *   this function, may be the first value within `object`
 *   or an explicit initial value.
 * @param current The value to be operated on.
 * @param index The index of the `current` value within
 *   `object`.
 * @param object The object the values are originating from.
 * 
 * @template V The type of the values being passed into
 *   `current`.
 * @template R The return value type, the accumulator.
 * @template F The type of the object the values are
 *   originating from. Defaults to `Array<V>`.
 * @template I The initial value type. Defaults to `V`.
 * @template T The type of object this function is ran on.
 */
export type Reducer<V, R, F = V[], I = V, T = any> =
  (this: T, accumulator: R | I, current: V, index?: number, object?: F) => R;

/**
 * A function which takes in values under `current` from the
 * object `object`, and preforms some action upon it.
 * 
 * This is a shorthand for `Mapper<V, void, F, T>`.
 * 
 * @param current The value to be operated upon.
 * @param index The index of the `current` value within
 *   `object`.
 * @param object The object the values are originating from.
 * 
 * @template V The type of the values being passed into
 *   `current`.
 * @template F The type of the object the values are
 *   originating from. Defaults to `Array<V>`.
 * @template T The type of object this function is ran on.
 */
export type Consumer<V, F = V[], T = any> = Mapper<V, void, F, T>;

/*
  Miscellaneous
*/

/**
 * The timeout ids used within this environment's timeout
 * functions. This type automagically changes to the type
 * `NodeJS.Timer` under a node environment, and changes to
 * `number` under a browser environment.
 * 
 * Typing is better than `any`.
 */
export type Timeout = ReturnType<typeof setTimeout> | ReturnType<typeof setInterval>;

/**
 * A constructor function, such as a class.
 */
export type Constructor<T> =
  {prototype: T, name?: string} &
  T extends Primitive ? {(...args: any[]): T} : {new(...args: any[]): T};

/**
 * An object for specifying how code should run.
 */
type EvaluateOptions = {
  asynchronous?: boolean,
  expression?: boolean,
  arguments?: Of<any>,
  thisArg?: any,
  code: string
  evaluater?: (code: Function) => Promise<any>
};

/**
 * A stack frame object.
 * 
 * Exclusion Reason: Relies on AdvancedError. May also be
 *   changed to an interface?
 */
/*type StackFrame = {
  file: string,
  methodName: string,
  arguments: string[],
  lineNumber: number,
  column: number
};*/



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
let defineProperties = <T>(target: T, values: Partial<T>) => {
  let reducer = (map: PropertyDescriptorMap, key: string):
      PropertyDescriptorMap => ({
    ...map,
    [key]: {
      ...Object.getOwnPropertyDescriptor(values, key),
      "enumerable": false
    }
  });

  Object.defineProperties(target, Object.keys(values).reduce(reducer, {}));
}

/*
  Updated Definitions
*/
//TODO: Fit code within 80 characters width.

declare global {
  interface Array<T> {
    /*
      New Getters / Setters
    */
    last: T;
  
    /*
      New Functions
    */

    /**
     * Executes .flat and .crumble all in one go.
     * 
     * @see Array.prototype.flat
     * @see Array.prototype.crumble
     * @param depth The maximum recusrion depth.
     * @returns Null, one element or the array with sub
     *   arrays concatinated.
     */
    crumbleFlat(depth?: number): null | T | T[];
  
    /**
     * Returns null if nothing is in the array, or the one
     * element in an array if the array only contains one
     * value, otherwise the array itself if more than one
     * elements are stored.
     * 
     * Can be thought of as trying to remove an array's
     * brackets.
     * 
     * @returns Null, one element or the array itself.
     */
    crumble(): null | T | T[];
  
    //TODO: Gimmie docs!
    reduceSkip<R = T>(callback: (previous: T | R, current: T, skip: symbol, index?: number, array?: T[]) => R | symbol): (T | R)[];
    reduceSkip<R = T, I = T>(callback: (previous: R | I, current: T, skip: symbol, index?: number, array?: T[]) => R | symbol, initial?: I): (R | I)[];
  
    /**
     * Reverses the elements in an array without changing
     * itself.
     * 
     * @returns A new array with the values reversed.
     */
    softReverse(): T[];
  
    /*
      Better Typed Functions
    */
    every<TH = any>(callback: Mapper<T, boolean, this, TH>, thisArg?: TH): boolean;
    filter<TH = any>(callback: Mapper<T, boolean, this, TH>, thisArg?: TH): T[];
    find<TH = any>(callback: Mapper<T, boolean, this, TH>, thisArg?: TH): T;
    findIndex<TH = any>(callback: Mapper<T, boolean, this, TH>, thisArg?: TH): number;
    forEach<TH = any>(callback: Consumer<T, this, TH>, thisArg?: TH): void;
    map<R = void, TH = any>(callback: Mapper<T, R, this, TH>, thisArg?: TH): R[];
    reduce<R = T>(callback: Reducer<T, R, this>): T | R;
    reduce<R = T, I = R>(callback: Reducer<T, R, this, I>, initial: I): R | I;
    reduceRight<R = T>(callback: Reducer<T, R, this>): T | R;
    reduceRight<R = T, I = R>(callback: Reducer<T, R, this, I>, initial: I): R | T;
    some<TH = any>(callback: Mapper<T, boolean, this, TH>, thisArg?: TH): boolean;
  }

  interface ObjectConstructor {
    /*
      New Functions
    */
    clone<T extends Object>(item: T): T;
  
    every<T, V, TH = any>(object: Of<V> & T, callback: Mapper<Entry<V>, boolean, T, TH>, thisArg?: TH): boolean;
    filter<T, V, TH = any>(object: Of<V> & T, callback: Mapper<Entry<V>, boolean, T, TH>, thisArg?: TH): Of<V>;
    forEach<T, V, TH = any>(object: Of<V> & T, callback: Mapper<Entry<V>, void, T, TH>, thisArg?: TH): void;
    map<T, V, R = void, TH = any>(object: Of<V> & T, callback: Mapper<Entry<V>, boolean, T, TH>, thisArg?: TH): Of<R>;
    reduce<T, V, R>(object: Of<V> & T, callback: Reducer<Entry<V>, R, T>): T | R;
    reduce<T, V, R, I = R>(object: Of<V> & T, callback: Reducer<Entry<V>, R, T, I>, initial: I): R | I;
    some<T, V, TH = any>(object: Of<V> & T, callback: Mapper<Entry<V>, boolean, T, TH>, thisArg?: TH): boolean;
  
    getType(item: any): string;
    objectHasOwnProperty(object: any, property: Key): boolean;
    objectHasProperty(object: any, property: Key): boolean;
    
    /*
      Better Typed Functions
    */
    entries<T>(object: Of<T>): Entry<T>[];
    fromEntries<T>(entries: Entry<T>[]): Of<T>;
    getPrototypeOf<T extends Primitive>(instance: T): PsuedoObject<T>;
    getPrototypeOf<T>(instance: T): T;
  }

  interface String {
    /*
      New Functions
    */
    capitalize(): string;
    escape(nonSpecials?: boolean): string;
    toTitleCase(): string;

    /**
     * Interpolates a string as if it was a template.
     * It should be noted that templates execute code, and that has
     * been emulated by this function.
     * 
     * @param str String to interpolate with.
     * @param values The variables supplied.
     */
    interpolate(values: Of<any>): string;
  }

  interface SymbolConstructor {
    readonly skip: symbol;
  }
}

/*
  Appended Properties
*/
//TODO: Fit code within 80 characters width.

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

  //TODO: Attempting to use Type Paramaters here is a nightmare, so any is used instead.
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
  clone<T>(item: T): T {
    if (typeof item != "object") return item;

    let Construct = item.constructor as Constructor<T extends Primitive ? never : T>;
    //@ts-ignore: Construct WILL always have a construct
    //signature because we already handled all primitives.
    return Object.assign(new Construct(), item);
  },

  every<T, V, TH = any>(object: Of<V> & T,
      callback: Mapper<Entry<V>, boolean, T, TH>, thisArg?: TH): boolean {
    return Object.entries(object)
      .every((item, ind) => callback.call(thisArg, item, ind, object));
  },

  filter<T, V, TH = any>(object: Of<V> & T,
      callback: Mapper<Entry<V>, boolean, T, TH>, thisArg?: TH): Of<V> {
    return Object.fromEntries(Object.entries(object)
      .filter((item, ind) => callback.call(thisArg, item, ind, object)));
  },

  forEach<T, V, TH = any>(object: Of<V> & T,
      callback: Mapper<Entry<V>, void, T, TH>, thisArg: TH): void {
    return Object.entries(object)
      .forEach((item, ind) => callback.call(thisArg, item, ind, object));
  },

  map<T, V, R = void, TH = any>(object: Of<V> & T,
      callback: Mapper<Entry<V>, R, T, TH>, thisArg: TH) {
    return Object.fromEntries(Object.entries(object)
      .map((item, ind) => callback.call(thisArg, item, ind, object)));
  },

  reduce<T, V, R, I>(object: Of<V> & T, callback: Reducer<Entry<V>, R, T, I>,
      initial?: I) {
    return Object.entries(object).reduce<R, I>((acc, item, ind) =>
      callback(acc, item, ind, object), initial);
  },

  some<T, V, TH = any>(object: Of<V> & T,
      callback: Mapper<Entry<V>, boolean, T, TH>, thisArg?: TH) {
    return Object.entries(object)
      .some((item, ind) => callback.call(thisArg, item, ind, object));
  },

  getType(item: any) {
    if (item === null) return "null";
    if (typeof item != "object") return typeof item;
    return Object.getPrototypeOf(item).constructor.name;
  },

  objectHasOwnProperty(object: any, property: Key) {
    return [].hasOwnProperty.call(object, property);
  },

  objectHasProperty(this: ObjectConstructor, object: any, property: Key) {
    let protoChain: Object[] = [object];
    while (this.getPrototypeOf(protoChain.last) !== null) protoChain.push(this.getPrototypeOf(protoChain.last));
    return protoChain.some((proto) => this.objectHasOwnProperty(proto, property));
  }
});

defineProperties(String.prototype, {
  capitalize() {
    return this.substr(0, 1).toUpperCase() + this.substr(1);
  },

  escape(nonSpecials: boolean = true) { //TODO: Improve me!
    let charArray = this.split("");
    if (nonSpecials) charArray = charArray.map((char) => ['"', "'", "\\"].includes(char) ? "\\" + char : char)
    charArray = charArray.map((char) => ["\n", "\r", "\t"].includes(char) ? "\\" + {"\n": "n", "\r": "r", "\t": "t"}[char] : char);
    return charArray.join("");
  },

  toTitleCase() {
    return this.split(" ").map((word) => word.toLowerCase().capitalize()).join(" ");
  },

  interpolate(this: string, values: Of<any>) {
    const cleanedContent = this.split("")
      .map(char => char == "`" ? "\`" : char == "\\" ? "\\\\" : char).join("");
    const argNames = Object.keys(values);
    const argValues = Object.values(values);
    const func = new Function(...argNames, `return \`${cleanedContent}\`;`);
    return func(...argValues);
  }
} as Partial<String>);

defineProperties(Symbol, {
  "skip": Symbol("skip")
});



/*
   CCCC  OOO  N   N  SSSS TTTTT  AAA  N   N TTTTT  SSSS
  C     O   O NN  N S       T   A   A NN  N   T   S    
  C     O   O N N N  SSS    T   AAAAA N N N   T    SSS 
  C     O   O N  NN     S   T   A   A N  NN   T       S
   CCCC  OOO  N   N SSSS    T   A   A N   N   T   SSSS
*/

const evalCode = "{const a=JSON.parse(\"\0\"),b=JSON.parse(\"\0\"),c=JSON.parse(\"\0\"),d=Object.getPrototypeOf(async function(){}).constructor,e=JSON.parse(\"\0\"),f=()=>{if(!b)try{return new Function(...a,`return(()=>${e}).call(null,arguments)`).call(this,...arguments)}catch(c){if(c instanceof SyntaxError&&null==b)return new Function(...a,`return(async()=>${e}).call(null,arguments)`).call(this,...arguments);throw c}else return new Function(...a,`return(()=>${e}).call(null,arguments)`).call(this,...arguments)},g=()=>{if(!b)try{return new Function(...a,e).call(this,...arguments)}catch(c){if(c instanceof SyntaxError&&null==b)return new d(...a,e).call(this,...arguments);throw c}else return new d(...a,e).call(this,...arguments)};if(null==c)try{return f()}catch(a){if(a instanceof SyntaxError&&null==c)return g();throw a}else return c?f():g()}";
const evalVarsIllegal = ["break", "case", "catch", "class", "const", "continue", "debugger", "default", "delete", "do", "else", "enum", "export", "extends", "false", "finally", "for", "function", "if", "implements", "import", "in", "instanceof", "interface", "let", "new", "null", "packagae", "private", "protected", "public", "return", "static", "super", "switch", "this", "throw", "true", "try", "typeof", "var", "void", "while", "with", "yield"];
const evalVarsRegEx = /[\p{L}$_][\p{L}\d$_]*/gu;



/*
  FFFFF U   U N   N  CCCC TTTTT IIIII  OOO  N   N  SSSS
  F     U   U NN  N C       T     I   O   O NN  N S    
  FFF   U   U N N N C       T     I   O   O N N N  SSS 
  F     U   U N  NN C       T     I   O   O N  NN     S
  F      UUU  N   N  CCCC   T   IIIII  OOO  N   N SSSS 
*/

/**
 * Ensures that the mentioned method's this value will
 * always be that of the object it belongs to.
 * 
 * @param proto Prototype of the object.
 * @param key Name of the function.
 * @param descriptor Function's descriptor.
 */
export function bound<Type extends (...a: any[]) => any>(proto: Object,
    key: string, descriptor: TypedPropertyDescriptor<Type>) {
  let value = descriptor.value;
  delete descriptor.writable;
  delete descriptor.value;

  descriptor.get = function() {return value.bind(this) as Type;}
  return descriptor;
}

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

  descriptor.get = function() {
    let thisHere = this;
    return function(...items) {
      return value.call(thisHere, this, ...items);
    }
  }
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
export async function evaluate(options: EvaluateOptions | string): Promise<any>;
export async function evaluate(code: string, options: Omit<EvaluateOptions, "code">): Promise<any>;
export async function evaluate(code: string, args: Of<any>, options: Omit<EvaluateOptions, "code" | "arguments">): Promise<any>;
export async function evaluate(code: string | EvaluateOptions,
    args?: Of<any> | Omit<EvaluateOptions, "code">, options?:
    Omit<EvaluateOptions, "code" | "arguments">): Promise<any> {
  let opts: EvaluateOptions;
  if (!options) {
    if (!args) opts = typeof code == "string" ? {"code": code} : code;
    else opts = {...args, "code": code as string};
  } else opts = {...options, "arguments": args, "code": code as string};
  Object.forEach(opts.arguments || {}, ([key]) => {
    if (evalVarsIllegal.includes(key) || !evalVarsRegEx.test(key))
      throw new TypeError("Illegal argument name provided.");
  });

  const argNames = Object.keys(opts.arguments || {});
  const argValues = Object.values(opts.arguments || {});
  const parts = [argNames, opts.asynchronous, opts.expression, opts.code]
    .map(part => JSON.stringify(part == null ? null : part).escape());
  const finalCode = new Function(...argNames, evalCode.split("\0")
    .reduce((acc, val, ind) => acc + parts[ind - 1] + val))
      .bind(opts.thisArg ? opts.thisArg : this, ...argValues);
  return await (opts.evaluater || (func => func()))(finalCode);
}

/* RAW EVALUATE FUNCTION
  const rawEval = function(argNames, something, nothing, namesHaveNoEffectOnCode, isExpression, code) {
    {
      const argNames = JSON.parse("FED");
      const isAsync = JSON.parse("FED");
      const isExpression = JSON.parse("FED");
      const AsyncFunction = Object.getPrototypeOf(async function() {}).constructor;
      const code = JSON.parse("FED");
      const asyncHandleExpression = () => {
        if (!isAsync) {
          try {
            return new Function(...argNames, `return(()=>${code}).call(null,arguments)`).call(this, ...arguments);
          } catch (ex) {
            if (ex instanceof SyntaxError && isAsync == null)
              return new Function(...argNames, `return(async()=>${code}).call(null,arguments)`).call(this, ...arguments);
            throw ex;
          }
        } else {
          return new Function(...argNames, `return(async()=>${code}).call(null,arguments)`).call(this, ...arguments);
        }
      };
      const asyncHandleStatements = () => {
        if (!isAsync) {
          try {
            return new Function(...argNames, code).call(this, ...arguments);
          } catch (ex) {
            if (ex instanceof SyntaxError && isAsync == null)
              //@ts-ignore
              return new AsyncFunction(...argNames, code).call(this, ...arguments);
            throw ex;
          }
        } else {
          //@ts-ignore
          return new AsyncFunction(...argNames, code).call(this, ...arguments);
        }
      };
      if (isExpression == null) {
        try {
          return asyncHandleExpression();
        } catch (ex) {
          if (ex instanceof SyntaxError && isExpression == null)
            return asyncHandleStatements();
          throw ex;
        }
      } else if (isExpression) {
        return asyncHandleExpression();
      } else {
        return asyncHandleStatements();
      }
    }
  }
*/
