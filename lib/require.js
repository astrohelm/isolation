'use strict';

const { basename, dirname, resolve } = require('node:path');
const { readFileSync } = require('node:fs');
const { checkAccess } = require('./utils');
const { execute } = require('./script');

const internalRequire = require;
class VMError extends Error {}

module.exports = (path, options) => {
  const { npmIsolation, access } = options;
  return module => {
    var npm = !module.includes('.'),
      name = !npm ? resolve(path, module) : module,
      lib = checkAccess('realm', access, name);

    if (lib instanceof Object) return lib;
    if (!lib) throw new VMError(`Access denied '${module}'`);
    try {
      const absolute = internalRequire.resolve(name);
      if (npm && absolute === name) return internalRequire(name); //? NODEJS API
      if (npm && !npmIsolation) return internalRequire(absolute); //?  NPM PCKGS
      if (absolute.endsWith('.json')) return internalRequire(absolute); //? JSON
      return execute(readFileSync(absolute, 'utf8'), {
        ...options,
        filename: basename(absolute),
        dir: dirname(absolute),
      });
    } catch (err) {
      if (err instanceof VMError) throw err;
      throw new VMError(`Cannot find module '${module}'`);
    }
  };
};
