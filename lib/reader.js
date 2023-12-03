'use strict';

const { basename, extname, join, dirname } = require('node:path');
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
    filename: basename(path),
    dir: dirname(path),
  });
}

const JS_EXT = /^\.[cme]?js$/;
const READ_OPTS = { withFileTypes: true };
function dir(src, options = {}) {
  const { depth: max = true, access } = options;
  const isAllowed = checkAccess.bind(null, 'reader', access);
  return pull(src);
  async function pull(src, depth = 1) {
    const futher = (typeof max === 'number' && depth + 1 <= max) || max === true;
    const files = await readdir(src, READ_OPTS);
    const scripts = {};
    // prettier-ignore
    await Promise.all(files.map(async f => {
      var isDir = f.isDirectory(), filename = f.name, path = join(src, filename);
      if (!isAllowed(path) || (isDir && !futher)) return;
      var ext = extname(filename), key = basename(filename, ext.match(JS_EXT) ? ext : '');
      scripts[key] = await (isDir ? pull(path, depth + 1) : file(path, options));
    }));
    return { ...scripts };
  }
}
