'use strict';

const { scriptType, wrapper: wrap, cjs } = require('./utils');
const { CTX, RUN_OPTS } = require('./default');
const createRequire = require('./require');
const { Script: VM } = require('node:vm');

const Script = function (src, opts = {}) {
  if (!this) return new Script(src, opts);
  const { script = {}, run = {}, ctx = {}, filename = 'Astro', dir = process.cwd(), type } = opts;

  [this.name, this.dir] = [filename, dir];
  this.type = type ?? (filename && filename !== 'Astro' ? scriptType(this.name) : 'js');
  const isJS = this.type === 'js';

  const require = createRequire({ ...opts, dir }, Script.execute);
  const baseCTX = { require, __filename: this.name, __dirname: this.dir };
  const context = CTX.create(Object.freeze(isJS ? { ...ctx, ...baseCTX } : ctx));
  const machine = new VM(wrap(src, this.type), { filename, lineOffset: -1 - isJS, ...script });

  this.execute = (ctx = context) => {
    const exports = machine.runInContext(ctx, { ...RUN_OPTS, ...run });
    return isJS ? exports : cjs(exports, baseCTX);
  };

  return this;
};

Script.prepare = (src, opts) => new Script(src, opts);
Script.execute = (src, opts) => new Script(src, opts).execute();
module.exports = Script;
