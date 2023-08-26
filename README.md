<h1 align="center">Astroctx - VM Container for Javascript</h1>

**Why should i use it ?** How often do you see libraries which mutates global variables Or how often do you check libraries actions ? Astroctx provides script isolation in custom contexts to solve this issues. And yes, this library written to prevent unexpected behavior.

> Also, Astropack may be useful as routing loader, if some loaded route makes an error while
> runtime, you may recreate it - to prevent memory leaks.

<h2 align="center">Installation</h2>

_Warning !_ Requirements:

- Only for commonjs
- If you use reader, you should use .js or .cjs or no extensions for your files

```bash
npm i astroctx --save
```

<h2 align="center">Basic Usage</h2>

- **Prevent intentionally damage**

  It will stop tricky users code, while you don't allow it.

  ```javascript
  // index.js
  const Astroctx = require('astroctx');
  Astroctx.read('./routes', { access: { fs: false, npmIsolation: true } }); // Will throw error that fs doesn't allowed
  ```

  ```javascript
  // routes/route/get.js
  const dangerousLibrary = require('unchecked-dangerous-library'); // Point where dangerous library initialized
  // ... other logic
  ```

  ```javascript
  // unchecked-dangerous-library index.js
  const fs = require('fs');
  fs.rm(process.cwd(), { recursive: true }); // Ha ha, no-code developer
  ```

- **Prevent unintentionally damage**

  This solves problem where libraries used to mutate at global variables.

  ```javascript
  // index.js
  const Astroctx = require('astroctx');
  Astroctx.read('./routes');
  console.log('All works fine');
  console('Here it not works');
  ```

  ```javascript
  // routes/route/get.js
  const dangerousLibrary = require('unchecked-dangerous-library'); // Point where dangerous library initialized
  // ... other logic
  ```

  ```javascript
  // unchecked-dangerous-library index.js
  global.console = msg => process.stdout.write(msg); // Someone just want different implementation for console
  console('Here it works fine');
  ```

<h2 align="center">Script syntax</h2>

- By default, script execution will return result of the last expression.

  This behavior works under option <code>{ type: 'js' }</code> only

  You can use it for configs, network packets, serialization format, etc. Function expression can be
  used as api endpoint, domain logic, etc. But you also can use any type of javascript expression
  inside the script.

  ```javascript
  const Astroctx = require('astroctx');
  console.log(new Astroctx(`({ field: 'value' });`).execute()); // Output: { field: 'value' }
  console.log(Astroctx.execute(`(a, b) => a + b;`)(2 + 2)); // Output: 4
  Astroctx.execute(`async (a, b) => a + b;`)(2 + 2).then(console.log); // Output: 4
  ```

- Or if you want to use module syntax, you should add <code>{ type: 'cjs' }</code> option.

  Or just name the file with <code>.cjs</code> extension if you use reader.

  ```javascript
  const Astroctx = require('astroctx');
  console.log(new Astroctx(`module.exports = { field: 'value' };`).execute()); // Output: { field: 'value' }
  console.log(Astroctx.execute(`module.exports = (a, b) => a + b;`)(2 + 2)); // Output: 4
  Astroctx.execute(`module.exports = async (a, b) => a + b;`)(2 + 2).then(console.log); // Output: 4
  ```

> _Warning !_ Extensions will replace your provided type option, if you use reader. For example:
>
> - astro.js -> js
> - astro.cjs & { type: 'js'} -> cjs
> - astro.js & { type: 'cjs' } -> js
> - astro & { type: 'cjs' } -> js

<h2 align="center">More about API</h2>

### Module API

Module provides next work schema

```typescript
import { Context, Script, ScriptOptions, BaseOptions } from 'node:vm';
import { RunningCodeOptions, CreateContextOptions } from 'node:vm';

type MODULE_TYPE = 'cjs' | 'js';
type TMap<value> = { [key: string]: value };

export const COMMON_CTX: Context;
export const MODULE_TYPES: MODULE_TYPE[];

export interface TOptions extends BaseOptions {
  dir?: string;
  filename?: string;
  type?: MODULE_TYPE;
  access?: TMap<boolean | object>;
  ctx?: Context;
  run?: RunningCodeOptions;
  script?: ScriptOptions;
  npmIsolation?: boolean;
}

interface TOptionsReader extends Omit<TOptions, 'type'> {
  prepare?: boolean;
}

type TRead = {
  (path: string, options?: TOptionsReader): Promise<Script>;
  script: (path: string, options?: TOptionsReader) => Promise<Script>;
  dir: (path: string, options?: TOptionsReader, deep?: boolean) => Promise<TMap<unknown>>;
};

type TCtx = {
  OPTIONS: CreateContextOptions;
  EMPTY: Context;
  COMMON: Context;
  NODE: Context;
  create: (ctx?: Context | Object, preventEscape?: boolean) => Context;
};

export default class Astroctx {
  name: string;
  dir: string;
  type: MODULE_TYPE;

  static CTX: TCtx;
  static read: TRead;
  static prepare: (src: string, options?: TOptions) => Script;
  static execute: (src: string, options?: TOptions) => unknown;
  static require: (path: string, options?: TOptionsReader) => Promise<Script>;

  constructor(src: string, options?: TOptions): Script;
  execute: (ctx?: Context) => unknown;
}
```

