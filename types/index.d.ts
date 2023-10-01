import type { Context, Script, ScriptOptions, BaseOptions } from 'node:vm';
import type { RunningCodeOptions, CreateContextOptions } from 'node:vm';
import type { TOptions, TOptionsReader } from './options';
import type { TSandbox } from './context';

type TMap<value> = { [key: string]: value };

type TRead = {
  (path: string, options?: TOptionsReader): Promise<Script | unknown>;
  script: (path: string, options?: TOptionsReader) => Promise<Script | unknown>;
  dir: (path: string, options?: TOptionsReader, deep?: boolean) => Promise<TMap<unknown | Script>>;
};

/**
 * Astroctx - VM Container for Commonjs
 * @example <caption>Basics</caption>
 * const Astroctx = require('astroctx');
 * console.log(new Astroctx(`({ field: 'value' });`).execute()); // Output: { field: 'value' }
 * console.log(Astroctx.execute(`(a, b) => a + b;`)(2 + 2)); // Output: 4
 * Astroctx.execute(`async (a, b) => a + b;`)(2 + 2).then(console.log); // Output: 4
 * @example <caption>CTX & Delay execution example</caption>
 * const ctx = Astroctx.sandbox({ console, a: 1000, b: 10  });
 * const prepared = Astroctx.prepare(`a - b`, { ctx });
 * prepared.execute(); // Output: 990
 * prepared.execute(Astroctx.sandbox({ ...ctx, b: 7  })); // Output: 993
 * @example <caption>Read Api</caption>
 * Astroctx.require('./path/to/script.js').then(console.log); // Output: result of script execution
 * Astroctx.require('./path/to').then(console.log); // Output: { script: any }
 * Astroctx.require('./path/to', { prepare: true }).then(console.log); // Output: { script: Script {} }
 * Astroctx.require('./path/to', { deep: true }).then(console.log); // Output: { script: any, deep: { script: any } }
 */
export class Script {
  /**
   * @description Equivalent to __filename
   */
  name: string;
  /**
   * @description Equivalent to __dirname
   */
  dir: string;

  static require: TRead;
  static prepare: (src: string, options?: TOptions) => Script;
  static execute: (src: string, options?: TOptions) => unknown;
  static require: (path: string, options?: TOptionsReader) => Promise<unknown | Script>;
  static sandbox: TSandbox;

  constructor(src: string, options?: TOptions): Script;

  /**
   * @description Run prepared scripts
   */
  execute: (ctx?: Context) => unknown;
}
