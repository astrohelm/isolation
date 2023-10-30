'use strict';

const RSTRICT = /['"]use strict['"];\n?/g;
const [{ Script: VM, createContext }, createRequire] = [require('node:vm'), require('./require')];
const cjs = src => `((exports, require, module, __filename, __dirname) => {\n${src}\n});`;
const wrap = src => `'use strict';\n` + cjs(src.replace(RSTRICT, ''));

const Script = function (src, opts = {}) {
  if (!new.target) return new Script(src, opts);
  const { script = {}, run = {}, ctx = {}, filename = 'ISO', dir = process.cwd() } = opts;
  const machine = new VM(wrap(src), { filename, lineOffset: -1 - !src.match(RSTRICT), ...script });
  const require = createRequire({ ...opts, dir }, Script.execute);
  const context = Script.sandbox(ctx);

  [this.name, this.dir] = [filename, dir];
  this.execute = (ctx = context) => {
    const module = { exports: {} };
    const closure = machine.runInContext(Script.sandbox(ctx), { timeout: 1000, ...run });
    return closure(module.exports, require, module, this.name, this.dir), module.exports;
  };

  return this;
};

Script.prepare = (src, opts) => new Script(src, opts);
Script.execute = (src, opts) => new Script(src, opts).execute();
Script.sandbox = Object.assign((ctx, mode = false) => {
  if (!ctx) return Script.sandbox.EMPTY;
  return createContext(ctx, {
    ...Script.sandbox.OPTIONS,
    preventEscape: mode ? 'afterEvaluate' : '',
  });
}, require('./ctx'));

module.exports = Script;
