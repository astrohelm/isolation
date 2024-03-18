'use strict';

const { basename: base, extname, join, dirname } = require('node:path');
const { readFile, readdir, stat } = require('node:fs').promises;
const { prepare: init, execute } = require('./script');
const { checkAccess } = require('./utils');

module.exports = (src, opts = {}) => stat(src).then(s => (s.isDirectory() ? dir : file)(src, opts));
Object.assign(module.exports, { file, dir });

async function file(path, { prepare, ...estimated } = {}) {
  const src = await readFile(path, 'utf8');
  if (!src) throw new SyntaxError(`File ${path} is empty`);
  return (prepare ? init : execute)(src, {
    ...estimated,
    filename: base(path),
    dir: dirname(path),
  });
}

const JS_EXT = /^\.[cme]?js$/;
const READ_OPTS = { withFileTypes: true };
const further = (max, depth) => max === true || (typeof max === 'number' && depth + 1 <= max);
function dir(src, options = {}) {
  const { depth: max = true, flat = false, access } = options;
  const isAllow = checkAccess.bind(null, 'reader', access);
  const scripts = {};
  return pull(src);
  // prettier-ignore
  async function pull(src, depth = 1) {
    const files = await readdir(src, READ_OPTS);
    const storage = flat ? scripts : {};
    await Promise.all(files.map(async f => {
      var isDir = f.isDirectory(), name = f.name, path = join(src, name);
      if ((isDir && !further(max, depth)) || !isAllow(path)) return;
      if (isDir && flat) return void await pull(path, depth + 1);
      var ext = extname(name), key = base(name, ext.match(JS_EXT) ? ext : '');
      storage[key] = await (isDir ? pull(path, depth + 1) : file(path, options));
    }));
    return storage;
  }
}
