'use strict';

const { basename, dirname, resolve } = require('node:path');
const { readFileSync } = require('node:fs');
const { checkAccess } = require('./utils');
const internalRequire = require;
class VMError extends Error {}

module.exports = (options, exec) => {
  const { dir, npmIsolation, access } = options;
  const pull = checkAccess.bind(null, 'realm', access);

  return module => {
    const npm = !module.includes('.');
    const name = !npm ? resolve(dir, module) : module;
    const lib = pull(name);

    if (lib instanceof Object) return lib;
    if (!lib) throw new VMError(`Access denied '${module}'`);
    try {
      const absolute = internalRequire.resolve(name);
      if (npm && absolute === name) return internalRequire(name); //? Primordials
      if (npm && !npmIsolation) return internalRequire(absolute); //? No npm isolation
      if (absolute.endsWith('.json')) return internalRequire(absolute); //? JSON
      const [filename, dir, type] = [basename(absolute), dirname(absolute), undefined];
      return exec(readFileSync(absolute, 'utf8'), { ...options, filename, dir, type });
    } catch (err) {
      if (err instanceof VMError) throw err;
      throw new VMError(`Cannot find module '${module}'`);
    }
  };
};
