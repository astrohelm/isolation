'use strict';

const { ERR_UNSUPPORTED_OPTS, ERR_FILE_IS_EMPTY, ERR_UNSUPPORTED_PATH } = require('./constants');
const { basename, extname, join, dirname } = require('node:path');
const { readFile, readdir, stat } = require('node:fs').promises;
const { READ_OPTS, READ_REGEX } = require('./constants');
const { checkAccess } = require('./utils');

const isAllowed = checkAccess.bind(null, 'reader');
var init, execute;

const read = (src, opts = {}) => stat(src).then(s => (s.isDirectory() ? dir : file)(src, opts));
Object.assign(read, { file, dir });

async function file(path, options = {}) {
  if (typeof path !== 'string') throw new TypeError(ERR_UNSUPPORTED_PATH);
  if (typeof options !== 'object') throw new TypeError(ERR_UNSUPPORTED_OPTS);

  const src = await readFile(path, 'utf8');
  const createScript = options.prepare ? init : execute;
  if (src.length === 0) throw new SyntaxError(`${ERR_FILE_IS_EMPTY} '${path}'`);
  return createScript(src, { ...options, filename: basename(path), dir: dirname(path) });
}

async function dir(src, options = {}) {
  if (typeof options !== 'object') throw new TypeError(ERR_UNSUPPORTED_OPTS);
  if (typeof src !== 'string') throw new TypeError(ERR_UNSUPPORTED_PATH);
  const result = await pull(options, src);
  return result || {};
}

const further = (max, depth) => max === true || (typeof max === 'number' && depth + 1 < max);
async function pull(options, dir, root = {}, depth = 0) {
  const { depth: max = true, flat = false, access } = options;
  const createScript = options.prepare ? init : execute;
  const files = await readdir(dir, READ_OPTS);
  const storage = flat ? root : {};

  const promises = files.map(async file => {
    const path = join(dir, file.name);
    if (!isAllowed(access, path)) return;
    const isDir = file.isDirectory();
    const ext = extname(file.name);
    const filename = file.name;

    const key = basename(filename, ext.match(READ_REGEX) ? ext : '');

    if (!isDir) {
      var src = await readFile(path, 'utf8');
      if (src.length === 0) return;
      storage[key] = createScript(src, { ...options, filename, dir });
      return;
    }

    if (!further(max, depth)) return;
    const result = await pull(options, path, root, depth + 1);
    if (flat || result === null) return;
    storage[key] = result;
  });

  await Promise.all(promises);
  if (Object.keys(storage) === 0) return null;
  return storage;
}

module.exports = Script => {
  init = Script.prepare;
  execute = Script.execute;
  return read;
};
