'use strict';

const { wrap } = require('./utils');
const { Script: VMScript } = require('node:vm');
const kContext = Symbol('Execution context');
const kRequire = Symbol('Modules locator');
const kOptions = Symbol('Context options');
const kMachine = Symbol('VM script');
const EXEC_TIMEOUT = 1_000;
module.exports = Script;

function Script(src, options = {}) {
  if (!new.target) return new Script(src, options);
  const { filename = 'ISO', dir = process.cwd() } = options;
  const { script = {}, run = {}, type = 'cjs' } = options;
  const { code, lineOffset } = wrap(src, type === 'cjs');

  this.dir = dir;
  this.type = type;
  this.name = filename;
  this[kContext] = options.ctx;
  this[kOptions] = { timeout: EXEC_TIMEOUT, ...run };
  this[kMachine] = new VMScript(code, { filename, lineOffset, ...script });
  this[kRequire] = type === 'cjs' ? Script.createRequire(dir, options) : null;
}

Script.prepare = (src, opts) => new Script(src, opts);
Script.execute = (src, opts, ctx = opts?.ctx) => new Script(src, opts).execute(ctx);
Script.symbols = { kMachine, kOptions, kRequire, kContext };
Script.prototype.execute = function (ctx = this[kContext]) {
  const { [kMachine]: machine, [kOptions]: options, type } = this;
  const closure = machine.runInContext(Script.sandbox(ctx), options);
  if (type !== 'cjs') return closure;
  const exports = {};
  const module = { exports };
  closure(exports, this[kRequire], module, this.name, this.dir);
  return module.exports ?? exports;
};
