'use strict';

const test = require('node:test');
const assert = require('node:assert');
const path = require('node:path');
const Script = require('../..');
const { CTX, read } = Script;
const target = name => path.join(__dirname, name);

test('Script executor', async () => {
  const script = new Script(`({field: 'value'});`);
  assert.strictEqual(script.type, 'js');
  assert.strictEqual(script.name, 'Astro');
  assert.strictEqual(script.dir, process.cwd());
  assert.strictEqual(typeof script.execute, 'function');
  const ms = script.execute();
  assert.deepStrictEqual(Object.keys(ms), ['field']);
  assert.strictEqual(ms.field, 'value');
});

test('[JS/CJS] Script loader', async () => {
  const simple = await read.script(target('examples/simple.js'));

  assert.deepStrictEqual(Object.keys(simple), ['field', 'add', 'sub']);
  assert.strictEqual(simple.field, 'value');
  assert.strictEqual(simple.add(2, 3), 5);
  assert.strictEqual(simple.sub(2, 3), -1);
});

test('[JS/CJS] Universal loader', async () => {
  const scripts = await read(target('examples'));
  const { deep, simple } = scripts;
  const { arrow } = deep;

  assert.strictEqual(typeof scripts, 'object');
  assert.strictEqual(Object.keys(scripts).length, 2);

  assert.deepStrictEqual(Object.keys(simple), ['field', 'add', 'sub']);
  assert.strictEqual(simple.field, 'value');
  assert.strictEqual(simple.add(2, 3), 5);
  assert.strictEqual(simple.sub(2, 3), -1);

  assert.strictEqual(typeof arrow, 'function');
  assert.strictEqual(arrow.toString(), '(a, b) => a + b');
  assert.strictEqual(arrow(2, 3), 5);
  assert.strictEqual(arrow(-1, 1), 0);
});

test('[JS/CJS] Folder loader', async () => {
  const scripts = await read.dir(target('examples'));
  const { deep, simple } = scripts;
  const { arrow } = deep;

  assert.strictEqual(typeof scripts, 'object');
  assert.strictEqual(Object.keys(scripts).length, 2);

  assert.deepStrictEqual(Object.keys(simple), ['field', 'add', 'sub']);
  assert.strictEqual(simple.field, 'value');
  assert.strictEqual(simple.add(2, 3), 5);
  assert.strictEqual(simple.sub(2, 3), -1);

  assert.strictEqual(typeof arrow, 'function');
  assert.strictEqual(arrow.toString(), '(a, b) => a + b');
  assert.strictEqual(arrow(2, 3), 5);
  assert.strictEqual(arrow(-1, 1), 0);
});

test('[JS/CJS] Folder loader with preparations', async () => {
  const scripts = await read.dir(target('examples'), { prepare: true });
  console.log(scripts);
  const { deep } = scripts;
  let { simple } = scripts;
  let { arrow } = deep;
  assert.strictEqual(typeof simple.execute, 'function');
  assert.strictEqual(typeof arrow.execute, 'function');
  [simple, arrow] = [simple.execute(), arrow.execute()];

  assert.strictEqual(typeof scripts, 'object');
  assert.strictEqual(Object.keys(scripts).length, 2);

  assert.deepStrictEqual(Object.keys(simple), ['field', 'add', 'sub']);
  assert.strictEqual(simple.field, 'value');
  assert.strictEqual(simple.add(2, 3), 5);
  assert.strictEqual(simple.sub(2, 3), -1);

  assert.strictEqual(typeof arrow, 'function');
  assert.strictEqual(arrow.toString(), '(a, b) => a + b');
  assert.strictEqual(arrow(2, 3), 5);
  assert.strictEqual(arrow(-1, 1), 0);
});

test('Create Default Context', async () => {
  const context = CTX.create();
  assert.deepEqual(Object.keys(context), []);
  assert.strictEqual(context.global, undefined);
});

test('Create Common Context', async () => {
  const context = CTX.create(CTX.NODE);
  assert.strictEqual(typeof context, 'object');
  assert.strictEqual(context.console, console);
  assert.strictEqual(context.global, global);
});

test('Create Custom Context', async () => {
  const sandbox = { field: 'value' };
  sandbox.global = sandbox;
  const context = CTX.create(Object.freeze(sandbox));
  assert.strictEqual(context.field, 'value');
  assert.deepEqual(Object.keys(context), ['field', 'global']);
  assert.strictEqual(context.global, sandbox);
});

test('[JS/CJS] Access internal not permitted', async () => {
  try {
    const ms = Script.execute(`const fs = require('fs');`, { type: 'cjs' });
    assert.strictEqual(ms, undefined);
  } catch (err) {
    assert.strictEqual(err.message, `Access denied 'fs'`);
  }

  try {
    const ms = Script.execute(`const fs = require('fs');`);
    assert.strictEqual(ms, undefined);
  } catch (err) {
    assert.strictEqual(err.message, `Access denied 'fs'`);
  }
});

test('[JS/CJS] Access non-existent not permitted', async () => {
  try {
    const src = `const notExist = require('nothing');`;
    const ms = Script.execute(src, { type: 'cjs' });
    assert.strictEqual(ms, undefined);
  } catch (err) {
    assert.strictEqual(err.message, `Access denied 'nothing'`);
  }

  try {
    const src = `const notExist = require('nothing');`;
    const ms = Script.execute(src);
    assert.strictEqual(ms, undefined);
  } catch (err) {
    assert.strictEqual(err.message, `Access denied 'nothing'`);
  }
});
