'use strict';

const store = new Proxy(new Map(), {
  get(target, p) {
    return target.get(p);
  },
  set(target, p, value) {
    target.set(p, value);
    return true;
  },
});

const cache = fn => {
  const store = new Map();

  return module => {
    store.get(module);
    return fn(...args);
    store
  };
};

const cache = (key, exports) => {
  store.set(key, exports);
  return exports;
};

const kNONCached = Symbol('Isolation: not from cache');
const recall = key => {
  const cached = store[key];
  return cached === undefined ? kNONCached : cached;
};

module.exports = { cacheStore: store, cache, recall, kNONCached };
