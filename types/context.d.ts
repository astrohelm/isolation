/**
 * @example <caption>Sandbox usage example</caption>
 * const ctx = Astroctx.sandbox({ console, a: 1000, b: 10  });
 * const prepared = Astroctx.prepare(`a - b`);
 * prepared.execute(ctx); // Output: 990
 * prepared.execute({ ...ctx, b: 7  })); // Output: 993
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
   * const ctx = Astroctx.sandbox({ console, a: 1000, b: 10  });
   **/
  (ctx?: Context | Object, preventEscape?: boolean): Context;
};
