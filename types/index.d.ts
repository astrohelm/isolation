import { Context, Script, ScriptOptions, BaseOptions } from 'node:vm';
import { RunningCodeOptions, CreateContextOptions } from 'node:vm';

type MODULE_TYPE = 'cjs' | 'js';
type TMap<value> = { [key: string]: value };

export const COMMON_CTX: Context;
export const MODULE_TYPES: MODULE_TYPE[];

export interface TOptions extends BaseOptions {
  dir?: string;
  filename?: string;
  type?: MODULE_TYPE;
  access?: TMap<boolean | object>;
  ctx?: Context;
  run?: RunningCodeOptions;
  script?: ScriptOptions;
  npmIsolation?: boolean;
}

interface TOptionsReader extends Omit<TOptions, 'type'> {
  prepare?: boolean;
}

type TRead = {
  (path: string, options?: TOptionsReader): Promise<Script | unknown>;
  script: (path: string, options?: TOptionsReader) => Promise<Script | unknown>;
  dir: (path: string, options?: TOptionsReader, deep?: boolean) => Promise<TMap<unknown | Script>>;
};

type TCtx = {
  OPTIONS: CreateContextOptions;
  EMPTY: Context;
  COMMON: Context;
  NODE: Context;
  create: (ctx?: Context | Object, preventEscape?: boolean) => Context;
};

/**
 * Compare any Dates
 *  Create any dates compare functions or use our presets.
 * @example <caption>Basics</caption>
 * const Astroctx = require('astroctx');
 * console.log(new Astroctx(`({ field: 'value' });`).execute()); // Output: { field: 'value' }
 * console.log(Astroctx.execute(`(a, b) => a + b;`)(2 + 2)); // Output: 4
 * Astroctx.execute(`async (a, b) => a + b;`)(2 + 2).then(console.log); // Output: 4
 * @example <caption>CTX & Delay example</caption>
 * const ctx = Astroctx.CTX.create({ console, a: 1000, b: 10  });
 * const prepared = Astroctx.prepare(`a - b`, { ctx });
 * prepared.execute(); // Output: 990
 * prepared.execute(Astroctx.CTX.create({ ...ctx, b: 7  })); // Output: 993
 * @example <caption>Read Api</caption>
 * Astroctx.read('./path/to/script.js').then(console.log); // Output: result of script execution
 * Astroctx.read('./path/to').then(console.log); // Output: { script: any }
 * Astroctx.read('./path/to', { prepare: true }).then(console.log); // Output: { script: Script {} }
 * Astroctx.read('./path/to', { deep: true }).then(console.log); // Output: { script: any, deep: { script: any } }
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
  type: MODULE_TYPE;

  static CTX: TCtx;
  static read: TRead;
  static prepare: (src: string, options?: TOptions) => Script;
  static execute: (src: string, options?: TOptions) => unknown;
  static require: (path: string, options?: TOptionsReader) => Promise<unknown | Script>;

  constructor(src: string, options?: TOptions): Script;

  /**
   * @description Run prepared scripts
   */
  execute: (ctx?: Context) => unknown;
}
