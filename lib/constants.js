'use strict';

const kCache = Symbol('Isolation.cache');
const kRealm = Symbol('Isolation.realm');
const kRunOpts = Symbol('Isolation.run.options');
const kCtx = Symbol('Isolation.ctx');
const kName = Symbol('Isolation.filename');
const kDir = Symbol('Isolation.directory');
const kType = Symbol('Isolation.type');
const kNpm = Symbol('Isolation.npm.isolation');
const kAccess = Symbol('Isolation.access');

module.exports = {
  SYMBOLS: { kCache, kCtx, kRealm, kDir, kName, kType, kRunOpts, kAccess, kNpm },
  ERR_UNSUPPORTED_OPTS: 'Non-object options are not supported',
  ERR_UNSUPPORTED_PATH: 'Non-string source code path is not supported',
  ERR_UNSUPPORTED_SRC: 'Non-string source code is not supported',
  ERR_MODULE_NOT_FOUND: 'Cannot find module',
  ERR_FILE_IS_EMPTY: 'File is empty',
  ERR_ACCESS_DENIED: 'Access denied',
  READ_OPTS: { withFileTypes: true },
  READ_REGEX: /^\.[cme]?js$/,
  DEFAULT_TYPE: 'cjs',
  DEFAULT_NAME: 'ISO',
  INTERRUPT_TM: 1_000,
};
