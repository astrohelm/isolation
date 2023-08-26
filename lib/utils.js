'use strict';

const { WRAPPERS } = require('./default');
const { join } = require('node:path');
const MODULE_TYPES = Object.keys(WRAPPERS);

const scriptType = name => {
  if (!name?.includes('.')) return MODULE_TYPES[0];
  const type = name.split('.').at(-1);
  return MODULE_TYPES.includes(type) ? type : MODULE_TYPES[0];
};

const cjs = (closure, options) => {
  const exports = {};
  const module = { exports };
  closure({ exports, module, ...options });
  return module.exports;
};

const checkAccess = (module, access) => {
  if (!access) return null;
  const dir = join(module);
  for (const key of Object.keys(access)) {
    if (!dir.startsWith(key)) continue;
    return Reflect.get(access, key);
  }
  return null;
};

const wrapper = (src, ext = 'js') =>
  `'use strict';\n${WRAPPERS[ext](src.replace(/'use strict';\n?/g, ''))}`;

module.exports = { scriptType, wrapper, cjs, checkAccess };
