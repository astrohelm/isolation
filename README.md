<h1 align="center">Astroctx - VM Container for Commonjs</h1>

**Why should i use it ?** How often do you see libraries which mutates global variables Or how often
do you check libraries actins ? Astroctx provides script isolation in custom contexts to solve this
issues. And yes, this library written to prevent unexpected behavior.

> Also, Astropack may be useful as routing loader, if some loaded route makes an error while
> runtime, you may recreate it - to prevent memory leaks.

<h2 align="center">Installation</h2>

_Warning !_ Require: commonjs syntax

```bash
npm i astroctx --save
```

<h2 align="center">Basic Usage</h2>

- **Prevent intentionally damage**

  It will stop tricky users code, while you don't allow it.

  ```javascript
  // index.js
  const Astroctx = require('astroctx');
  const routes = Astroctx.read('./routes', { access: { sandbox: module => module !== 'fs' } }); // Will throw error that fs doesn't allowed
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

<h2 align="center">Details</h2>

### Access controll

You may control access to some modules or paths of your application

```js
const option = { access: pathOrModule => pathOrModule === 'fs' || pathOrModule.endsWith('.js') };
Astroctx.execute('module.exports = require("fs")');
Astroctx.read('./path/to/script.js');
// Or
const option2 = {
  access: {
    internal: path => true, // Reader controll
    sandbox: module => {}, // Sandbox require controll
  },
};
```

> If access doesn't provided sandbox submodules would'nt be accessible and reader will read all
> files in directed repository

### Common js

Astroctx supports only commonjs syntax from <code>v1.1.0</code> That's because currently node.vm
doesn't support ecmascript syntax

```javascript
const Astroctx = require('astroctx');
console.log(new Astroctx(`module.exports = { field: 'value' };`).execute()); // Output: { field: 'value' }
console.log(Astroctx.execute(`module.exports = (a, b) => a + b;`)(2 + 2)); // Output: 4
Astroctx.execute(`module.exports = async (a, b) => a + b;`)(2 + 2).then(console.log); // Output: 4
```

### Context API

You can create custom context or use default presets with context api.

```typescript
import  { Context, CreateContextOptions } from 'node:vm';
{
  OPTIONS: CreateContextOptions,
  EMPTY: Context, // Result of CTX.create(Object.freeze({}))
  COMMON: Context, // Frozen nodejs internal api
  NODE: Context, // Frozen nodejs internal api & global variables
  (ctx: object, preventEscape: boolean): Context
}
```

```javascript
const { sandbox, execute } = require('astroctx');
const custom = sandbox({ console });
execute(`console.log(123);`, { ctx: custom }); // Output: 123
execute(`console.log(123);`); // No output, because different stdout stream
```

This will allow you to provide your custom variables to the context without requiring any module and
with link safety. Also it can allow you to change program behavior with somthing like:

```js
const ctx = Astroctx.sandbox({ a: 1000, b: 10 });
const prepared = Astroctx.prepare(`module.exports = a - b`, { ctx });
prepared.execute(); // Output: 990
prepared.execute({ ...ctx, a: 0 }); // Output: -10
prepared.execute({ ...ctx, b: 7 }); // Output: 993
```

### Reader API

Reader allow you to run scripts from files

- <code>read</code> Allow you to read files or directories

  You should use specific methods to have better performance. Option <code>prepare</code> allow you
  to run script later

  ```javascript
  const { require: read } = require('astroctx');
  read('./path/to/script.js').then(console.log); // Output: result of script execution
  read('./path/to').then(console.log); // Output: { script: any }
  read('./path/to', { prepare: true }).then(console.log); // Output: { script: Script {} }
  ```

  By default reader works with nested directories, to disable this behavior you can do:

  ```js
  const { require: read } = require('astroctx');
  read('./path/to', {}, false);
  ```

- <code>read.script</code> Allow you to read single file

  ```javascript
  const { require: read } = require('astroctx');
  read.script('./path/to/script.js').then(console.log); // Output: result of script execution
  read.script('./path/to/script.js', { prepare: true }).then(console.log); // Output: Script {}
  ```

- <code>read.dir</code> Allow you to read a directory

  ```javascript
  const { require: read } = require('astroctx');
  read.script('./path/to').then(console.log); // Output: { script: any, deep: { script: any } }
  read.script('./path/to', { prepare: true }).then(console.log); Output: { script: Script {} }
  read.script('./path/to', {}, false).then(console.log); // Output: { script: any }
  ```

<h2>Other useful information</h2>

- **Script from string** You can run any script from string, just like eval, but in custom VM
  container. But you shouldn't use it for unknown script evaluation, it may create security issues.

  ```js
  const Astroctx = require('astroctx');
  console.log(Astroctx.execute(`module.exports = (a, b) => a + b;`)(2 + 2)); // Output: 4
  Astroctx.execute(`module.exports = async (a, b) => a + b;`)(2 + 2).then(console.log); // Output: 4
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
        sandbox: module => ({
          fs: {
            readFile: (filename, callback) => callback(null, 'stub-content');
          },
        })[module];
      },
    });
    const res = await ms.useStub();
    console.log(res);
  })(); // Output: stub-content
  ```

### Script Options

- **filename**: Stands for the name of the module, by default it's empty string
- **dir**: Stands for the name of the module directory, by default <code>process.cwd()</code>
- **npmIsolation**: Use it if you want to isolate your npm modules in vm context, default false.
- **ctx**: See Context API
- **access**: See Access API
- **prepare**: Works only with read API. Functions, where this option provided, will return
  intermediate object and you will be able to finish execution later. Script has alternative to this
  option - <code>prepare method</code>.
- **script** & **run** This options allow you to configure VM.Script initialization & execution.

<h2 align="center">Copyright & contributors</h2>

<p align="center">
Copyright © 2023 <a href="https://github.com/astrohelm/astroctx/graphs/contributors">Astrohelm contributors</a>.
Astroctx is <a href="./LICENSE">MIT licensed license</a>.<br/>
Astroctx is one of <a href="https://github.com/astrohelm">Astrohelm solutions</a>.
</p>
