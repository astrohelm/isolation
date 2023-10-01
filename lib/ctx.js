'use strict';

const { createContext } = require('node:vm');

const NODE = { global, console, process };
const TIME = { setTimeout, setImmediate, setInterval, clearTimeout, clearImmediate, clearInterval };
const BUFF = { Buffer, TextDecoder, TextEncoder };
const URI = { URL, URLSearchParams };
const EVENT = { Event, EventTarget, queueMicrotask };
const MESSAGE = { MessageChannel, MessageEvent, MessagePort };
const DEFAULT = { AbortController, ...EVENT, ...BUFF, ...URI, ...TIME, ...MESSAGE };

const CTX_OPTS = { codeGeneration: { strings: false, wasm: false } };

const CTX = {
  OPTIONS: CTX_OPTS,
  EMPTY: createContext(Object.freeze({}), CTX_OPTS),
  COMMON: createContext(Object.freeze({ ...DEFAULT }), CTX_OPTS),
  NODE: createContext(Object.freeze({ ...DEFAULT, ...NODE }), CTX_OPTS),
};

module.exports = CTX;
