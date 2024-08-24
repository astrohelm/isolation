'use strict';

const { kCache, kAccess, kRunOpts, kNpm, kCreateVM, kCreateRequire } = require('./symbols');
const { parse, resolve: pathResolve } = require('node:path');
const { checkAccess, createExports } = require('./utils');
const { readFileSync } = require('node:fs');
const internalRequire = require;

module.exports = class Require {
  [kCache] = new Map();

  constructor(options) {
    this[kNpm] = options.npmIsolation ?? false;
    this[kAccess] = options.access ?? null;
  }

  [kCreateRequire](ctx, dir) {
    const require = id => this.#require(ctx, dir, id);
    require.resolve = (request, options) => internalRequire.resolve(join(dir, request), options);
    require.resolve.path = request => internalRequire.resolve.paths(join(dir, request));
    require.cache = this[kCache];
    require.extensions = null;
    require.main = null;
    return require;
  }

  #require(ctx, dir, id) {
    const npm = !id.includes('.');
    const path = !npm ? pathResolve(dir, id) : id;
    const lib = checkAccess('realm', this[kAccess], path);

    if (lib instanceof Object) return lib;
    if (!lib) throw new Error(`Access denied '${id}'`);
    try {
      var resolved = internalRequire.resolve(path);
      if (npm && resolved === path) return internalRequire(path); //? NODEJS API
      if (npm && !this[kNpm]) return internalRequire(resolved); //?  NPM MODULES
      if (resolved.endsWith('.json')) return internalRequire(resolved); //? JSON
      var src = readFileSync(resolved, 'utf8');
    } catch (err) {
      throw new Error(`Cannot find module '${id}'`);
    }

    const cached = this[kCache].get(resolved);
    if (cached) return cached;
    const { module, exports } = createExports();
    const { dir: moduleDir, base: moduleName } = parse(resolved);
    const closure = this[kCreateVM](src, moduleName).runInContext(ctx, this[kRunOpts]);
    closure(exports, this[kCreateRequire](ctx, moduleDir), module, moduleName, moduleDir);
    const result = module.exports ?? exports;
    this[kCache].set(resolved, result);
    return result;
  }
};

function join(dir, request) {
  if (!request.includes('.')) return request;
  return pathResolve(dir, request);
}
