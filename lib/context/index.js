'use strict';

const GLOBAL = require('./global');
const { createContext, isContext } = require('node:vm');
const CTX_OPTS = { codeGeneration: { strings: false, wasm: false } };

// prettier-ignore
var sandbox = module.exports = (ctx, mode = false) => {
  if (!ctx) return sandbox.EMPTY;
  if (isContext(ctx)) return ctx;
  return createContext(ctx, {
    ...sandbox.OPTIONS,
    preventEscape: mode ? 'afterEvaluate' : '',
  });
};

const { freeze, assign } = Object;
assign(sandbox, {
  OPTIONS: CTX_OPTS,
  EMPTY: createContext(freeze({}), CTX_OPTS),
  COMMON: createContext(freeze({ ...GLOBAL }), CTX_OPTS),
  NODE: createContext(freeze({ ...GLOBAL, global, console, process }), CTX_OPTS),
});
