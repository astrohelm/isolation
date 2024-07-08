'use strict';

const { resolve: pathResolve } = require('node:path');
const { Script: VMScript } = require('node:vm');

exports.VMError = class VMError extends Error {};
exports.checkAccess = (type, access, module) => {
  if (typeof access === 'object' && access[type]) return access[type](module);
  if (typeof access === 'function') return access(type, module);
  return type !== 'realm'; //? By default reader have full access and realm no access
};

const wrappers = {
  iso: src => `{\n${src}\n}`,
  cjs: src => `((exports, require, module, __filename, __dirname) => {\n${src}\n});`,
};

exports.createVM = (type, opts, src, filename) => {
  const strict = src.match(/['"]use strict['"];\n?/g)?.[0].index === 0 ? `'use strict';\n` : '';
  return new VMScript(strict + wrappers[type](src), {
    lineOffset: strict ? -2 : -1,
    filename,
    ...opts,
  });
};

exports.resolve = (dir, request) => {
  if (!request.includes('.')) return request;
  return pathResolve(dir, request);
};
