import type { Context, Script as TScript, ScriptOptions, BaseOptions } from 'node:vm';
import type { RunningCodeOptions, CreateContextOptions } from 'node:vm';
import type { TOptions, TOptionsReader } from './options';
import type { TSandbox } from './context';

type TMap<value> = { [key: string]: value };

type TRead = {
  (src: string, options?: TOptionsReader): Promise<TScript | unknown>;
  file: (path: string, options?: TOptionsReader) => Promise<TScript | unknown>;
  dir: (path: string, options?: TOptionsReader) => Promise<TMap<TScript | unknown>>;
};

/**
 * Isolation
 * @description Isolate your code in custom realms / contexts
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
   * @example <caption>Read Api</caption>
   * Isolation.read('./path/to/script.js').then(console.log); // Output: result of script execution
   * Isolation.read('./path/to').then(console.log); // Output: { script: any }
   * Isolation.read('./path/to', { prepare: true }).then(console.log); // Output: { script: Script {} }
   * Isolation.read('./path/to', { deep: true }).then(console.log); // Output: { script: any, deep: { script: any } }
   * Isolation.read('module.exports = (a, b) => a + b').then(fn => console.log(fn(1, 2))); // 3
   */
  static read: TRead;

  /**
   * @example <caption>Functional initialization</caption>
   * const Isolation = require('isolation');
   * console.log(Isolation.read(`({ field: 'value' });`).execute()); // Output: { field: 'value' }
   */
  static prepare: (src: string, options?: TOptions) => Script;

  /**
   * @example <caption>Skip init process</caption>
   * console.log(Isolation.execute(`(a, b) => a + b;`)(2 + 2)); // Output: 4
   * Isolation.execute(`async (a, b) => a + b;`)(2 + 2).then(console.log); // Output: 4
   */
  static execute: (src: string, options?: TOptions, ctx?: Context) => unknown;

  /**
   * @example <caption>Function that creates require function for the realm</caption>
   * const myModule = Isolation.createRequire('/parent/directory')('./myModule.js);
   */
  static createRequire: (dir: string, options?: TOptions) => NodeRequire;

  /**
   * @example <caption>Custom sandboxes</caption>
   * const ctx = { a: 1000, b: 10 }
   * const realm = new Isolation(`a - b`, { ctx });
   * realm.execute(); // Output: 990
   * realm.execute({ ...ctx, b: 7  }); // Output: 993
   */
  static sandbox: TSandbox;

  /**
   * @example <caption>Constructor initialization</caption>
   * const Isolation = require('isolation');
   * console.log(new Isolation(`({ field: 'value' });`).execute()); // Output: { field: 'value' }
   */
  constructor(src: string, options?: TOptions): Script;

  /**
   * @description Run prepared scripts
   */
  execute: (ctx?: Context) => unknown;
};
