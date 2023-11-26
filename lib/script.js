'use strict';

const { Script: VM, createContext } = require('node:vm');
const createRequire = require('./require');
module.exports = Script;

const RSTRICT = /['"]use strict['"];\n?/g;
const cjs = src => `((exports, require, module, __filename, __dirname) => {\n${src}\n});`;
const wrap = src => `'use strict';\n` + cjs(src.replace(RSTRICT, ''));

function Script(src, opts = {}) {
  if (!new.target) return new Script(src, opts);
  const { script = {}, run = {}, ctx = {}, filename = 'Astro', dir = process.cwd() } = opts;
  const lineOffset = src.includes('use strict') ? -1 : -2;
  const machine = new VM(wrap(src), { filename, lineOffset, ...script });
  const require = createRequire({ ...opts, dir }, Script.execute);
  const context = Script.sandbox(Object.freeze(ctx));

  this.name = filename;
  this.dir = dir;
  this.execute = (ctx = context) => {
    const module = { exports: {} };
    const closure = machine.runInContext(Script.sandbox(ctx), { timeout: 1000, ...run });
    return closure(module.exports, require, module, this.name, this.dir), module.exports;
  };
}

Script.prepare = (src, opts) => new Script(src, opts);
Script.execute = (src, opts) => new Script(src, opts).execute();
Script.sandbox = Object.assign((ctx, mode = false) => {
  if (!ctx) return Script.sandbox.EMPTY;
  const preventEscape = mode ? 'afterEvaluate' : '';
  return createContext(ctx, { ...Script.sandbox.OPTIONS, preventEscape });
}, require('./ctx'));