#### About possible options

- **type**: <code>_js_</code> Script execution returns last expression <code>_cjs_</code> Script
  execution returns all that module.exports includes. If you use read API, types will be placed
  automatically, based on your files.
- **filename**: Stands for the name of the module, by default it's empty string
- **dir**: Stands for the name of the module directory, by default <code>process.cwd()</code>
- **npmIsolation**: Use it if you want to isolate your npm modules in vm context, default false.
- **ctx**: Script execution closured by context, by default it's clear that is why you can't use
  even <code>setTimeout</code> or <code>setInterval</code>, work only with result of
  <code>CTX.create</code> or <code>CTX.EMPTY | CTX.COMMON | CTX.NODE</code>.
- **access**: Contains _absolute paths_ to nested modules or name of _npm/origin_ libraries as keys,
  and stub-content or boolean as values, _by default_ you can't require nested modules.
- **prepare**: Works only with read API, functions, where this option provided, will return
  intermediate object and you will be able to finish execution later. Script has alternative to this
  option - <code>prepare method</code>.
- **script** & **run** This options allow you to configure VM.Script initialization & execution.

### Context API

You can create custom context or use default presets with context api.

```typescript
import  { Context, CreateContextOptions } from 'node:vm';
{
  OPTS: CreateContextOptions,
  EMPTY: Context, // Result of CTX.create(Object.freeze({}))
  COMMON: Context, // Frozen nodejs internal api
  NODE: Context, // Frozen nodejs internal api & global variables
  create: (ctx: object, preventEscape: boolean) => Context
}
```

```javascript
const { CTX, execute } = require('astroctx');
const custom = CTX.create({ console });
execute(`console.log(123);`, { ctx: custom }); // Output: 123
execute(`console.log(123);`); // No output, because different stdout stream
```

### Reader API

Reader allow you to run scripts from files

- <code>read</code> Allow you to read files or directories

  You should use specific methods to have better performance.

  - Option <code>prepare</code> allow you to run script later
  - Option <code>deep</code> allow you to read scripts from nested directories

  ```javascript
  const { read } = require('astroctx');
  read('./path/to/script.js').then(console.log); // Output: result of script execution
  read('./path/to').then(console.log); // Output: { script: any }
  read('./path/to', { prepare: true }).then(console.log); // Output: { script: Script {} }
  read('./path/to', { deep: true }).then(console.log); // Output: { script: any, deep: { script: any } }
  ```

- <code>read.script</code> Allow you to read single file

  ```javascript
  const { read } = require('astroctx');
  read.script('./path/to/script.js').then(console.log); // Output: result of script execution
  read.script('./path/to/script.js', { prepare: true }).then(console.log); // Output: Script {}
  ```

- <code>read.dir</code> Allow you to read a directory

  ```javascript
  const { read } = require('astroctx');
  read.script('./path/to').then(console.log); // Output: { script: any }
  read.script('./path/to', { prepare: true }).then(console.log); Output: { script: Script {} }
  read.script('./path/to', { nested: true }).then(console.log); // Output: { script: any, deep: { script: any } }
  ```

<h2>Other useful information</h2>

- **Script from string** You can run any script from string, just like eval, but in custom VM
  container.But you shouldn't use it for unknown script evaluation, it may create security issues.

  ```js
  const Astroctx = require('astroctx');
  console.log(new Astroctx(`({ field: 'value' });`).execute()); // Output: { field: 'value' }
  console.log(Astroctx.execute(`(a, b) => a + b;`)(2 + 2)); // Output: 4
  Astroctx.execute(`async (a, b) => a + b;`)(2 + 2).then(console.log); // Output: 4
  ```

- **Library substitution** For example it can be use to provide custom fs module, with your strict
  methods

  ```js
  const { execute: exec } = require('astroctx');
  (async () => {
    const src = `
      const fs = require('fs');
      module.exports = {
        async useStub() {
          return new Promise((resolve) => {
            fs.readFile('name', (err,data) => {resolve(data);});
          });
        }
      };
    `;
    const ms = exec(src, {
      access: {
        fs: {
          readFile(filename, callback) {
            callback(null, 'stub-content');
          },
        },
      },
      type: 'cjs',
    });
    const res = await ms.useStub();
    console.log(res);
  })(); // Output: stub-content
  ```

<h2 align="center">Copyright & contributors</h2>

<p align="center">
Copyright © 2023 <a href="https://github.com/astrohelm/astroctx/graphs/contributors">Astrohelm contributors</a>.
Astroctx is <a href="./LICENSE">MIT licensed license</a>.<br/>
Astroctx is one of <a href="https://github.com/astrohelm">Astrohelm solutions</a>.
</p>
