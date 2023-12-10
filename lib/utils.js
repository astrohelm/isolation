'use strict';

const checkAccess = (type, access, module) => {
  if (typeof access === 'object' && access[type]) return access[type](module);
  if (typeof access === 'function') return access(module, type);
  return type !== 'realm'; //? By default reader have full access and realm no access
};

const iso = src => `{\n${src}\n}`;
const cjs = src => `((exports, require, module, __filename, __dirname) => {\n${src}\n});`;
const wrap = (src, closure) => {
  const strict = src.match(/['"]use strict['"];\n?/g)?.[0].index === 0 ? `'use strict';\n` : '';
  return { lineOffset: strict ? -2 : -1, code: strict + (closure ? cjs : iso)(src) };
};

module.exports = { checkAccess, wrap };
