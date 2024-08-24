'use strict';

const { Script: VMScript } = require('node:vm');
const wrappers = {
  iso: src => `{\n${src}\n}`,
  cjs: src => `((exports, require, module, __filename, __dirname) => {\n${src}\n});`,
};

exports.isObject = obj => typeof obj === 'object' && obj !== null;
exports.createExports = () => {
  const exports = {};
  const module = { exports };
  return { module, exports };
};

exports.checkAccess = (type, access, module) => {
  if (exports.isObject(access) && access[type]) return access[type](module);
  if (typeof access === 'function') return access(type, module);
  return type !== 'realm'; //? By default reader have full access and realm no access
};

exports.createVM = (type, opts, src, filename) => {
  const strict = src.match(/['"]use strict['"];\n?/g)?.[0].index === 0 ? `'use strict';\n` : '';
  return new VMScript(strict + wrappers[type](src), {
    lineOffset: strict ? -2 : -1,
    filename,
    ...opts,
  });
};
