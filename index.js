'use strict';

const { SYMBOLS, DEFAULT_NAME, DEFAULT_TYPE, INTERRUPT_TM } = require('./lib/constants');
const { kCache, kCtx, kRealm, kDir, kName, kType, kRunOpts, kAccess, kNpm } = SYMBOLS;
const { ERR_UNSUPPORTED_SRC, ERR_UNSUPPORTED_OPTS } = require('./lib/constants');
const { ERR_ACCESS_DENIED, ERR_MODULE_NOT_FOUND } = require('./lib/constants');
const { createVM, checkAccess, resolve, VMError } = require('./lib/utils');
const { basename, dirname, resolve: pathResolve } = require('node:path');
const { readFileSync } = require('node:fs');
const contextify = require('./lib/context');
const internalRequire = require;

class Script {
  static execute = (src, opts, ctx) => new Script(src, opts).execute(ctx);
  static prepare = (src, opts) => new Script(src, opts);
  static contextify = contextify;
  static symbols = SYMBOLS;
  [kCache] = new Map();
  [kRunOpts] = {};
  #createVM;

  constructor(src, options = {}) {
    if (typeof options !== 'object') throw new TypeError(ERR_UNSUPPORTED_OPTS);
    if (typeof src !== 'string') throw new TypeError(ERR_UNSUPPORTED_SRC);

    var { realmOpts, runOpts } = options;
    if (typeof realmOpts !== 'object') realmOpts = {};
    if (typeof runOpts === 'object') this[kRunOpts] = { timeout: INTERRUPT_TM, ...runOpts };

    this[kName] = options.filename ?? DEFAULT_NAME;
    this[kType] = options.type ?? DEFAULT_TYPE;
    this[kCtx] = Script.contextify(options.ctx);
    this[kNpm] = options.npmIsolation ?? false;
    this[kDir] = options.dir ?? process.cwd();
    this[kAccess] = options.access;

    this.#createVM = createVM.bind(null, this[kType], realmOpts);
    this[kRealm] = this.#createVM(src, this[kName]);
  }

  execute(ctx = this[kCtx], keepCache = false) {
    if (!keepCache) this[kCache].clear();
    const context = Script.contextify(ctx);
    const closure = this[kRealm].runInContext(context, this[kRunOpts]);
    if (this[kType] !== 'cjs') return closure;

    const exports = {};
    const module = { exports };
    closure(exports, this.#createRequire(ctx), module, this[kName], this[kDir]);
    return module.exports ?? exports;
  }

  #createRequire(ctx, dir = this[kDir]) {
    const require = id => this.#require(ctx, dir, id);
    require.resolve = (request, options) => internalRequire.resolve(resolve(dir, request), options);
    require.resolve.paths = request => internalRequire.resolve.paths(resolve(dir, request));
    require.cache = this[kCache];
    require.extensions = null;
    require.main = null;
    return require;
  }

  #require(ctx, dir, id) {
    var npm = !id.includes('.');
    var path = !npm ? pathResolve(dir, id) : id;
    var lib = checkAccess('realm', this[kAccess], path);

    if (lib instanceof Object) return lib;
    if (!lib) throw new VMError(`${ERR_ACCESS_DENIED} '${id}'`);
    try {
      var resolved = internalRequire.resolve(path);
      if (npm && resolved === path) return internalRequire(path); //? NODEJS API
      if (npm && !this[kNpm]) return internalRequire(resolved); //?  NPM MODULES
      if (resolved.endsWith('.json')) return internalRequire(resolved); //? JSON
      const cached = this[kCache].get(resolved);
      if (cached) return cached;

      var name = basename(resolved);
      var src = readFileSync(resolved, 'utf8');
      var closure = this.#createVM(src, name).runInContext(ctx, this[kRunOpts]);
      if (this.type !== 'cjs') {
        cached.set(resolved, closure);
        return closure;
      }

      var exports = {};
      var module = { exports };
      var dir = dirname(resolved);
      closure(exports, this.#createRequire(ctx, dir), module, name, dir);
      exports = module.exports ?? exports;
      this[kCache].set(resolved, exports);
      return exports;
    } catch (err) {
      if (err instanceof VMError) throw err;
      throw new VMError(`${ERR_MODULE_NOT_FOUND} '${id}'`);
    }
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
}

Script.read = require('./lib/reader')(Script);
module.exports = Script;
