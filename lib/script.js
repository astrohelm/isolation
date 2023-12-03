'use strict';

const { Script: VM } = require('node:vm');
module.exports = Script;

const RSTRICT = /['"]use strict['"];\n?/g;
const cjs = src => `((exports, require, module, __filename, __dirname) => {\n${src}\n});`;
const wrap = src => `'use strict';\n` + cjs(src.replace(RSTRICT, ''));

Script.execute = (src, opts, ctx = opts?.ctx) => new Script(src, opts).execute(ctx);
Script.prepare = (src, opts) => new Script(src, opts);

function Script(src, opts = {}) {
  if (!new.target) return new Script(src, opts);
  const { script = {}, run = {}, ctx: context = {}, filename = 'ISO', dir = process.cwd() } = opts;
  const machine = new VM(wrap(src), { filename, lineOffset: -1 - !src.match(RSTRICT), ...script });
  const require = Script.createRequire(dir, opts);

  [this.name, this.dir] = [filename, dir];
  this.execute = (ctx = context) => {
    const module = { exports: {} };
    const closure = machine.runInContext(Script.sandbox(ctx), { timeout: 1000, ...run });
    return closure(module.exports, require, module, this.name, this.dir), module.exports;
  };
}
