type TAccess = (path: string, type?: 'reader' | 'realm') => boolean | object;
type TSpecific = <RES>(path: string) => RES;

/**
 * @example
 * ({
 *    dir: '/tests', //? __dirname variable, realm require startpoint
 *    filename: 'index.js', //? __filename variable
 *    npmIsolation: true, //? Intenal dependencies will be loaded with isolation, default is false
 *    ctx: { console, A: 5, B: 'Hello world' }, //? Inject global variables, default {}
 *    access: (name, type) => true, //? Controll access to Realm submodules or reader API
 * })
 */
export interface TOptions {
  dir?: string; // proccess.cwd()
  filename?: string; // ISO
  npmIsolation?: boolean; // false;
  type?: 'cjs' | 'iso'; // cjs

  access?: { sandbox?: TSpecific<boolean | object>; internal?: TSpecific<boolean> } | TAccess;
  ctx?: Context | { [key: string]: unknown };

  run?: RunningCodeOptions;
  script?: ScriptOptions;
}

/**
 * @example
 * ({
 *    type: 'cjs', //? cjs mode injects global variables, in iso mode script will export result of last expression
 *    dir: '/tests', //? __dirname variable, internal require startpoint
 *    filename: 'index.js', //? __filename variable
 *    npmIsolation: true, //? Intenal dependencies will be loaded with isolation, by default false
 *    ctx: { console, A: 5, B: 'Hello world' }, //? Inject global variables, default {}
 *    access: (name, type) => true, //? Controll access to Realm submodules or reader API
 *    prepare: true, //?  If true, reader will return unexecuted script, by default false
 *    depth: 5, //? If true, reader will go through all depth folders, by default true
 * })
 */
export interface TOptionsReader {
  prepare?: boolean; // By default false
  depth?: boolean | number; // By default true
}
