'use strict';

<<<<<<< Updated upstream
const [createRequire, { wrap, exec }] = [require('./require'), require('./utils')];
const { Script: VM, isContext, createContext } = require('node:vm');
=======
const { Script: VM, createContext } = require('node:vm');
const createRequire = require('./require');
module.exports = Script;

const RSTRICT = /['"]use strict['"];\n?/g;
const cjs = src => `((exports, require, module, __filename, __dirname) => {\n${src}\n});`;
const wrap = src => `'use strict';\n` + cjs(src.replace(RSTRICT, ''));
>>>>>>> Stashed changes

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
    if (!isContext(ctx)) ctx = Script.sandbox(Object.freeze(ctx));
    const baseCTX = { require, __filename: this.name, __dirname: this.dir };
    const exports = machine.runInContext(ctx, { timeout: 1000, ...run });
    return exec(exports, baseCTX);
  };
}

Script.prepare = (src, opts) => new Script(src, opts);
Script.execute = (src, opts) => new Script(src, opts).execute();
Script.sandbox = Object.assign((ctx, mode = false) => {
  if (!ctx) return Script.sandbox.EMPTY;
<<<<<<< Updated upstream
  if (isContext(ctx)) return ctx;
  const options = { ...Script.sandbox.OPTIONS, preventEscape: mode ? 'afterEvaluate' : '' };
  return createContext(ctx, options);
=======
  const preventEscape = mode ? 'afterEvaluate' : '';
  return createContext(ctx, { ...Script.sandbox.OPTIONS, preventEscape });
>>>>>>> Stashed changes
}, require('./ctx'));
