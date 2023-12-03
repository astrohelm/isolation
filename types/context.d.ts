/**
 * @example <caption>Sandbox usage example</caption>
 * const realm = new Isolation(`a - b`);
 * realm.execute({ a: 1000, b: 10 }); // Output: 990
 * realm.execute({ a: 1000, b: 20 }); // Output: 980
 */
export type TSandbox = {
  /**
   * @example <caption>This will affect on future contexts</caption>
   * // Default config:
   * const OPTIONS = { codeGeneration: { strings: false, wasm: false } };
   */
  OPTIONS: CreateContextOptions;

  /**
   * @example <caption>Empty frozen object</caption>
   * const EMPTY = {};
   */
  EMPTY: Context;

  /**
   * @example <caption>Global variables such as timers and others</caption>
   * const COMMON = { setTimeout, Event, ...other };
   */
  COMMON: Context;

  /**
   * @example <caption>Nodejs global variables</caption>
   * const NODE = { global, console, process, ...COMMON };
   */
  NODE: Context;

  /**
   * @example <caption>You can create custom context</caption>
   * const ctx = Isolation.sandbox({ console, a: 1000, b: 10  });
   **/
  (ctx?: Context | Object, preventEscape?: boolean): Context;
};
