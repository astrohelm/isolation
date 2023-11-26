'use strict';

const checkAccess = (type, access, module) => {
  if (typeof access === 'object' && access[type]) return access[type](module);
  if (typeof access === 'function') return access(module, type);
  return type !== 'realm'; //? By default reader have full access and realm no access
};

module.exports = { checkAccess };
