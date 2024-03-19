'use strict';

const { assign, freeze } = Object;
// prettier-ignore
module.exports.default = module.exports = freeze(assign(require('./lib/script'), {
  createRequire: require('./lib/require'),
  contextify: require('./lib/context'),
  read: require('./lib/reader'),
}));
