'use strict';

const { createContext } = require('node:vm');

const URI = { URL, URLSearchParams };
const MSG = { MessageChannel, MessageEvent, MessagePort, BroadcastChannel };
const CRUD = { fetch, FormData, Response, Request, Headers, Buffer, Blob };
const TXT = { TextDecoder, TextEncoder, TextDecoderStream, TextEncoderStream };
const TIME = { setTimeout, setImmediate, setInterval, clearTimeout, clearImmediate, clearInterval };
const EVT = { AbortController, AbortSignal, Event, EventTarget };
const STRAT = { ByteLengthQueuingStrategy, CountQueuingStrategy };
const STREAM = { CompressionStream, DecompressionStream };
const OTHER = { queueMicrotask, WebAssembly };

const NODE = { global, console, process };
const DEFAULT = { ...OTHER, ...STRAT, ...STREAM, ...URI, ...MSG, ...TXT, ...CRUD, ...TIME, ...EVT };

const CTX_OPTS = { codeGeneration: { strings: false, wasm: false } };

const CTX = {
  OPTIONS: CTX_OPTS,
  EMPTY: createContext(Object.freeze({}), CTX_OPTS),
  COMMON: createContext(Object.freeze({ ...DEFAULT }), CTX_OPTS),
  NODE: createContext(Object.freeze({ ...DEFAULT, ...NODE }), CTX_OPTS),
};

module.exports = CTX;
