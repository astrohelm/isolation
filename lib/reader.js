'use strict';

const [Script, { checkAccess }] = [require('./script'), require('./utils')];
const { basename, extname, join, dirname } = require('node:path');
const { readFile, readdir, stat } = require('node:fs').promises;

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
    const name = basename(file.name, ext.match(/^\.[cme]?js$/) ? ext : '');
    scripts[name] = await reader(path, options);
  };

  const promises = files.reduce((acc, file) => {
    const path = join(dir, file.name);
    if (!checkAccess(path, options.access, 'reader')) return acc;
    if (file.isDirectory() && !deep) return acc;
    return acc.push(loader(file, path)), acc;
  }, []);

  await Promise.all(promises);
  return scripts;
};

read.script = async (path, options = {}) => {
  const src = await readFile(path, 'utf8');
  if (!src) throw new SyntaxError(`File ${path} is empty`);
  const [filename, dir] = [basename(path), dirname(path)];
  const runner = options.prepare ? Script.prepare : Script.execute;
  return runner(src, { ...options, filename, dir, prepare: false });
};

module.exports = read;
