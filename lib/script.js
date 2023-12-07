'use strict';

const { Script: VM } = require('node:vm');
const { wrap } = require('./utils');

//prettier-ignore
var Script = module.exports = function Script(src, opts = {}) {
  if (!new.target) return new Script(src, opts);
  const { script = {}, run = {}, ctx: context = {}, type = 'cjs' } = opts;
  const { filename = 'ISO', dir = process.cwd() } = opts;
  const { code, lineOffset } = wrap(src, type === 'cjs');
  const machine = new VM(code, { filename, lineOffset, ...script });
  if (type === 'cjs') var require = Script.createRequire(dir, opts);

  [this.name, this.dir] = [filename, dir];
  this.execute = (ctx = context) => {
    const module = { exports: {} };
    const closure = machine.runInContext(Script.sandbox(ctx), { timeout: 1000, ...run });
    if (type !== 'cjs') return closure;
    return closure(module.exports, require, module, this.name, this.dir), module.exports;
  };
};

module.exports.execute = (src, opts, ctx = opts?.ctx) => new Script(src, opts).execute(ctx);
module.exports.prepare = (src, opts) => new Script(src, opts);
