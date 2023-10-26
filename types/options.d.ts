type TAccess = (path: string, type?: 'reader' | 'realm') => boolean | object;
type TSpecific = <RES>(path: string) => RES;

/**
 * @example
 * ({
 *    dir: '/tests', //? __dirname variable, internal require startpoint
 *    filename: 'index.js', //? __filename variable
 *    npmIsolation: true, //? Intenal dependencies will be loaded with isolation, default is false
 *    ctx: { console, A: 5, B: 'Hello world' }, //? Inject global variables, default {}
 *    access: (name, type) => true, //? Controll access to Realm submodules or reader API
 * })
 */
export interface TOptions {
  dir?: string;
  filename?: string;
  npmIsolation?: boolean;

  access?: { sandbox?: TSpecific<boolean | object>; internal?: TSpecific<boolean> } | TAccess;
  ctx?: Context | { [key: string]: unknown };

  run?: RunningCodeOptions;
  script?: ScriptOptions;
}

export interface TOptionsReader extends Omit<TOptions, 'type'> {
  prepare?: boolean; // By default false
}
