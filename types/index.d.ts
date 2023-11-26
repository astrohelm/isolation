import type { Context, Script, ScriptOptions, BaseOptions } from 'node:vm';
import type { RunningCodeOptions, CreateContextOptions } from 'node:vm';
import type { TOptions, TOptionsReader } from './options';
import type { TSandbox } from './context';

type TMap<value> = { [key: string]: value };

type TRead = {
  (path: string, options?: TOptionsReader): Promise<Script | unknown>;
  script: (path: string, options?: TOptionsReader) => Promise<Script | unknown>;
  dir: (path: string, options?: TOptionsReader) => Promise<TMap<unknown | Script>>;
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
   * Realm.from('./path/to/script.js').then(console.log); // Output: result of script execution
   * Realm.from('./path/to').then(console.log); // Output: { script: any }
   * Realm.from('./path/to', { prepare: true }).then(console.log); // Output: { script: Script {} }
   * Realm.from('./path/to', { deep: true }).then(console.log); // Output: { script: any, deep: { script: any } }
   */
  static from: TRead;

  /**
   * @example <caption>Functional initialization</caption>
   * const Realm = require('isolation');
   * console.log(Realm.from(`({ field: 'value' });`).execute()); // Output: { field: 'value' }
   */
  static prepare: (src: string, options?: TOptions) => Script;

  /**
   * @example <caption>Skip init process</caption>
   * console.log(Realm.execute(`(a, b) => a + b;`)(2 + 2)); // Output: 4
   * Realm.execute(`async (a, b) => a + b;`)(2 + 2).then(console.log); // Output: 4
   */
  static execute: (src: string, options?: TOptions) => unknown;

  /**
   * @example <caption>Custom sandboxes</caption>
   * const ctx = { a: 1000, b: 10 }
   * const realm = new Realm(`a - b`, { ctx });
   * realm.execute(); // Output: 990
   * realm.execute({ ...ctx, b: 7  }); // Output: 993
   */
  static sandbox: TSandbox;

  /**
   * @example <caption>Constructor initialization</caption>
   * const Realm = require('isolation');
   * console.log(new Realm(`({ field: 'value' });`).execute()); // Output: { field: 'value' }
   */
  constructor(src: string, options?: TOptions): Script;

  /**
   * @description Run prepared scripts
   */
  execute: (ctx?: Context) => unknown;
};
