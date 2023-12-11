import type { Context, Script as TScript, ScriptOptions, BaseOptions } from 'node:vm';
import type { RunningCodeOptions, CreateContextOptions } from 'node:vm';
import type { TOptions, TOptionsReader } from './options';
import type { TContextify } from './context';

type TMap<value> = { [key: string]: value };

type TRead = {
  (src: string, options?: TOptionsReader): Promise<TScript | unknown>;
  file: (path: string, options?: TOptionsReader) => Promise<TScript | unknown>;
  dir: (path: string, options?: TOptionsReader) => Promise<TMap<TScript | unknown>>;
};

/**
 * Isolation
 * @description Isolate your code in custom realms / contexts
 * @example
 * Isolation.execute('module.exports = (a, b) => a + b'); // 3
 * Isolation.execute('(a, b) => a + b', { type: 'iso'}); // 3
 */
export = class Script {
  /**
   * @description Equivalent to __filename
   */
  name: string;
  /**
   * @description Equivalent to __dirname
   */
  dir: string;
  /**
   * @description Typeof script wrapping process, by default cjs
   * @warning In ISO mode you will stand alone without global variables such as __dirname, __filename, require, exports and module.
   */
  type: 'cjs' | 'iso';

  /**
   * @example <caption>Read Api</caption>
   * Isolation.read('./path/to/script.js').then(console.log); // Output: result of script execution
   * Isolation.read('./path/to').then(console.log); // Output: { script: any }
   * Isolation.read('./path/to', { prepare: true }).then(console.log); // Output: { script: Script {} }
   * Isolation.read('./path/to', { deep: true }).then(console.log); // Output: { script: any, deep: { script: any } }
   */
  static read: TRead;

  /**
   * @example <caption>Functional initialization</caption>
   * const Isolation = require('isolation');
   * console.log(Isolation.read(`({ field: 'value' });`, { type: 'iso' }).execute()); // Output: { field: 'value' }
   */
  static prepare: (src: string, options?: TOptions) => Script;

  /**
   * @example <caption>Symbols for hidden properties</caption>
   * @warning You should know what are you doing
   * const Isolation = require('isolation');
   * const script = new Isolation('a + b', { type: 'iso' });
   * const ctx = script[Isolation.symbols.kContext]; // Access to script context & etc.
   */
  static symbols: { kContext: symbol; kRequire: symbol; kOptions: symbol; kMachine: symbol };

  /**
   * @example <caption>Skip init process</caption>
   * console.log(Isolation.execute(`module.exporst = (a, b) => a + b;`)(2 + 2)); // Output: 4
   * Isolation.execute(`async (a, b) => a + b;`, { type: 'iso' })(2 + 2).then(console.log); // Output: 4
   */
  static execute: (src: string, options?: TOptions, ctx?: Context) => unknown;

  /**
   * @example <caption>Function that creates require function for the realm</caption>
   * const myModule = Isolation.createRequire('/parent/directory')('./myModule.js);
   */
  static createRequire: (dir: string, options?: TOptions) => NodeRequire;

  /**
   * @example <caption>Custom contexts</caption>
   * const ctx = { a: 1000, b: 10 }
   * const realm = new Isolation('a - b', { ctx, type: 'iso' });
   * realm.execute(); // Output: 990
   * realm.execute({ ...ctx, b: 7  }); // Output: 993
   */
  static contextify: TContextify;

  /**
   * @example <caption>Constructor initialization</caption>
   * const Isolation = require('isolation');
   * console.log(new Isolation(`({ field: 'value' });`, { type: 'iso' }).execute()); // Output: { field: 'value' }
   */
  constructor(src: string, options?: TOptions): Script;

  /**
   * @description Run prepared scripts
   */
  execute: (ctx?: Context) => unknown;
};
