'use strict';
const test = require('node:test');
const assert = require('node:assert');
const path = require('node:path');
const Script = require('../..');
const { contextify, read } = Script;
const target = name => path.join(__dirname, name);

test('[CORE] Node context', () => {
  const ctx = Script.contextify.COMMON;
  const v = process.version.slice(1, 3);
  const v18 = 'Blob' in ctx;
  const v19 = 'PerformanceEntry' in ctx;
  const v20 = 'File' in ctx;
  const v21 = 'Navigator' in ctx;
  const versions = { 18: v18, 19: v19, 20: v20, 21: v21 };

  if (v in versions) {
    var testA = versions[v];
    var testB = versions[v + 1];
    assert(testA && !testB);
    return;
  }

  if (v > Object.keys(versions).at(-1)) assert(testB);
  else assert.fail('Unsupported node version');
});

test('[CORE] Script executor', async () => {
  const script = new Script(`module.exports = ({field: 'value'});`);
  assert.strictEqual(script.name, 'ISO');
  assert.strictEqual(script.dir, process.cwd());
  assert.strictEqual(typeof script.execute, 'function');
  const result = script.execute();
  assert.deepStrictEqual(Object.keys(result), ['field']);
  assert.strictEqual(result.field, 'value');
});

test('[CORE] Script executor extended', async () => {
  const script = Script.prepare(`module.exports = a + b`);
  assert.strictEqual(script.name, 'ISO');
  assert.strictEqual(script.dir, process.cwd());
  assert.strictEqual(typeof script.execute, 'function');
  assert.strictEqual(script.execute({ a: 2, b: 2 }), 4);
  assert.strictEqual(script.execute({ a: 2, b: 3 }), 5);
});

test('[CORE] Npm isolation check', async () => {
  const access = () => true;
  const script = Script.prepare(`module.exports = require('chalk')`, {
    access,
    npmIsolation: true,
    ctx: contextify.NODE,
  });
  assert.strictEqual(typeof script.execute(), 'function');
});

test('[READER] Script loader', async () => {
  const simple = await read.file(target('examples/simple.js'));

  assert.deepStrictEqual(Object.keys(simple), ['field', 'sub', 'add']);
  assert.strictEqual(simple.field, 'value');
  assert.strictEqual(simple.add(2, 3), 5);
  assert.strictEqual(simple.sub(2, 3), -1);
});

test('[READER] Access control', async () => {
  const access = { reader: path => !path.endsWith('simple.js') && !path.endsWith('.json') };
  const scripts = await read(target('examples'), { access });
  const { deep } = scripts;
  const { arrow } = deep;

  assert.strictEqual(typeof scripts, 'object');
  assert.strictEqual(Object.keys(scripts).length, 1);

  assert.strictEqual(typeof arrow, 'function');
  assert.strictEqual(arrow.toString(), '(a, b) => a + b');
  assert.strictEqual(arrow(2, 3), 5);
  assert.strictEqual(arrow(-1, 1), 0);
});

test('[READER] Folder loader', async () => {
  const access = { reader: path => !path.endsWith('.json') };
  const scripts = await read(target('examples'), { access });
  const { deep, simple } = scripts;
  const { arrow } = deep;

  assert.strictEqual(typeof scripts, 'object');
  assert.strictEqual(Object.keys(scripts).length, 2);

  assert.deepStrictEqual(Object.keys(simple), ['field', 'sub', 'add']);
  assert.strictEqual(simple.field, 'value');
  assert.strictEqual(simple.add(2, 3), 5);
  assert.strictEqual(simple.sub(2, 3), -1);

  assert.strictEqual(typeof arrow, 'function');
  assert.strictEqual(arrow.toString(), '(a, b) => a + b');
  assert.strictEqual(arrow(2, 3), 5);
  assert.strictEqual(arrow(-1, 1), 0);
});

test('[READER] Universal loader', async () => {
  const access = (_, path) => !path.endsWith('.json');
  const scripts = await read(target('examples'), { access });
  const { deep, simple } = scripts;
  const { arrow } = deep;

  assert.strictEqual(typeof scripts, 'object');
  assert.strictEqual(Object.keys(scripts).length, 2);

  assert.deepStrictEqual(Object.keys(simple), ['field', 'sub', 'add']);
  assert.strictEqual(simple.field, 'value');
  assert.strictEqual(simple.add(2, 3), 5);
  assert.strictEqual(simple.sub(2, 3), -1);

  assert.strictEqual(typeof arrow, 'function');
  assert.strictEqual(arrow.toString(), '(a, b) => a + b');
  assert.strictEqual(arrow(2, 3), 5);
  assert.strictEqual(arrow(-1, 1), 0);
});

