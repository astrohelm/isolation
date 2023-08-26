'use strict';

const test = require('node:test');
const assert = require('node:assert');
const path = require('node:path');
const Script = require('../..');
const { CTX, read } = Script;
const exec = Script.execute;

const target = name => path.join(__dirname, 'examples', name);

test('Access for node internal module', async () => {
  const sandbox = {};
  sandbox.global = sandbox;
  const src = `module.exports = { fs: require('fs') };`;
  const context = CTX.create(Object.freeze(sandbox));
  exec(src, { context, access: { fs: true }, type: 'cjs' });
});

test('[JS/CJS] Access non-existent npm module', async () => {
  try {
    const ms = exec(`const notExist = require('leadfisher');`, {
      access: { leadfisher: true },
      type: 'cjs',
    });
    assert.strictEqual(ms, undefined);
  } catch (err) {
    assert.strictEqual(err.message, `Cannot find module 'leadfisher'`);
  }

  try {
    const ms = exec(`const notExist = require('leadfisher');`, { access: { leadfisher: true } });
    assert.strictEqual(ms, undefined);
  } catch (err) {
    assert.strictEqual(err.message, `Cannot find module 'leadfisher'`);
  }
});

test('[CJS] Access for stub function', async () => {
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
      fs: {
        readFile(filename, callback) {
          callback(null, 'stub-content');
        },
      },
    },
    type: 'cjs',
  });
  const res = await ms.useStub();
  assert.strictEqual(res, 'stub-content');
});

test('[CJS] Access nestsed commonjs', async () => {
  const sandbox = { console };
  sandbox.global = sandbox;
  const src = `module.exports = require('./module.cjs');`;
  const ms = exec(src, {
    ctx: CTX.create(Object.freeze(sandbox)),
    dir: path.join(__dirname, 'examples'),
    access: {
      [path.join(__dirname, 'examples', 'module.cjs')]: true,
      [path.join(__dirname, 'examples', 'module.nested.js')]: true,
    },
    type: 'cjs',
  });
  assert.strictEqual(ms.value, 1);
  assert.strictEqual(ms.nested.value, 2);
});

test('[CJS] Access folder [path prefix]', async () => {
  const src = `module.exports = require('./module.cjs');`;
  const ms = exec(src, {
    dir: path.join(__dirname, 'examples'),
    access: { [path.join(__dirname)]: true },
    type: 'cjs',
  });
  assert.strictEqual(ms.value, 1);
  assert.strictEqual(ms.nested.value, 2);
});

test('[CJS] Access with readScript', async () => {
  const ms = await read.script(target('module.cjs'), {
    dir: path.join(__dirname, 'examples'),
    access: { [path.join(__dirname, 'examples', 'module.nested.js')]: true },
    type: 'cjs',
  });
  assert.strictEqual(ms.value, 1);
  assert.strictEqual(ms.nested.value, 2);
});

test('[CJS] Access nested not permitted', async () => {
  try {
    const src = `module.exports = require('./module.cjs');`;
    exec(src, {
      dir: path.join(__dirname, 'examples'),
      access: { [path.join(__dirname, 'examples', './module.cjs')]: true },
      type: 'cjs',
    });
    assert.fail(new Error('Should not be loaded.'));
  } catch (err) {
    assert.strictEqual(err.message, `Access denied './module.nested.js'`);
  }
});

test('[CJS] Access nestsed npm modules', async () => {
  const src = `module.exports = require('node:test');`;
  const ms = exec(src, { access: { 'node:test': true }, type: 'cjs' });
  assert.strictEqual(typeof ms, 'function');
});
