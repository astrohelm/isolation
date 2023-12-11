'use strict';

const GLOBAL = require('./global');
const { createContext, isContext } = require('node:vm');
const CTX_OPTS = { codeGeneration: { strings: false, wasm: false } };

// prettier-ignore
var contextify = module.exports = (ctx, mode = false) => {
  if (!ctx) return contextify.EMPTY;
  if (isContext(ctx)) return ctx;
  return createContext(ctx, {
    ...contextify.OPTIONS,
    preventEscape: mode ? 'afterEvaluate' : '',
  });
};

const { freeze, assign } = Object;
assign(contextify, {
  OPTIONS: CTX_OPTS,
  EMPTY: createContext(freeze({}), CTX_OPTS),
  COMMON: createContext(freeze({ ...GLOBAL }), CTX_OPTS),
  NODE: createContext(freeze({ ...GLOBAL, global, console, process }), CTX_OPTS),
});
