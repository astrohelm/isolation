import type { RunningCodeOptions, ScriptOptions } from 'node:vm';

type TAccess = (type?: 'reader' | 'realm', path: string) => boolean | object;

/**
 * @example
 * ({
 *    dir: '/tests',
 *    filename: 'index.js',
 *    npmIsolation: true,
 *    ctx: { console, A: 5, B: 'Hello world' }, //? Inject global variables, default {}
 *    access: (name, type) => true, //? Control access to Realm submodules or reader API
 * })
 */
export interface TOptions {
  /**
   * @default process.cwd()
   * @description __dirname, used for require start point
   * @warning Provided to realm only with CJS type
   */
  dir?: string;
  /**
   * @default 'ISO'
   * @description __filename
   * @warning Provided to realm only with CJS type
   */
  filename?: string;
  /**
   * @default false
   * @description Runs npm modules in the same realm as current
   * @warning Work only in CJS realms
   */
  npmIsolation?: boolean;
  /**
   * @default 'cjs'
   * @description Type of realm
   * @warning In ISO mode realm Isolation does not inject global variables such as require, module, exports, __filename and __dirname
   * @example
   * // CJS realm
   * new Isolation('module.exports = (a,b) => a + b;');
   * // ISO realm
   * new Isolation('(a,b) => a + b;', { type: 'iso' })
   */
  type?: 'cjs' | 'iso'; // cjs

  /**
   * @default type => type === 'realm' ? false : true;
   * @description Isolation access control and stabbing
   */
  // prettier-ignore
  access?: TAccess | {
    realm?: (path: string) => boolean | object;
    reader?: (path: string) => boolean;
  };

  /**
   * @default Isolation.contextify.EMPTY
   * @description Realm context
   */
  ctx?: Context | { [key: string]: unknown };

  runOpts?: RunningCodeOptions;
  realmOpts?: ScriptOptions;
}

/**
 * @example
 * ({
 *    type: 'cjs',
 *    dir: '/tests',
 *    filename: 'index.js',
 *    npmIsolation: true,
 *    ctx: { console, A: 5, B: 'Hello world' },
 *    access: (name, type) => true,
 *    prepare: true,
 *    depth: 5,
 * })
 */
export interface TOptionsReader extends TOptions {
  /**
   * @default false
   * @description If true, Reader will return unexecuted script
   */
  prepare?: boolean;
  /**
   * @default true
   * @description If true, Reader will go through all depth folder
   */
  depth?: boolean | number;
  /**
   * @default false
   * @description If true, all deep dependencies names will appear in the root
   * @example
   * // option: false
   * ({ myscript: Function, test: 123, depthFolder: { myscript: 'hello world' }  })
   * // option: true
   * ({ myscript: 'hello world', test: 123 })
   */
  flat?: boolean;
}
