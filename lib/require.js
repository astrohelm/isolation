'use strict';

const { cacheStore, cache, recall, kNONCached } = require('./cache');
const { basename, dirname, resolve } = require('node:path');
const { readFileSync } = require('node:fs');
const { checkAccess } = require('./utils');
const { execute } = require('./script');
const internalRequire = require;
class VMError extends Error {}

module.exports = (path, options) => {
  const require = customRequire.bind(null, options, path);
  require.cache = cacheStore;
  return require;
};

const Err = 'Module must be a file URL object, file URL string, or absolute path string.';
function customRequire(options, path, module) {
  if (!(module instanceof URL || typeof module === 'string')) throw new TypeError(Err);
  var access = options.access,
    npm = !module.includes('.'),
    name = !npm ? resolve(path, module) : module,
    lib = checkAccess('realm', access, name);

  if (lib instanceof Object) return lib;
  if (!lib) throw new VMError(`Access denied '${module}'`);

  try {
    var absolute = internalRequire.resolve(name),
      npmIsolation = options.npmIsolation,
      cached = recall(absolute);

    if (npm && absolute === name) return internalRequire(name); //? NODEJS API
    if (npm && !npmIsolation) return internalRequire(absolute); //?   NPM PKGS
    if (absolute.endsWith('.json')) return internalRequire(absolute); //? JSON
    if (cached) console.log('FROM CACHE ' + absolute);
    if (cached !== kNONCached && (options.cache ?? true)) return cached;

    var params = Object.create(options);
    params.filename = basename(absolute);
    params.dir = dirname(absolute);

    var exports = execute(readFileSync(absolute, 'utf8'), params);
    return cache(absolute, exports);
  } catch (err) {
    if (err instanceof VMError) throw err;
    throw new VMError(`Cannot find module '${module}'`);
  }
}
