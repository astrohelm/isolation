'use strict';

const test = require('node:test');
const assert = require('node:assert');
const path = require('node:path');
const Script = require('../..');
const { sandbox, require: read } = Script;
const exec = Script.execute;

const target = name => path.join(__dirname, 'examples', name);

test('[SANDBOX] For node internal module', async () => {
  const context = {};
  context.global = context;
  const src = `module.exports = { fs: require('fs') };`;
  const ctx = sandbox(Object.freeze(context));
  exec(src, { ctx, access: module => module === 'fs', type: 'cjs' });
});

test('[SANDBOX] non-existent but granted', async () => {
  try {
    const ms = exec(`module.exports = require('astroctx');`, {
      access: module => module === 'astroctx',
    });
    assert.strictEqual(ms, undefined);
  } catch (err) {
    assert.strictEqual(err.message, `Cannot find module 'astroctx'`);
  }
});

test('[SANDBOX] Stub', async () => {
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
      sandbox: module => {
        if (module === 'fs') {
          return {
            readFile(filename, callback) {
              callback(null, 'stub-content');
            },
          };
        }
        return null;
      },
    },
  });
  const res = await ms.useStub();
  assert.strictEqual(res, 'stub-content');
});

test('[SANDBOX] Nested', async () => {
  const context = { console };
  context.global = sandbox;
  const src = `module.exports = require('./module.cjs');`;
  const ms = exec(src, {
    ctx: sandbox(Object.freeze(context)),
    dir: path.join(__dirname, 'examples'),
    access: filepath => {
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

test('[SANDBOX] Access with reader', async () => {
  const ms = await read.script(target('module.cjs'), {
    dir: path.join(__dirname, 'examples'),
    access: filepath => filepath === path.join(__dirname, 'examples', 'module.nested.js'),
  });
  assert.strictEqual(ms.value, 1);
  assert.strictEqual(ms.nested.value, 2);
});

test('[SANDBOX] Nested not permitted', async () => {
  try {
    const src = `module.exports = require('./module.cjs');`;
    exec(src, {
      dir: path.join(__dirname, 'examples'),
      access: filepath => filepath === path.join(__dirname, 'examples', './module.cjs'),
    });
    assert.fail(new Error('Should not be loaded.'));
  } catch (err) {
    assert.strictEqual(err.message, `Access denied './module.nested.js'`);
  }
});

test('[SANDBOX] nested npm', async () => {
  const src = `module.exports = require('node:test');`;
  const ms = exec(src, {
    access: module => module === 'node:test',
  });
  assert.strictEqual(typeof ms, 'function');
});