test('[READER] Deep option', async () => {
  const access = (_, path) => !path.endsWith('.json');
  const scripts = await read(target('examples'), { access, depth: 1 });
  const { simple } = scripts;

  assert.strictEqual(typeof scripts, 'object');
  assert.strictEqual(Object.keys(scripts).length, 1);

  assert.deepStrictEqual(Object.keys(simple), ['field', 'sub', 'add']);
  assert.strictEqual(simple.field, 'value');
  assert.strictEqual(simple.add(2, 3), 5);
  assert.strictEqual(simple.sub(2, 3), -1);
});

test('[READER] Flat option', async () => {
  const access = (_, path) => !path.endsWith('.json');
  const scripts = await read(target('examples'), { access, flat: true });

  assert.strictEqual(typeof scripts, 'object');
  assert.strictEqual(Object.keys(scripts).length, 2);
  assert.deepStrictEqual(
    Object.keys(scripts).every(i => ['simple', 'arrow'].includes(i)),
    true,
  );
});

test('[READER] Prepare option', async () => {
  const access = (_, path) => !path.endsWith('.json');
  const scripts = await read.dir(target('examples'), { prepare: true, access });
  const { deep } = scripts;
  let { simple } = scripts;
  let { arrow } = deep;
  assert.strictEqual(typeof simple.execute, 'function');
  assert.strictEqual(typeof arrow.execute, 'function');
  [simple, arrow] = [simple.execute(), arrow.execute()];

  assert.strictEqual(typeof scripts, 'object');
  assert.strictEqual(Object.keys(scripts).length, 2);

  assert.deepStrictEqual(Object.keys(simple), ['field', 'sub', 'add']);
  assert.strictEqual(simple.field, 'value');
  assert.strictEqual(simple.add(2, 3), 5);
  assert.strictEqual(simple.sub(2, 3), -1);

  assert.strictEqual(typeof arrow, 'function');
  assert.strictEqual(arrow.toString(), '(a, b) => a + b');
  assert.strictEqual(arrow(2, 3), 5);
  assert.strictEqual(arrow(-1, 1), 0);

  let simple2 = await read.file(target('examples/simple.js'), { prepare: true });
  assert.strictEqual(typeof simple2.execute, 'function');
  simple2 = simple2.execute();
  assert.deepStrictEqual(Object.keys(simple2), ['field', 'sub', 'add']);
  assert.strictEqual(simple2.field, 'value');
  assert.strictEqual(simple2.add(2, 3), 5);
  assert.strictEqual(simple2.sub(2, 3), -1);
});

test('[CTX] Default', async () => {
  const ctx = contextify();
  assert.deepEqual(Object.keys(ctx), []);
  assert.strictEqual(ctx.global, undefined);
});

test('[CTX] Common', async () => {
  const ctx = contextify(contextify.NODE);
  assert.strictEqual(typeof ctx, 'object');
  assert.strictEqual(ctx.console, console);
  assert.strictEqual(ctx.global, global);
});

test('[CTX] Custom', async () => {
  const context = { field: 'value' };
  context.global = context;
  const ctx = contextify(Object.freeze(context));
  assert.strictEqual(ctx.field, 'value');
  assert.deepEqual(Object.keys(ctx), ['field', 'global']);
  assert.strictEqual(ctx.global, context);
});

test('[REALM] Access denied', async () => {
  try {
    const result = Script.execute(`const fs = require('fs');`);
    assert.strictEqual(result, undefined);
  } catch (err) {
    assert.strictEqual(err.message, `Access denied 'fs'`);
  }
});

test('[REALM] Non-existent', async () => {
  try {
    const src = `const notExist = require('nothing');`;
    const result = Script.execute(src);
    assert.strictEqual(result, undefined);
  } catch (err) {
    assert.strictEqual(err.message, `Access denied 'nothing'`);
  }

  try {
    const src = `const notExist = require('nothing');`;
    const result = Script.execute(src);
    assert.strictEqual(result, undefined);
  } catch (err) {
    assert.strictEqual(err.message, `Access denied 'nothing'`);
  }
});

// test('', () => {
//   const src = `require('./examples/simple');`;
//   const ctx = { require };
//   const result = Script.execute(src, { type: 'iso', ctx });
//   console.log(result);
// });
