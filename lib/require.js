'use strict';

const { basename, dirname, resolve } = require('node:path');
const { readFileSync } = require('node:fs');
const { checkAccess } = require('./utils');
const internalRequire = require;
class VMError extends Error {}

module.exports = (options, exec) => {
  const { dir, npmIsolation, access } = options;
<<<<<<< Updated upstream

=======
  const pull = checkAccess.bind(null, 'realm', access);
>>>>>>> Stashed changes
  return module => {
    const npm = !module.includes('.');
    const name = !npm ? resolve(dir, module) : module;
    const lib = checkAccess(name, access, 'realm');

    if (lib instanceof Object) return lib;
    if (!lib) throw new VMError(`Access denied '${module}'`);
    try {
      const absolute = internalRequire.resolve(name);
<<<<<<< Updated upstream
      if (npm && absolute === name) return internalRequire(name); //? Integrated nodejs API
      if (npm && !npmIsolation) return internalRequire(absolute); //?  VM uncover Npm packages
      if (absolute.endsWith('.json')) return internalRequire(absolute); //? JSON modules
      const [filename, dir, type] = [basename(absolute), dirname(absolute), undefined];
      const exports = exec(readFileSync(absolute, 'utf8'), { ...options, filename, dir, type });
      return exports;
=======
      if (npm && absolute === name) return internalRequire(name); //? Primordials
      if ((npm && !npmIsolation) || absolute.endsWith('.json')) return internalRequire(absolute);
      const [filename, dir] = [basename(absolute), dirname(absolute)];
      return exec(readFileSync(absolute, 'utf8'), { ...options, filename, dir });
>>>>>>> Stashed changes
    } catch (err) {
      if (err instanceof VMError) throw err;
      throw new VMError(`Cannot find module '${module}'`);
    }
  };
};
