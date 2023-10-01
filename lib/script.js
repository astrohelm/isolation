'use strict';

const [createRequire, { wrap, exec }] = [require('./require'), require('./utils')];
const { Script: VM, isContext, createContext } = require('node:vm');

const Script = function (src, opts = {}) {
  if (!new.target) return new Script(src, opts);
  const { script = {}, run = {}, ctx = {}, filename = 'Astro', dir = process.cwd() } = opts;
  const lineOffset = src.includes('use strict') ? -1 : -2;
  const machine = new VM(wrap(src), { filename, lineOffset, ...script });
  const require = createRequire({ ...opts, dir }, Script.execute);
  const context = Script.sandbox(Object.freeze(ctx));

  [this.name, this.dir] = [filename, dir];
  this.execute = (ctx = context) => {
    if (!isContext(ctx)) ctx = Script.sandbox(Object.freeze(ctx));
    const baseCTX = { require, __filename: this.name, __dirname: this.dir };
    const exports = machine.runInContext(ctx, { timeout: 1000, ...run });
    return exec(exports, baseCTX);
  };

  return this;
};

Script.prepare = (src, opts) => new Script(src, opts);
Script.execute = (src, opts) => new Script(src, opts).execute();
Script.sandbox = Object.assign((ctx, mode = false) => {
  if (!ctx) return Script.sandbox.EMPTY;
  const options = { ...Script.sandbox.OPTIONS, preventEscape: mode ? 'afterEvaluate' : '' };
  return createContext(ctx, options);
}, require('./ctx'));

module.exports = Script;
