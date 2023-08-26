'use strict';

const { basename, extname, join, dirname } = require('node:path');
const { readFile, readdir, stat } = require('node:fs').promises;
const { CTX, WRAPPERS } = require('./lib/default');
const { scriptType } = require('./lib/utils');
const MODULE_TYPES = Object.keys(WRAPPERS);
const Script = require('./lib/script');

const read = async (path, options = {}, deep = true) => {
  const isDir = (await stat(path)).isDirectory();
  const result = await (isDir ? read.dir(path, options, deep) : read.script(path, options));
  return result;
};

read.dir = async (dir, options = {}, deep = true) => {
  const files = await readdir(dir, { withFileTypes: true });
  const scripts = {};

  const loader = async (file, path) => {
    const [reader, ext] = [file.isFile() ? read.script : read.dir, extname(file.name)];
    const name = basename(file.name, MODULE_TYPES.includes(ext.slice(1)) ? ext : '');
    scripts[name] = await reader(path, options);
  };

  const promises = files.reduce((acc, file) => {
    if (!file.isDirectory() && !MODULE_TYPES.includes(extname(file.name).slice(1))) return acc;
    if (file.isDirectory() && !deep) return acc;
    return acc.push(loader(file, join(dir, file.name))), acc;
  }, []);

  await Promise.all(promises);
  return scripts;
};

read.script = async (path, options = {}) => {
  const src = await readFile(path, 'utf8');
  if (!src) throw new SyntaxError(`File ${path} is empty`);
  const [filename, dir] = [basename(path), dirname(path)];
  const runner = options.prepare ? Script.prepare : Script.execute;
  return runner(src, { ...options, filename, dir, type: scriptType(filename), prepare: false });
};

[Script.read, Script.CTX, Script.require] = [read, CTX, read.script];
module.exports = Script;
