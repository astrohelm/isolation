type TAccess = (path, type?: string) => boolean | object;

export interface TOptions extends BaseOptions {
  dir?: string;
  filename?: string;
  npmIsolation?: boolean;

  access?: { sandbox?: TAccess; internal?: TAccess } | TAccess;
  ctx?: Context | { [key: string]: unknown };

  run?: RunningCodeOptions;
  script?: ScriptOptions;
}

export interface TOptionsReader extends Omit<TOptions, 'type'> {
  prepare?: boolean; // By default false
}
