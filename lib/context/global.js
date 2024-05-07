'use strict';

module.exports = {
  //? Node18
  AbortController,
  AbortSignal,
  Blob,
  BroadcastChannel,
  Buffer,
  ByteLengthQueuingStrategy,
  btoa,
  atob,
  clearImmediate,
  clearInterval,
  clearTimeout,
  CompressionStream,
  CountQueuingStrategy,
  DecompressionStream,
  DOMException,
  Event,
  EventTarget,
  fetch,
  FormData,
  Headers,
  MessageChannel,
  MessageEvent,
  MessagePort,
  queueMicrotask,
  Request,
  Response,
  structuredClone,
  setImmediate,
  setInterval,
  setTimeout,
  TextDecoder,
  TextDecoderStream,
  TextEncoder,
  TextEncoderStream,
  URL,
  URLSearchParams,
  WebAssembly,
};

try {
  Object.assign(module.exports, {
    //? Node18 (e)
    TransformStream,
    TransformStreamDefaultController,
    WritableStream,
    WritableStreamDefaultController,
    WritableStreamDefaultWriter,
    ReadableByteStreamController,
    ReadableStream,
    ReadableStreamBYOBReader,
    ReadableStreamBYOBRequest,
    ReadableStreamDefaultController,
    ReadableStreamDefaultReader,
  });

  Object.assign(module.exports, {
    //? Node19
    SubtleCrypto,
    PerformanceEntry,
    PerformanceMark,
    PerformanceMeasure,
    PerformanceObserver,
    PerformanceObserverEntryList,
    PerformanceResourceTiming,
    performance,
    crypto,
    Crypto,
    CryptoKey,
    CustomEvent,
  });

  Object.assign(module.exports, { File }); //? Node20
  Object.assign(module.exports, { Navigator, navigator, WebSocket }); //? Node21
  //? Node22 has not yet introduced new global variables
  // eslint-disable-next-line no-empty
} catch {}
