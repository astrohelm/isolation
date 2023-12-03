'use strict';

const { assign, freeze } = Object;
// prettier-ignore
module.exports = freeze(assign(require('./lib/script'), {
  createRequire: require('./lib/require'),
  sandbox: require('./lib/context'),
  read: require('./lib/reader'),
  default: module.exports,
}));
