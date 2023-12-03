'use strict';

const [REGEXP_JS, READDIR_OPTS] = [/^\.[cme]?js$/, { withFileTypes: true }];
const [Script, { checkAccess }] = [require('./script'), require('./utils')];
const { basename, extname, join, dirname } = require('node:path');
const { readFile, readdir, stat } = require('node:fs').promises;

const from = async (src, options = {}) => {
  if (src !== '.' && src !== '..' && basename(src) === src) {
    const { prepare, ...estimated } = options;
    if (prepare) return Script.prepare(src, estimated);
    return new Script(src, estimated);
  }
  const reader = (await stat(src)).isDirectory() ? from.dir : from.file;
  const result = await reader(src, options);
  return result;
};

from.file = async (path, options = {}) => {
  const src = await readFile(path, 'utf8');
  if (!src) throw new SyntaxError(`File ${path} is empty`);
  const [filename, dir] = [basename(path), dirname(path)];
  const runner = options.prepare ? Script.prepare : Script.execute;
  return runner(src, { ...options, filename, dir, prepare: undefined });
};

from.dir = (src, options = {}) => {
  const { depth: max = true, ...estimated } = options;
  const isAllowed = checkAccess.bind(null, 'reader', estimated.access);
  const pull = async (src, depth) => {
    const dontGoDeep = typeof max === 'number' && depth + 1 > max;
    const files = await readdir(src, READDIR_OPTS);
    const scripts = {};
    // prettier-ignore
    await Promise.all(files.map(async file => {
      const [path, isDir, ext] = [join(src, file.name), file.isDirectory(), extname(file.name)];
      if (!isAllowed(path) || (isDir && dontGoDeep)) return;
      const promise = isDir ? pull(path, depth + 1) : from.file(path, options);
      const name = basename(file.name, ext.match(REGEXP_JS) ? ext : '');
      scripts[name] = await promise;
    }));
    return Object.assign({}, scripts);
  };
  return pull(src, 1);
};

module.exports = from;
