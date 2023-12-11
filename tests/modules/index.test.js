'use strict';

const test = require('node:test');
const assert = require('node:assert');
const path = require('node:path');
const Script = require('../..');
const { contextify, read } = Script;
const exec = Script.execute;

const target = name => path.join(__dirname, 'examples', name);

test('[REALM] For node internal module', async () => {
  const context = {};
  context.global = context;
  const src = `module.exports = { fs: require('fs') };`;
  const ctx = contextify(Object.freeze(context));
  exec(src, { ctx, access: (_, module) => module === 'fs' });
});

test('[REALM] non-existent but granted', async () => {
  try {
    const ms = exec(`module.exports = require('astroctx');`, {
      access: (_, module) => module === 'astroctx',
    });
    assert.strictEqual(ms, undefined);
  } catch (err) {
    assert.strictEqual(err.message, `Cannot find module 'astroctx'`);
  }
});

test('[REALM] Stub', async () => {
  const src = `
    const fs = require('fs');
    module.exports = {
      async useStub() {
        return new Promise((resolve) => {
          fs.readFile('name', (err,data) => {resolve(data);});
        });
      }
    };
  `;
  const ms = exec(src, {
    access: {
      realm: module => {
        if (module !== 'fs') return true;
        return {
          readFile: (filename, callback) => callback(null, 'stub-content'),
        };
      },
    },
  });
  const res = await ms.useStub();
  assert.strictEqual(res, 'stub-content');
});

test('[REALM] Nested', async () => {
  const context = { console };
  context.global = contextify;
  const src = `module.exports = require('./module.cjs');`;
  const ms = exec(src, {
    ctx: contextify(Object.freeze(context)),
    dir: path.join(__dirname, 'examples'),
    access: (_, filepath) => {
      const available = {
        [path.join(__dirname, 'examples', 'module.cjs')]: true,
        [path.join(__dirname, 'examples', 'module.nested.js')]: true,
      };
      return available[filepath];
    },
  });
  assert.strictEqual(ms.value, 1);
  assert.strictEqual(ms.nested.value, 2);
});

test('[REALM] Access with reader', async () => {
  const ms = await read.file(target('module.cjs'), {
    dir: path.join(__dirname, 'examples'),
    access: (_, filepath) => filepath === path.join(__dirname, 'examples', 'module.nested.js'),
  });
  assert.strictEqual(ms.value, 1);
  assert.strictEqual(ms.nested.value, 2);
});

test('[REALM] Nested not permitted', async () => {
  try {
    const src = `module.exports = require('./module.cjs');`;
    exec(src, {
      dir: path.join(__dirname, 'examples'),
      access: (_, filepath) => filepath === path.join(__dirname, 'examples', './module.cjs'),
    });
    assert.fail(new Error('Should not be loaded.'));
  } catch (err) {
    assert.strictEqual(err.message, `Access denied './module.nested.js'`);
  }
});

test('[REALM] nested npm', async () => {
  const src = `module.exports = require('node:test');`;
  const ms = exec(src, {
    access: (_, module) => module === 'node:test',
  });
  assert.strictEqual(typeof ms, 'function');
});
