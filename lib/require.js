'use strict';

const { readFileSync } = require('node:fs');
const { checkAccess } = require('./utils');
const { basename, dirname, resolve } = require('node:path');
const internalRequire = require;
class VMError extends Error {}

module.exports = (options, exec) => {
  const { dir, npmIsolation, access } = options;

  return module => {
    const npm = !module.includes('.');
    const name = !npm ? resolve(dir, module) : module;
    const lib = checkAccess(name, access);

    if (lib instanceof Object) return lib;
    if (!lib) throw new VMError(`Access denied '${module}'`);
    try {
      const absolute = internalRequire.resolve(name);
      if (npm && absolute === name) return internalRequire(name); //? Integrated nodejs API
      if (npm && !npmIsolation) return internalRequire(absolute); //?  VM uncover Npm packages
      const [filename, dir, type] = [basename(absolute), dirname(absolute), undefined];
      const exports = exec(readFileSync(absolute, 'utf8'), { ...options, filename, dir, type });
      return exports;
    } catch (err) {
      if (err instanceof VMError) throw err;
      throw new VMError(`Cannot find module '${module}'`);
    }
  };
};
