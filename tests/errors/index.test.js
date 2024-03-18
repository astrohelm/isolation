'use strict';

const test = require('node:test');
const assert = require('node:assert');
const path = require('node:path');
const Script = require('../..');
const { read } = Script;
const exec = Script.execute;

const target = name => path.join(__dirname, 'examples', name);

test('[CORE] Realm execution timeout', async () => {
  const src = `Promise.resolve().then(() => { while(1); });`;
  try {
    Script.execute(src, { run: { timeout: 1_000 } }, Script.contextify({}, true));
    assert.fail('Should fail by timeout');
  } catch (err) {}
});

test('[CORE] Eval error ', async () => {
  try {
    exec(`module.exports = eval('100 * 2');`);
    assert.fail(new Error('Should throw an error.'));
  } catch (error) {
    assert.strictEqual(error.constructor.name, 'EvalError');
  }
});

test('[CORE] Eval error', async () => {
  try {
    exec(`eval('100 * 2')`);
    assert.fail(new Error('Should throw an error.'));
  } catch (error) {
    assert.strictEqual(error.constructor.name, 'EvalError');
  }
});

test('[CORE] Error.notfound.js', async () => {
  let ms;
  try {
    ms = await read(target('error.notfound.js'));
    assert.fail(new Error('Should throw an error.'));
  } catch (err) {
    assert.strictEqual(err.code, 'ENOENT');
  }
  assert.strictEqual(ms, undefined);
});

test('[CORE] Error.syntax.js', async () => {
  try {
    await read(target('error.syntax'));
    assert.fail(new Error('Should throw an error.'));
  } catch (err) {
    assert.strictEqual(err.constructor.name, 'SyntaxError');
  }
});

test('[CORE] Error.reference.js', async () => {
  try {
    const script = await read(target('error.reference.js'), { type: 'iso' });
    await script();

    assert.fail(new Error('Should throw an error.'));
  } catch (err) {
    assert.strictEqual(err.constructor.name, 'ReferenceError');
  }
});

test('[CORE] Call undefined as a function', async () => {
  try {
    const script = await read(target('error.undef.js'));
    await script();
    assert.fail(new Error('Should throw an error.'));
  } catch (err) {
    assert.strictEqual(err.constructor.name, 'TypeError');
  }
});

test('[CORE] Error.reference.js Error.reference.cjs (line number)', async () => {
  try {
    const script = await read(target('error.reference.js'), { type: 'iso' });
    await script();

    assert.fail(new Error('Should throw an error.'));
  } catch (err) {
    const [, firstLine] = err.stack.split('\n');
    const [, lineNumber] = firstLine.split(':');
    assert.strictEqual(parseInt(lineNumber, 10), 4);
  }

  try {
    const script = await read(target('error.reference.cjs'));
    await script();
    assert.fail(new Error('Should throw an error.'));
  } catch (err) {
    const [, firstLine] = err.stack.split('\n');
    const [, lineNumber] = firstLine.split(':');
    assert.strictEqual(parseInt(lineNumber, 10), 5);
  }
});

test('[CORE] Error.empty.js', async () => {
  try {
    await read(target('error.empty.js'));
    assert.fail(new Error('Should throw an error.'));
  } catch (err) {
    assert.strictEqual(err.constructor.name, 'SyntaxError');
  }
});

test('[CORE] Type iso', async () => {
  const result = exec('2 + 2', { type: 'iso' });
  assert.strictEqual(result, 4);
});
