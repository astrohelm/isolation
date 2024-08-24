'use strict';

const SYMBOLS = require('./lib/symbols');
const { kRunOpts, kAccess, kCreateRequire, kCreateVM } = SYMBOLS;
const { kCache, kCtx, kRealm, kDir, kName, kType, kRealmOpts } = SYMBOLS;
const { createVM, isObject, createExports } = require('./lib/utils');

module.exports = class Script extends require('./lib/require') {
  static execute = (src, opts, ctx) => new Script(src, opts).execute(ctx);
  static prepare = (src, opts) => new Script(src, opts);
  static read = require('./lib/reader')(Script);
  static contextify = require('./lib/context');
  static symbols = SYMBOLS;

  [kRunOpts] = { timeout: 1000 };
  constructor(src, options = {}) {
    if (typeof src !== 'string') throw new TypeError('Non-string source is not supported');
    if (!isObject(options)) throw new TypeError('Non-object options are not supported');
    super(options);
    const { realmOpts, runOpts } = options;
    if (isObject(runOpts)) this[kRunOpts] = { ...this[kRunOpts], ...runOpts };
    this[kRealmOpts] = isObject(realmOpts) ? realmOpts : {};
    this[kName] = options.filename ?? 'ISO';
    this[kCtx] = Script.contextify(options.ctx);
    this[kType] = options.type ?? 'cjs';
    this[kDir] = options.dir ?? process.cwd();
    this[kAccess] = options.access;
    this[kCreateVM] = createVM.bind(null, this[kType], this[kRealmOpts]);
    this[kRealm] = this[kCreateVM](src, this[kName]);
  }

  execute(ctx = this[kCtx], keepCache = false) {
    if (!keepCache) this[kCache].clear();
    const context = Script.contextify(ctx);
    const closure = this[kRealm].runInContext(context, this[kRunOpts]);
    if (this[kType] !== 'cjs') return closure;
    const { module, exports } = createExports();
    const require = this[kCreateRequire](context, this[kDir]);
    closure(exports, require, module, this[kName], this[kDir]);
    return module.exports ?? exports;
  }

  get name() {
    return this[kName];
  }

  get type() {
    return this[kType];
  }

  get dir() {
    return this[kDir];
  }
};
