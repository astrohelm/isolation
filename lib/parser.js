'use strict';

const { basename, extname, join, dirname } = require('node:path');
const { readFile, readdir, stat } = require('node:fs').promises;
const { prepare, execute } = require('./script');
const { checkAccess } = require('./utils');
const READ_OPTS = { withFileTypes: true };
const JS_EXT = /^\.[cme]?js$/;
module.exports = from;

async function from(src, options = {}) {
  if (src !== '.' && src !== '..' && basename(src) === src) {
    const { prepare, ...estimated } = options;
    if (prepare) return prepare(src, estimated);
    return execute(src, estimated);
  }
  const reader = (await stat(src)).isDirectory() ? from.dir : from.file;
  return reader(src, options);
}

from.file = async (path, options = {}) => {
  const src = await readFile(path, 'utf8');
  if (!src) throw new SyntaxError(`File ${path} is empty`);
  const { 0: filename, 1: dir } = [basename(path), dirname(path)];
  const runner = options.prepare ? prepare : execute;
  return runner(src, { ...options, filename, dir, prepare: undefined });
};

from.dir = (src, options = {}) => {
  const { depth: max = true, access } = options;
  const isAllowed = checkAccess.bind(null, 'reader', access);
  const pull = async (src, depth = 1) => {
    const futher = typeof max === 'number' && depth + 1 > max;
    const files = await readdir(src, READ_OPTS);
    const scripts = {};
    // prettier-ignore
    await Promise.all(files.map(async file => {
      const isDir = file.isDirectory();
      const path = join(src, file.name);
      if (!isAllowed(path) || (isDir && futher)) return;
      const promise = isDir ? pull(path, depth + 1) : from.file(path, options);
      const ext = extname(file.name);
      const name = basename(file.name, ext.match(JS_EXT) ? ext : '');
      scripts[name] = await promise;
    }));
    return Object.assign({}, scripts);
  };
  return pull(src);
};
