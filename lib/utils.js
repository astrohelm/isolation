'use strict';

const cjs = src => `(({exports, require, module, __filename, __dirname}) => {\n${src}\n});`;
const wrap = src => `'use strict';\n` + cjs(src.replace(/['"]use strict['"];\n?/g, ''));

const exec = (closure, options) => {
  const exports = {};
  const module = { exports };
  closure({ exports, module, ...options });
  return module.exports;
};

const checkAccess = (module, access, type) => {
  if (typeof access === 'object' && access[type]) return access[type](module);
  if (typeof access === 'function') return access(module, type);
  return type !== 'realm'; //? By default reader have full access and realm no access
};

module.exports = { exec, wrap, checkAccess };
