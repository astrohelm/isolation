'use strict';

const { basename, join, dirname, parse } = require('node:path');
const { readFile, readdir, stat } = require('node:fs').promises;
const { checkAccess, isObject } = require('./utils');
const isAllowed = checkAccess.bind(null, 'reader');

const read = (src, opts = {}) => stat(src).then(s => (s.isDirectory() ? dir : file)(src, opts));
Object.assign(read, { file, dir });

var init, execute;
module.exports = Script => {
  execute = Script.execute;
  init = Script.prepare;
  return read;
};

async function file(path, options = {}) {
  if (typeof path !== 'string') throw new TypeError('Non-string path is not supported');
  if (!isObject(options)) throw new TypeError('Non-object options are not supported');
  const src = await readFile(path, 'utf8');
  if (src.length === 0) throw new SyntaxError(`File is empty '${path}'`);
  return (options.prepare ? init : execute)(src, {
    ...options,
    filename: basename(path),
    dir: dirname(path),
  });
}

async function dir(src, options = {}) {
  if (typeof src !== 'string') throw new TypeError('Non-string path is not supported');
  if (!isObject(options)) throw new TypeError('Non-object options are not supported');
  const result = await pull(options, src);
  return result || {};
}

const further = (max, depth) => max === true || (typeof max === 'number' && depth + 1 < max);
async function pull(options, dir, root = {}, depth = 0) {
  const { depth: max = true, flat = false, access } = options;
  const createScript = options.prepare ? init : execute;
  const files = await readdir(dir, { withFileTypes: true });
  const storage = flat ? root : {};
  const promises = files.map(async file => {
    const path = join(dir, file.name);
    if (!isAllowed(access, path)) return;
    const isDir = file.isDirectory();
    const { base: filename, name: key } = parse(path);

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
