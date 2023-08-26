'use strict';

const { createContext } = require('node:vm');

const WRAPPERS = {
  js: src => `{\n${src}\n}`,
  cjs: src => `(({exports, require, module, __filename, __dirname}) => {\n${src}\n});`,
};

const NODE = { global, console, process };
const TIME = { setTimeout, setImmediate, setInterval, clearTimeout, clearImmediate, clearInterval };
const BUFF = { Buffer, TextDecoder, TextEncoder };
const URI = { URL, URLSearchParams };
const EVENT = { Event, EventTarget, queueMicrotask };
const MESSAGE = { MessageChannel, MessageEvent, MessagePort };
const DEFAULT = { AbortController, ...EVENT, ...BUFF, ...URI, ...TIME, ...MESSAGE };

const RUN_OPTS = { timeout: 1000 };
const CTX_OPTS = { codeGeneration: { strings: false, wasm: false } };

const CTX = {
  OPTIONS: CTX_OPTS,
  EMPTY: createContext(Object.freeze({}), CTX_OPTS),
  COMMON: createContext(Object.freeze({ ...DEFAULT })),
  NODE: createContext(Object.freeze({ ...DEFAULT, ...NODE })),
};

CTX.create = (ctx, mode = false) => {
  if (!ctx) return CTX.EMPTY;
  return createContext(ctx, { ...CTX.OPTIONS, preventEscape: mode ? 'afterEvaluate' : '' });
};

module.exports = { CTX, WRAPPERS, RUN_OPTS };
