'use strict';

const { basename, dirname, resolve } = require('node:path');
const { readFileSync } = require('node:fs');
const { checkAccess } = require('./utils');
const { execute } = require('./script');

const internalRequire = require;
class VMError extends Error {}

module.exports = (path, options) => {
  const { npmIsolation, access } = options;
  const pull = checkAccess.bind(null, 'realm', access);
  return module => {
    var npm = !module.includes('.'),
      name = !npm ? resolve(path, module) : module,
      lib = pull(name);

    // console.log(lib, npm, name, module);
    if (lib instanceof Object) return lib;
    if (!lib) throw new VMError(`Access denied '${module}'`);
    try {
      const absolute = internalRequire.resolve(name);
      if (npm && absolute === name) return internalRequire(name); //? Integrated nodejs API
      if (npm && !npmIsolation) return internalRequire(absolute); //?  VM uncover Npm packages
      if (absolute.endsWith('.json')) return internalRequire(absolute); //? JSON modules
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
